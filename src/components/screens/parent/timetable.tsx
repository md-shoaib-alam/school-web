"use client";


import { apiFetch } from "@/lib/api";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/store/use-app-store";
import { useParentDashboard } from "@/lib/graphql/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, BookOpen, CalendarDays, User, MapPin } from "lucide-react";
import type { StudentInfo, TimetableSlot } from "@/types";
import { ChildSelector } from "./ChildSelector";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

const DAY_LABELS: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
};

const DAY_FULL_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
};

const SUBJECT_COLORS = [
  "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
  "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
  "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
];

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function ParentTimetable() {
  const { currentUser } = useAppStore();
  const { data: parentData, isLoading: parentLoading } = useParentDashboard(currentUser?.name || "");
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState("monday");

  const children = parentData?.children ?? [];
  const effectiveChildId = selectedChildId || children[0]?.id || "";
  const currentChild = children.find((c) => c.id === effectiveChildId);
  const classId = currentChild?.classId || "";

  const { data: timetableData } = useQuery<TimetableSlot[]>({
    queryKey: ["parent-timetable", classId],
    queryFn: async () => {
      if (!classId) return [];
      try {
        const res = await apiFetch(`/api/timetable?classId=${classId}`);
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    },
    enabled: !!classId,
  });

  const timetable: TimetableSlot[] = timetableData ?? [];

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
      map[`${t.day.toLowerCase()}-${t.startTime}`] = t;
    });
    return map;
  }, [timetable]);

  const selectedDaySlots = useMemo(
    () =>
      timeSlots.flatMap((ts) => {
        const slot = slotLookup[`${selectedDay}-${ts.start}`];
        return slot ? [slot] : [];
      }),
    [timeSlots, selectedDay, slotLookup],
  );

  if (parentLoading) {
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
          <BookOpen className="size-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            No children found
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            No students are linked to your account.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 select-none animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-3.5 text-left">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-foreground uppercase tracking-tight">
              Class Timetable
            </h2>
          </div>
          {/* Children Selector */}
          <ChildSelector 
            students={children} 
            selectedStudentId={effectiveChildId} 
            onSelect={setSelectedChildId} 
          />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border border-border bg-card shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
              <BookOpen className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {children.find((c) => c.id === effectiveChildId)?.name || "–"}
              </p>
              <p className="text-xs text-muted-foreground">
                {children.find((c) => c.id === effectiveChildId)?.className || "–"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border bg-card shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <CalendarDays className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {selectedDaySlots.length} Periods
              </p>
              <p className="text-xs text-muted-foreground">
                {DAY_FULL_LABELS[selectedDay]}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border bg-card shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {selectedDaySlots.length > 0
                  ? `${formatTime(selectedDaySlots[0].startTime)} – ${formatTime(selectedDaySlots[selectedDaySlots.length - 1].endTime)}`
                  : "No classes"}
              </p>
              <p className="text-xs text-muted-foreground">
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
            className={`rounded-xl px-4 h-9 font-medium text-xs shrink-0 cursor-pointer transition-all ${
              selectedDay === day
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs shadow-blue-500/20"
                : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {DAY_LABELS[day]}
          </Button>
        ))}
      </div>

      {/* Day Schedule */}
      {timeSlots.length === 0 ? (
        <Card className="rounded-2xl border border-border bg-card shadow-xs">
          <CardContent className="py-16 text-center">
            <BookOpen className="size-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-semibold text-foreground">
              No timetable configured
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Contact the school administrator
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl border border-border bg-card shadow-xs">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="size-4 text-blue-600 dark:text-blue-400" />
              {DAY_FULL_LABELS[selectedDay]} Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-3">
                {timeSlots.map((ts) => {
                  const slot = slotLookup[`${selectedDay}-${ts.start}`] || null;
                  if (!slot) {
                    return (
                      <div
                        key={`${selectedDay}-${ts.start}`}
                        className="flex items-center gap-4 p-3.5 rounded-xl border border-dashed border-border bg-muted/30"
                      >
                        <div className="text-xs text-muted-foreground font-medium min-w-[90px]">
                          {formatTime(ts.start)} – {formatTime(ts.end)}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="size-3.5" />
                          <span className="text-xs font-medium">
                            Free Period
                          </span>
                        </div>
                      </div>
                    );
                  }

                  const colorClass =
                    subjectColorMap[slot.subjectName] ||
                    "bg-muted text-foreground";

                  return (
                    <div
                      key={slot.id}
                      className="flex items-center gap-4 p-3.5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors"
                    >
                      <div className="text-xs text-foreground font-medium min-w-[90px]">
                        {formatTime(slot.startTime)} –{" "}
                        {formatTime(slot.endTime)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold border ${colorClass}`}
                          >
                            {slot.subjectName}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="size-3" />
                            {slot.teacherName}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3" />
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
        <Card className="rounded-2xl border border-border bg-card shadow-xs">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="size-4 text-blue-600 dark:text-blue-400" />
              Subjects
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-wrap gap-2">
              {Object.entries(subjectColorMap).map(([subject, colorClass]) => (
                <div
                  key={subject}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${colorClass}`}
                >
                  <div className="size-2 rounded-full bg-current opacity-60" />
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
