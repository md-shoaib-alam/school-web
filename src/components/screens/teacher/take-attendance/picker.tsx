"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, AlertCircle, CheckCircle2, Info, Clock, Eye } from "lucide-react";
import { api } from "@/lib/api";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FixedDock } from "@/components/shared/fixed-dock";
import { useAppStore } from "@/store/use-app-store";
import { cn } from "@/lib/utils";
import { DateStrip } from "./date-strip";
import { DateCalendar } from "./date-calendar";
import { toKey } from "./date-utils";

interface PickerClassRow {
  classId: string;
  name: string;
  section: string;
  total: number;
  marked: number;
  present: number;
}

const initials = (c: { name: string; section: string }) => `${c.name[0] ?? ""}${c.section}`.toUpperCase();

const classLabel = (c: { name: string; section: string }) =>
  /^class\b/i.test(c.name) ? `${c.name}-${c.section}` : `Class ${c.name}-${c.section}`;

export function AttendancePicker({
  tenantId,
  initialDate,
  disableDates,
  onPick,
}: {
  tenantId: string | null;
  initialDate: string;
  disableDates: (d: Date) => boolean;
  onPick: (classId: string, date: string) => void;
}) {
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(initialDate);
  const [viewMonth, setViewMonth] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const { sidebarOpen } = useAppStore();

  // Scoped server-side to the classes this teacher is assigned to
  // (class teacher, subject teacher or timetable), unless the school allows all.
  const { data: statusData, isPending: classesLoading } = useQuery({
    queryKey: ["attendance-status", tenantId, date],
    queryFn: () => api.get<{ classes: PickerClassRow[] }>(`/attendance/status?date=${date}`),
    enabled: !!tenantId,
  });
  const classes = useMemo(() => statusData?.classes ?? [], [statusData]);

  const todayKey = toKey(new Date());
  const active = classes.find((c) => c.classId === classId);
  const taken = (active?.marked ?? 0) > 0;
  const selectedLabel = `${date === todayKey ? "Today, " : ""}${new Date(`${date}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`;

  return (
    <div className="space-y-4 pb-28 sm:space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-foreground text-center sm:text-left sm:text-2xl">Take Attendance</h2>
        <p className="mt-0.5 text-sm text-muted-foreground hidden sm:block sm:mt-1">Pick a date and a class to begin.</p>
      </div>

      <div className="grid items-start gap-4 sm:grid-cols-[minmax(0,320px)_1fr] sm:gap-6">
        <section aria-label="Date">
          <div className="mb-2 flex items-center justify-between gap-3 sm:mb-2.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Date</h3>
              {date !== todayKey && (
                <button
                  type="button"
                  onClick={() => {
                    setDate(todayKey);
                    const now = new Date();
                    setViewMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                  }}
                  className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary hover:bg-primary/20 transition-colors"
                >
                  Today
                </button>
              )}
            </div>
            <div className="w-[150px] shrink-0 sm:w-[170px]">
              <DatePicker
                date={new Date(`${date}T00:00:00Z`)}
                disabled={disableDates}
                onChange={(d) => {
                  if (d) {
                    setDate(toKey(d));
                    setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
                  }
                }}
                className="w-full rounded-xl"
              />
            </div>
          </div>

          <div className="sm:hidden">
            <DateStrip date={date} disableDates={disableDates} onSelect={setDate} />
          </div>
          <div className="hidden sm:block">
            <DateCalendar
              date={date}
              viewMonth={viewMonth}
              onViewMonthChange={setViewMonth}
              disableDates={disableDates}
              onSelect={setDate}
            />
          </div>

          <p className="mt-2 text-xs text-muted-foreground">{selectedLabel}</p>
        </section>

        <section aria-label="Classes">
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground sm:mb-2.5">Your classes</h3>
          {classesLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
          ) : classes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No classes are assigned to you.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
              {classes.map((c) => {
                const classTaken = c.marked > 0;
                const picked = classId === c.classId;
                return (
                  <button
                    key={c.classId}
                    type="button"
                    aria-pressed={picked}
                    onClick={() => setClassId(c.classId)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors sm:p-4",
                      picked
                        ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20"
                        : "border-border bg-card hover:bg-muted/30",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-xl text-sm font-semibold sm:size-12 sm:rounded-2xl",
                        picked ? "bg-emerald-600 text-white" : "bg-muted text-foreground",
                      )}
                    >
                      {initials(c)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">{classLabel(c)}</span>
                      <span className="block text-xs text-muted-foreground">{c.total} students</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <Badge
                        className={cn(
                          "border-0",
                          classTaken
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
                        )}
                      >
                        {classTaken ? "Taken" : "Not taken"}
                      </Badge>
                      {classTaken && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {c.present} of {c.total} present
                        </p>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Floating Status Dock - fixed portal that stays floating on screen and centers accurately */}
      <FixedDock
        className={cn(
          "fixed bottom-6 z-40 pointer-events-none px-4 transition-[left,right] duration-300 ease-spring sm:bottom-6 lg:bottom-8",
          sidebarOpen ? "left-0 right-0 lg:left-[298px] lg:right-2.5" : "left-0 right-0 lg:left-[82px] lg:right-2.5",
        )}
      >
        <div className="pointer-events-auto flex justify-center w-full">
          {/* Mobile Capsule Bar */}
          <div className="mx-auto flex w-full max-w-[420px] items-center justify-between rounded-full border border-border bg-card/95 p-1.5 shadow-lg backdrop-blur sm:hidden">
            <div className="flex items-center pl-1">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wider",
                  !active
                    ? "bg-muted text-muted-foreground"
                    : taken
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                )}
              >
                {!active ? (
                  <Info className="size-3.5" />
                ) : taken ? (
                  <CheckCircle2 className="size-3.5" />
                ) : (
                  <AlertCircle className="size-3.5" />
                )}
                {!active ? "NO CLASS" : taken ? "MARKED" : "NOT MARKED"}
              </span>
            </div>

            <Button
              onClick={() => onPick(classId, date)}
              disabled={!classId}
              className={cn(
                "h-9 rounded-full px-4 text-xs font-semibold shadow-sm transition-all",
                active
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-muted text-muted-foreground hover:bg-muted opacity-70",
              )}
            >
              {active ? (
                <>
                  {taken ? "Review" : "Start"}
                  <ArrowRight className="ml-1.5 size-3.5" />
                </>
              ) : (
                "Select a class"
              )}
            </Button>
          </div>

          {/* Desktop Floating Status Dock (matches marking screen attendance dock) */}
          <div className="mx-auto hidden w-full max-w-[460px] items-center justify-between gap-3 rounded-[18px] border border-border bg-card/95 p-2 pl-3.5 pr-2 shadow-[0_14px_34px_-12px_rgba(0,0,0,0.45)] backdrop-blur-md sm:flex">
            {/* Status icon tile */}
            <span
              className={cn(
                "shrink-0 size-8 rounded-[11px] grid place-items-center transition-all duration-300",
                !active && "bg-muted text-muted-foreground",
                active && !taken && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                active && taken && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
              )}
            >
              {!active ? (
                <Clock className="size-[17px]" strokeWidth={2.2} />
              ) : taken ? (
                <CheckCircle2 className="size-[17px]" strokeWidth={2.2} />
              ) : (
                <Clock className="size-[17px]" strokeWidth={2.2} />
              )}
            </span>

            {/* Status text */}
            <div className="flex-1 min-w-0 text-left">
              <b className="block text-[13px] font-semibold text-foreground truncate leading-tight">
                {active ? classLabel(active) : "No class selected"}
              </b>
              <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground truncate mt-0.5 leading-tight">
                {!active ? (
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground shrink-0">
                    <span className="size-1.5 rounded-full bg-muted-foreground/60 shrink-0" />
                    <span>Select a class to begin</span>
                  </span>
                ) : taken ? (
                  <>
                    <span className="inline-flex items-center gap-1 text-foreground font-medium shrink-0">
                      <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{active.present} of {active.total} present</span>
                    </span>
                    <span className="text-muted-foreground truncate">
                      · Taken
                    </span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium shrink-0">
                      <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>Not marked</span>
                    </span>
                    <span className="text-muted-foreground truncate">
                      · {active.total} students
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Action button */}
            <button
              type="button"
              onClick={() => onPick(classId, date)}
              disabled={!classId}
              className={cn(
                "shrink-0 h-[38px] px-4 rounded-[13px] flex items-center gap-1.5 text-[13px] font-bold transition-all",
                classId
                  ? "bg-emerald-500 hover:bg-emerald-600 dark:bg-[#12c58b] dark:hover:bg-[#10b981] text-white dark:text-[#04140d] cursor-pointer shadow-sm active:scale-[0.97]"
                  : "bg-muted text-muted-foreground cursor-not-allowed opacity-60",
              )}
            >
              {active ? (
                <>
                  {taken ? (
                    <>
                      <Eye className="size-[15px]" strokeWidth={2.3} />
                      <span>Review</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="size-[15px]" strokeWidth={2.3} />
                      <span>Start</span>
                    </>
                  )}
                </>
              ) : (
                <>
                  <ArrowRight className="size-[15px]" strokeWidth={2.3} />
                  <span>Select a class</span>
                </>
              )}
            </button>
          </div>
        </div>
      </FixedDock>
    </div>
  );
}
