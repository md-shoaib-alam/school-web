"use client";

import { api } from "@/lib/api";
import { queryClient } from "@/lib/query-client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  Save,
  CheckCircle,
  Users,
  UserCheck,
  UserX,
  Clock,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { DatePicker } from "@/components/ui/date-picker";

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

type AttendanceStatus = "present" | "absent" | "late";

interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
}

// ─── Helpers ──────────────────────────────────────────────────

const getStatusBg = (status: AttendanceStatus) => {
  switch (status) {
    case "present":
      return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800";
    case "absent":
      return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
    case "late":
      return "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800";
  }
};

const getStatusIcon = (status: AttendanceStatus) => {
  switch (status) {
    case "present":
      return <UserCheck className="h-3.5 w-3.5" />;
    case "absent":
      return <UserX className="h-3.5 w-3.5" />;
    case "late":
      return <Clock className="h-3.5 w-3.5" />;
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
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // ── Fetch classes ──────────────────────────────────────────

  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: classesKey(),
    queryFn: () => api.get<ClassInfo[]>("/classes?all=true"),
    staleTime: 5 * 60 * 1000,
    select: (data) => {
      // Auto-select first class on first load
      if (data.length > 0 && !selectedClassId) {
        // We set it via side-effect below; just return data
      }
      return data;
    },
  });

  // Auto-select first class once loaded
  const firstClassId = classes[0]?.id;
  if (firstClassId && !selectedClassId) {
    setSelectedClassId(firstClassId);
  }

  // ── Fetch students for selected class ─────────────────────

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: studentsKey(selectedClassId),
    queryFn: async () => {
      const data = await api.get<any>(`/students?classId=${selectedClassId}`);
      return (Array.isArray(data) ? data : data.items ?? []) as StudentInfo[];
    },
    enabled: !!selectedClassId,
    staleTime: 5 * 60 * 1000,
  });

  // ── Fetch existing attendance for class + date ─────────────

  const { data: existingAttendance = [] } = useQuery({
    queryKey: attendanceKey(selectedClassId, date),
    queryFn: () =>
      api.get<any[]>(`/attendance?classId=${selectedClassId}&date=${date}`),
    enabled: !!selectedClassId,
    staleTime: 30 * 1000, // 30 s — background refresh keeps it fresh
  });

  // ── Derive records from students + existing attendance ─────
  // This is the "source of truth" for display; mutations optimistically patch it.

  const buildRecords = (
    studentList: StudentInfo[],
    attList: any[]
  ): AttendanceRecord[] =>
    studentList.map((s) => {
      const existing = attList.find((a) => a.studentId === s.id);
      return {
        studentId: s.id,
        status: existing ? (existing.status as AttendanceStatus) : "present",
      };
    });

  // Local overrides — applied on top of server data for instant feel
  const [localOverrides, setLocalOverrides] = useState<
    Record<string, AttendanceStatus>
  >({});
  const [saved, setSaved] = useState(false);

  // Reset overrides when class or date changes
  const prevKey = `${selectedClassId}__${date}`;
  const [lastKey, setLastKey] = useState(prevKey);
  if (prevKey !== lastKey) {
    setLastKey(prevKey);
    setLocalOverrides({});
    setSaved(false);
  }

  const serverRecords = buildRecords(students, existingAttendance);
  const records: AttendanceRecord[] = serverRecords.map((r) => ({
    ...r,
    status: localOverrides[r.studentId] ?? r.status,
  }));

  // ── Update a single student ────────────────────────────────

  const updateRecord = (studentId: string, status: AttendanceStatus) => {
    setLocalOverrides((prev) => ({ ...prev, [studentId]: status }));
    setSaved(false);
  };

  const markAll = (status: AttendanceStatus) => {
    const overrides: Record<string, AttendanceStatus> = {};
    students.forEach((s) => (overrides[s.id] = status));
    setLocalOverrides(overrides);
    setSaved(false);
  };

  // ── Save mutation ──────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: () =>
      api.post("/attendance", {
        classId: selectedClassId,
        date,
        records,
      }),
    onMutate: async () => {
      // Optimistically update the cache so the UI reflects saved state instantly
      await queryClient.cancelQueries({
        queryKey: attendanceKey(selectedClassId, date),
      });

      const snapshot = queryClient.getQueryData<any[]>(
        attendanceKey(selectedClassId, date)
      );

      queryClient.setQueryData(
        attendanceKey(selectedClassId, date),
        records.map((r) => ({ studentId: r.studentId, status: r.status }))
      );

      return { snapshot };
    },
    onSuccess: () => {
      setSaved(true);
      setLocalOverrides({});
      toast.success(`Attendance for ${date} has been recorded successfully.`);

      // Background refetch to sync with server truth
      queryClient.invalidateQueries({
        queryKey: attendanceKey(selectedClassId, date),
      });
    },
    onError: (_err, _vars, ctx) => {
      // Roll back optimistic update
      if (ctx?.snapshot) {
        queryClient.setQueryData(
          attendanceKey(selectedClassId, date),
          ctx.snapshot
        );
      }
      toast.error("Failed to save attendance. Please try again.");
    },
  });

  // ── Stats ──────────────────────────────────────────────────

  const presentCount = records.filter((r) => r.status === "present").length;
  const absentCount = records.filter((r) => r.status === "absent").length;
  const lateCount = records.filter((r) => r.status === "late").length;
  const totalCount = records.length;

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const hasUnsavedChanges = Object.keys(localOverrides).length > 0;

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
    <div className="space-y-6 pb-6 sm:pb-20">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Take Attendance
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Record daily attendance for your classes.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-xs">
          <Select
            value={selectedClassId}
            onValueChange={(v) => {
              setSelectedClassId(v);
              setLocalOverrides({});
              setSaved(false);
            }}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} - Section {cls.section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 max-w-[200px]">
          <DatePicker
            date={date ? new Date(date) : undefined}
            onChange={(d) => {
              if (d) {
                setDate(d.toISOString().split("T")[0]);
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total",
              value: totalCount,
              icon: <Users className="h-5 w-5 text-blue-500 dark:text-blue-400" />,
              bg: "bg-blue-50 dark:bg-blue-900/30",
              text: "text-gray-900 dark:text-gray-100",
            },
            {
              label: "Present",
              value: presentCount,
              icon: <UserCheck className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />,
              bg: "bg-emerald-50 dark:bg-emerald-900/30",
              text: "text-emerald-600 dark:text-emerald-400",
            },
            {
              label: "Absent",
              value: absentCount,
              icon: <UserX className="h-5 w-5 text-red-500 dark:text-red-400" />,
              bg: "bg-red-50 dark:bg-red-900/30",
              text: "text-red-600 dark:text-red-400",
            },
            {
              label: "Late",
              value: lateCount,
              icon: <Clock className="h-5 w-5 text-amber-500 dark:text-amber-400" />,
              bg: "bg-amber-50 dark:bg-amber-900/30",
              text: "text-amber-600 dark:text-amber-400",
            },
          ].map(({ label, value, icon, bg, text }) => (
            <Card key={label} className="rounded-xl shadow-sm border-0">
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}
                >
                  {icon}
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
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
      <Card className="rounded-xl shadow-sm border border-gray-800 overflow-hidden bg-[#09090b]">
        <CardHeader className="pb-3 sticky top-0 bg-[#09090b] backdrop-blur-md z-10 border-b border-gray-800/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center justify-between sm:justify-start sm:gap-4 flex-1">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <CalendarDays className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-100 leading-none">
                    {selectedClass
                      ? `${selectedClass.name} - ${selectedClass.section}`
                      : "Select a class"}
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-1 font-medium">
                    Attendance Registry
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="text-[10px] h-6 px-2 bg-blue-500/5 text-blue-400 border-blue-500/10 rounded-md font-bold"
              >
                {students.length} students
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-[#111113] border border-gray-800/50 rounded-xl sm:w-auto">
              <div className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-gray-600 italic">
                Quick:
              </div>
              <button
                className="flex-1 sm:flex-none py-1.5 px-3 rounded-lg text-[10px] font-bold transition-all bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 hover:bg-emerald-500/10 active:scale-95"
                onClick={() => markAll("present")}
              >
                All Present
              </button>
              <button
                className="flex-1 sm:flex-none py-1.5 px-3 rounded-lg text-[10px] font-bold transition-all bg-red-500/5 text-red-500 border border-red-500/10 hover:bg-red-500/10 active:scale-95"
                onClick={() => markAll("absent")}
              >
                All Absent
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 overflow-hidden">
          {studentsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : students.length > 0 ? (
            <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-2 pb-2 sm:pb-6">
                {students.map((student, index) => {
                  const record = records.find((r) => r.studentId === student.id);
                  const currentStatus = record?.status ?? "present";
                  return (
                    <div
                      key={student.id}
                      className={`flex items-center gap-2 p-2 sm:p-3 rounded-xl border transition-all ${getStatusBg(currentStatus)}`}
                    >
                      <span className="text-[10px] text-gray-500 font-mono w-4 sm:w-6 text-center">
                        {index + 1}
                      </span>

                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                        <AvatarFallback className="text-[9px] sm:text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0 ml-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {student.name}
                        </p>
                        <p className="text-[9px] sm:text-xs text-gray-400 dark:text-gray-500">
                          {student.rollNumber}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                        {(
                          ["present", "absent", "late"] as AttendanceStatus[]
                        ).map((status) => (
                          <button
                            key={status}
                            onClick={() => updateRecord(student.id, status)}
                            className={`flex items-center justify-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all border ${
                              currentStatus === status
                                ? `${getStatusBg(status)} ${
                                    status === "present"
                                      ? "bg-emerald-500 dark:bg-emerald-500 text-white"
                                      : status === "absent"
                                      ? "bg-red-500 dark:bg-red-500 text-white"
                                      : "bg-amber-500 dark:bg-amber-500 text-white"
                                  } border-transparent`
                                : "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-600 dark:hover:text-gray-300"
                            }`}
                          >
                            <span className="flex-shrink-0">
                              {getStatusIcon(status)}
                            </span>
                            <span className="hidden md:inline capitalize">
                              {status}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <Users className="h-10 w-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                {selectedClassId
                  ? "No students in this class"
                  : "Select a class to begin"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating save bar */}
      {students.length > 0 && (
        <div className="fixed bottom-1 sm:bottom-4 left-[50%] lg:left-[calc(50%+140px)] -translate-x-1/2 w-[calc(100%-2.5rem)] sm:w-[calc(100%-4rem)] lg:w-[calc(100%-360px)] max-w-4xl z-50 px-3 py-1.5 sm:px-6 sm:py-3 bg-[#09090b]/95 backdrop-blur-2xl border border-white/5 rounded-xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-6">
              <div
                className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-full text-[9px] sm:text-[10px] font-black tracking-tighter sm:tracking-widest uppercase italic transition-all duration-300 ${
                  saved && !hasUnsavedChanges
                    ? "text-gray-600 bg-gray-800/20"
                    : "text-amber-500 bg-amber-500/10 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                }`}
              >
                {saved && !hasUnsavedChanges ? (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span>Synchronized</span>
                  </span>
                ) : (
                  "Unsaved Changes"
                )}
              </div>
              {saved && !hasUnsavedChanges && (
                <div className="hidden md:flex items-center gap-1.5 text-emerald-500 text-[10px] sm:text-xs font-medium animate-in fade-in slide-in-from-left-1">
                  <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Cloud Live</span>
                </div>
              )}
            </div>

            <Button
              onClick={() => saveMutation.mutate()}
              disabled={
                saveMutation.isPending ||
                (saved && !hasUnsavedChanges && students.length > 0)
              }
              className={`rounded-lg sm:rounded-xl px-4 py-1.5 sm:px-8 sm:py-5 h-8 sm:h-auto text-[11px] sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 sm:gap-3 shadow-lg ${
                saved && !hasUnsavedChanges
                  ? "bg-gray-800/50 text-gray-600 cursor-not-allowed border border-gray-700/30"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 active:scale-[0.96] hover:shadow-blue-500/40"
              }`}
            >
              {saveMutation.isPending ? (
                <div className="h-3 w-3 sm:h-4 sm:w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save
                  className={`h-3 w-3 sm:h-4 sm:w-4 ${
                    !(saved && !hasUnsavedChanges) && "animate-bounce"
                  }`}
                />
              )}
              <span>
                {saved && !hasUnsavedChanges ? "Saved" : "Save Attendance"}
              </span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
