"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  MapPin,
  Clock,
  X,
  Loader2,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/store/use-app-store";
import { useModulePermissions } from "@/hooks/use-permissions";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

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

const TARGET_ROLE_LABELS: Record<string, string> = {
  all: "Everyone",
  admin: "Admins",
  teacher: "Teachers",
  student: "Students",
  parent: "Parents",
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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

const ALL_EVENT_TYPES = [
  "exam",
  "holiday",
  "event",
  "meeting",
  "sports",
  "cultural",
  "deadline",
  "other",
  "general",
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CalendarEvent {
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

interface EventFormData {
  title: string;
  description: string;
  date: string;
  endDate: string;
  type: string;
  targetRole: string;
  color: string;
  allDay: boolean;
  location: string;
}

const EMPTY_FORM: EventFormData = {
  title: "",
  description: "",
  date: "",
  endDate: "",
  type: "event",
  targetRole: "all",
  color: "#3b82f6",
  allDay: true,
  location: "",
};

// ---------------------------------------------------------------------------
// Calendar helpers
// ---------------------------------------------------------------------------

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSameDay(d1: string | Date, d2: string | Date): boolean {
  const a = typeof d1 === "string" ? d1 : formatDateISO(d1);
  const b = typeof d2 === "string" ? d2 : formatDateISO(d2);
  return a === b;
}

function isToday(dateStr: string): boolean {
  return isSameDay(dateStr, new Date());
}

function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Check if an event should appear on a given day. Multi-day events span from date to endDate. */
function eventFallsOnDate(ev: CalendarEvent, dayStr: string): boolean {
  if (ev.date === dayStr) return true;
  if (ev.endDate && ev.endDate >= dayStr && ev.date <= dayStr) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminCalendar() {
  const { canCreate, canEdit, canDelete } = useModulePermissions("calendar");
  const { toast } = useToast();
  const currentTenantId = useAppStore((s) => s.currentTenantId);

  // --- State ---
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(
    formatDateISO(today),
  );
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState<EventFormData>({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // --- Derived data ---
  const monthKey = useMemo(
    () => `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`,
    [currentYear, currentMonth],
  );

  const daysInMonth = useMemo(
    () => getDaysInMonth(currentYear, currentMonth),
    [currentYear, currentMonth],
  );

  const firstDayOfWeek = useMemo(
    () => getFirstDayOfWeek(currentYear, currentMonth),
    [currentYear, currentMonth],
  );

  /** Build the 42-cell calendar grid (6 rows x 7 cols), each cell is a date string or null. */
  const calendarCells = useMemo(() => {
    const cells: (string | null)[] = [];
    // Previous month padding
    const prevMonthDays = getDaysInMonth(
      currentMonth === 0 ? currentYear - 1 : currentYear,
      currentMonth === 0 ? 11 : currentMonth - 1,
    );
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const m = currentMonth === 0 ? 11 : currentMonth - 1;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      cells.push(
        `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      );
    }
    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(
        `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      );
    }
    // Next month padding (fill to 42)
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth === 11 ? 0 : currentMonth + 1;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      cells.push(
        `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      );
    }
    return cells;
  }, [currentYear, currentMonth, daysInMonth, firstDayOfWeek]);

  /** Filtered events for the current view */
  const filteredEvents = useMemo(() => {
    if (typeFilter === "all") return events;
    return events.filter((ev) => ev.type === typeFilter);
  }, [events, typeFilter]);

  /** Events for the selected date */
  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    return filteredEvents.filter((ev) => eventFallsOnDate(ev, selectedDate));
  }, [selectedDate, filteredEvents]);

  /** Map of date string -> events for quick lookup on the grid */
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of filteredEvents) {
      // Add to start date
      const start = ev.date;
      const end = ev.endDate || ev.date;
      let cursor = start;
      while (cursor <= end) {
        const existing = map.get(cursor) || [];
        existing.push(ev);
        map.set(cursor, existing);
        // Increment cursor by one day
        const d = new Date(cursor + "T00:00:00");
        d.setDate(d.getDate() + 1);
        cursor = formatDateISO(d);
      }
    }
    return map;
  }, [filteredEvents]);

  // --- Fetch events ---
  const fetchEvents = useCallback(async () => {
    if (!currentTenantId) {
      setEvents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/events?tenantId=${encodeURIComponent(currentTenantId)}&month=${monthKey}`,
      );
      if (!res.ok) throw new Error("Failed to fetch events");
      const json = await res.json();
      const data: CalendarEvent[] = Array.isArray(json)
        ? json
        : (json.data ?? []);
      setEvents(data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load calendar events. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [monthKey, currentTenantId, toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // --- Navigation ---
  const goToPrevMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      if (prev === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      if (prev === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  const goToToday = useCallback(() => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(formatDateISO(now));
  }, []);

  // --- Dialog handlers ---
  const openCreateDialog = useCallback(() => {
    setEditingEvent(null);
    setForm({
      ...EMPTY_FORM,
      date: selectedDate || formatDateISO(today),
    });
    setDialogOpen(true);
  }, [selectedDate, today]);

  const openEditDialog = useCallback((ev: CalendarEvent) => {
    setEditingEvent(ev);
    setForm({
      title: ev.title,
      description: ev.description || "",
      date: ev.date,
      endDate: ev.endDate || "",
      type: ev.type,
      targetRole: ev.targetRole,
      color: ev.color,
      allDay: ev.allDay,
      location: ev.location || "",
    });
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingEvent(null);
    setForm({ ...EMPTY_FORM });
  }, []);

  const updateForm = useCallback(
    <K extends keyof EventFormData>(key: K, value: EventFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleTypeChange = useCallback(
    (value: string) => {
      updateForm("type", value);
      // Auto-assign color when type changes (only if user hasn't customized)
      if (EVENT_TYPE_COLORS[value]) {
        updateForm("color", EVENT_TYPE_COLORS[value]);
      }
    },
    [updateForm],
  );

  // --- Submit (create / edit) ---
  const handleSubmit = useCallback(async () => {
    if (!form.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Event title is required.",
        variant: "destructive",
      });
      return;
    }
    if (!form.date) {
      toast({
        title: "Validation Error",
        description: "Event start date is required.",
        variant: "destructive",
      });
      return;
    }
    if (form.endDate && form.endDate < form.date) {
      toast({
        title: "Validation Error",
        description: "End date cannot be before start date.",
        variant: "destructive",
      });
      return;
    }

    if (!currentTenantId) {
      toast({
        title: "Error",
        description: "No school selected. Please log in again.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const url = editingEvent ? "/api/events" : "/api/events";
      const method = editingEvent ? "PUT" : "POST";
      const body: Record<string, unknown> = {
        tenantId: currentTenantId,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        date: form.date,
        endDate: form.endDate || undefined,
        type: form.type,
        targetRole: form.targetRole,
        color: form.color,
        allDay: form.allDay,
        location: form.location.trim() || undefined,
      };
      if (editingEvent) {
        body.id = editingEvent.id;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save event");

      toast({
        title: editingEvent ? "Event Updated" : "Event Created",
        description: editingEvent
          ? `"${form.title}" has been updated.`
          : `"${form.title}" has been added to the calendar.`,
      });

      closeDialog();
      await fetchEvents();
    } catch {
      toast({
        title: "Error",
        description: editingEvent
          ? "Failed to update event. Please try again."
          : "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }, [form, editingEvent, closeDialog, fetchEvents, toast]);

  // --- Delete ---
  const handleDelete = useCallback(
    async (id: string) => {
      if (!currentTenantId) {
        toast({
          title: "Error",
          description: "No school selected.",
          variant: "destructive",
        });
        return;
      }
      setDeleting(true);
      try {
        const res = await fetch(
          `/api/events?id=${encodeURIComponent(id)}&tenantId=${encodeURIComponent(currentTenantId)}`,
          { method: "DELETE" },
        );
        if (!res.ok) throw new Error("Failed to delete event");

        toast({
          title: "Event Deleted",
          description: "The event has been removed.",
        });
        setEvents((prev) => prev.filter((ev) => ev.id !== id));
      } catch {
        toast({
          title: "Error",
          description: "Failed to delete event. Please try again.",
          variant: "destructive",
        });
      } finally {
        setDeleting(false);
      }
    },
    [toast],
  );

  // --- Render helpers ---
  const getTypeBadgeStyle = useCallback((type: string, color: string) => {
    // Use the event's custom color or fall back to type default
    const c = color || EVENT_TYPE_COLORS[type] || "#6b7280";
    return {
      backgroundColor: `${c}18`,
      color: c,
      borderColor: `${c}40`,
    };
  }, []);

  const isCurrentMonthDay = useCallback(
    (dateStr: string) => {
      const d = new Date(dateStr + "T00:00:00");
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    },
    [currentMonth, currentYear],
  );

  // =========================================================================
  // Render
  // =========================================================================

  return (
    <div className="space-y-6">
      {/* Read-only banner */}
      {!canCreate && !canEdit && !canDelete && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 px-3 py-2">
          <Eye className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
            Read-only mode — you have view permission only for this module.
          </span>
        </div>
      )}

      {/* Header: Navigation + Filters + Add Button */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Left: Month navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={goToPrevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3"
            onClick={goToToday}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="ml-2 text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>
        </div>

        {/* Center + Right: Filter + Add */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-44 h-9">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {ALL_EVENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: EVENT_TYPE_COLORS[t] }}
                    />
                    {EVENT_TYPE_LABELS[t]}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {canCreate && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 h-9"
              onClick={openCreateDialog}
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Event</span>
              <span className="sm:hidden">Add</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main layout: Calendar grid + Side panel */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar grid */}
        <Card className="flex-1 min-w-0">
          <CardContent className="p-2 sm:p-4">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAY_LABELS.map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Loading skeleton */}
            {loading ? (
              <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                {Array.from({ length: 42 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-background p-1.5 sm:p-2 min-h-[72px] sm:min-h-[90px]"
                  >
                    <Skeleton className="h-4 w-6 mb-1" />
                    <Skeleton className="h-2 w-10 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              /* Calendar cells */
              <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                {calendarCells.map((dateStr, idx) => {
                  if (!dateStr)
                    return (
                      <div key={`empty-${idx}`} className="bg-background" />
                    );

                  const dayEvents = eventsByDate.get(dateStr) || [];
                  const dayNum = parseInt(dateStr.split("-")[2], 10);
                  const todayHighlight = isToday(dateStr);
                  const isSelected = selectedDate === dateStr;
                  const inCurrentMonth = isCurrentMonthDay(dateStr);
                  const maxDots = 3;

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => setSelectedDate(dateStr)}
                      className={`
                        relative bg-background p-1 sm:p-2 min-h-[60px] sm:min-h-[90px]
                        text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none
                        focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-inset
                        ${!inCurrentMonth ? "bg-gray-50/60 dark:bg-gray-800/60" : ""}
                        ${isSelected ? "ring-2 ring-emerald-500 ring-inset bg-emerald-50/40 dark:bg-emerald-900/20" : ""}
                      `}
                      aria-label={`${MONTH_NAMES[currentMonth]} ${dayNum}, ${currentYear}. ${dayEvents.length} event${dayEvents.length !== 1 ? "s" : ""}`}
                    >
                      {/* Day number */}
                      <span
                        className={`
                          inline-flex items-center justify-center
                          text-xs sm:text-sm font-medium
                          ${todayHighlight ? "bg-emerald-600 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7" : ""}
                          ${!todayHighlight && !inCurrentMonth ? "text-muted-foreground/50" : ""}
                          ${!todayHighlight && inCurrentMonth ? "text-gray-900 dark:text-gray-100" : ""}
                        `}
                      >
                        {dayNum}
                      </span>

                      {/* Event indicators */}
                      {dayEvents.length > 0 && (
                        <div className="mt-0.5 sm:mt-1 space-y-0.5">
                          {dayEvents.slice(0, maxDots).map((ev) => (
                            <div
                              key={ev.id}
                              className="hidden sm:flex items-center truncate text-[10px] sm:text-xs font-medium px-1 py-0.5 rounded-sm leading-tight"
                              style={{
                                backgroundColor: `${ev.color || EVENT_TYPE_COLORS[ev.type] || "#6b7280"}18`,
                                color:
                                  ev.color ||
                                  EVENT_TYPE_COLORS[ev.type] ||
                                  "#6b7280",
                              }}
                            >
                              <span className="truncate">{ev.title}</span>
                            </div>
                          ))}
                          {/* Mobile: colored dots only */}
                          {dayEvents.slice(0, maxDots + 1).map((ev, i) => (
                            <span
                              key={ev.id}
                              className="sm:hidden inline-block w-1.5 h-1.5 rounded-full mr-0.5"
                              style={{
                                backgroundColor:
                                  ev.color ||
                                  EVENT_TYPE_COLORS[ev.type] ||
                                  "#6b7280",
                              }}
                            />
                          ))}
                          {/* "+N more" indicator */}
                          {dayEvents.length > maxDots && (
                            <span className="hidden sm:block text-[10px] text-muted-foreground pl-1 truncate">
                              +{dayEvents.length - maxDots} more
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

        {/* Side panel: selected day events */}
        <Card className="w-full lg:w-80 xl:w-96 shrink-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-emerald-600" />
                Events
              </CardTitle>
              {selectedDate && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedDate(null)}
                  aria-label="Close panel"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            {!selectedDate ? (
              <div className="text-center py-10 text-muted-foreground">
                <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No date selected</p>
                <p className="text-xs mt-1">
                  Click a day on the calendar to view events
                </p>
              </div>
            ) : loading ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-40" />
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2 p-3 rounded-lg border">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : selectedDayEvents.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No events</p>
                <p className="text-xs mt-1 mb-4">
                  No events scheduled for this day
                </p>
                {canCreate && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={openCreateDialog}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Add Event
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selected date header */}
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    {formatDisplayDate(selectedDate)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {selectedDayEvents.length} event
                    {selectedDayEvents.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <ScrollArea className="max-h-[420px] pr-1">
                  <div className="space-y-2">
                    {selectedDayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="group p-3 rounded-lg border hover:shadow-sm transition-shadow"
                        style={{
                          borderLeftWidth: "3px",
                          borderLeftColor:
                            ev.color || EVENT_TYPE_COLORS[ev.type] || "#6b7280",
                        }}
                      >
                        {/* Title row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {ev.title}
                            </p>
                          </div>
                          {/* Action buttons */}
                          {(canEdit || canDelete) && (
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              {canEdit && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                                  onClick={() => openEditDialog(ev)}
                                  aria-label="Edit event"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              {canDelete && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                                      aria-label="Delete event"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Event
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete &quot;
                                        {ev.title}&quot;? This action cannot be
                                        undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(ev.id)}
                                        disabled={deleting}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        {deleting ? "Deleting..." : "Delete"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Type badge */}
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-medium px-1.5 py-0"
                            style={getTypeBadgeStyle(ev.type, ev.color)}
                          >
                            {EVENT_TYPE_LABELS[ev.type] || ev.type}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-medium px-1.5 py-0 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                          >
                            {TARGET_ROLE_LABELS[ev.targetRole] || ev.targetRole}
                          </Badge>
                          {ev.allDay && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-medium px-1.5 py-0 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                            >
                              All Day
                            </Badge>
                          )}
                        </div>

                        {/* Description */}
                        {ev.description && (
                          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {ev.description}
                          </p>
                        )}

                        {/* Meta info */}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                          {/* Date range display */}
                          {ev.endDate && ev.endDate !== ev.date && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(
                                ev.date + "T00:00:00",
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                              {" – "}
                              {new Date(
                                ev.endDate + "T00:00:00",
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                          {ev.location && (
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="h-3 w-3 shrink-0" />
                              {ev.location}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Type legend */}
      <div className="flex flex-wrap items-center gap-3 px-1">
        <span className="text-xs text-muted-foreground font-medium">
          Event Types:
        </span>
        {ALL_EVENT_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTypeFilter(typeFilter === t ? "all" : t)}
            className={`
              flex items-center gap-1.5 text-xs px-2 py-1 rounded-full transition-colors
              ${typeFilter === t ? "bg-gray-100 dark:bg-gray-800 font-semibold" : "hover:bg-gray-50 dark:hover:bg-gray-800 text-muted-foreground"}
            `}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: EVENT_TYPE_COLORS[t] }}
            />
            {EVENT_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* ================================================================== */}
      {/* Create / Edit Event Dialog                                          */}
      {/* ================================================================== */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
          else setDialogOpen(true);
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Edit Event" : "Create Event"}
            </DialogTitle>
            <DialogDescription>
              {editingEvent
                ? "Update the event details below."
                : "Add a new event to the school calendar."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="event-title">Title *</Label>
              <Input
                id="event-title"
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                placeholder="Event title"
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="event-desc">Description</Label>
              <Textarea
                id="event-desc"
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                placeholder="Event description (optional)"
                rows={3}
              />
            </div>

            {/* Date row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="event-date">Start Date *</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => updateForm("date", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-enddate">End Date</Label>
                <Input
                  id="event-enddate"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => updateForm("endDate", e.target.value)}
                  min={form.date}
                />
              </div>
            </div>

            {/* Type + Target Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Event Type</Label>
                <Select value={form.type} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_EVENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        <span className="flex items-center gap-2">
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: EVENT_TYPE_COLORS[t] }}
                          />
                          {EVENT_TYPE_LABELS[t]}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Target Audience</Label>
                <Select
                  value={form.targetRole}
                  onValueChange={(v) => updateForm("targetRole", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                    <SelectItem value="teacher">Teachers</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="parent">Parents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Color + Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="event-color">Color</Label>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="color"
                      id="event-color"
                      value={form.color}
                      onChange={(e) => updateForm("color", e.target.value)}
                      className="w-9 h-9 rounded-md border cursor-pointer p-0.5"
                    />
                  </div>
                  <Input
                    value={form.color}
                    onChange={(e) => updateForm("color", e.target.value)}
                    placeholder="#000000"
                    className="flex-1 font-mono text-xs"
                    maxLength={7}
                  />
                  {/* Quick color presets */}
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(EVENT_TYPE_COLORS)
                      .filter(([, c]) => c !== form.color)
                      .slice(0, 4)
                      .map(([type, c]) => (
                        <button
                          key={type}
                          type="button"
                          className="w-5 h-5 rounded-full border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform"
                          style={{ backgroundColor: c }}
                          title={EVENT_TYPE_LABELS[type]}
                          onClick={() => updateForm("color", c)}
                          aria-label={`Set color to ${EVENT_TYPE_LABELS[type]}`}
                        />
                      ))}
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-location">Location</Label>
                <Input
                  id="event-location"
                  value={form.location}
                  onChange={(e) => updateForm("location", e.target.value)}
                  placeholder="Event location (optional)"
                />
              </div>
            </div>

            {/* All Day toggle */}
            <div className="flex items-center gap-3">
              <Switch
                id="event-allday"
                checked={form.allDay}
                onCheckedChange={(checked) => updateForm("allDay", checked)}
              />
              <Label htmlFor="event-allday" className="text-sm">
                All Day Event
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={closeDialog}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleSubmit}
              disabled={submitting || !form.title.trim() || !form.date}
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingEvent ? "Save Changes" : "Create Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
