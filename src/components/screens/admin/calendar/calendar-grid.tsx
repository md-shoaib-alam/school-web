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
  const maxDots = 2;

  if (loading) {
    return (
      <div className="grid grid-cols-7 gap-px bg-gray-100 dark:bg-gray-800">
        {Array.from({ length: 42 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-3 min-h-[90px] sm:min-h-[110px]">
            <Skeleton className="h-4 w-6 mb-2 rounded-md" />
            <Skeleton className="h-2 w-full mb-1 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-7 gap-px bg-gray-100 dark:bg-gray-800">
      {WEEKDAY_LABELS.map((day) => (
        <div key={day} className="py-1.5 text-center text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800 last:border-0">
          {day}
        </div>
      ))}
      {calendarCells.map((dateStr, idx) => {
        if (!dateStr) return <div key={`empty-${idx}`} className="bg-white dark:bg-gray-900" />;
        const dayEvents = eventsByDate.get(dateStr) || [];
        const dayNum = parseInt(dateStr.split("-")[2], 10);
        const todayHighlight = isToday(dateStr);
        const isSelected = selectedDate === dateStr;
        const inCurrentMonth = isCurrentMonthDay(dateStr);

        return (
          <button
            key={dateStr}
            type="button"
            onClick={() => setSelectedDate(dateStr)}
            className={`
              group relative bg-white dark:bg-slate-900 p-1.5 min-h-[60px] sm:min-h-[85px]
              text-left transition-colors border-r border-b border-slate-100 dark:border-slate-800 last:border-r-0
              ${!inCurrentMonth ? "bg-slate-50/50 dark:bg-slate-800/20 opacity-30" : ""}
              ${isSelected ? "bg-emerald-50/20 dark:bg-emerald-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"}
            `}
          >
            {isSelected && <div className="absolute inset-0 border-2 border-emerald-500 z-10 pointer-events-none" />}
            <span className={`inline-flex items-center justify-center text-xs sm:text-sm font-bold ${todayHighlight ? "bg-emerald-600 text-white rounded-lg w-6 h-6 sm:w-8 sm:h-8" : "text-slate-900 dark:text-slate-100"} ${!todayHighlight && !inCurrentMonth ? "text-slate-400 dark:text-slate-600" : ""}`}>
              {dayNum}
            </span>
            {dayEvents.length > 0 && (
              <div className="mt-2 space-y-1">
                {dayEvents.slice(0, maxDots).map((ev) => (
                  <div key={ev.id} className="hidden sm:flex items-center gap-1.5 truncate text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-transparent" style={{ backgroundColor: `${ev.color || EVENT_TYPE_COLORS[ev.type] || "#6b7280"}15`, color: ev.color || EVENT_TYPE_COLORS[ev.type] || "#6b7280" }}>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ev.color || EVENT_TYPE_COLORS[ev.type] }} />
                    <span className="truncate">{ev.title}</span>
                  </div>
                ))}
                <div className="flex sm:hidden flex-wrap gap-1 mt-1">
                  {dayEvents.slice(0, 4).map((ev) => (
                    <span key={ev.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ev.color || EVENT_TYPE_COLORS[ev.type] }} />
                  ))}
                </div>
                {dayEvents.length > maxDots && (
                  <span className="hidden sm:block text-[9px] font-bold text-gray-400 dark:text-gray-500 pl-1 uppercase tracking-tighter">
                    +{dayEvents.length - maxDots} more
                  </span>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
