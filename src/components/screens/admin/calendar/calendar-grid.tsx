"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { CalendarEvent, WEEKDAY_LABELS, EVENT_TYPE_COLORS } from "./types";
import { isToday } from "./utils";

interface CalendarGridProps {
  loading: boolean;
  calendarCells: (string | null)[];
  eventsByDate: Map<string, CalendarEvent[]>;
  selectedDate: string | null;
  setSelectedDate: (d: string) => void;
  isCurrentMonthDay: (d: string) => boolean;
}

export function CalendarGrid({
  loading,
  calendarCells,
  eventsByDate,
  selectedDate,
  setSelectedDate,
  isCurrentMonthDay,
}: CalendarGridProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-900/40 border border-slate-200/60 dark:border-white/[0.06] shadow-sm rounded-2xl p-6">
        <div className="grid grid-cols-7 gap-4 text-center">
          {WEEKDAY_LABELS.map((day) => (
            <div key={day} className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              {day}
            </div>
          ))}
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="aspect-square flex items-center justify-center">
              <Skeleton className="size-9 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900/40 border border-slate-200/60 dark:border-white/[0.06] shadow-sm rounded-2xl p-5 sm:p-6 h-full">
      {/* Grid container */}
      <div className="grid grid-cols-7 gap-y-2 gap-x-1 sm:gap-x-2 text-center items-center">
        {/* Weekdays */}
        {WEEKDAY_LABELS.map((day) => (
          <div 
            key={day} 
            className="pb-4 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider"
          >
            {day}
          </div>
        ))}

        {/* Day Cells */}
        {calendarCells.map((dateStr, idx) => {
          if (!dateStr) return <div key={`empty-${idx}`} className="aspect-square" />;
          const dayEvents = eventsByDate.get(dateStr) || [];
          const dayNum = parseInt(dateStr.split("-")[2], 10);
          const isDayToday = isToday(dateStr);
          const isSelected = selectedDate === dateStr;
          const inCurrentMonth = isCurrentMonthDay(dateStr);

          return (
            <div key={dateStr} className="aspect-square flex flex-col items-center justify-center relative">
              <button
                type="button"
                onClick={() => setSelectedDate(dateStr)}
                className={`
                  relative size-9 sm:size-11 flex flex-col items-center justify-center rounded-full text-sm font-medium 
                  transition-all duration-200 active:scale-90 group cursor-pointer
                  ${!inCurrentMonth ? "text-slate-300 dark:text-slate-700 opacity-40" : "text-slate-700 dark:text-slate-200"}
                  ${isSelected 
                    ? "bg-blue-600 dark:bg-rose-600 text-white shadow-md shadow-blue-500/20 dark:shadow-rose-500/20 scale-105" 
                    : isDayToday
                      ? "border-2 border-blue-500/60 dark:border-rose-500/60 text-blue-600 dark:text-rose-400 font-semibold bg-blue-50/40 dark:bg-rose-950/10"
                      : "hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                  }
                `}
              >
                <span>{dayNum}</span>

                {/* Dots Container for Events */}
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-1.5 sm:bottom-2 flex justify-center gap-0.5">
                    {dayEvents.slice(0, 3).map((ev, i) => (
                      <span 
                        key={ev.id} 
                        className={`size-1 rounded-full ${isSelected ? "bg-white" : ""}`}
                        style={!isSelected ? { backgroundColor: ev.color || EVENT_TYPE_COLORS[ev.type] || "#3b82f6" } : undefined}
                      />
                    ))}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

