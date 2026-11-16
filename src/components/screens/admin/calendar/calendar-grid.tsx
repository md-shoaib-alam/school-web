"use client";

import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarEvent, WEEKDAY_LABELS, EVENT_TYPE_COLORS, MONTH_NAMES } from "./types";
import { isToday, formatDateISO } from "./utils";

// 6 clean diagonal hatch lines matching AttendanceCalendar
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

interface CalendarGridProps {
  loading: boolean;
  calendarCells: (string | null)[];
  eventsByDate: Map<string, CalendarEvent[]>;
  selectedDate: string | null;
  setSelectedDate: (d: string) => void;
  isCurrentMonthDay: (d: string) => boolean;
  currentYear?: number;
  currentMonth?: number;
  goToPrevMonth?: () => void;
  goToNextMonth?: () => void;
  goToToday?: () => void;
}

export function CalendarGrid({
  loading,
  calendarCells,
  eventsByDate,
  selectedDate,
  setSelectedDate,
  isCurrentMonthDay,
  currentYear,
  currentMonth,
  goToPrevMonth,
  goToNextMonth,
  goToToday,
}: CalendarGridProps) {
  const isViewingToday = useMemo(() => {
    const now = new Date();
    if (currentYear === undefined || currentMonth === undefined) return false;
    const isSameMonth = currentYear === now.getFullYear() && currentMonth === now.getMonth();
    const todayStr = formatDateISO(now);
    return isSameMonth && selectedDate === todayStr;
  }, [currentYear, currentMonth, selectedDate]);

  const hasNavigation =
    currentYear !== undefined &&
    currentMonth !== undefined &&
    Boolean(goToPrevMonth && goToNextMonth);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs transition-colors select-none h-full flex flex-col justify-between">
        {hasNavigation && (
          <div className="flex items-center justify-between gap-3 pb-3 sm:pb-3.5">
            <Skeleton className="h-6 w-36 rounded-lg bg-muted" />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Skeleton className="size-8 rounded-full bg-muted" />
              <Skeleton className="size-8 rounded-full bg-muted" />
              <Skeleton className="h-8 w-16 rounded-full bg-muted" />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col justify-between">
          <div className="grid grid-cols-7 gap-1.5 pb-2.5 mb-3 border-b border-border">
            {WEEKDAY_LABELS.map((day) => (
              <div
                key={day}
                className="text-center text-xs sm:text-[13px] font-semibold text-muted-foreground uppercase tracking-wider py-0.5"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5 flex-1 items-stretch">
            {Array.from({ length: 42 }).map((_, i) => (
              <Skeleton
                key={i}
                className="aspect-[1/0.95] min-h-[44px] sm:min-h-[50px] rounded-xl bg-muted/60"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs transition-colors select-none h-full flex flex-col justify-between">
      {/* Header: Month & Year on left, Navigation controls on right */}
      {hasNavigation && (
        <div className="flex items-center justify-between gap-3 pb-3 sm:pb-3.5">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
              {MONTH_NAMES[currentMonth!]} {currentYear}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={goToPrevMonth}
              aria-label="Previous Month"
              className="size-8 rounded-full border border-border bg-card hover:bg-muted active:scale-95 flex items-center justify-center text-foreground transition-all shadow-2xs cursor-pointer"
            >
              <ChevronLeft className="size-4" />
            </button>

            <button
              type="button"
              onClick={goToNextMonth}
              aria-label="Next Month"
              className="size-8 rounded-full border border-border bg-card hover:bg-muted active:scale-95 flex items-center justify-center text-foreground transition-all shadow-2xs cursor-pointer"
            >
              <ChevronRight className="size-4" />
            </button>

            {goToToday && (
              <button
                type="button"
                onClick={goToToday}
                disabled={isViewingToday}
                className={cn(
                  "h-8 px-3.5 rounded-full border border-border bg-card hover:bg-muted active:scale-95 text-xs font-semibold text-foreground flex items-center justify-center transition-all shadow-2xs cursor-pointer",
                  isViewingToday && "opacity-35 cursor-default hover:bg-card active:scale-100"
                )}
              >
                Today
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Calendar Body */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Days of Week Row */}
        <div className="grid grid-cols-7 gap-1.5 pb-2.5 mb-3 border-b border-border">
          {WEEKDAY_LABELS.map((day) => (
            <div
              key={day}
              className="text-center text-xs sm:text-[13px] font-semibold text-muted-foreground uppercase tracking-wider py-0.5"
            >
              {day}
            </div>
          ))}
        </div>

        {/* 7-Column Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 flex-1 items-stretch">
          {calendarCells.map((dateStr, idx) => {
            if (!dateStr) return <div key={`empty-${idx}`} className="aspect-[1/0.95]" />;
            const dayEvents = eventsByDate.get(dateStr) || [];
            const dayNum = parseInt(dateStr.split("-")[2], 10);
            const dateObj = new Date(dateStr + "T00:00:00");
            const isWeekendDay = dateObj.getDay() === 0 || dateObj.getDay() === 6;
            const isDayToday = isToday(dateStr);
            const isSelected = selectedDate === dateStr;
            const inCurrentMonth = isCurrentMonthDay(dateStr);

            let cellBg = "bg-muted/40 hover:bg-muted text-foreground border-border/50 hover:border-border";
            if (!inCurrentMonth) {
              cellBg = "opacity-25 text-muted-foreground bg-transparent border-transparent cursor-default pointer-events-none";
            } else if (isWeekendDay) {
              cellBg = "bg-muted/20 text-muted-foreground/80 border-border/40 hover:border-border";
            }

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => setSelectedDate(dateStr)}
                className={cn(
                  "aspect-[1/0.95] min-h-[44px] sm:min-h-[50px] rounded-xl border flex flex-col items-center justify-center relative overflow-hidden transition-all duration-150 cursor-pointer active:scale-95",
                  cellBg,
                  isSelected &&
                    "border-2 border-foreground ring-2 ring-foreground/15 shadow-sm scale-[1.02] z-10 font-bold bg-muted"
                )}
              >
                {/* Weekend diagonal hatch overlay */}
                {isWeekendDay && inCurrentMonth && <WeekendHatch />}

                {/* 2-digit day number */}
                <span
                  className={cn(
                    "text-xs sm:text-[13.5px] font-mono tracking-tight font-medium relative z-1",
                    (isSelected || isDayToday) && "font-bold text-foreground"
                  )}
                >
                  {String(dayNum).padStart(2, "0")}
                </span>

                {/* Today indicator dot in top-right */}
                {isDayToday && (
                  <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-foreground shadow-xs z-1" />
                )}

                {/* Event dots container */}
                {dayEvents.length > 0 && inCurrentMonth && (
                  <div className="absolute bottom-1 sm:bottom-1.5 flex justify-center gap-1 z-1">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <span
                        key={ev.id}
                        className="size-1.5 rounded-full shrink-0 shadow-xs"
                        style={{
                          backgroundColor: ev.color || EVENT_TYPE_COLORS[ev.type] || "#3b82f6",
                        }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-auto pt-3.5 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="size-2 rounded-full bg-foreground" />
            <span>Today</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="size-2 rounded-full bg-blue-500" />
            <span>Event</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="size-2 rounded-full bg-muted-foreground/40" />
            <span>Weekend</span>
          </div>
        </div>
      </div>
    </div>
  );
}
