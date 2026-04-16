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

const ROLE_FILTER = ["all", "parent"] as const;
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

export function ParentCalendar() {
  const today = useMemo(() => new Date(), []);
  const currentTenantId = useAppStore((s) => s.currentTenantId);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(
    formatDateKey(today.getFullYear(), today.getMonth(), today.getDate()),
  );
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 dark:bg-gray-900/40 p-1.5 rounded-2xl border border-white/20 dark:border-gray-800/20 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3 px-3">
          <div className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20">
            <CalendarDays className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight">Parent Calendar</h2>
            <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Home Portal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 pb-2 md:pb-0">
          <div className="flex items-center gap-1.5 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-inner">
            <Button variant="ghost" size="icon" onClick={goToPrevMonth} className="h-8 w-8 rounded-lg outline-none focus-visible:ring-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={goToToday} className="h-8 px-3 text-xs font-black rounded-lg outline-none focus-visible:ring-0 uppercase">
              Today
            </Button>
            <Button variant="ghost" size="icon" onClick={goToNextMonth} className="h-8 w-8 rounded-lg outline-none focus-visible:ring-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid */}
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
            {/* Weekday Headers */}
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

            {/* Calendar Grid */}
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
                      onClick={() => setSelectedDate(dateKey)}
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
                        <div className="flex flex-wrap gap-1 mt-2.5 w-full">
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

        {/* Daily Agenda Side Panel */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-2xl border-gray-100/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 shadow-2xl shadow-gray-200/5 dark:shadow-none overflow-hidden h-fit">
            <CardHeader className="p-5 border-b border-gray-100/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-950/40">
              <CardTitle className="text-xs font-black flex items-center gap-2.5 text-gray-900 dark:text-gray-100 uppercase tracking-[0.15em]">
                <div className="p-2 rounded-xl bg-amber-500/10">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                Events Focus
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-0">
              {!selectedDate || selectedEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 px-10 text-center animate-in fade-in zoom-in-95">
                  <div className="w-16 h-16 rounded-[2rem] bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center mb-6 transition-all hover:border-amber-500 hover:rotate-12 group">
                    <CalendarDays className="h-8 w-8 text-gray-300 dark:text-gray-600 transition-colors group-hover:text-amber-500" />
                  </div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">
                    {selectedDate ? "Day is Clear" : "View Schedule"}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 max-w-[200px] leading-relaxed">
                    {selectedDate 
                      ? "There are no school events or deadlines scheduled for this date." 
                      : "Click on any calendar day to see specific school events and child activities."}
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-5">
                  <div className="px-2 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.25em]">
                        {formatDisplayDate(selectedDate).split(',')[0]}
                      </p>
                      <h4 className="text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight">
                        {formatDisplayDate(selectedDate).split(',').slice(1).join(',')}
                      </h4>
                    </div>
                    <Badge variant="secondary" className="rounded-lg font-black text-[10px] bg-amber-50 text-amber-600 border-none px-2.5 py-1">
                      {selectedEvents.length} ITEMS
                    </Badge>
                  </div>
                  
                  <ScrollArea className="max-h-[520px] pr-3 -mr-2">
                    <div className="space-y-4">
                      {selectedEvents.map((event) => (
                        <div
                          key={event.id}
                          className="group relative bg-white dark:bg-gray-950 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-500"
                        >
                          <div
                            className="absolute left-0 top-5 bottom-5 w-1.5 rounded-r-full transition-all group-hover:scale-y-125"
                            style={{ backgroundColor: event.color || EVENT_TYPE_COLORS[event.type] }}
                          />
                          
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-black text-gray-900 dark:text-gray-100 leading-snug group-hover:text-amber-600 transition-colors">
                                {event.title}
                              </h5>
                              <div className="flex flex-wrap items-center gap-2.5 mt-2.5">
                                <Badge
                                  className="text-[9px] font-black px-2.5 py-0.5 rounded-md border-none shadow-sm uppercase tracking-wider"
                                  style={{
                                    backgroundColor: `${event.color || EVENT_TYPE_COLORS[event.type] || "#6b7280"}20`,
                                    color: event.color || EVENT_TYPE_COLORS[event.type] || "#6b7280",
                                  }}
                                >
                                  {EVENT_TYPE_LABELS[event.type] || event.type}
                                </Badge>
                                <span className="text-[10px] font-black text-gray-400 flex items-center gap-1.5 uppercase tracking-tighter">
                                  <Clock className="h-3 w-3 text-amber-500" />
                                  {formatTimeRange(event.date, event.endDate, event.allDay)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {event.description && (
                            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed font-medium">
                              {event.description}
                            </p>
                          )}

                          {event.location && (
                            <div className="mt-4 pt-3.5 border-t border-gray-50 dark:border-gray-800 flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              <MapPin className="h-3.5 w-3.5 text-amber-500 transition-transform group-hover:scale-125" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border-gray-100/50 dark:border-gray-800/50 bg-amber-500/5 p-5 backdrop-blur-sm border border-amber-500/10">
            <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Legend
            </h4>
            <div className="grid grid-cols-2 gap-3.5">
              {availableTypes.length > 0 ? (
                availableTypes.map((t) => (
                  <div key={t} className="flex items-center gap-2.5 text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-tight">
                    <span className="w-2.5 h-2.5 rounded-full shadow-md border border-white dark:border-gray-900" style={{ backgroundColor: EVENT_TYPE_COLORS[t] }} />
                    {EVENT_TYPE_LABELS[t]}
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-gray-400 italic font-bold">No active types found.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
