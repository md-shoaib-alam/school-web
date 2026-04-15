"use client";


import { apiFetch } from "@/lib/api";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useAppStore } from "@/store/use-app-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  BookOpen,
  Calendar,
  LayoutGrid,
  List,
  CalendarDays,
  MapPin,
  User,
  Timer,
} from "lucide-react";
import type { StudentInfo, TimetableSlot } from "@/lib/types";

/* ─── Constants ─── */

type ViewMode = "grid" | "list" | "day";

const SUBJECT_COLORS = [
  "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-700",
  "bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-700",
  "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700",
  "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700",
  "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700",
  "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700",
  "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-700",
];

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;

const DAY_LABELS: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
};

const DAY_FULL_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
};

const JS_DAY_TO_KEY: Record<number, string> = {
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
};

/* ─── Helpers ─── */

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function getNow(): { timeStr: string; dayKey: string } {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  return {
    timeStr: `${h}:${m}`,
    dayKey: JS_DAY_TO_KEY[now.getDay()] || "",
  };
}

/* ─── Component ─── */

export function StudentTimetable() {
  const { currentUser } = useAppStore();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedDay, setSelectedDay] = useState(
    () => getNow().dayKey || "monday",
  );
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);

  const student = useMemo(
    () =>
      students.find((s) => s.email === currentUser?.email) ||
      students[0] ||
      null,
    [students, currentUser?.email],
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const studentsRes = await apiFetch("/api/students").then((r) => r.json());
      setStudents(studentsRes);

      const matchedStudent =
        studentsRes.find((s: StudentInfo) => s.email === currentUser?.email) ||
        studentsRes[0];

      if (!matchedStudent) {
        setLoading(false);
        return;
      }

      const ttRes = await fetch(
        `/api/timetable?classId=${matchedStudent.classId}`,
      );
      const ttData = await ttRes.json();
      setTimetable(ttData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.email]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ─── Computed data ─── */

  const { timeStr: currentTimeStr, dayKey: todayKey } = useMemo(getNow, []);

  const timeSlots = useMemo(() => {
    const slots = new Map<string, { start: string; end: string }>();
    timetable.forEach((t) => {
      if (!slots.has(t.startTime)) {
        slots.set(t.startTime, { start: t.startTime, end: t.endTime });
      }
    });
    return Array.from(slots.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, v]) => v);
  }, [timetable]);

  const subjectColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    const seen = new Set<string>();
    let colorIdx = 0;
    timetable.forEach((t) => {
      if (!seen.has(t.subjectName)) {
        seen.add(t.subjectName);
        map[t.subjectName] = SUBJECT_COLORS[colorIdx % SUBJECT_COLORS.length];
        colorIdx++;
      }
    });
    return map;
  }, [timetable]);

  const slotLookup = useMemo(() => {
    const map: Record<string, TimetableSlot> = {};
    timetable.forEach((t) => {
      map[`${t.day}-${t.startTime}`] = t;
    });
    return map;
  }, [timetable]);

  const todaySlots = useMemo(
    () => timetable.filter((t) => t.day === todayKey),
    [timetable, todayKey],
  );

  const selectedDaySlots = useMemo(
    () =>
      timeSlots
        .map((ts) => slotLookup[`${selectedDay}-${ts.start}`] || null)
        .filter(Boolean) as TimetableSlot[],
    [timeSlots, selectedDay, slotLookup],
  );

  const isCurrentSlot = useCallback(
    (start: string, end: string) =>
      currentTimeStr >= start && currentTimeStr <= end,
    [currentTimeStr],
  );

  const isSlotPast = useCallback(
    (start: string) => currentTimeStr > start,
    [currentTimeStr],
  );

  const nextPeriod = useMemo(() => {
    return todaySlots.find((s) => s.startTime > currentTimeStr) || null;
  }, [todaySlots, currentTimeStr]);

  /* ─── Render ─── */

  if (loading) return <TimetableSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header + View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            My Timetable
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 mt-0.5">
            Weekly class schedule and time slots
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-1">
          <Button
            size="sm"
            variant={viewMode === "grid" ? "default" : "ghost"}
            onClick={() => setViewMode("grid")}
            className={
              viewMode === "grid"
                ? "bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
                : "text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }
          >
            <LayoutGrid className="h-4 w-4 mr-1.5" />
            Grid
          </Button>
          <Button
            size="sm"
            variant={viewMode === "list" ? "default" : "ghost"}
            onClick={() => setViewMode("list")}
            className={
              viewMode === "list"
                ? "bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
                : "text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }
          >
            <List className="h-4 w-4 mr-1.5" />
            List
          </Button>
          <Button
            size="sm"
            variant={viewMode === "day" ? "default" : "ghost"}
            onClick={() => setViewMode("day")}
            className={
              viewMode === "day"
                ? "bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
                : "text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }
          >
            <CalendarDays className="h-4 w-4 mr-1.5" />
            Day
          </Button>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {todayKey ? DAY_FULL_LABELS[todayKey] : "Weekend"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400">
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {todaySlots.length} Classes
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400">
                Scheduled for today
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {nextPeriod
                  ? `Next: ${nextPeriod.subjectName}`
                  : todaySlots.length > 0
                    ? "No more classes"
                    : "No classes today"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400">
                {nextPeriod
                  ? `At ${formatTime(nextPeriod.startTime)}`
                  : todaySlots.length > 0
                    ? "All done for today"
                    : "Enjoy your day off"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {timeSlots.length === 0 ? (
        <Card className="rounded-xl shadow-sm">
          <CardContent className="py-16 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400">
              No timetable configured
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400 mt-1">
              Contact your school administrator
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ─── Grid View ─── */}
          {viewMode === "grid" && (
            <Card className="rounded-xl shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-violet-500" />
                    Weekly Schedule
                  </CardTitle>
                  {todayKey && (
                    <Badge className="bg-violet-100 text-violet-700 text-[10px] hover:bg-violet-100">
                      Today: {DAY_LABELS[todayKey]}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[600px]">
                  <div className="min-w-[640px]">
                    {/* Table Header */}
                    <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-1.5 mb-2">
                      <div className="text-xs font-medium text-gray-400 dark:text-gray-500 dark:text-gray-400 px-2 py-2" />
                      {DAYS.map((day) => (
                        <div
                          key={day}
                          className={`text-center text-xs font-semibold py-2 rounded-lg ${
                            day === todayKey
                              ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {DAY_LABELS[day]}
                        </div>
                      ))}
                    </div>

                    {/* Table Rows */}
                    {timeSlots.map((slot) => (
                      <div
                        key={slot.start}
                        className="grid grid-cols-[100px_repeat(5,1fr)] gap-1.5 mb-1.5"
                      >
                        {/* Time label */}
                        <div className="flex items-center justify-center px-2 py-1">
                          <div className="text-center">
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                              {formatTime(slot.start)}
                            </p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 dark:text-gray-400">
                              {formatTime(slot.end)}
                            </p>
                          </div>
                        </div>

                        {/* Day cells */}
                        {DAYS.map((day) => {
                          const cellSlot = slotLookup[`${day}-${slot.start}`];
                          const isToday = day === todayKey;
                          const isCurrent =
                            isToday &&
                            cellSlot &&
                            isCurrentSlot(cellSlot.startTime, cellSlot.endTime);
                          const isPast =
                            isToday &&
                            cellSlot &&
                            isSlotPast(cellSlot.startTime) &&
                            !isCurrent;

                          return (
                            <div
                              key={day}
                              className={`rounded-lg border px-2 py-2 min-h-[60px] transition-all ${
                                cellSlot
                                  ? subjectColorMap[cellSlot.subjectName] ||
                                    "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 dark:border-gray-700"
                                  : "bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 border-dashed"
                              } ${isToday && !cellSlot ? "bg-violet-50/30 border-violet-100" : ""} ${
                                isCurrent
                                  ? "ring-2 ring-violet-500 ring-offset-1 shadow-md scale-[1.02]"
                                  : ""
                              } ${isPast ? "opacity-60" : ""}`}
                            >
                              {cellSlot ? (
                                <div className="flex flex-col gap-0.5">
                                  <p className="text-xs font-semibold truncate">
                                    {cellSlot.subjectName}
                                  </p>
                                  <p className="text-[10px] opacity-70 truncate">
                                    {cellSlot.teacherName}
                                  </p>
                                  {isCurrent && (
                                    <Badge className="bg-violet-500 text-white text-[9px] px-1.5 py-0 w-fit mt-0.5 hover:bg-violet-500">
                                      Live
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <div className="h-full flex items-center justify-center">
                                  <span className="text-[10px] text-gray-300">
                                    —
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* ─── List View ─── */}
          {viewMode === "list" && (
            <Card className="rounded-xl shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <List className="h-4 w-4 text-violet-500" />
                    All Classes
                  </CardTitle>
                  {todayKey && (
                    <Badge className="bg-violet-100 text-violet-700 text-[10px] hover:bg-violet-100">
                      Today: {DAY_LABELS[todayKey]}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="max-h-[600px]">
                  <div className="px-6 pb-6 space-y-6">
                    {DAYS.map((day) => {
                      const daySlots = timeSlots
                        .map((ts) => slotLookup[`${day}-${ts.start}`] || null)
                        .filter(Boolean) as TimetableSlot[];

                      if (daySlots.length === 0) return null;

                      const isToday = day === todayKey;

                      return (
                        <div key={day}>
                          {/* Day Header */}
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                isToday
                                  ? "bg-violet-600 text-white"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {isToday
                                ? `Today — ${DAY_FULL_LABELS[day]}`
                                : DAY_FULL_LABELS[day]}
                            </div>
                            {isToday && (
                              <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] hover:bg-emerald-100 dark:hover:bg-emerald-900/30">
                                {daySlots.length} classes
                              </Badge>
                            )}
                            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                          </div>

                          {/* Day Entries */}
                          <div className="space-y-2 ml-2">
                            {daySlots.map((slot) => {
                              const isCurrent =
                                isToday &&
                                isCurrentSlot(slot.startTime, slot.endTime);
                              const isPast =
                                isToday &&
                                isSlotPast(slot.startTime) &&
                                !isCurrent;
                              const colorClass =
                                subjectColorMap[slot.subjectName] ||
                                "bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 dark:border-gray-700";

                              return (
                                <div
                                  key={slot.id}
                                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                    isCurrent
                                      ? "border-violet-300 bg-violet-50/50 shadow-sm"
                                      : `${colorClass} border`
                                  } ${isPast ? "opacity-60" : ""}`}
                                >
                                  {/* Now indicator */}
                                  {isCurrent && (
                                    <div className="flex flex-col items-center">
                                      <div className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />
                                      <div className="w-px h-6 bg-violet-300" />
                                    </div>
                                  )}

                                  {/* Time */}
                                  <div
                                    className={`min-w-[100px] ${
                                      isCurrent
                                        ? "text-violet-700 dark:text-violet-400"
                                        : "text-gray-600 dark:text-gray-400"
                                    }`}
                                  >
                                    <p className="text-xs font-semibold">
                                      {formatTime(slot.startTime)} –{" "}
                                      {formatTime(slot.endTime)}
                                    </p>
                                  </div>

                                  {/* Subject */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${
                                          subjectColorMap[slot.subjectName] ||
                                          "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 dark:border-gray-700"
                                        }`}
                                      >
                                        {slot.subjectName}
                                      </span>
                                      {isCurrent && (
                                        <Badge className="bg-violet-500 text-white text-[9px] px-1.5 py-0 hover:bg-violet-500">
                                          Now
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-gray-400 dark:text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                      {slot.teacherName}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* ─── Day View ─── */}
          {viewMode === "day" && (
            <div className="space-y-4">
              {/* Day Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {DAYS.map((day) => {
                  const isSelected = day === selectedDay;
                  const isToday = day === todayKey;
                  const daySlotCount = timeSlots
                    .map((ts) => slotLookup[`${day}-${ts.start}`] || null)
                    .filter(Boolean).length;

                  return (
                    <Button
                      key={day}
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => setSelectedDay(day)}
                      className={`rounded-full px-4 shrink-0 ${
                        isSelected
                          ? "bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
                          : isToday
                            ? "border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                            : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {DAY_LABELS[day]}
                      {isToday && !isSelected && (
                        <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-violet-500 inline-block" />
                      )}
                    </Button>
                  );
                })}
              </div>

              {/* Day Info Header */}
              <Card className="rounded-xl shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {DAY_FULL_LABELS[selectedDay]}
                        {selectedDay === todayKey && (
                          <span className="ml-2 text-sm font-normal text-violet-500">
                            (Today)
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400 mt-0.5">
                        {selectedDaySlots.length} classes scheduled
                      </p>
                    </div>
                    {selectedDaySlots.length > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(selectedDaySlots[0].startTime)} –{" "}
                          {formatTime(
                            selectedDaySlots[selectedDaySlots.length - 1]
                              .endTime,
                          )}
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 dark:text-gray-400">
                          {(() => {
                            const totalMin = selectedDaySlots.reduce(
                              (acc, s) => {
                                const [sh, sm] = s.startTime
                                  .split(":")
                                  .map(Number);
                                const [eh, em] = s.endTime
                                  .split(":")
                                  .map(Number);
                                return acc + (eh * 60 + em) - (sh * 60 + sm);
                              },
                              0,
                            );
                            const hrs = Math.floor(totalMin / 60);
                            const mins = totalMin % 60;
                            return hrs > 0
                              ? `${hrs}h ${mins}m total`
                              : `${mins}m total`;
                          })()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Day Timeline */}
              <div className="relative space-y-3">
                {/* Timeline line */}
                {selectedDaySlots.length > 0 && (
                  <div className="absolute left-[23px] top-8 bottom-8 w-px bg-gray-200 dark:bg-gray-700 dark:bg-gray-700 hidden sm:block" />
                )}

                {timeSlots.map((ts, idx) => {
                  const slot = slotLookup[`${selectedDay}-${ts.start}`] || null;
                  const isCurrentSlotActive =
                    selectedDay === todayKey &&
                    slot &&
                    isCurrentSlot(slot.startTime, slot.endTime);
                  const isPastSlot =
                    selectedDay === todayKey &&
                    slot &&
                    isSlotPast(slot.startTime) &&
                    !isCurrentSlotActive;

                  if (!slot) {
                    // Free Period
                    return (
                      <div
                        key={`${selectedDay}-${ts.start}`}
                        className="relative"
                      >
                        <Card className="rounded-xl border-dashed border-gray-200 dark:border-gray-700 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="hidden sm:flex flex-col items-center z-10">
                              <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 dark:border-gray-600 bg-white dark:bg-gray-900" />
                            </div>
                            <div className="flex-1 flex items-center gap-3">
                              <div className="text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400 font-medium min-w-[90px]">
                                {formatTime(ts.start)} – {formatTime(ts.end)}
                              </div>
                              <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 dark:text-gray-400">
                                <Clock className="h-3.5 w-3.5" />
                                <span className="text-xs font-medium">
                                  Free Period
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  }

                  const colorClass =
                    subjectColorMap[slot.subjectName] ||
                    "bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 dark:border-gray-700";

                  return (
                    <div key={slot.id} className="relative">
                      <Card
                        className={`rounded-xl border transition-all ${
                          isCurrentSlotActive
                            ? "border-violet-300 shadow-lg shadow-violet-100"
                            : isPastSlot
                              ? "opacity-60"
                              : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Timeline dot */}
                            <div className="hidden sm:flex flex-col items-center z-10 pt-0.5">
                              {isCurrentSlotActive ? (
                                <div className="w-5 h-5 rounded-full bg-violet-500 border-2 border-violet-300 flex items-center justify-center">
                                  <div className="w-2 h-2 rounded-full bg-white dark:bg-gray-900 animate-pulse" />
                                </div>
                              ) : (
                                <div
                                  className={`w-5 h-5 rounded-full border-2 ${
                                    isPastSlot
                                      ? "border-gray-300 dark:border-gray-600 dark:border-gray-600 bg-gray-200 dark:bg-gray-700 dark:bg-gray-700"
                                      : "border-violet-400 bg-white dark:bg-gray-900"
                                  }`}
                                />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4
                                      className={`text-sm font-bold truncate ${colorClass.split(" ")[1] || "text-gray-900 dark:text-gray-100"}`}
                                    >
                                      {slot.subjectName}
                                    </h4>
                                    {isCurrentSlotActive && (
                                      <Badge className="bg-violet-500 text-white text-[10px] px-2 py-0 hover:bg-violet-500 shrink-0">
                                        In Progress
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {formatTime(slot.startTime)} –{" "}
                                  {formatTime(slot.endTime)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="h-3.5 w-3.5" />
                                  {slot.teacherName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {slot.className}
                                </span>
                              </div>

                              {isCurrentSlotActive && (
                                <div className="mt-3">
                                  <div className="flex items-center gap-2">
                                    <Timer className="h-3.5 w-3.5 text-violet-500" />
                                    <span className="text-xs text-violet-600 font-medium">
                                      {(() => {
                                        const [eh, em] = slot.endTime
                                          .split(":")
                                          .map(Number);
                                        const [ch, cm] = currentTimeStr
                                          .split(":")
                                          .map(Number);
                                        const remaining =
                                          eh * 60 + em - (ch * 60 + cm);
                                        if (remaining <= 0)
                                          return "Ending soon";
                                        const rh = Math.floor(remaining / 60);
                                        const rm = remaining % 60;
                                        return rh > 0
                                          ? `${rh}h ${rm}m remaining`
                                          : `${rm}m remaining`;
                                      })()}
                                    </span>
                                  </div>
                                  <div className="mt-1.5 h-1.5 rounded-full bg-violet-100 overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-violet-500 transition-all"
                                      style={{
                                        width: `${(() => {
                                          const [sh, sm] = slot.startTime
                                            .split(":")
                                            .map(Number);
                                          const [eh, em] = slot.endTime
                                            .split(":")
                                            .map(Number);
                                          const [ch, cm] = currentTimeStr
                                            .split(":")
                                            .map(Number);
                                          const total =
                                            eh * 60 + em - (sh * 60 + sm);
                                          const elapsed =
                                            ch * 60 + cm - (sh * 60 + sm);
                                          if (total <= 0) return 100;
                                          return Math.min(
                                            100,
                                            Math.max(
                                              0,
                                              (elapsed / total) * 100,
                                            ),
                                          );
                                        })()}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Period number badge */}
                            <div className="shrink-0">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                                  isCurrentSlotActive
                                    ? "bg-violet-600 text-white"
                                    : isPastSlot
                                      ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 dark:text-gray-400"
                                      : colorClass
                                }`}
                              >
                                {idx + 1}
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
          )}

          {/* Subject Legend (Grid and List views) */}
          {viewMode !== "day" && Object.keys(subjectColorMap).length > 0 && (
            <Card className="rounded-xl shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-violet-500" />
                  Subjects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(subjectColorMap).map(
                    ([subject, colorClass]) => (
                      <div
                        key={subject}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${colorClass}`}
                      >
                        <div className="w-2 h-2 rounded-full bg-current opacity-60" />
                        {subject}
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Skeleton ─── */

function TimetableSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header + toggle skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-7 w-40 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-64 rounded-lg" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>

      {/* Main content */}
      <Skeleton className="h-[400px] rounded-xl" />
      <Skeleton className="h-28 rounded-xl" />
    </div>
  );
}
