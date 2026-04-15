"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAppStore } from "@/store/use-app-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, BookOpen, CalendarDays, User, MapPin } from "lucide-react";
import type { StudentInfo, TimetableSlot } from "@/lib/types";

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

const SUBJECT_COLORS = [
  "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
  "bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800",
  "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800",
  "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
];

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function ParentTimetable() {
  const { currentUser } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<StudentInfo[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [selectedDay, setSelectedDay] = useState("monday");

  const fetchChildren = useCallback(async () => {
    try {
      const res = await fetch("/api/students");
      const data = await res.json();
      const parentKids = Array.isArray(data)
        ? data.filter((s: StudentInfo) => s.parentName === currentUser?.name)
        : [];
      setChildren(parentKids);
      if (parentKids.length > 0) {
        setSelectedChildId(parentKids[0].id);
      }
      return parentKids;
    } catch {
      return [];
    }
  }, [currentUser?.name]);

  const fetchTimetable = useCallback(async (classId: string) => {
    if (!classId) return;
    try {
      const res = await fetch(`/api/timetable?classId=${classId}`);
      const data = await res.json();
      setTimetable(Array.isArray(data) ? data : []);
    } catch {
      setTimetable([]);
    }
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const kids = await fetchChildren();
      if (kids.length > 0) {
        await fetchTimetable(kids[0].classId);
      }
      setLoading(false);
    }
    init();
  }, [fetchChildren, fetchTimetable]);

  useEffect(() => {
    if (!selectedChildId || loading) return;
    const child = children.find((c) => c.id === selectedChildId);
    if (child) fetchTimetable(child.classId);
  }, [selectedChildId, children, fetchTimetable, loading]);

  const subjectColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    const seen = new Set<string>();
    let idx = 0;
    timetable.forEach((t) => {
      if (!seen.has(t.subjectName)) {
        seen.add(t.subjectName);
        map[t.subjectName] = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
        idx++;
      }
    });
    return map;
  }, [timetable]);

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

  const slotLookup = useMemo(() => {
    const map: Record<string, TimetableSlot> = {};
    timetable.forEach((t) => {
      map[`${t.day}-${t.startTime}`] = t;
    });
    return map;
  }, [timetable]);

  const selectedDaySlots = useMemo(
    () =>
      timeSlots
        .map((ts) => slotLookup[`${selectedDay}-${ts.start}`] || null)
        .filter(Boolean) as TimetableSlot[],
    [timeSlots, selectedDay, slotLookup],
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-7 w-40" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardContent className="py-16 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-gray-200 dark:text-gray-700 mb-3" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            No children found
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            No students are linked to your account.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Class Timetable
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            View your children&apos;s weekly schedules
          </p>
        </div>

        {children.length > 1 && (
          <Select value={selectedChildId} onValueChange={setSelectedChildId}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select child" />
            </SelectTrigger>
            <SelectContent>
              {children.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.name} — {child.className}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {children.find((c) => c.id === selectedChildId)?.name || "—"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {children.find((c) => c.id === selectedChildId)?.className ||
                  "—"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {selectedDaySlots.length} Periods
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {DAY_FULL_LABELS[selectedDay]}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {selectedDaySlots.length > 0
                  ? `${formatTime(selectedDaySlots[0].startTime)} – ${formatTime(selectedDaySlots[selectedDaySlots.length - 1].endTime)}`
                  : "No classes"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                School hours
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Day Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {DAYS.map((day) => (
          <Button
            key={day}
            size="sm"
            variant={selectedDay === day ? "default" : "outline"}
            onClick={() => setSelectedDay(day)}
            className={`rounded-full px-4 shrink-0 ${
              selectedDay === day
                ? "bg-amber-600 text-white hover:bg-amber-700 shadow-sm"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {DAY_LABELS[day]}
          </Button>
        ))}
      </div>

      {/* Day Schedule */}
      {timeSlots.length === 0 ? (
        <Card className="rounded-xl shadow-sm">
          <CardContent className="py-16 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-700" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              No timetable configured
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Contact the school administrator
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-amber-500" />
              {DAY_FULL_LABELS[selectedDay]} Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-3">
                {timeSlots.map((ts) => {
                  const slot = slotLookup[`${selectedDay}-${ts.start}`] || null;
                  if (!slot) {
                    return (
                      <div
                        key={`${selectedDay}-${ts.start}`}
                        className="flex items-center gap-4 p-3 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30"
                      >
                        <div className="text-xs text-gray-400 dark:text-gray-500 font-medium min-w-[90px]">
                          {formatTime(ts.start)} – {formatTime(ts.end)}
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">
                            Free Period
                          </span>
                        </div>
                      </div>
                    );
                  }

                  const colorClass =
                    subjectColorMap[slot.subjectName] ||
                    "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700";

                  return (
                    <div
                      key={slot.id}
                      className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-all"
                    >
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-medium min-w-[90px]">
                        {formatTime(slot.startTime)} –{" "}
                        {formatTime(slot.endTime)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${colorClass}`}
                          >
                            {slot.subjectName}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {slot.teacherName}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {slot.className}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Subject Legend */}
      {Object.keys(subjectColorMap).length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-amber-500" />
              Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(subjectColorMap).map(([subject, colorClass]) => (
                <div
                  key={subject}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${colorClass}`}
                >
                  <div className="w-2 h-2 rounded-full bg-current opacity-60" />
                  {subject}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
