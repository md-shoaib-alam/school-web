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
      <div className="bg-card border shadow-sm rounded-xl p-5 sm:p-6 h-full">
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center items-center">
          {/* Weekdays */}
          {WEEKDAY_LABELS.map((day) => (
            <div 
              key={day} 
              className="pb-4 text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
          {/* Day Cells Skeleton */}
          {Array.from({ length: 42 }).map((_, i) => (
            <div key={i} className="aspect-square p-0.5 sm:p-1 flex flex-col items-stretch justify-stretch relative">
              <Skeleton className="w-full h-full rounded-xl bg-muted border " />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border shadow-sm rounded-xl p-5 sm:p-6 h-full">
      {/* Grid container */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center items-center">
        {/* Weekdays */}
        {WEEKDAY_LABELS.map((day) => (
          <div 
            key={day} 
            className="pb-4 text-xs font-medium text-muted-foreground uppercase tracking-wider"
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
            <div key={dateStr} className="aspect-square p-0.5 sm:p-1 flex flex-col items-stretch justify-stretch relative">
              <button
                type="button"
                onClick={() => setSelectedDate(dateStr)}
                className={`
                  relative w-full h-full flex flex-col items-center justify-center rounded-xl text-sm font-medium 
                  transition-all duration-200 active:scale-95 group cursor-pointer border
                  ${isSelected 
                    ? "bg-blue-600 dark:bg-rose-600 text-white border-2 border-white dark:border-white shadow-lg shadow-blue-500/30 dark:shadow-rose-500/30 scale-[1.03] z-10 font-semibold" 
                    : isDayToday
                      ? "border-2 border-blue-500 dark:border-rose-500 text-blue-600 dark:text-rose-400 font-semibold bg-blue-50/60 dark:bg-rose-500/15 dark:shadow-[0_0_12px_rgba(244,63,94,0.15)]"
                      : !inCurrentMonth
                        ? "text-muted-foreground bg-muted " 
                        : "text-foreground bg-muted  shadow-sm hover:bg-accent hover: dark:hover: hover:shadow-md"
                  }
                `}
              >
                <span>{dayNum}</span>

                {/* Dots Container for Events */}
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-1 sm:bottom-1.5 flex justify-center gap-0.5">
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

