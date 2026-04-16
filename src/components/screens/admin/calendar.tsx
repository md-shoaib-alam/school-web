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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Read-only banner */}
      {!canCreate && !canEdit && !canDelete && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200/50 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-900/10 backdrop-blur-sm px-4 py-3">
          <Eye className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">
            Read-only mode — you have view permission only for this module.
          </span>
        </div>
      )}

      {/* Header: Navigation + Filters + Add Button */}
      <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between bg-white/40 dark:bg-gray-900/40 p-1.5 rounded-2xl border border-white/20 dark:border-gray-800/20 backdrop-blur-md shadow-sm">
        {/* Left: Month navigation */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex items-center gap-1.5 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-white dark:hover:bg-gray-700 shadow-none focus-visible:ring-0"
              onClick={goToPrevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs font-semibold rounded-lg hover:bg-white dark:hover:bg-gray-700 shadow-none focus-visible:ring-0"
              onClick={goToToday}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-white dark:hover:bg-gray-700 shadow-none focus-visible:ring-0"
              onClick={goToNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-300 dark:to-white">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>
        </div>

        {/* Center + Right: Filter + Add */}
        <div className="flex items-center gap-3 w-full lg:w-auto px-2 pb-1 lg:pb-0">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-44 h-10 rounded-xl border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 shadow-none focus:ring-emerald-500/20">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Event Types</SelectItem>
              {ALL_EVENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-5 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              onClick={openCreateDialog}
            >
              <Plus className="h-4 w-4 mr-2" />
              <span>Add Event</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main layout: Calendar grid + Side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar grid */}
        <Card className="lg:col-span-8 overflow-hidden rounded-2xl border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-gray-200/20 dark:shadow-none">
          <CardContent className="p-0 sm:p-0">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/30">
              {WEEKDAY_LABELS.map((day) => (
                <div
                  key={day}
                  className="py-3 text-center text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Loading skeleton */}
            {loading ? (
              <div className="grid grid-cols-7 gap-px bg-gray-100 dark:bg-gray-800">
                {Array.from({ length: 42 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-900 p-3 min-h-[90px] sm:min-h-[110px]"
                  >
                    <Skeleton className="h-4 w-6 mb-2 rounded-md" />
                    <Skeleton className="h-2 w-full mb-1 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              /* Calendar cells */
              <div className="grid grid-cols-7 gap-px bg-gray-100 dark:bg-gray-800">
                {calendarCells.map((dateStr, idx) => {
                  if (!dateStr) return <div key={`empty-${idx}`} className="bg-white dark:bg-gray-900" />;

                  const dayEvents = eventsByDate.get(dateStr) || [];
                  const dayNum = parseInt(dateStr.split("-")[2], 10);
                  const todayHighlight = isToday(dateStr);
                  const isSelected = selectedDate === dateStr;
                  const inCurrentMonth = isCurrentMonthDay(dateStr);
                  const maxDots = 2;

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => setSelectedDate(dateStr)}
                      className={`
                        group relative bg-white dark:bg-gray-900 p-1.5 sm:p-3 min-h-[70px] sm:min-h-[110px]
                        text-left transition-all hover:z-10 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 focus:outline-none
                        focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-inset
                        ${!inCurrentMonth ? "bg-gray-50/40 dark:bg-gray-800/20 opacity-50" : ""}
                        ${isSelected ? "bg-emerald-50/50 dark:bg-emerald-950/40 ring-2 ring-emerald-500 ring-inset" : ""}
                      `}
                    >
                      {/* Day number */}
                      <span
                        className={`
                          inline-flex items-center justify-center
                          text-xs sm:text-sm font-bold transition-all
                          ${todayHighlight ? "bg-emerald-600 text-white rounded-lg w-6 h-6 sm:w-8 sm:h-8 shadow-md shadow-emerald-500/20" : "text-gray-900 dark:text-gray-100"}
                          ${!todayHighlight && !inCurrentMonth ? "text-gray-400 dark:text-gray-600" : ""}
                        `}
                      >
                        {dayNum}
                      </span>

                      {/* Event indicators */}
                      {dayEvents.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {dayEvents.slice(0, maxDots).map((ev) => (
                            <div
                              key={ev.id}
                              className="hidden sm:flex items-center gap-1.5 truncate text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-transparent hover:border-current/20"
                              style={{
                                backgroundColor: `${ev.color || EVENT_TYPE_COLORS[ev.type] || "#6b7280"}15`,
                                color: ev.color || EVENT_TYPE_COLORS[ev.type] || "#6b7280",
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ev.color || EVENT_TYPE_COLORS[ev.type] }} />
                              <span className="truncate">{ev.title}</span>
                            </div>
                          ))}
                          {/* Mobile: colored dots only */}
                          <div className="flex sm:hidden flex-wrap gap-1 mt-1">
                            {dayEvents.slice(0, 4).map((ev) => (
                              <span
                                key={ev.id}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: ev.color || EVENT_TYPE_COLORS[ev.type] }}
                              />
                            ))}
                          </div>
                          {/* "N more" indicator */}
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
            )}
          </CardContent>
        </Card>

        {/* Side panel: selected day events */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-2xl border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-gray-200/20 dark:shadow-none overflow-hidden h-fit">
            <CardHeader className="p-5 border-b border-gray-100/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-950/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2.5 text-gray-900 dark:text-gray-100">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10">
                    <CalendarDays className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  Daily Agenda
                </CardTitle>
                {selectedDate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    onClick={() => setSelectedDate(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {!selectedDate ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                    <CalendarDays className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Select a Date</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-[200px] mx-auto">
                    Click any day on the calendar to view its scheduled events and activities.
                  </p>
                </div>
              ) : loading ? (
                <div className="p-5 space-y-4">
                  <Skeleton className="h-4 w-32 rounded-lg" />
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="space-y-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedDayEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <CalendarDays className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Clean Slate</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-6">
                    Nothing scheduled for {formatDisplayDate(selectedDate)}.
                  </p>
                  {canCreate && (
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-lg shadow-emerald-500/10"
                      onClick={openCreateDialog}
                    >
                      <Plus className="h-4 w-4 mr-1.5" />
                      Create Event
                    </Button>
                  )}
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {/* Selected date header */}
                  <div className="px-1 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                        {formatDisplayDate(selectedDate).split(',')[0]}
                      </p>
                      <h4 className="text-sm font-black text-gray-900 dark:text-gray-100">
                        {formatDisplayDate(selectedDate).split(',').slice(1).join(',')}
                      </h4>
                    </div>
                    <Badge variant="secondary" className="rounded-lg font-bold text-[10px]">
                      {selectedDayEvents.length} Items
                    </Badge>
                  </div>

                  <ScrollArea className="max-h-[500px] pr-2">
                    <div className="space-y-3">
                      {selectedDayEvents.map((ev) => (
                        <div
                          key={ev.id}
                          className="group relative bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300"
                        >
                          {/* Colored bar */}
                          <div
                            className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
                            style={{ backgroundColor: ev.color || EVENT_TYPE_COLORS[ev.type] }}
                          />

                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug">
                                {ev.title}
                              </h5>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <Badge
                                  className="text-[9px] font-bold px-2 py-0.5 rounded-md border-none"
                                  style={getTypeBadgeStyle(ev.type, ev.color)}
                                >
                                  {EVENT_TYPE_LABELS[ev.type] || ev.type}
                                </Badge>
                                <span className="text-[10px] font-medium text-gray-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {ev.allDay ? "All Day" : "Scheduled"}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            {(canEdit || canDelete) && (
                              <div className="hidden group-hover:flex items-center gap-1">
                                {canEdit && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/40 text-emerald-600"
                                    onClick={() => openEditDialog(ev)}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>

                          {ev.description && (
                            <p className="mt-2.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
                              {ev.description}
                            </p>
                          )}

                          {ev.location && (
                            <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-800 flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                              <MapPin className="h-3 w-3 text-emerald-500" />
                              {ev.location}
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

          {/* Type Key Legend */}
          <Card className="rounded-2xl border-gray-200/50 dark:border-gray-800/50 bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm p-4">
            <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Legend</h4>
            <div className="grid grid-cols-2 gap-2">
              {ALL_EVENT_TYPES.slice(0, 8).map((t) => (
                <div key={t} className="flex items-center gap-2 text-[11px] font-bold text-gray-600 dark:text-gray-300">
                  <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: EVENT_TYPE_COLORS[t] }} />
                  {EVENT_TYPE_LABELS[t]}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>


      {/* ================================================================== */}
      {/* Create / Edit Event Dialog                                          */}
      {/* ================================================================== */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-lg rounded-3xl border-none shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl animate-in zoom-in-95 duration-300">
          <DialogHeader className="space-y-1.5 pt-2">
            <DialogTitle className="text-xl font-black text-gray-900 dark:text-gray-100">
              {editingEvent ? "Update Event" : "Create New Event"}
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-gray-500">
              {editingEvent ? "Modify the schedule details for this activity." : "Schedule a new activity or important date for the school community."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Title Section */}
            <div className="space-y-2.5">
              <Label className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500 flex items-center gap-1.5 ml-1">
                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                Event Title
              </Label>
              <Input
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                placeholder="e.g. Annual Sports Meet 2024"
                className="rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 focus:ring-emerald-500/20 h-11 text-sm font-medium"
              />
            </div>

            {/* Date Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500 ml-1">Start Date</Label>
                <div className="relative group">
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => updateForm("date", e.target.value)}
                    className="rounded-xl bg-gray-50/50 dark:bg-gray-950/50 h-11 text-sm pl-4"
                  />
                </div>
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500 ml-1">End Date (Optional)</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => updateForm("endDate", e.target.value)}
                  className="rounded-xl bg-gray-50/50 dark:bg-gray-950/50 h-11 text-sm pl-4"
                  min={form.date}
                />
              </div>
            </div>

            {/* Classification */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500 ml-1">Category</Label>
                <Select value={form.type} onValueChange={handleTypeChange}>
                  <SelectTrigger className="rounded-xl bg-gray-50/50 dark:bg-gray-950/50 h-11 border-gray-100 dark:border-gray-800 shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl">
                    {ALL_EVENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="rounded-lg my-0.5">
                        <span className="flex items-center gap-2 font-medium py-1">
                          <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: EVENT_TYPE_COLORS[t] }} />
                          {EVENT_TYPE_LABELS[t]}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500 ml-1">Share With</Label>
                <Select value={form.targetRole} onValueChange={(v) => updateForm("targetRole", v)}>
                  <SelectTrigger className="rounded-xl bg-gray-50/50 dark:bg-gray-950/50 h-11 border-gray-100 dark:border-gray-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="admin">Admins Only</SelectItem>
                    <SelectItem value="teacher">Teachers</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="parent">Parents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location & Details */}
            <div className="space-y-2.5">
              <Label className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500 ml-1">Location / Platform</Label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                <Input
                  value={form.location}
                  onChange={(e) => updateForm("location", e.target.value)}
                  placeholder="e.g. Main Auditorium or Zoom"
                  className="rounded-xl bg-gray-50/50 dark:bg-gray-950/50 h-11 pl-10 text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500 ml-1">Detailed Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                placeholder="Write a few lines about what participants should expect..."
                className="rounded-xl bg-gray-50/50 dark:bg-gray-950/50 min-h-[100px] text-sm py-3 px-4 leading-relaxed"
              />
            </div>
            
            <div className="flex items-center gap-3 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
              <Switch
                id="event-allday"
                checked={form.allDay}
                onCheckedChange={(checked) => updateForm("allDay", checked)}
                className="data-[state=checked]:bg-emerald-600"
              />
              <Label htmlFor="event-allday" className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                Mark as all-day event
              </Label>
            </div>
          </div>

          <DialogFooter className="bg-gray-50/50 dark:bg-gray-950/30 -mx-6 -mb-6 px-6 py-4 mt-2">
            <Button variant="ghost" onClick={closeDialog} className="rounded-xl font-bold text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
              Discard
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold px-8 shadow-lg shadow-emerald-500/20 h-11 transition-all active:scale-95"
              onClick={handleSubmit}
              disabled={submitting || !form.title.trim() || !form.date}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingEvent ? "Sync Changes" : "Create Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
