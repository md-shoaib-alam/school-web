"use client";


import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
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
  Clock,
  BookOpen,
  User,
  GraduationCap,
  Coffee,
} from "lucide-react";

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

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"];

const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
};

const SHORT_DAY_LABELS: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
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
  if (jsDay >= 1 && jsDay <= 5) return jsDay - 1;
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
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${min} ${ampm}`;
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
  const views: { key: ViewMode; icon: typeof LayoutGrid; label: string }[] = [
    { key: "grid", icon: LayoutGrid, label: "Grid" },
    { key: "list", icon: List, label: "List" },
    { key: "day", icon: CalendarDays, label: "Day" },
  ];

  return (
    <div className="inline-flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-0.5">
      {views.map(({ key, icon: Icon, label }) => (
        <Button
          key={key}
          size="sm"
          variant={mode === key ? "default" : "ghost"}
          onClick={() => onChange(key)}
          className={
            mode === key
              ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-800"
          }
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TeacherTimetable() {
  const [selectedClass, setSelectedClass] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedDay, setSelectedDay] = useState("");

  const { data: classes = [] } = useQuery({
    queryKey: ["teacher-classes"],
    queryFn: async () => {
      const res = await api.get<any>("/classes");
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

  const todayIndex = useMemo(() => toDayIndex(new Date().getDay()), []);
  const currentDayKey = useMemo(() => DAYS[todayIndex], [todayIndex]);

  const selectedDayKey = useMemo(
    () => selectedDay || currentDayKey,
    [selectedDay, currentDayKey],
  );

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
    DAYS.forEach((d) => (map[d] = []));
    timetable.forEach((t) => {
      if (map[t.day]) map[t.day].push(t);
    });
    DAYS.forEach((d) => {
      map[d].sort(
        (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
      );
    });
    return map;
  }, [timetable]);

  const uniqueSubjects = useMemo(
    () => [...new Set(timetable.map((t) => t.subjectName))],
    [timetable],
  );

  const slotLookupMap = useMemo(() => {
    const map = new Map<string, TimetableSlot>();
    timetable.forEach((t) => {
      map.set(`${t.day}-${t.startTime}-${t.endTime}`, t);
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
        onViewChange={setViewMode}
      />

      {loading ? (
        <LoadingSkeleton />
      ) : viewMode === "grid" ? (
        <GridView
          timeSlots={allTimeSlots}
          getSlot={getSlot}
          getColor={getColor}
          currentDayKey={currentDayKey}
        />
      ) : viewMode === "list" ? (
        <ListView
          slotsByDay={slotsByDay}
          getColor={getColor}
          currentDayKey={currentDayKey}
        />
      ) : (
        <DayView
          dayKey={selectedDayKey}
          currentDayKey={currentDayKey}
          onSelectDay={setSelectedDay}
          dayViewSlots={dayViewSlots}
          getColor={getColor}
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
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          My Timetable
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Weekly class schedule
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Select value={selectedClass} onValueChange={onClassChange}>
          <SelectTrigger className="w-56 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <SelectValue placeholder="Select Schedule" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-semibold text-emerald-600 dark:text-emerald-400">
              My Personal Schedule
            </SelectItem>
            {classes.length > 0 && <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />}
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
}: {
  timeSlots: string[];
  getSlot: (day: string, ts: string) => TimetableSlot | undefined;
  getColor: (name: string) => string;
  currentDayKey: string;
}) {
  return (
    <Card className="rounded-xl shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="py-3 px-4 text-left font-medium text-muted-foreground w-36 border-r border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Time Slot
                  </div>
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className={`py-3 px-2 text-center font-medium border-r border-gray-100 dark:border-gray-700 last:border-r-0 ${
                      day === currentDayKey
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {SHORT_DAY_LABELS[day]}
                    {day === currentDayKey && (
                      <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
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
                    <td className="py-3 px-4 align-top border-r border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground leading-tight">{formatTime(start)}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {formatTime(end)}
                          </p>
                        </div>
                      </div>
                    </td>
                    {DAYS.map((day) => {
                      const slot = getSlot(day, ts);
                      const isToday = day === currentDayKey;
                      const inProgress =
                        slot &&
                        isToday &&
                        isBetween(slot.startTime, slot.endTime);
                      return (
                        <td
                          key={day}
                          className={`py-2 px-1.5 align-top border-r border-gray-100 dark:border-gray-700 last:border-r-0 ${
                            isToday
                              ? "bg-emerald-50/20 dark:bg-emerald-900/10"
                              : ""
                          }`}
                        >
                          {slot ? (
                            <div
                              className={`relative rounded-lg p-2.5 border transition-shadow ${getColor(
                                slot.subjectName,
                              )} ${inProgress ? "ring-2 ring-emerald-400 dark:ring-emerald-500 shadow-md" : ""} ${
                                isToday
                                  ? "ring-1 ring-emerald-200 dark:ring-emerald-800"
                                  : ""
                              }`}
                            >
                              {inProgress && (
                                <Badge className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[9px] px-1.5 py-0 h-4">
                                  Now
                                </Badge>
                              )}
                              <p className="font-semibold text-sm leading-tight">
                                {slot.subjectName}
                              </p>
                              {slot.teacherName && (
                                <p className="text-xs mt-1 opacity-80">
                                  {slot.teacherName}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="rounded-lg border border-dashed border-muted-foreground/20 h-[52px] flex items-center justify-center">
                              <span className="text-[11px] text-muted-foreground/50">
                                —
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
  getColor,
  currentDayKey,
}: {
  slotsByDay: Record<string, TimetableSlot[]>;
  getColor: (name: string) => string;
  currentDayKey: string;
}) {
  const daysWithSlots = DAYS.filter((d) => slotsByDay[d].length > 0);

  if (daysWithSlots.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {daysWithSlots.map((day) => (
        <Card key={day} className="rounded-xl shadow-sm overflow-hidden">
          <div
            className={`px-4 py-2.5 flex items-center gap-2 border-b ${
              day === currentDayKey
                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                : "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700"
            }`}
          >
            <CalendarDays
              className={`h-4 w-4 ${
                day === currentDayKey
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            />
            <span
              className={`text-sm font-semibold ${
                day === currentDayKey
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {DAY_LABELS[day]}
            </span>
            {day === currentDayKey && (
              <Badge className="bg-emerald-600 text-white text-[10px] ml-auto h-5">
                Today
              </Badge>
            )}
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
              {slotsByDay[day].length} class
              {slotsByDay[day].length !== 1 ? "es" : ""}
            </span>
          </div>

          <CardContent className="p-2">
            {slotsByDay[day].map((slot) => {
              const inProgress =
                day === currentDayKey &&
                isBetween(slot.startTime, slot.endTime);
              return (
                <div
                  key={slot.id}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                    inProgress
                      ? "bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-200 dark:ring-emerald-800"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <div className="flex-shrink-0 w-24 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                    <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>

                  <Badge
                    variant="outline"
                    className={`flex-shrink-0 text-xs font-medium ${getColor(slot.subjectName)}`}
                  >
                    {slot.subjectName}
                  </Badge>

                  <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 min-w-0">
                    <User className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{slot.teacherName}</span>
                  </div>

                  <div className="hidden md:flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 min-w-0 ml-auto">
                    <GraduationCap className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{slot.className}</span>
                  </div>

                  {inProgress && (
                    <Badge className="bg-emerald-500 text-white text-[10px] ml-auto sm:ml-0 h-5 flex-shrink-0">
                      In Progress
                    </Badge>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
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
}

function DayView({
  dayKey,
  currentDayKey,
  onSelectDay,
  dayViewSlots,
  getColor,
}: {
  dayKey: string;
  currentDayKey: string;
  onSelectDay: (d: string) => void;
  dayViewSlots: (TimetableSlot | FreeSlot)[];
  getColor: (name: string) => string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {DAYS.map((day) => {
          const isToday = day === currentDayKey;
          const isActive = day === dayKey;
          return (
            <Button
              key={day}
              size="sm"
              variant={isActive ? "default" : "outline"}
              onClick={() => onSelectDay(day)}
              className={
                isActive
                  ? isToday
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                    : "bg-gray-800 dark:bg-gray-700 text-white hover:bg-gray-900 dark:hover:bg-gray-600 shadow-sm"
                  : isToday
                    ? "border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }
            >
              <span className="font-medium">{SHORT_DAY_LABELS[day]}</span>
            </Button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {DAY_LABELS[dayKey]}
        </h3>
        {dayKey === currentDayKey && (
          <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs">
            Today
          </Badge>
        )}
        <span className="text-sm text-gray-400 dark:text-gray-500 ml-auto">
          {dayViewSlots.filter((s) => s.subjectName).length} of{" "}
          {dayViewSlots.length} periods
        </span>
      </div>

      <div className="relative space-y-3">
        <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-gray-200 dark:bg-gray-700 block" />

        {dayViewSlots.map((slot) => {
          const isFree = !slot.subjectName;
          const inProgress =
            !isFree &&
            dayKey === currentDayKey &&
            isBetween(slot.startTime, slot.endTime);

          if (isFree) {
            return (
              <div key={slot.id} className="flex items-stretch gap-4">
                <div className="flex-shrink-0 w-10 flex justify-center pt-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-900 shadow-sm block"></div>
                </div>
                <Card className="flex-1 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl shadow-none">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Coffee className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
                        Free Period
                      </p>
                      <p className="text-xs text-gray-300 dark:text-gray-600">
                        {slot.startTime} - {slot.endTime}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          }

          return (
            <div key={slot.id} className="flex items-stretch gap-4">
              <div className="flex-shrink-0 w-10 flex justify-center pt-5">
                <div
                  className={`w-3 h-3 rounded-full border-2 bg-background shadow-sm block transition-all ${
                    inProgress
                      ? "border-emerald-500 scale-110 ring-2 ring-emerald-100 dark:ring-emerald-900/50"
                      : "border-emerald-400"
                  }`}
                />
              </div>
              <Card
                className={`flex-1 rounded-xl shadow-sm transition-all border border-gray-200 dark:border-gray-800 ${
                  inProgress
                    ? "ring-1 ring-emerald-200 dark:ring-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/10"
                    : "hover:shadow-md bg-white dark:bg-gray-950"
                }`}
              >
                <CardContent className="p-4 flex flex-row flex-wrap sm:flex-nowrap items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-[120px] flex-1">
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 leading-tight tracking-tight">
                      {slot.subjectName}
                    </h4>
                    <div className="flex flex-col text-sm text-gray-500 dark:text-gray-400 space-y-0.5">
                      <p>{slot.teacherName}</p>
                      {slot.className && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">{slot.className}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <Badge 
                      variant="outline" 
                      className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 font-medium px-2.5 py-1 rounded-lg h-auto text-xs flex items-center gap-1.5"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </Badge>
                    {inProgress && (
                      <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold h-5 shadow-sm animate-pulse">
                        Live
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
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
    <div className="text-center py-16 text-gray-400 dark:text-gray-500">
      <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
        No timetable available
      </p>
      <p className="text-sm mt-1">
        Timetable will appear once classes are assigned
      </p>
    </div>
  );
}
