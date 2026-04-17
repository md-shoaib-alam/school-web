"use client";

import { apiFetch } from "@/lib/api";
import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/use-app-store";

// Sub-components
import { CalendarHeader } from "./calendar/CalendarHeader";
import { CalendarGrid } from "./calendar/CalendarGrid";
import { AgendaPanel } from "./calendar/AgendaPanel";

// Types & Utils & Constants
import { CalendarEvent } from "./calendar/types";
import { formatDateKey } from "./calendar/utils";
import { ROLE_FILTER_SET } from "./calendar/constants";

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
    apiFetch(
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <CalendarHeader 
        onPrevMonth={goToPrevMonth} 
        onNextMonth={goToNextMonth} 
        onToday={goToToday} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <CalendarGrid
          currentYear={currentYear}
          currentMonth={currentMonth}
          isLoading={isLoading}
          eventsByDate={eventsByDate}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          activeTypeFilter={activeTypeFilter}
          setActiveTypeFilter={setActiveTypeFilter}
          availableTypes={availableTypes}
          todayKey={todayKey}
        />

        <AgendaPanel
          selectedDate={selectedDate}
          selectedEvents={selectedEvents}
          availableTypes={availableTypes}
        />
      </div>
    </div>
  );
}
