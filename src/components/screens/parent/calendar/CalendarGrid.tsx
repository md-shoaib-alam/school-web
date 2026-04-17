"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarEvent } from "./types";
import { MONTH_NAMES, WEEK_DAYS, EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from "./constants";
import { getDaysInMonth, getFirstDayOfWeek, formatDateKey } from "./utils";

interface CalendarGridProps {
  currentYear: number;
  currentMonth: number;
  isLoading: boolean;
  eventsByDate: Record<string, CalendarEvent[]>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  activeTypeFilter: string;
  setActiveTypeFilter: (type: string) => void;
  availableTypes: string[];
  todayKey: string;
}

export function CalendarGrid({
  currentYear,
  currentMonth,
  isLoading,
  eventsByDate,
  selectedDate,
  onSelectDate,
  activeTypeFilter,
  setActiveTypeFilter,
  availableTypes,
  todayKey,
}: CalendarGridProps) {
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfWeek(currentYear, currentMonth);

  return (
    <Card className="lg:col-span-8 overflow-hidden rounded-2xl border-gray-100/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 shadow-2xl shadow-gray-200/10 dark:shadow-none">
      <CardHeader className="p-5 border-b border-gray-50/50 dark:border-gray-800/50 flex flex-row items-center justify-between bg-gray-50/30 dark:bg-gray-950/20">
        <CardTitle className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-400 dark:from-white dark:to-gray-500">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </CardTitle>
        
        <div className="flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant={activeTypeFilter === "all" ? "default" : "ghost"}
            className={`h-7 text-[10px] font-black px-3 rounded-lg shadow-none ${activeTypeFilter === "all" ? "bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-500/20" : "text-gray-400"}`}
            onClick={() => setActiveTypeFilter("all")}
          >
            SUMMARY
          </Button>
          {availableTypes.map((type) => (
            <Button
              key={type}
              size="sm"
              variant="ghost"
              className={`h-7 text-[10px] font-black px-3 rounded-lg shadow-none ${activeTypeFilter === type ? "" : "text-gray-400"}`}
              onClick={() => setActiveTypeFilter(type)}
              style={
                activeTypeFilter === type
                  ? {
                      backgroundColor: `${EVENT_TYPE_COLORS[type] || "#6b7280"}20`,
                      color: EVENT_TYPE_COLORS[type] || "#6b7280",
                    }
                  : {}
              }
            >
              {EVENT_TYPE_LABELS[type] || type.toUpperCase()}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/30">
          {WEEK_DAYS.map((day) => (
            <div
              key={day}
              className="text-center text-[10px] font-black text-gray-400 dark:text-gray-500 py-3.5 uppercase tracking-widest"
            >
              {day}
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-7 gap-px bg-gray-100 dark:bg-gray-800">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 p-4 min-h-[100px]">
                <Skeleton className="h-4 w-6 rounded-md mb-2" />
                <Skeleton className="h-2 w-full rounded-full opacity-50" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-px bg-gray-100 dark:bg-gray-800">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-gray-50/30 dark:bg-gray-950/10 min-h-[80px] sm:min-h-[110px]" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateKey = formatDateKey(currentYear, currentMonth, day);
              const dayEvents = eventsByDate[dateKey] || [];
              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedDate;

              return (
                <button
                  key={dateKey}
                  onClick={() => onSelectDate(dateKey)}
                  className={`
                    min-h-[80px] sm:min-h-[110px] flex flex-col items-start p-3 bg-white dark:bg-gray-900
                    text-sm font-medium transition-all relative cursor-pointer group
                    hover:z-20 hover:bg-amber-50/30 dark:hover:bg-amber-900/10 focus:outline-none
                    ${isToday ? "bg-amber-50/20 dark:bg-amber-900/10 shadow-inner" : ""}
                    ${isSelected ? "ring-2 ring-amber-500 ring-inset bg-amber-50/50 dark:bg-amber-900/20" : ""}
                  `}
                >
                  <span className={`
                    text-xs sm:text-sm font-black flex items-center justify-center transition-all
                    ${isToday ? "bg-amber-600 text-white w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-xl shadow-amber-500/30" : "text-gray-900 dark:text-gray-100"}
                    ${isSelected && !isToday ? "text-amber-600 scale-110" : ""}
                  `}>
                    {day}
                  </span>
                  
                  {dayEvents.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5 w-full text-left">
                      <div className="hidden sm:block space-y-1 w-full">
                        {dayEvents.slice(0, 2).map((ev) => (
                          <div
                            key={ev.id}
                            className="text-[9px] font-black px-2 py-0.5 rounded-md truncate border-l-2 shadow-sm uppercase tracking-tighter"
                            style={{
                              backgroundColor: `${ev.color || EVENT_TYPE_COLORS[ev.type] || "#6b7280"}15`,
                              color: ev.color || EVENT_TYPE_COLORS[ev.type] || "#6b7280",
                              borderLeftColor: ev.color || EVENT_TYPE_COLORS[ev.type] || "#6b7280"
                            }}
                          >
                            {ev.title}
                          </div>
                        ))}
                      </div>
                      <div className="sm:hidden flex gap-1.5">
                        {dayEvents.slice(0, 3).map((ev) => (
                          <span
                            key={ev.id}
                            className="w-2 h-2 rounded-full border border-white dark:border-gray-900 shadow-sm"
                            style={{
                              backgroundColor: ev.color || EVENT_TYPE_COLORS[ev.type] || "#6b7280",
                            }}
                          />
                        ))}
                      </div>
                      {dayEvents.length > 2 && (
                        <span className="hidden sm:block text-[8px] font-black text-gray-400 uppercase tracking-tighter ml-1">
                          +{dayEvents.length - 2} MORE
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
