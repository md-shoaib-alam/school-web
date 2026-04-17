"use client";

import { useState, useMemo, useCallback } from "react";
import { useAppStore } from "@/store/use-app-store";
import { useModulePermissions } from "@/hooks/use-permissions";
import { Eye } from "lucide-react";
import { goeyToast as toast } from "goey-toast";

import { CalendarEvent, EventFormData, EMPTY_FORM, EVENT_TYPE_COLORS } from "./calendar/types";
import { formatDateISO, eventFallsOnDate, getDaysInMonth, getFirstDayOfWeek } from "./calendar/utils";
import { CalendarHeader } from "./calendar/calendar-header";
import { CalendarGrid } from "./calendar/calendar-grid";
import { CalendarAgenda } from "./calendar/calendar-agenda";
import { CalendarDialogs } from "./calendar/calendar-dialogs";
import { useCalendarEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from "./calendar/calendar-hooks";

export function AdminCalendar() {
  const { canCreate, canEdit, canDelete } = useModulePermissions("calendar");
  const currentTenantId = useAppStore((s) => s.currentTenantId);

  // --- State ---
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(formatDateISO(today));
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState<EventFormData>({ ...EMPTY_FORM });

  // --- TanStack Query ---
  const monthKey = useMemo(() => `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`, [currentYear, currentMonth]);
  const { data: events = [], isLoading: loading } = useCalendarEvents(currentTenantId, monthKey);
  
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();

  // --- Derived data ---
  const daysInMonth = useMemo(() => getDaysInMonth(currentYear, currentMonth), [currentYear, currentMonth]);
  const firstDayOfWeek = useMemo(() => getFirstDayOfWeek(currentYear, currentMonth), [currentYear, currentMonth]);

  const calendarCells = useMemo(() => {
    const cells: (string | null)[] = [];
    const prevMonthDays = getDaysInMonth(currentMonth === 0 ? currentYear - 1 : currentYear, currentMonth === 0 ? 11 : currentMonth - 1);
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const m = currentMonth === 0 ? 11 : currentMonth - 1;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      cells.push(`${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(`${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    }
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth === 11 ? 0 : currentMonth + 1;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      cells.push(`${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    }
    return cells;
  }, [currentYear, currentMonth, daysInMonth, firstDayOfWeek]);

  const filteredEvents = useMemo(() => (typeFilter === "all" ? events : events.filter((ev) => ev.type === typeFilter)), [events, typeFilter]);
  const selectedDayEvents = useMemo(() => (selectedDate ? filteredEvents.filter((ev) => eventFallsOnDate(ev, selectedDate)) : []), [selectedDate, filteredEvents]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of filteredEvents) {
      let cursor = ev.date;
      const end = ev.endDate || ev.date;
      while (cursor <= end) {
        const existing = map.get(cursor) || [];
        existing.push(ev);
        map.set(cursor, existing);
        const d = new Date(cursor + "T00:00:00");
        d.setDate(d.getDate() + 1);
        cursor = formatDateISO(d);
      }
    }
    return map;
  }, [filteredEvents]);

  // --- Navigation ---
  const goToPrevMonth = () => setCurrentMonth(prev => prev === 0 ? (setCurrentYear(y => y-1), 11) : prev - 1);
  const goToNextMonth = () => setCurrentMonth(prev => prev === 11 ? (setCurrentYear(y => y+1), 0) : prev + 1);
  const goToToday = () => { const n = new Date(); setCurrentYear(n.getFullYear()); setCurrentMonth(n.getMonth()); setSelectedDate(formatDateISO(n)); };

  // --- Handlers ---
  const openCreateDialog = () => { setEditingEvent(null); setForm({ ...EMPTY_FORM, date: selectedDate || formatDateISO(today) }); setDialogOpen(true); };
  const openEditDialog = (ev: CalendarEvent) => {
    setEditingEvent(ev);
    setForm({ title: ev.title, description: ev.description || "", date: ev.date, endDate: ev.endDate || "", type: ev.type, targetRole: ev.targetRole, color: ev.color, allDay: ev.allDay, location: ev.location || "" });
    setDialogOpen(true);
  };
  const closeDialog = () => { setDialogOpen(false); setEditingEvent(null); setForm({ ...EMPTY_FORM }); };
  const updateForm = (key: keyof EventFormData, value: any) => setForm(prev => ({ ...prev, [key]: value }));
  const handleTypeChange = (v: string) => { updateForm("type", v); if (EVENT_TYPE_COLORS[v]) updateForm("color", EVENT_TYPE_COLORS[v]); };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.date) return toast.error("Required fields missing");
    const payload = { ...form, tenantId: currentTenantId, id: editingEvent?.id };
    
    if (editingEvent) {
      const { tenantId: _, ...updateData } = payload;
      await updateMutation.mutateAsync(updateData);
    } else {
      // Remove id and tenantId as they are not allowed in EventInput
      const { id: _, tenantId: __, ...cleanData } = payload;
      await createMutation.mutateAsync(cleanData);
    }
    closeDialog();
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete || !currentTenantId) return;
    await deleteMutation.mutateAsync({ id: eventToDelete });
    setDeleteConfirmOpen(false);
    setEventToDelete(null);
  };

  const isCurrentMonthDay = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  };

  const getTypeBadgeStyle = (type: string, color: string) => {
    const c = color || EVENT_TYPE_COLORS[type] || "#6b7280";
    return { backgroundColor: `${c}18`, color: c, borderColor: `${c}40` };
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-500 overflow-hidden">
      {!canCreate && !canEdit && !canDelete && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900/50 dark:bg-amber-900/20">
          <Eye className="h-5 w-5 text-amber-600 shrink-0" />
          <span className="text-sm text-amber-700 font-medium">Read-only mode.</span>
        </div>
      )}

      <CalendarHeader
        currentYear={currentYear} currentMonth={currentMonth} typeFilter={typeFilter} setTypeFilter={setTypeFilter}
        goToPrevMonth={goToPrevMonth} goToNextMonth={goToNextMonth} goToToday={goToToday} canCreate={canCreate} openCreateDialog={openCreateDialog}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-8">
          <CalendarGrid
            loading={loading} calendarCells={calendarCells} eventsByDate={eventsByDate}
            selectedDate={selectedDate} setSelectedDate={setSelectedDate} isCurrentMonthDay={isCurrentMonthDay}
          />
        </div>

        <CalendarAgenda
          selectedDate={selectedDate} setSelectedDate={setSelectedDate} loading={loading}
          selectedDayEvents={selectedDayEvents} getTypeBadgeStyle={getTypeBadgeStyle}
          canEdit={canEdit} canDelete={canDelete} openEditDialog={openEditDialog} openDeleteConfirm={(id) => { setEventToDelete(id); setDeleteConfirmOpen(true); }}
        />
      </div>

      <CalendarDialogs
        dialogOpen={dialogOpen} closeDialog={closeDialog} editingEvent={editingEvent} form={form}
        updateForm={updateForm} handleTypeChange={handleTypeChange}
        submitting={createMutation.isPending || updateMutation.isPending}
        handleSubmit={handleSubmit}
        deleteConfirmOpen={deleteConfirmOpen} setDeleteConfirmOpen={setDeleteConfirmOpen}
        deleting={deleteMutation.isPending} handleConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
