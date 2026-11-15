"use client";


import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useAppStore } from "@/store/use-app-store";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutGrid,
  List,
  CalendarDays,
  Calendar,
  Clock,
  BookOpen,
  User,
  GraduationCap,
  Coffee,
  Utensils,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { TimetableToggle } from "@/components/shared/timetable-toggle";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TimetableSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subjectName: string;
  teacherName: string;
  className: string;
  label?: string;
}

interface ClassInfo {
  id: string;
  name: string;
  section: string;
  studentCount: number;
  classTeacher: string;
}

type ViewMode = "grid" | "list" | "day";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
};

const SHORT_DAY_LABELS: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
};

const SUBJECT_COLORS = [
  "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800",
  "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
  "bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toDayIndex(jsDay: number): number {
  if (jsDay >= 1 && jsDay <= 6) return jsDay - 1;
  return 0;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function isBetween(start: string, end: string): boolean {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return nowMin >= timeToMinutes(start) && nowMin < timeToMinutes(end);
}

function formatTime(time: string): string {
  if (!time) return "";
  const [h, m] = time.split(":");
  const hour = parseInt(h ?? "0", 10);
  const min = m ?? "00";
  const ampm = hour >= 12 ? "pm" : "am";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${min} ${ampm}`;
}

function getDisplayDate(dayKey: string): { formattedDate: string; fullDay: string } {
  const dayIndexMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };
  const targetDay = dayIndexMap[dayKey.toLowerCase()] ?? 1;
  const now = new Date();
  const currentDay = now.getDay();
  const diff = targetDay - currentDay;
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + diff);

  const weekday = targetDate.toLocaleDateString("en-US", { weekday: "short" });
  const day = targetDate.getDate();
  const month = targetDate.toLocaleDateString("en-US", { month: "short" });
  const year = targetDate.getFullYear();

  const formattedDate = `${weekday}, ${day} ${month}, ${year}`;
  const fullDay = targetDate.toLocaleDateString("en-US", { weekday: "long" });

  return { formattedDate, fullDay };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ViewToggle({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (m: ViewMode) => void;
}) {
  return <TimetableToggle mode={mode} onChange={onChange} />;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TeacherTimetable() {
  const [selectedClass, setSelectedClass] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedDay, setSelectedDay] = useState("");

  const currentTenantId = useAppStore((s) => s.currentTenantId);

  const { data: workingDays = DAYS } = useQuery<string[]>({
    queryKey: ["working-days", currentTenantId],
    queryFn: async () => {
      const res = await api.get<any>(`/tenant-settings?tenantId=${currentTenantId}`);
      return res.workingDays || DAYS;
    },
    enabled: !!currentTenantId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: async () => {
      const res = await api.get<any>("/classes?mode=min");
      return (Array.isArray(res) ? res : []) as ClassInfo[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: timetable = [], isLoading: timetableLoading } = useQuery({
    queryKey: ["teacher-timetable", selectedClass],
    queryFn: async () => {
      const endpoint = selectedClass === "all" 
        ? "/timetable?mine=true" 
        : `/timetable?classId=${selectedClass}`;
      const res = await api.get<any>(endpoint);
      return (Array.isArray(res) ? res : []) as TimetableSlot[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Keep variable for rendering backwards compat
  const loading = timetableLoading;

  const currentDayKey = useMemo(() => {
    const jsDay = new Date().getDay();
    const dayMap: Record<number, string> = {
      0: "sunday",
      1: "monday",
      2: "tuesday",
      3: "wednesday",
      4: "thursday",
      5: "friday",
      6: "saturday",
    };
    const currentDayName = dayMap[jsDay] || "monday";
    const found = workingDays.find((d) => d.toLowerCase() === currentDayName);
    return found || workingDays[0] || "monday";
  }, [workingDays]);

  const selectedDayKey = useMemo(
    () => {
      if (selectedDay) {
        const found = workingDays.find((d) => d.toLowerCase() === selectedDay.toLowerCase());
        if (found) return found;
      }
      return currentDayKey;
    },
    [selectedDay, currentDayKey, workingDays],
  );

  const handleViewChange = (m: ViewMode) => {
    setViewMode(m);
    if (m === "day") {
      setSelectedDay("");
    }
  };

  const allTimeSlots = useMemo(() => {
    const set = new Set<string>();
    timetable.forEach((t) => set.add(`${t.startTime}-${t.endTime}`));
    return [...set].sort((a, b) => {
      const aStart = a.split("-")[0];
      const bStart = b.split("-")[0];
      return timeToMinutes(aStart) - timeToMinutes(bStart);
    });
  }, [timetable]);

  const slotsByDay = useMemo(() => {
    const map: Record<string, TimetableSlot[]> = {};
    workingDays.forEach((d) => (map[d] = []));
    timetable.forEach((t) => {
      const dayLower = t.day.toLowerCase();
      if (map[dayLower]) map[dayLower].push(t);
    });
    workingDays.forEach((d) => {
      map[d].sort(
        (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
      );
    });
    return map;
  }, [timetable, workingDays]);

  const uniqueSubjects = useMemo(
    () => [...new Set(timetable.map((t) => t.subjectName))],
    [timetable],
  );

  const slotLookupMap = useMemo(() => {
    const map = new Map<string, TimetableSlot>();
    timetable.forEach((t) => {
      map.set(`${t.day.toLowerCase()}-${t.startTime}-${t.endTime}`, t);
    });
    return map;
  }, [timetable]);

  const subjectColorMap = useMemo(() => {
    const map = new Map<string, string>();
    uniqueSubjects.forEach((subject, i) => {
      map.set(subject, SUBJECT_COLORS[i % SUBJECT_COLORS.length]);
    });
    return map;
  }, [uniqueSubjects]);

  const getColor = (subjectName: string) => {
    return subjectColorMap.get(subjectName) || SUBJECT_COLORS[0];
  };

  const getSlot = (day: string, timeSlot: string) => {
    const [start, end] = timeSlot.split("-");
    return slotLookupMap.get(`${day}-${start}-${end}`);
  };

  const dayViewSlots = useMemo(() => {
    return allTimeSlots.map((ts) => {
      const [start, end] = ts.split("-");
      const slot = slotLookupMap.get(`${selectedDayKey}-${start}-${end}`);
      return (
        slot ?? {
          id: `free-${ts}`,
          day: selectedDayKey,
          startTime: start,
          endTime: end,
          subjectName: "",
          teacherName: "",
          className: "",
        }
      );
    });
  }, [allTimeSlots, selectedDayKey, slotLookupMap]);

  if (loading && timetable.length === 0) {
    return <LoadingSkeleton />;
  }

  if (timetable.length === 0 && !loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          classes={classes}
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
          viewMode={viewMode}
          onViewChange={setViewMode}
        />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        classes={classes}
        selectedClass={selectedClass}
        onClassChange={setSelectedClass}
        viewMode={viewMode}
        onViewChange={handleViewChange}
      />

      {loading ? (
        <LoadingSkeleton />
      ) : viewMode === "grid" ? (
        <GridView
          timeSlots={allTimeSlots}
          getSlot={getSlot}
          getColor={getColor}
          currentDayKey={currentDayKey}
          workingDays={workingDays}
        />
      ) : viewMode === "list" ? (
        <ListView
          slotsByDay={slotsByDay}
          getColor={getColor}
          currentDayKey={currentDayKey}
          workingDays={workingDays}
        />
      ) : (
        <DayView
          dayKey={selectedDayKey}
          currentDayKey={currentDayKey}
          onSelectDay={setSelectedDay}
          dayViewSlots={dayViewSlots}
          getColor={getColor}
          workingDays={workingDays}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PageHeader
// ---------------------------------------------------------------------------

function PageHeader({
  classes,
  selectedClass,
  onClassChange,
  viewMode,
  onViewChange,
}: {
  classes: ClassInfo[];
  selectedClass: string;
  onClassChange: (v: string) => void;
  viewMode: ViewMode;
  onViewChange: (m: ViewMode) => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          My Timetable
        </h2>
        <p className="text-sm text-muted-foreground">
          Weekly class schedule
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Select value={selectedClass} onValueChange={onClassChange}>
          <SelectTrigger className="w-56 bg-card ">
            <SelectValue placeholder="Select Schedule" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-semibold text-blue-600 dark:text-blue-400">
              My Personal Schedule
            </SelectItem>
            {classes.length > 0 && <div className="h-px bg-muted my-1" />}
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                Class {c.name} - {c.section}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ViewToggle mode={viewMode} onChange={onViewChange} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grid View
// ---------------------------------------------------------------------------

function GridView({
  timeSlots,
  getSlot,
  getColor,
  currentDayKey,
  workingDays,
}: {
  timeSlots: string[];
  getSlot: (day: string, ts: string) => TimetableSlot | undefined;
  getColor: (name: string) => string;
  currentDayKey: string;
  workingDays: string[];
}) {
  return (
    <Card className="rounded-xl shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="py-2.5 px-3 text-left text-xs font-normal text-muted-foreground w-32 border-r ">
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    Time Slot
                  </div>
                </th>
                {workingDays.map((day) => (
                  <th
                    key={day}
                    className={`py-2.5 px-2 text-center text-xs border-r  last:border-r-0 ${
                      day === currentDayKey
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium"
                        : "text-muted-foreground font-normal"
                    }`}
                  >
                    {SHORT_DAY_LABELS[day]}
                    {day === currentDayKey && (
                      <span className="ml-1.5 inline-block size-1.5 rounded-full bg-blue-500" />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((ts, idx) => {
                const [start, end] = ts.split("-");
                return (
                  <tr
                    key={ts}
                    className={
                      idx % 2 === 0
                        ? "bg-background"
                        : "bg-muted/10"
                    }
                  >
                    <td className="py-2.5 px-3 align-top border-r ">
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                           <Clock className="size-3 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-foreground/90 leading-tight">{formatTime(start)}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {formatTime(end)}
                          </p>
                        </div>
                      </div>
                    </td>
                    {workingDays.map((day) => {
                      const slot = getSlot(day, ts);
                      const isToday = day === currentDayKey;
                      const inProgress =
                        slot &&
                        isToday &&
                        isBetween(slot.startTime, slot.endTime);
                      const isBreak =
                        slot &&
                        (!!slot.label ||
                          (!slot.teacherName && !slot.subjectName) ||
                          slot.subjectName?.toLowerCase().includes("break") ||
                          slot.subjectName?.toLowerCase().includes("lunch") ||
                          slot.label?.toLowerCase().includes("break") ||
                          slot.label?.toLowerCase().includes("lunch"));
                      const BreakIcon =
                        isBreak &&
                        ((slot.label || slot.subjectName || "").toLowerCase().includes("tea") ||
                          (slot.label || slot.subjectName || "").toLowerCase().includes("coffee"))
                          ? Coffee
                          : Utensils;

                      return (
                        <td
                          key={day}
                          className={`py-2 px-1.5 align-top border-r  last:border-r-0 ${
                            isToday
                              ? "bg-blue-50/20 dark:bg-blue-900/10"
                              : ""
                          }`}
                        >
                          {slot ? (
                            isBreak ? (
                              <div
                                className={`relative rounded-lg p-2.5 border transition-shadow border-amber-300/60 dark:border-amber-600/40 bg-amber-500/10 dark:bg-amber-500/15 text-amber-900 dark:text-amber-200 min-h-[52px] flex items-center gap-2.5 ${
                                  inProgress ? "ring-2 ring-blue-400 dark:ring-blue-500 shadow-md" : ""
                                } ${
                                  isToday
                                    ? "ring-1 ring-blue-200 dark:ring-blue-800"
                                    : ""
                                }`}
                              >
                                {inProgress && (
                                  <Badge className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[9px] px-1.5 py-0 h-4 font-normal">
                                    Now
                                  </Badge>
                                )}
                                <div className="size-6 rounded-md bg-amber-500/15 dark:bg-amber-500/25 flex items-center justify-center shrink-0">
                                  <BreakIcon className="size-3 text-amber-700 dark:text-amber-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium leading-tight truncate">
                                    {slot.label || slot.subjectName || "Lunch Break"}
                                  </p>
                                  {slot.teacherName && (
                                    <p className="text-[10px] text-amber-700/70 dark:text-amber-400/70 mt-0.5 truncate font-normal">
                                      {slot.teacherName}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div
                                className={`relative rounded-lg px-2.5 py-2 border transition-shadow min-h-[50px] flex flex-col justify-center ${getColor(
                                  slot.subjectName,
                                )} ${inProgress ? "ring-2 ring-blue-400 dark:ring-blue-500 shadow-md" : ""} ${
                                  isToday
                                    ? "ring-1 ring-blue-200 dark:ring-blue-800"
                                    : ""
                                }`}
                              >
                                {inProgress && (
                                  <Badge className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[9px] px-1.5 py-0 h-4 font-normal">
                                    Now
                                  </Badge>
                                )}
                                <p className="text-xs font-medium leading-tight truncate">
                                  {slot.label || slot.subjectName}
                                </p>
                                {slot.teacherName && (
                                  <p className="text-[11px] mt-0.5 opacity-75 font-normal truncate">
                                    {slot.teacherName}
                                  </p>
                                )}
                              </div>
                            )
                          ) : (
                            <div className="rounded-lg border border-dashed border-muted-foreground/20 h-[50px] flex items-center justify-center">
                              <span className="text-[11px] font-normal text-muted-foreground/40">
                                -
                              </span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// List View
// ---------------------------------------------------------------------------

function ListView({
  slotsByDay,
  currentDayKey,
  workingDays,
}: {
  slotsByDay: Record<string, TimetableSlot[]>;
  getColor: (name: string) => string;
  currentDayKey: string;
  workingDays: string[];
}) {
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>("all");

  const daysWithSlots = useMemo(() => {
    return workingDays.filter(
      (d) => (slotsByDay[d] || []).length > 0
    );
  }, [workingDays, slotsByDay]);

  const filteredDays = useMemo(() => {
    if (selectedDayFilter === "all") return daysWithSlots;
    return daysWithSlots.filter(
      (d) => d.toLowerCase() === selectedDayFilter.toLowerCase()
    );
  }, [daysWithSlots, selectedDayFilter]);

  if (daysWithSlots.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Day Selector Pills in ListView */}
      <div className="flex items-center gap-2 overflow-x-auto py-2.5 px-1">
        <Button
          size="sm"
          variant={selectedDayFilter === "all" ? "default" : "outline"}
          className={`rounded-full px-4 text-xs font-medium shrink-0 transition-colors ${
            selectedDayFilter === "all"
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
          onClick={() => setSelectedDayFilter("all")}
        >
          All
        </Button>
        {workingDays.map((day) => {
          const dayLower = day.toLowerCase();
          const isActive = selectedDayFilter.toLowerCase() === dayLower;
          const isCurrentDay = dayLower === currentDayKey.toLowerCase();
          const label = SHORT_DAY_LABELS[dayLower] || day;

          return (
            <Button
              key={day}
              size="sm"
              variant={isActive ? "default" : "outline"}
              className={`rounded-full px-4 text-xs font-medium shrink-0 transition-colors ${
                isActive
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                  : isCurrentDay
                    ? "border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/20 hover:bg-blue-100/80"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
              onClick={() => setSelectedDayFilter(isActive ? "all" : day)}
            >
              <span>{label}</span>
              {isCurrentDay && !isActive && (
                <span className="ml-1.5 size-1.5 rounded-full bg-blue-500 inline-block" />
              )}
            </Button>
          );
        })}
      </div>

      {filteredDays.length === 0 ? (
        <div className="rounded-2xl border border-border/80 bg-card p-8 text-center text-muted-foreground shadow-xs">
          <p className="font-medium text-foreground">No periods scheduled for this day</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 text-xs"
            onClick={() => setSelectedDayFilter("all")}
          >
            Show All Days
          </Button>
        </div>
      ) : (
        filteredDays.map((day) => {
        const isToday = day === currentDayKey;
        const daySlots = slotsByDay[day] || [];
        const sortedSlots = [...daySlots].sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        );

        const items: (
          | { type: "break"; id: string; time: string; name: string }
          | {
              type: "period";
              slot: TimetableSlot;
              periodNumber: number;
              inProgress: boolean;
            }
        )[] = [];

        let periodIndex = 0;
        let slotCounter = 1;

        for (let i = 0; i < sortedSlots.length; i++) {
          const slot = sortedSlots[i];
          const prevSlot = i > 0 ? sortedSlots[i - 1] : null;

          if (prevSlot) {
            const prevEndMin = timeToMinutes(prevSlot.endTime);
            const currStartMin = timeToMinutes(slot.startTime);
            const gap = currStartMin - prevEndMin;

            if (gap >= 10) {
              const breakName =
                gap >= 25 || prevEndMin >= 660 ? "Lunch Break" : "Short Break";
              items.push({
                type: "break",
                id: `break-gap-${day}-${prevSlot.id}-${slot.id}`,
                time: formatTime(prevSlot.endTime),
                name: breakName,
              });
              slotCounter += 1;
            }
          }

          const isNamedBreak =
            (slot.subjectName &&
              (slot.subjectName.toLowerCase().includes("break") ||
                slot.subjectName.toLowerCase().includes("lunch"))) ||
            (slot.label &&
              (slot.label.toLowerCase().includes("break") ||
                slot.label.toLowerCase().includes("lunch")));

          if (isNamedBreak) {
            items.push({
              type: "break",
              id: slot.id,
              time: formatTime(slot.startTime),
              name: slot.label || slot.subjectName || "Break",
            });
            slotCounter += 1;
            continue;
          }

          periodIndex += 1;
          const inProgress =
            isToday && isBetween(slot.startTime, slot.endTime);

          items.push({
            type: "period",
            slot,
            periodNumber: (slot as any).periodNumber ?? slotCounter,
            inProgress,
          });
          slotCounter += 1;
        }

        return (
          <div
            key={day}
            className="rounded-2xl border border-border/80 bg-card p-5 sm:p-7 shadow-xs"
          >
            {/* Card Header matching DayView */}
            <div className="flex items-center justify-between pb-6 border-b border-border/50">
              <div className="flex items-center gap-3.5">
                <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/50 flex items-center justify-center shrink-0">
                  <Calendar className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight">
                    {DAY_LABELS[day]}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {periodIndex} periods scheduled
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isToday && (
                  <Badge className="bg-blue-600 text-white text-[10px] h-5 px-2">
                    Today
                  </Badge>
                )}
                <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50">
                  {SHORT_DAY_LABELS[day]}
                </span>
              </div>
            </div>

            {/* Schedule List matching DayView */}
            <div className="mt-6 space-y-6 sm:space-y-7">
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Coffee className="size-8 mx-auto mb-1.5 opacity-30" />
                  <p className="font-medium text-xs sm:text-sm">No classes scheduled</p>
                  <p className="text-[11px] mt-0.5 text-muted-foreground/70">
                    This day is completely free.
                  </p>
                </div>
              ) : (
                items.map((item) => {
                  if (item.type === "break") {
                    const BreakIcon = item.name.toLowerCase().includes("lunch")
                      ? Utensils
                      : Coffee;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 sm:gap-6 py-1"
                      >
                        <div className="w-16 sm:w-20 shrink-0 text-left">
                          <p className="text-xs sm:text-sm text-muted-foreground font-normal">
                            {item.time}
                          </p>
                        </div>

                        <div className="flex-1 relative flex items-center justify-center">
                          <div className="w-full border-t border-dashed border-border/80 absolute inset-x-0" />
                          <div className="relative z-10 bg-card px-3 py-0.5 text-xs text-muted-foreground flex items-center gap-1.5 select-none">
                            <BreakIcon className="size-3.5 text-muted-foreground/80" />
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </div>

                        <div className="w-7 sm:w-8 shrink-0" />
                      </div>
                    );
                  }

                  const { slot, periodNumber, inProgress } = item;

                  return (
                    <div
                      key={slot.id}
                      className="flex items-center gap-4 sm:gap-6 group"
                    >
                      {/* Time column */}
                      <div className="w-16 sm:w-20 shrink-0 text-left">
                        <p className="text-xs sm:text-sm font-semibold text-foreground/85 leading-tight">
                          {formatTime(slot.startTime)}
                        </p>
                        <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                          {formatTime(slot.endTime)}
                        </p>
                      </div>

                      {/* Vertical accent bar + content */}
                      <div className="flex-1 min-w-0 border-l-2 border-blue-200 dark:border-blue-800/80 pl-4 sm:pl-5 py-0.5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm sm:text-base font-semibold text-foreground leading-snug">
                                {slot.label || slot.subjectName}
                              </h4>
                              {inProgress && (
                                <Badge className="bg-blue-600 hover:bg-blue-600 text-white text-[10px] font-bold h-4 px-1.5 shadow-xs animate-pulse">
                                  Live
                                </Badge>
                              )}
                            </div>
                          </div>

                          {(slot.className || slot.teacherName) && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto shrink-0">
                              {slot.teacherName && (
                                <div className="flex items-center gap-1.5 font-medium text-foreground/80">
                                  <User className="size-3.5 text-muted-foreground/70" />
                                  <span>{slot.teacherName}</span>
                                </div>
                              )}
                              {slot.teacherName && slot.className && (
                                <span className="text-muted-foreground/40">|</span>
                              )}
                              {slot.className && <span>{slot.className}</span>}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Period circular badge */}
                      <div className="shrink-0">
                        <div className="size-7 sm:size-8 rounded-full bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground text-xs font-semibold flex items-center justify-center">
                          {periodNumber}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Day View
// ---------------------------------------------------------------------------

interface FreeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subjectName: "";
  teacherName: "";
  className: "";
  label?: string;
  periodNumber?: number;
}

function DayView({
  dayKey,
  currentDayKey,
  onSelectDay,
  dayViewSlots,
  getColor,
  workingDays,
}: {
  dayKey: string;
  currentDayKey: string;
  onSelectDay: (d: string) => void;
  dayViewSlots: (TimetableSlot | FreeSlot)[];
  getColor: (name: string) => string;
  workingDays: string[];
}) {
  const { formattedDate, fullDay } = useMemo(() => getDisplayDate(dayKey), [dayKey]);

  // Compute periods and breaks
  const { items, totalPeriods } = useMemo(() => {
    const list: (
      | { type: "break"; id: string; time: string; name: string }
      | {
          type: "period";
          slot: TimetableSlot | FreeSlot;
          periodIndex: number;
          periodNumber: number;
          isFree: boolean;
          inProgress: boolean;
        }
    )[] = [];

    let periodIndex = 0;
    let slotCounter = 1;

    for (let i = 0; i < dayViewSlots.length; i++) {
      const slot = dayViewSlots[i];
      const prevSlot = i > 0 ? dayViewSlots[i - 1] : null;

      // Check if gap between previous slot and current slot
      if (prevSlot) {
        const prevEndMin = timeToMinutes(prevSlot.endTime);
        const currStartMin = timeToMinutes(slot.startTime);
        const gap = currStartMin - prevEndMin;

        if (gap >= 10) {
          const breakName = gap >= 25 || prevEndMin >= 660 ? "Lunch" : "Short Break";
          list.push({
            type: "break",
            id: `break-gap-${prevSlot.id}-${slot.id}`,
            time: formatTime(prevSlot.endTime),
            name: breakName,
          });
          slotCounter += 1;
        }
      }

      // Check if slot itself is named as a break
      const isNamedBreak =
        (slot.subjectName && (
          slot.subjectName.toLowerCase().includes("break") ||
          slot.subjectName.toLowerCase().includes("lunch")
        )) ||
        ((slot as any).label && (
          (slot as any).label.toLowerCase().includes("break") ||
          (slot as any).label.toLowerCase().includes("lunch")
        ));

      if (isNamedBreak) {
        list.push({
          type: "break",
          id: slot.id,
          time: formatTime(slot.startTime),
          name: slot.subjectName || (slot as any).label || "Break",
        });
        slotCounter += 1;
        continue;
      }

      periodIndex += 1;
      const isFree = !slot.subjectName;
      const inProgress =
        !isFree &&
        dayKey === currentDayKey &&
        isBetween(slot.startTime, slot.endTime);

      list.push({
        type: "period",
        slot,
        periodIndex,
        periodNumber: (slot as any).periodNumber ?? slotCounter,
        isFree,
        inProgress,
      });

      slotCounter += 1;
    }

    return { items: list, totalPeriods: periodIndex };
  }, [dayViewSlots, dayKey, currentDayKey]);

  const handlePrevDay = () => {
    const currentIndex = workingDays.indexOf(dayKey);
    if (currentIndex > 0) {
      onSelectDay(workingDays[currentIndex - 1]);
    } else {
      onSelectDay(workingDays[workingDays.length - 1]);
    }
  };

  const handleNextDay = () => {
    const currentIndex = workingDays.indexOf(dayKey);
    if (currentIndex >= 0 && currentIndex < workingDays.length - 1) {
      onSelectDay(workingDays[currentIndex + 1]);
    } else {
      onSelectDay(workingDays[0]);
    }
  };

  const isSelectedToday = dayKey.toLowerCase() === currentDayKey.toLowerCase();

  return (
    <div className="space-y-6">
      {/* Main Day View Card */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-7 shadow-xs">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-6 border-b border-border/50">
          <div className="flex items-center gap-3.5">
            <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/50 flex items-center justify-center shrink-0">
              <Calendar className="size-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight">
                {formattedDate}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalPeriods} periods today
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={handlePrevDay}
              title="Previous Day"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50">
              {isSelectedToday ? "Today" : fullDay}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={handleNextDay}
              title="Next Day"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Schedule List */}
        <div className="mt-6 space-y-6 sm:space-y-7">
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Coffee className="size-10 mx-auto mb-2 opacity-30" />
              <p className="font-medium text-sm">No classes scheduled</p>
              <p className="text-xs mt-1">This day is completely free.</p>
            </div>
          ) : (
            items.map((item) => {
              if (item.type === "break") {
                return (
                  <div key={item.id} className="flex items-center gap-4 sm:gap-6 py-1">
                    <div className="w-16 sm:w-20 shrink-0 text-left">
                      <p className="text-xs sm:text-sm text-muted-foreground font-normal">
                        {item.time}
                      </p>
                    </div>

                    <div className="flex-1 relative flex items-center justify-center">
                      <div className="w-full border-t border-dashed border-border/80 absolute inset-x-0" />
                      <div className="relative z-10 bg-card px-3 py-0.5 text-xs text-muted-foreground flex items-center gap-1.5 select-none">
                        {(() => {
                          const BreakIcon = item.name.toLowerCase().includes("lunch") ? Utensils : Coffee;
                          return <BreakIcon className="size-3.5 text-muted-foreground/80" />;
                        })()}
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </div>

                    <div className="w-7 sm:w-8 shrink-0" />
                  </div>
                );
              }

              const { slot, periodNumber, periodIndex, isFree, inProgress } = item;
              const periodTitle = isFree
                ? (slot as any).label || `Period ${periodIndex}`
                : slot.subjectName;

              return (
                <div key={slot.id} className="flex items-center gap-4 sm:gap-6 group">
                  {/* Time column */}
                  <div className="w-16 sm:w-20 shrink-0 text-left">
                    <p className="text-xs sm:text-sm font-semibold text-foreground/85 leading-tight">
                      {formatTime(slot.startTime)}
                    </p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                      {formatTime(slot.endTime)}
                    </p>
                  </div>

                  {/* Vertical accent bar + content */}
                  <div className="flex-1 min-w-0 border-l-2 border-blue-200 dark:border-blue-800/80 pl-4 sm:pl-5 py-0.5">
                    {isFree ? (
                      <div>
                        <h4 className="text-sm sm:text-base font-semibold text-foreground leading-snug">
                          {periodTitle}
                        </h4>
                        <p className="text-xs text-muted-foreground italic mt-0.5">
                          Free period
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm sm:text-base font-semibold text-foreground leading-snug">
                              {periodTitle}
                            </h4>
                            {inProgress && (
                              <Badge className="bg-blue-600 hover:bg-blue-600 text-white text-[10px] font-bold h-4 px-1.5 shadow-xs animate-pulse">
                                Live
                              </Badge>
                            )}
                          </div>
                        </div>
                        {(slot.className || slot.teacherName) && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto shrink-0">
                            {slot.teacherName && (
                              <div className="flex items-center gap-1.5 font-medium text-foreground/80">
                                <User className="size-3.5 text-muted-foreground/70" />
                                <span>{slot.teacherName}</span>
                              </div>
                            )}
                            {slot.teacherName && slot.className && (
                              <span className="text-muted-foreground/40">|</span>
                            )}
                            {slot.className && <span>{slot.className}</span>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Period circular badge */}
                  <div className="shrink-0">
                    <div className="size-7 sm:size-8 rounded-full bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground text-xs font-semibold flex items-center justify-center">
                      {periodNumber}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-xl" />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 px-4 text-center animate-in fade-in-50 duration-300">
      <div className="relative mb-6 flex items-center justify-center">
        <img
          src="/assets/admin/timetable.avif"
          alt="No timetable records"
          className="w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 object-contain drop-shadow-sm select-none pointer-events-none"
          loading="eager"
        />
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
        No timetable records found
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto mt-2 sm:mt-2.5 leading-relaxed">
        Timetable schedules will appear here once classes and time slots are assigned by your administrator.
      </p>
    </div>
  );
}
