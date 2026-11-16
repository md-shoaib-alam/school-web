"use client";

import { api, fetchAllStudents } from "@/lib/api";
import { queryClient } from "@/lib/query-client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ClassSelect } from "@/components/ui/class-select";
import {
  CalendarDays,
  Save,
  CheckCircle,
  Users,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  PenLine,
  Loader2,
  WifiOff,
  Send,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────

interface ClassInfo {
  id: string;
  name: string;
  section: string;
  studentCount: number;
}

interface StudentInfo {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  classId: string;
  gender: string;
}

type AttendanceStatus = "present" | "absent" | "unmarked";

interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
}

// ─── Helpers ──────────────────────────────────────────────────

const getStatusBg = (status: AttendanceStatus) => {
  switch (status) {
    case "present":
      return "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60";
    case "absent":
      return "bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-800/60";
    default:
      return "bg-card border-border hover:bg-muted/30";
  }
};

const getStatusIcon = (status: AttendanceStatus) => {
  switch (status) {
    case "present":
      return <UserCheck className="size-3.5" />;
    case "absent":
      return <UserX className="size-3.5" />;
    default:
      return null;
  }
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

// ─── Query keys ───────────────────────────────────────────────

const classesKey = () => ["teacher-classes"] as const;
const studentsKey = (classId: string) => ["teacher-students", classId] as const;
const attendanceKey = (classId: string, date: string) =>
  ["teacher-attendance", classId, date] as const;

// ─── Component ────────────────────────────────────────────────

export function TeacherAttendance() {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [date, setDate] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });
  const disableFutureDates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (candidate: Date) => {
      const day = new Date(candidate);
      day.setHours(0, 0, 0, 0);
      return day > today;
    };
  }, []);

  // ── Fetch classes ──────────────────────────────────────────

  const { data: rawClasses, isLoading: classesLoading } = useQuery({
    queryKey: classesKey(),
    queryFn: async () => {
      const data = await api.get<any>("/classes?all=true");
      return (Array.isArray(data) ? data : (data?.items ?? [])) as ClassInfo[];
    },
    staleTime: 5 * 60 * 1000,
    select: (data) => data,
  });

  const classes = useMemo(() => (Array.isArray(rawClasses) ? rawClasses : (rawClasses as any)?.items ?? []), [rawClasses]);
  const activeClassId = selectedClassId || classes[0]?.id || "";

  // ── Fetch students for selected class ─────────────────────

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: studentsKey(activeClassId),
    queryFn: async () => {
      // Paginates internally — the server caps a page at 100 students.
      const data = await fetchAllStudents({ classId: activeClassId });
      return data as StudentInfo[];
    },
    enabled: !!activeClassId,
    staleTime: 5 * 60 * 1000,
  });

  // ── Fetch existing attendance for class + date ─────────────

  const { data: existingAttendance = [] } = useQuery({
    queryKey: attendanceKey(activeClassId, date),
    queryFn: async () => {
      const res = await api.get<any>(`/attendance?classId=${activeClassId}&date=${date}&limit=1000`);
      return Array.isArray(res?.records) ? res.records : [];
    },
    enabled: !!activeClassId,
    staleTime: 30 * 1000, // 30 s - background refresh keeps it fresh
  });

  // ── Derive records from students + existing attendance ─────
  // This is the "source of truth" for display; mutations optimistically patch it.
  
  // Memoize the heavy work of merging datasets (only recalculates on network sync)
  const serverRecords = useMemo((): AttendanceRecord[] => {
    const list = Array.isArray(existingAttendance) ? existingAttendance : [];
    // Build O(1) lookup map for maximum scaling
    const statusMap = new Map<string, string>();
    list.forEach((a) => {
      if (a?.studentId) statusMap.set(a.studentId, a.status);
    });

    return students.map((s) => ({
      studentId: s.id,
      status: (statusMap.get(s.id) as AttendanceStatus) || "unmarked",
    }));
  }, [students, existingAttendance]);

  // Local overrides - applied on top of server data for instant feel
  const [localOverrides, setLocalOverrides] = useState<
    Record<string, AttendanceStatus>
  >({});
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<number>(() => Date.now() - 39000);
  const [timeAgoText, setTimeAgoText] = useState("just now");
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));

  // Online / offline detector
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Time ago updater
  useEffect(() => {
    const updateTimeAgo = () => {
      const diffSec = Math.max(0, Math.round((Date.now() - lastSavedTime) / 1000));
      if (diffSec < 5) {
        setTimeAgoText("just now");
      } else if (diffSec < 60) {
        setTimeAgoText(`${diffSec}s ago`);
      } else {
        const mins = Math.round(diffSec / 60);
        setTimeAgoText(`${mins} min ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 5000);
    return () => clearInterval(interval);
  }, [lastSavedTime]);

  // Adjust/Reset overrides when class or date changes during rendering (prevents set-state-in-effect and extra cycles)
  const [prevClassAndDate, setPrevClassAndDate] = useState({ classId: activeClassId, date });
  if (prevClassAndDate.classId !== activeClassId || prevClassAndDate.date !== date) {
    setLocalOverrides({});
    setSaved(false);
    setSubmitted(false);
    setPrevClassAndDate({ classId: activeClassId, date });
  }

  // Combine server record truth with user pending interactions
  const records = useMemo((): AttendanceRecord[] => {
    return serverRecords.map((r) => ({
      ...r,
      status: localOverrides[r.studentId] ?? r.status,
    }));
  }, [serverRecords, localOverrides]);

  // ── Update a single student ────────────────────────────────

  const updateRecord = (studentId: string, status: AttendanceStatus) => {
    setLocalOverrides((prev) => ({ ...prev, [studentId]: status }));
    setSaved(false);
    setSubmitted(false);
  };

  const markAll = (status: AttendanceStatus) => {
    const overrides: Record<string, AttendanceStatus> = {};
    students.forEach((s) => (overrides[s.id] = status));
    setLocalOverrides(overrides);
    setSaved(false);
    setSubmitted(false);
  };

  // ── Save mutation ──────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: () => {
      const payloadRecords = records.map((r) => ({
        studentId: r.studentId,
        status: r.status === "absent" ? "absent" : "present",
      }));
      return api.post("/attendance", {
        classId: activeClassId,
        date,
        records: payloadRecords,
      });
    },
    onMutate: async () => {
      // Optimistically update the cache so the UI reflects saved state instantly
      await queryClient.cancelQueries({
        queryKey: attendanceKey(activeClassId, date),
      });

      const snapshot = queryClient.getQueryData<any[]>(
        attendanceKey(activeClassId, date)
      );

      queryClient.setQueryData(
        attendanceKey(activeClassId, date),
        records.map((r) => ({ studentId: r.studentId, status: r.status }))
      );

      return { snapshot };
    },
    onSuccess: () => {
      setSaved(true);
      setSubmitted(true);
      setLastSavedTime(Date.now());
      setLocalOverrides({});
      toast.success("Attendance saved!");

      // Background refetch to sync with server truth
      queryClient.invalidateQueries({
        queryKey: attendanceKey(activeClassId, date),
      });
    },
    onError: (_err, _vars, ctx) => {
      // Roll back optimistic update
      if (ctx?.snapshot) {
        queryClient.setQueryData(
          attendanceKey(activeClassId, date),
          ctx.snapshot
        );
      }
      toast.error("Failed to save attendance. Please try again.");
    },
  });

  // ── Stats ──────────────────────────────────────────────────

  const presentCount = records.filter((r) => r.status === "present").length;
  const absentCount = records.filter((r) => r.status === "absent").length;
  const unmarkedCount = records.filter((r) => r.status === "unmarked").length;
  const totalCount = records.length;

  const selectedClass = classes.find((c) => c.id === activeClassId);
  
  const hasExistingAttendance = existingAttendance.length > 0;
  const hasUnsavedChanges = Object.keys(localOverrides).length > 0;
  const hasMarkedAny = records.some((r) => r.status !== "unmarked");
  const isAllUnmarked = unmarkedCount === totalCount && !hasExistingAttendance && !saved;

  // Has attendance already been recorded and nothing was modified?
  const isAlreadySaved = !hasUnsavedChanges && (hasExistingAttendance || saved);

  // Can submit ONLY if:
  // 1. All students are marked (no unmarked students remain)
  // 2. Either has unsaved changes OR attendance has not been recorded yet for the day
  // 3. Online, not pending save, and class has students
  const canSubmit =
    unmarkedCount === 0 &&
    (hasUnsavedChanges || (!hasExistingAttendance && !saved)) &&
    isOnline &&
    !saveMutation.isPending &&
    totalCount > 0;

  const syncStatus = !isOnline
    ? "offline"
    : saveMutation.isPending
    ? "syncing"
    : isAllUnmarked
    ? "idle"
    : hasUnsavedChanges
    ? "dirty"
    : "synced";

  const statusTitle = !isOnline
    ? "You’re offline"
    : saveMutation.isPending
    ? "Saving…"
    : isAllUnmarked
    ? "Mark Attendance"
    : hasUnsavedChanges
    ? "Unsaved changes"
    : submitted
    ? "Attendance submitted"
    : "All changes saved";

  // ── Loading skeleton ───────────────────────────────────────

  if (classesLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-2 sm:pb-4">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          Take Attendance
        </h2>
        <p className="text-muted-foreground mt-1">
          Record daily attendance for your classes.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-xs">
          <ClassSelect
            value={activeClassId}
            onValueChange={(v) => {
              setSelectedClassId(v);
              setLocalOverrides({});
              setSaved(false);
            }}
            placeholder="Select Class"
            className="w-full rounded-xl"
            classes={classes}
            isLoading={classesLoading}
          />
        </div>
        <div className="flex-1 max-w-[200px]">
          <DatePicker
            date={date ? new Date(date) : undefined}
            disabled={disableFutureDates}
            onChange={(d) => {
              if (d) {
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                setDate(`${y}-${m}-${day}`);
                setLocalOverrides({});
                setSaved(false);
              }
            }}
            className="w-full rounded-xl"
          />
        </div>
      </div>

      {/* Stats */}
      {students.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Total",
              value: totalCount,
              icon: <Users className="size-5 text-blue-500 dark:text-blue-400" />,
              bg: "bg-blue-50 dark:bg-blue-900/30",
              text: "text-foreground",
            },
            {
              label: "Present",
              value: presentCount,
              icon: <UserCheck className="size-5 text-emerald-500 dark:text-emerald-400" />,
              bg: "bg-emerald-50 dark:bg-emerald-900/30",
              text: "text-emerald-600 dark:text-emerald-400",
            },
            {
              label: "Absent",
              value: absentCount,
              icon: <UserX className="size-5 text-red-500 dark:text-red-400" />,
              bg: "bg-red-50 dark:bg-red-900/30",
              text: "text-red-600 dark:text-red-400",
            },
          ].map(({ label, value, icon, bg, text }) => (
            <Card key={label} className="rounded-xl shadow-sm border-0">
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className={`size-10 rounded-xl ${bg} flex items-center justify-center`}
                >
                  {icon}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {label}
                  </p>
                  <p className={`text-xl font-bold ${text}`}>{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Attendance list */}
      <Card className="rounded-xl shadow-sm border  overflow-hidden">
        <CardHeader className="pb-3 sticky top-0 bg-card backdrop-blur-md z-10 border-b ">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center justify-between sm:justify-start sm:gap-4 flex-1">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <CalendarDays className="size-4 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-foreground leading-none">
                    {selectedClass
                      ? `${selectedClass.name} - ${selectedClass.section}`
                      : "Select a class"}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                    Attendance Registry
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="text-[10px] h-6 px-2 rounded-md font-bold"
              >
                {students.length} students
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-muted dark:bg-[#111113] border rounded-xl sm:w-auto">
              <div className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground italic">
                Quick:
              </div>
              <button
                type="button"
                className="flex-1 sm:flex-none py-1.5 px-3 rounded-lg text-[10px] font-bold transition-all bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 active:scale-95 cursor-pointer"
                onClick={() => markAll("present")}
              >
                All Present
              </button>
              <button
                type="button"
                className="flex-1 sm:flex-none py-1.5 px-3 rounded-lg text-[10px] font-bold transition-all bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20 hover:bg-red-500/20 active:scale-95 cursor-pointer"
                onClick={() => markAll("absent")}
              >
                All Absent
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 overflow-hidden">
          {studentsLoading ? (
            <div className="space-y-3 pt-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : students.length > 0 ? (
            <>
              <div className="space-y-2 pt-4">
                {students.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground text-sm italic">No students match your search.</p>
                  </div>
                ) : (
                  students.map((student, index) => {
                    const record = records.find((r) => r.studentId === student.id);
                    const currentStatus = record?.status ?? "unmarked";
                    return (
                      <div
                        key={student.id}
                        className={cn(
                          "flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl border transition-all",
                          getStatusBg(currentStatus)
                        )}
                      >
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <span className="text-xs text-muted-foreground font-mono w-6 text-center">
                            {index + 1}
                          </span>
                          <Avatar className="size-8 flex-shrink-0">
                            <AvatarFallback
                              className={cn(
                                "text-[10px] font-semibold transition-colors",
                                currentStatus === "present" && "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400",
                                currentStatus === "absent" && "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400",
                                currentStatus === "unmarked" && "bg-muted text-muted-foreground"
                              )}
                            >
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {student.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {student.rollNumber}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 w-full sm:w-auto mt-2 sm:mt-0 sm:ml-auto">
                          {(["present", "absent"] as AttendanceStatus[]).map((status) => {
                            const isSelected = currentStatus === status;
                            return (
                              <button
                                key={status}
                                type="button"
                                onClick={() => updateRecord(student.id, isSelected ? "unmarked" : status)}
                                className={cn(
                                  "flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border",
                                  isSelected && status === "present" && "bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-500 text-white border-transparent shadow-sm ring-1 ring-white/10",
                                  isSelected && status === "absent" && "bg-red-500 hover:bg-red-600 dark:bg-red-500 text-white border-transparent shadow-sm ring-1 ring-white/10",
                                  !isSelected && "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                )}
                              >
                                {getStatusIcon(status)}
                                <span className="capitalize">{status}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <Users className="size-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                {activeClassId ? "No students in this class" : "Select a class to begin"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Attendance Status Dock */}
      {students.length > 0 && (
        <div className="sticky bottom-[-6px] lg:bottom-[-10px] z-40 flex justify-center mt-2 pointer-events-none px-3">
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-auto w-full max-w-[420px] sm:max-w-[440px] flex items-center justify-between gap-2.5 sm:gap-3 p-2 pl-3.5 pr-2 rounded-[18px] bg-card border border-border shadow-[0_14px_34px_-12px_rgba(0,0,0,0.45)] relative backdrop-blur-md animate-in slide-in-from-bottom-2 duration-300"
          >
            {/* Status icon tile */}
            <span
              className={cn(
                "shrink-0 size-8 rounded-[11px] grid place-items-center transition-all duration-300",
                syncStatus === "offline" && "bg-red-500/15 text-red-600 dark:text-red-400",
                syncStatus === "syncing" && "bg-blue-500/15 text-blue-600 dark:text-blue-400",
                syncStatus === "idle" && "bg-muted text-muted-foreground",
                syncStatus === "dirty" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                syncStatus === "synced" && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              )}
            >
              {syncStatus === "offline" && <WifiOff className="size-[17px]" strokeWidth={2.2} />}
              {syncStatus === "syncing" && <Loader2 className="size-[17px] animate-spin" strokeWidth={2.5} />}
              {syncStatus === "idle" && <Clock className="size-[17px]" strokeWidth={2.2} />}
              {syncStatus === "dirty" && <PenLine className="size-[17px]" strokeWidth={2.2} />}
              {syncStatus === "synced" && <CheckCircle2 className="size-[17px]" strokeWidth={2.2} />}
            </span>

            {/* Status text */}
            <div className="flex-1 min-w-0 text-left">
              <b className="block text-[13px] font-semibold text-foreground truncate leading-tight">
                {statusTitle}
              </b>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[11.5px] text-muted-foreground truncate mt-0.5 leading-tight">
                {!isOnline ? (
                  <span className="inline-flex items-center gap-1 text-red-500">
                    <span className="size-1.5 rounded-full bg-red-500 shrink-0" />
                    <span>Offline · Saved locally</span>
                  </span>
                ) : saveMutation.isPending ? (
                  <span className="inline-flex items-center gap-1 text-blue-500">
                    <span className="size-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
                    <span>Sending to cloud…</span>
                  </span>
                ) : isAllUnmarked ? (
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground shrink-0">
                    <span className="size-1.5 rounded-full bg-muted-foreground/60 shrink-0" />
                    <span>{totalCount} Unmarked · Ready to mark</span>
                  </span>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1 text-foreground font-medium shrink-0">
                      <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{presentCount} Present</span>
                    </span>

                    <span className="inline-flex items-center gap-1 text-foreground font-medium shrink-0">
                      <span className="size-1.5 rounded-full bg-red-500 shrink-0" />
                      <span>{absentCount} Absent</span>
                    </span>

                    {unmarkedCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium shrink-0">
                        <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
                        <span>{unmarkedCount} Unmarked</span>
                      </span>
                    )}

                    {unmarkedCount === 0 && (
                      <span className="text-muted-foreground truncate">
                        · {hasUnsavedChanges || (!hasExistingAttendance && !saved) ? "Ready" : timeAgoText}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Action button */}
            <button
              type="button"
              onClick={() => {
                if (canSubmit) {
                  saveMutation.mutate();
                }
              }}
              disabled={!canSubmit}
              title={
                unmarkedCount > 0
                  ? `Please mark all ${unmarkedCount} unmarked student${unmarkedCount > 1 ? "s" : ""} to submit`
                  : undefined
              }
              className={cn(
                "shrink-0 h-[38px] px-4 rounded-[13px] flex items-center gap-1.5 text-[13px] font-bold transition-all",
                canSubmit
                  ? "bg-emerald-500 hover:bg-emerald-600 dark:bg-[#12c58b] dark:hover:bg-[#10b981] text-white dark:text-[#04140d] cursor-pointer shadow-sm active:scale-[0.97]"
                  : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
              )}
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="size-[15px] animate-spin" strokeWidth={2.3} />
                  <span>Saving…</span>
                </>
              ) : isAlreadySaved ? (
                <>
                  <Check className="size-[15px]" strokeWidth={2.5} />
                  <span>Submitted</span>
                </>
              ) : (
                <>
                  <Send className="size-[15px]" strokeWidth={2.3} />
                  <span>Submit</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
