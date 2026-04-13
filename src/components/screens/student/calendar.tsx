"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  MapPin,
  Clock,
} from "lucide-react";
import { useAppStore } from "@/store/use-app-store";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  type: string;
  targetRole: string;
  color: string;
  allDay: boolean;
  location?: string;
  createdAt: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ROLE_FILTER = ["all", "student"] as const;
const ROLE_FILTER_SET = new Set<string>(ROLE_FILTER);

const EVENT_TYPE_COLORS: Record<string, string> = {
  exam: "#ef4444",
  holiday: "#10b981",
  event: "#3b82f6",
  meeting: "#f97316",
  sports: "#8b5cf6",
  cultural: "#ec4899",
  deadline: "#f59e0b",
  other: "#6b7280",
  general: "#10b981",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  exam: "Exam",
  holiday: "Holiday",
  event: "Event",
  meeting: "Meeting",
  sports: "Sports",
  cultural: "Cultural",
  deadline: "Deadline",
  other: "Other",
  general: "General",
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeRange(
  date: string,
  endDate?: string,
  allDay?: boolean,
): string {
  if (allDay) return "All Day";
  const d = new Date(date);
  const start = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  if (!endDate) return start;
  const ed = new Date(endDate);
  const end = ed.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${start} – ${end}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function StudentCalendar() {
  const today = useMemo(() => new Date(), []);
  const currentTenantId = useAppStore((s) => s.currentTenantId);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>("all");

  // Fetch events for the current month
  useEffect(() => {
    if (!currentTenantId) return;
    const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
    fetch(
      `/api/events?tenantId=${encodeURIComponent(currentTenantId)}&month=${monthStr}`,
    )
      .then((res) => res.json())
      .then((json) => {
        const data: CalendarEvent[] = Array.isArray(json)
          ? json
          : (json.data ?? []);
        const filtered = data.filter((e) =>
          ROLE_FILTER_SET.has(e.targetRole as string),
        );
        setEvents(filtered);
      })
      .catch(() => setEvents([]))
      .finally(() => setIsLoading(false));
  }, [currentYear, currentMonth, currentTenantId]);

  // Navigation helpers
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
    setIsLoading(true);
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
    setIsLoading(true);
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(
      formatDateKey(today.getFullYear(), today.getMonth(), today.getDate()),
    );
    setIsLoading(true);
  };

  // Calendar grid computation
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfWeek(currentYear, currentMonth);

  // Map events to date keys
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    const filteredEvents =
      activeTypeFilter === "all"
        ? events
        : events.filter((e) => e.type === activeTypeFilter);
    filteredEvents.forEach((event) => {
      const key = event.date.split("T")[0];
      if (!map[key]) map[key] = [];
      map[key].push(event);
    });
    return map;
  }, [events, activeTypeFilter]);

  // Selected day events
  const selectedEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];

  // Unique event types present in current month
  const availableTypes = useMemo(() => {
    const types = new Set(events.map((e) => e.type));
    return Array.from(types);
  }, [events]);

  // Today key
  const todayKey = formatDateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          School Calendar
        </h2>
        <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">
          Stay on top of exams, holidays, and school activities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2 rounded-xl shadow-sm border-0">
          <CardContent className="p-4 sm:p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrevMonth}
                  className="h-9 w-9"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 min-w-[180px] text-center">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNextMonth}
                  className="h-9 w-9"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="h-8 text-xs"
              >
                <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                Today
              </Button>
            </div>

            {/* Event Type Filter */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              <Button
                size="sm"
                variant={activeTypeFilter === "all" ? "default" : "outline"}
                className="h-7 text-xs px-3 rounded-full"
                onClick={() => setActiveTypeFilter("all")}
              >
                All
              </Button>
              {availableTypes.map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant={activeTypeFilter === type ? "default" : "outline"}
                  className="h-7 text-xs px-3 rounded-full"
                  onClick={() => setActiveTypeFilter(type)}
                  style={
                    activeTypeFilter === type
                      ? {
                          backgroundColor: EVENT_TYPE_COLORS[type] || "#6b7280",
                          color: "#fff",
                          borderColor: "transparent",
                        }
                      : {}
                  }
                >
                  <span
                    className="w-2 h-2 rounded-full mr-1.5 inline-block"
                    style={{
                      backgroundColor: EVENT_TYPE_COLORS[type] || "#6b7280",
                    }}
                  />
                  {EVENT_TYPE_LABELS[type] || type}
                </Button>
              ))}
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 mb-1">
              {WEEK_DAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            {isLoading ? (
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 sm:h-14 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells before first day */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateKey = formatDateKey(currentYear, currentMonth, day);
                  const dayEvents = eventsByDate[dateKey] || [];
                  const isToday = dateKey === todayKey;
                  const isSelected = dateKey === selectedDate;

                  return (
                    <button
                      key={dateKey}
                      onClick={() => setSelectedDate(dateKey)}
                      className={`
                        aspect-square flex flex-col items-center justify-center rounded-lg
                        text-sm font-medium transition-all relative cursor-pointer
                        hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95
                        ${isToday ? "ring-2 ring-violet-500 ring-offset-1 dark:ring-offset-gray-900 bg-violet-50 dark:bg-violet-900/20" : ""}
                        ${isSelected && !isToday ? "bg-violet-100/70" : ""}
                        ${!isToday && !isSelected ? "text-gray-700 dark:text-gray-300" : ""}
                        ${isToday ? "text-violet-700 dark:text-violet-400 font-bold" : ""}
                      `}
                    >
                      <span className="text-xs sm:text-sm leading-none">
                        {day}
                      </span>
                      {dayEvents.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5">
                          {dayEvents.slice(0, 3).map((ev) => (
                            <span
                              key={ev.id}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                backgroundColor:
                                  ev.color ||
                                  EVENT_TYPE_COLORS[ev.type] ||
                                  "#6b7280",
                              }}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-[8px] text-gray-400 dark:text-gray-500 leading-none">
                              +{dayEvents.length - 3}
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

        {/* Event List Panel */}
        <Card className="rounded-xl shadow-sm border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-violet-500" />
              {selectedDate ? formatDisplayDate(selectedDate) : "Select a Day"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : selectedDate && selectedEvents.length > 0 ? (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {selectedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm transition-all bg-white dark:bg-gray-900"
                  >
                    {/* Title & Type Badge */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug">
                        {event.title}
                      </h4>
                      <Badge
                        className="shrink-0 text-[10px] font-medium px-2 py-0 rounded-full border-0"
                        style={{
                          backgroundColor: `${event.color || EVENT_TYPE_COLORS[event.type] || "#6b7280"}20`,
                          color:
                            event.color ||
                            EVENT_TYPE_COLORS[event.type] ||
                            "#6b7280",
                        }}
                      >
                        {EVENT_TYPE_LABELS[event.type] || event.type}
                      </Badge>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-1.5">
                      <Clock className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                      <span>
                        {formatTimeRange(
                          event.date,
                          event.endDate,
                          event.allDay,
                        )}
                      </span>
                    </div>

                    {/* Location */}
                    {event.location && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-2">
                        <MapPin className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                        <span>{event.location}</span>
                      </div>
                    )}

                    {/* Description */}
                    {event.description && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarDays className="h-10 w-10 text-gray-200 dark:text-gray-700 mb-3" />
                {selectedDate ? (
                  <>
                    <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                      No events
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
                      Nothing scheduled for this day.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                      Pick a date
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
                      Click on any day to view its events.
                    </p>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
