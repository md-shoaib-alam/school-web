"use client";


import { apiFetch } from "@/lib/api";
import { useState, useEffect, useMemo } from "react";
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
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedDay, setSelectedDay] = useState("");

  useEffect(() => {
    apiFetch("/api/classes")
      .then((r) => r.json())
      .then((data: ClassInfo[]) => {
        setClasses(data);
        if (data.length > 0) setSelectedClass(data[0].id);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    apiFetch(`/api/timetable?classId=${selectedClass}`)
      .then((r) => r.json())
      .then((data: TimetableSlot[]) => {
        setTimetable(data);
        setLoading(false);
      });
  }, [selectedClass]);

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

  const getColor = (subjectName: string) => {
    const idx = uniqueSubjects.indexOf(subjectName);
    return SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
  };

  const getSlot = (day: string, timeSlot: string) => {
    const [start, end] = timeSlot.split("-");
    return timetable.find(
      (t) => t.day === day && t.startTime === start && t.endTime === end,
    );
  };

  const dayViewSlots = useMemo(() => {
    return allTimeSlots.map((ts) => {
      const [start, end] = ts.split("-");
      const slot = timetable.find(
        (t) =>
          t.day === selectedDayKey &&
          t.startTime === start &&
          t.endTime === end,
      );
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
  }, [allTimeSlots, selectedDayKey, timetable]);

  if (loading && classes.length === 0) {
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
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          My Timetable
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Weekly class schedule
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Select value={selectedClass} onValueChange={onClassChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} - {c.section}
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
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="p-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-32 border-r border-gray-100 dark:border-gray-700">
                  Time
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className={`p-3 text-center text-xs font-semibold border-r border-gray-100 dark:border-gray-700 last:border-r-0 ${
                      day === currentDayKey
                        ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-900/20"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {DAY_LABELS[day]}
                    {day === currentDayKey && (
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mx-auto mt-1" />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((ts, idx) => (
                <tr
                  key={ts}
                  className={
                    idx % 2 === 0
                      ? "bg-white dark:bg-gray-950"
                      : "bg-gray-50/50 dark:bg-gray-900/30"
                  }
                >
                  <td className="p-3 text-xs text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {ts}
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
                        className={`p-1.5 border-r border-gray-100 dark:border-gray-700 last:border-r-0 ${
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
                            <p className="font-semibold text-xs leading-tight">
                              {slot.subjectName}
                            </p>
                            <p className="text-[10px] mt-0.5 opacity-70">
                              {slot.teacherName}
                            </p>
                          </div>
                        ) : (
                          <div className="p-2.5 text-xs text-gray-300 dark:text-gray-600 text-center">
                            —
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
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
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
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
        <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-gray-200 dark:bg-gray-700 hidden sm:block" />

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
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-900 shadow-sm hidden sm:block"></div>
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
              <div className="flex-shrink-0 w-10 flex justify-center pt-4">
                <div
                  className={`w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900 shadow-sm hidden sm:block ${
                    inProgress
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-gray-400 dark:bg-gray-600"
                  }`}
                />
              </div>
              <Card
                className={`flex-1 rounded-xl shadow-sm transition-all ${
                  inProgress
                    ? "ring-2 ring-emerald-400 dark:ring-emerald-500 shadow-emerald-100 dark:shadow-emerald-900/30 border-emerald-200 dark:border-emerald-800"
                    : "hover:shadow-md"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={`text-xs font-semibold ${getColor(slot.subjectName)}`}
                        >
                          {slot.subjectName}
                        </Badge>
                        {inProgress && (
                          <Badge className="bg-emerald-500 text-white text-[10px] h-5">
                            In Progress
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {slot.startTime} – {slot.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                          <User className="h-3.5 w-3.5" />
                          <span>{slot.teacherName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                          <GraduationCap className="h-3.5 w-3.5" />
                          <span>{slot.className}</span>
                        </div>
                      </div>
                    </div>
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
