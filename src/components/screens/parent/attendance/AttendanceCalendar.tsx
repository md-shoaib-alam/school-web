"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { AttendanceRecord } from "@/types";

export interface MonthGridCell {
  date: Date;
  dateKey: string;
  dayNum: number;
  isCurrent: boolean;
  isWeekend: boolean;
  isToday: boolean;
  isSelected: boolean;
  status: string; // 'present' | 'absent' | 'none'
}

export interface MonthData {
  year: number;
  month: number;
  stats: { present: number; absent: number };
  rows: MonthGridCell[][];
}

const pad = (n: number) => String(n).padStart(2, "0");

// 6 clean diagonal hatch lines matching test-app
const HATCH_STEPS = [28, 56, 84, 112, 140, 168];
const HATCH_PATH_D = HATCH_STEPS.map((k) => {
  const x1 = k <= 100 ? 0 : k - 100;
  const y1 = k <= 100 ? k : 100;
  const x2 = k <= 100 ? k : 100;
  const y2 = k <= 100 ? 0 : k - 100;
  return `M${x1},${y1}L${x2},${y2}`;
}).join("");

function WeekendHatch({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 size-full pointer-events-none overflow-hidden rounded-[inherit]", className)}>
      <svg
        className="size-full text-foreground/10 dark:text-foreground/14"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d={HATCH_PATH_D}
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="square"
        />
      </svg>
    </div>
  );
}

function computeMonthData(
  targetDate: Date,
  records: AttendanceRecord[],
  selectedDate: Date
): MonthData {
  const y = targetDate.getFullYear();
  const m = targetDate.getMonth();

  const attMap = new Map<string, string>();
  let p = 0;
  let a = 0;

  records.forEach((r) => {
    const k = r.date ? r.date.slice(0, 10) : "";
    if (k) {
      const st = (r.status || "").toLowerCase();
      attMap.set(k, st);

      const [ry, rm] = k.split("-").map(Number);
      if (ry === y && rm === m + 1) {
        if (st === "present") p++;
        else if (st === "absent") a++;
      }
    }
  });

  const firstDay = new Date(y, m, 1);
  const lastDay = new Date(y, m + 1, 0);
  const totalDaysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();

  const totalCells = Math.ceil((startWeekday + totalDaysInMonth) / 7) * 7;
  const startDate = new Date(firstDay);
  startDate.setDate(1 - startWeekday);

  const today = new Date();
  const cells: MonthGridCell[] = [];

  for (let i = 0; i < totalCells; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);

    const k = format(d, "yyyy-MM-dd");
    const isCurrent = d.getMonth() === m;
    const isWeekendDay = d.getDay() === 0 || d.getDay() === 6;
    const isToday = isSameDay(d, today);
    const isSelected = isSameDay(d, selectedDate);
    const status = attMap.get(k) || "none";

    cells.push({
      date: d,
      dateKey: k,
      dayNum: d.getDate(),
      isCurrent,
      isWeekend: isWeekendDay,
      isToday,
      isSelected,
      status,
    });
  }

  const rows: MonthGridCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  return {
    year: y,
    month: m,
    stats: { present: p, absent: a },
    rows,
  };
}

export interface AttendanceCalendarProps {
  records?: AttendanceRecord[];
  data?: { date: number | null; day: string | null; status: string | null }[];
  isPremium?: boolean;
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  viewDate?: Date;
  currentPeriod?: string;
  canGoNext?: boolean;
  canGoBack?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  onGoToday?: () => void;
  studentName?: string;
  className?: string;
}

export function AttendanceCalendar({
  records = [],
  data,
  isPremium = true,
  selectedDate,
  onSelectDate,
  viewDate,
  canGoNext = true,
  canGoBack = true,
  onPrev,
  onNext,
  onGoToday,
}: AttendanceCalendarProps) {
  const activeViewDate = useMemo(() => viewDate || new Date(), [viewDate]);
  const activeSelectedDate = useMemo(() => selectedDate || new Date(), [selectedDate]);

  const effectiveRecords = useMemo(() => {
    if (records.length > 0) return records;
    if (data && data.length > 0) {
      const y = activeViewDate.getFullYear();
      const m = String(activeViewDate.getMonth() + 1).padStart(2, "0");
      return data
        .filter((d) => d.date !== null)
        .map((d, idx) => ({
          id: `legacy-${idx}`,
          studentId: "",
          studentName: "",
          className: "",
          date: `${y}-${m}-${String(d.date).padStart(2, "0")}`,
          status: d.status || "none",
        })) as AttendanceRecord[];
    }
    return [];
  }, [records, data, activeViewDate]);

  const monthData = useMemo(
    () => computeMonthData(activeViewDate, effectiveRecords, activeSelectedDate),
    [activeViewDate, effectiveRecords, activeSelectedDate]
  );

  const isViewingToday = useMemo(() => {
    const now = new Date();
    const isSameMonth =
      activeViewDate.getFullYear() === now.getFullYear() &&
      activeViewDate.getMonth() === now.getMonth();
    const isTodaySelected = isSameDay(activeSelectedDate, now);
    return isSameMonth && isTodaySelected;
  }, [activeViewDate, activeSelectedDate]);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs transition-colors select-none h-full flex flex-col justify-between">
      {/* Header: Single clean Month & Year on left, Navigation controls on right */}
      <div className="flex items-center justify-between gap-3 pb-3 sm:pb-3.5">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            {format(activeViewDate, "MMMM yyyy")}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {!isPremium ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-xs">
              <Lock className="size-3.5" />
              <span>Subscribe</span>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={onPrev}
                disabled={!canGoBack}
                aria-label="Previous Month"
                className={cn(
                  "size-8 rounded-full border border-border bg-card hover:bg-muted active:scale-95 flex items-center justify-center text-foreground transition-all shadow-2xs cursor-pointer",
                  !canGoBack && "opacity-35 cursor-not-allowed hover:bg-card active:scale-100"
                )}
              >
                <ChevronLeft className="size-4" />
              </button>

              <button
                type="button"
                onClick={onNext}
                disabled={!canGoNext}
                aria-label="Next Month"
                className={cn(
                  "size-8 rounded-full border border-border bg-card hover:bg-muted active:scale-95 flex items-center justify-center text-foreground transition-all shadow-2xs cursor-pointer",
                  !canGoNext && "opacity-35 cursor-not-allowed hover:bg-card active:scale-100"
                )}
              >
                <ChevronRight className="size-4" />
              </button>

              {onGoToday && (
                <button
                  type="button"
                  onClick={onGoToday}
                  disabled={isViewingToday}
                  className={cn(
                    "h-8 px-3.5 rounded-full border border-border bg-card hover:bg-muted active:scale-95 text-xs font-semibold text-foreground flex items-center justify-center transition-all shadow-2xs cursor-pointer",
                    isViewingToday && "opacity-35 cursor-default hover:bg-card active:scale-100"
                  )}
                >
                  Today
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Calendar Body */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Days of Week Row */}
        <div className="grid grid-cols-7 gap-1.5 pb-2.5 mb-3 border-b border-border">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-xs sm:text-[13px] font-semibold text-muted-foreground uppercase tracking-wider py-0.5"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Viewed Month Stats Chip Row (Present / Absent) */}
        <div className="flex items-center gap-2.5 mb-3.5">
          <div className="flex-1 flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-muted/50 border border-border text-xs sm:text-[13px]">
            <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-muted-foreground font-medium flex-1">Present</span>
            <span className="font-bold text-foreground font-mono tabular-nums">{monthData.stats.present}</span>
          </div>

          <div className="flex-1 flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-muted/50 border border-border text-xs sm:text-[13px]">
            <span className="size-2 rounded-full bg-rose-500 shrink-0" />
            <span className="text-muted-foreground font-medium flex-1">Absent</span>
            <span className="font-bold text-foreground font-mono tabular-nums">{monthData.stats.absent}</span>
          </div>
        </div>

        {/* 7-Column Calendar Grid */}
        <div className="space-y-1.5">
          {monthData.rows.map((row, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-7 gap-1.5">
              {row.map((cell) => {
                const isPresent = cell.status === "present";
                const isAbsent = cell.status === "absent";

                let cellBg = "bg-muted/40 hover:bg-muted text-foreground border-border/50 hover:border-border";
                if (!cell.isCurrent) {
                  cellBg = "opacity-25 text-muted-foreground bg-transparent border-transparent cursor-default pointer-events-none";
                } else if (cell.isWeekend && !isPresent && !isAbsent) {
                  cellBg = "bg-muted/20 text-muted-foreground/80 border-border/40 hover:border-border";
                }

                if (cell.isCurrent && isPresent) {
                  cellBg = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 font-bold";
                } else if (cell.isCurrent && isAbsent) {
                  cellBg = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20 font-bold";
                }

                return (
                  <button
                    key={cell.dateKey}
                    type="button"
                    onClick={() => onSelectDate?.(cell.date)}
                    className={cn(
                      "aspect-[1/0.95] min-h-[42px] sm:min-h-[46px] rounded-xl border flex flex-col items-center justify-center relative overflow-hidden transition-all duration-150 cursor-pointer active:scale-95",
                      cellBg,
                      cell.isSelected &&
                        "border-2 border-foreground ring-2 ring-foreground/15 shadow-sm scale-[1.02] z-10 font-bold"
                    )}
                  >
                    {/* Weekend diagonal hatch overlay */}
                    {cell.isWeekend && !isPresent && !isAbsent && cell.isCurrent && (
                      <WeekendHatch />
                    )}

                    {/* 2-digit day number */}
                    <span
                      className={cn(
                        "text-xs sm:text-[13.5px] font-mono tracking-tight font-medium relative z-1",
                        (cell.isSelected || isPresent || isAbsent) && "font-bold text-foreground"
                      )}
                    >
                      {pad(cell.dayNum)}
                    </span>

                    {/* Today indicator dot in top-right */}
                    {cell.isToday && (
                      <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-foreground shadow-xs" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend: Present, Absent, Holiday */}
        <div className="flex flex-wrap items-center gap-4 mt-auto pt-3.5 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>Present</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="size-2 rounded-full bg-rose-500" />
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="size-2 rounded-full bg-muted-foreground/40" />
            <span>Holiday / Weekend</span>
          </div>
        </div>
      </div>
    </div>
  );
}
