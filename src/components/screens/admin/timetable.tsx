'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Clock,
  BookOpen,
  Calendar,
  LayoutGrid,
  List,
  CalendarDays,
  Coffee,
  ChevronRight,
  Circle,
  Plus,
  Trash2,
  Loader2,
  Pencil,
  Copy,
  Eye,
  Settings,
  Check,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useModulePermissions } from '@/hooks/use-permissions';
import { useAppStore } from '@/store/use-app-store';
import type { ClassInfo, TimetableSlot } from '@/lib/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type ViewMode = 'grid' | 'list' | 'day';

// Default working days (Mon-Fri) — can be overridden by tenant settings
const DEFAULT_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

const ALL_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DAY_LABELS: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

const DAY_FULL_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const SUBJECT_COLORS = [
  'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
  'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
  'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-700',
  'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700',
  'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-700',
  'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700',
  'bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-700',
];

const SUBJECT_DOT_COLORS = [
  'bg-emerald-500',
  'bg-blue-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-pink-500',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSubjectColorIndex(
  uniqueSubjects: string[],
  subject: string,
): number {
  const idx = uniqueSubjects.indexOf(subject);
  return idx >= 0 ? idx : 0;
}

function getCurrentDayIndex(days: string[]): number {
  const jsDay = new Date().getDay(); // 0 = Sunday, 1 = Monday ...
  const dayMap: Record<number, string> = { 0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday' };
  const todayKey = dayMap[jsDay];
  return days.indexOf(todayKey);
}

function isCurrentPeriod(start: string, end: string): boolean {
  const now = new Date();
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  const startMin = startH * 60 + (startM ?? 0);
  const endMin = endH * 60 + (endM ?? 0);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return nowMin >= startMin && nowMin < endMin;
}

function formatTime(time: string): string {
  const [h, m] = time.split(':');
  const hour = parseInt(h ?? '0', 10);
  const min = m ?? '00';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${min} ${ampm}`;
}

function subjectBadge(
  subject: string,
  uniqueSubjects: string[],
  size: 'sm' | 'md',
): string {
  const idx = getSubjectColorIndex(uniqueSubjects, subject);
  return SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
}

function subjectDot(subject: string, uniqueSubjects: string[]): string {
  const idx = getSubjectColorIndex(uniqueSubjects, subject);
  return SUBJECT_DOT_COLORS[idx % SUBJECT_DOT_COLORS.length];
}

// ---------------------------------------------------------------------------
// Types for the create-timetable form
// ---------------------------------------------------------------------------

interface FormSlot {
  id: string;
  day: string;
  subjectId: string;
  teacherId: string;
  startTime: string;
  endTime: string;
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function AdminTimetable() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Working days from tenant settings (defaults to Mon-Fri)
  const [workingDays, setWorkingDays] = useState<string[]>(DEFAULT_DAYS);

  // Create timetable dialog state — day tabs with per-day period lists
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('monday');
  const [daySlots, setDaySlots] = useState<Record<string, FormSlot[]>>({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  });
  const [availableSubjects, setAvailableSubjects] = useState<
    { id: string; name: string; code: string; className: string; teacherName?: string }[]
  >([]);
  const [availableTeachers, setAvailableTeachers] = useState<
    { id: string; name: string; email: string }[]
  >([]);
  const [saving, setSaving] = useState(false);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [editForm, setEditForm] = useState({
    subjectId: '',
    teacherId: '',
    startTime: '',
    endTime: '',
    day: '',
  });
  const [editSaving, setEditSaving] = useState(false);

  // Working Days config dialog state
  const [daysConfigOpen, setDaysConfigOpen] = useState(false);
  const [daysConfigSaving, setDaysConfigSaving] = useState(false);
  const [daysConfigDraft, setDaysConfigDraft] = useState<string[]>([...workingDays]);

  // Copy from feature
  const [copySourceDay, setCopySourceDay] = useState<string>('monday');

  const { toast } = useToast();
  const currentClass = classes.find((c) => c.id === selectedClass);

  // ── Permission checks ──
  const { canCreate, canEdit, canDelete } = useModulePermissions('timetable');

  // Fetch classes on mount
  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch('/api/classes');
        if (!res.ok) throw new Error('Failed to fetch classes');
        const data = await res.json();
        setClasses(data);
        if (data.length > 0) {
          setSelectedClass(data[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoadingClasses(false);
      }
    }
    fetchClasses();
  }, []);

  // Fetch working days from tenant settings
  useEffect(() => {
    const fetchWorkingDays = async () => {
      const tenantId = useAppStore.getState().currentTenantId;
      if (!tenantId) return;
      try {
        const res = await fetch(`/api/tenant-settings?tenantId=${tenantId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.settings?.workingDays && Array.isArray(data.settings.workingDays)) {
            setWorkingDays(data.settings.workingDays);
          }
        }
      } catch {
        // Use default days on error
      }
    };
    fetchWorkingDays();
  }, []);

  // Fetch timetable when class changes
  const fetchTimetable = useCallback(async (classId: string) => {
    setLoadingTimetable(true);
    setError(null);
    try {
      const res = await fetch(`/api/timetable?classId=${classId}`);
      if (!res.ok) throw new Error('Failed to fetch timetable');
      const data = await res.json();
      setSlots(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoadingTimetable(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    fetchTimetable(selectedClass);
  }, [selectedClass, fetchTimetable]);

  // Delete handler
  const handleDeleteSlot = useCallback(async (slotId: string) => {
    try {
      const res = await fetch(`/api/timetable?id=${slotId}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Slot Deleted', description: 'Timetable entry removed.', variant: 'default' });
        if (selectedClass) fetchTimetable(selectedClass);
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete slot.', variant: 'destructive' });
    }
  }, [selectedClass, fetchTimetable, toast]);

  // Edit slot handler - opens edit dialog and pre-fills form
  const handleEditSlot = useCallback((slot: TimetableSlot) => {
    if (!canEdit) return;
    setEditingSlot(slot);
    setEditForm({
      subjectId: slot.subjectId,
      teacherId: slot.teacherId,
      startTime: slot.startTime,
      endTime: slot.endTime,
      day: slot.day,
    });
    setEditDialogOpen(true);
  }, [canEdit]);

  // Edit save handler - PUTs the updated data
  const handleEditSave = useCallback(async () => {
    if (!editingSlot) return;
    setEditSaving(true);

    try {
      const res = await fetch('/api/timetable', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingSlot.id,
          subjectId: editForm.subjectId,
          teacherId: editForm.teacherId,
          startTime: editForm.startTime,
          endTime: editForm.endTime,
          day: editForm.day,
        }),
      });
      if (!res.ok) throw new Error('Failed to update slot');

      toast({
        title: 'Slot Updated',
        description: 'Timetable entry has been updated successfully.',
      });
      setEditDialogOpen(false);
      setEditingSlot(null);
      if (selectedClass) fetchTimetable(selectedClass);
    } catch (err) {
      toast({
        title: 'Failed to update',
        description: err instanceof Error ? err.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setEditSaving(false);
    }
  }, [editingSlot, editForm, selectedClass, fetchTimetable, toast]);

  // Extract unique time slots
  const timeSlots = useMemo(() => {
    const slotMap = new Map<string, { start: string; end: string }>();
    for (const slot of slots) {
      const key = `${slot.startTime}-${slot.endTime}`;
      if (!slotMap.has(key)) {
        slotMap.set(key, { start: slot.startTime, end: slot.endTime });
      }
    }
    return Array.from(slotMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, val]) => val);
  }, [slots]);

  // Extract unique subjects
  const uniqueSubjects = useMemo(() => {
    const subjects: string[] = [];
    const seen = new Set<string>();
    for (const slot of slots) {
      if (!seen.has(slot.subjectName)) {
        seen.add(slot.subjectName);
        subjects.push(slot.subjectName);
      }
    }
    return subjects;
  }, [slots]);

  // Build the grid data — supports multiple slots per time slot (e.g. parallel subjects)
  const gridData = useMemo(() => {
    const grid = new Map<string, Map<string, TimetableSlot[]>>();
    for (const day of workingDays) {
      grid.set(day, new Map());
    }
    for (const slot of slots) {
      const dayMap = grid.get(slot.day);
      if (dayMap) {
        const key = `${slot.startTime}-${slot.endTime}`;
        const existing = dayMap.get(key);
        if (existing) {
          existing.push(slot);
        } else {
          dayMap.set(key, [slot]);
        }
      }
    }
    return grid;
  }, [slots]);

  // Slots grouped by day for list view
  const slotsByDay = useMemo(() => {
    const grouped = new Map<string, TimetableSlot[]>();
    for (const day of workingDays) {
      grouped.set(
        day,
        slots
          .filter((s) => s.day === day)
          .sort((a, b) => a.startTime.localeCompare(b.startTime)),
      );
    }
    return grouped;
  }, [slots]);

  // Slots for selected day (day view) — supports multiple slots per time slot
  const selectedDaySlots = useMemo(() => {
    const daySlotsList: TimetableSlot[][] = [];
    for (const { start, end } of timeSlots) {
      const found = slots.filter(
        (s) => s.day === selectedDay && s.startTime === start && s.endTime === end,
      );
      daySlotsList.push(found);
    }
    return daySlotsList;
  }, [slots, timeSlots, selectedDay]);

  // Total period count across all days
  const totalPeriodCount = useMemo(() => {
    return workingDays.reduce((sum, d) => sum + (daySlots[d]?.length ?? 0), 0);
  }, [daySlots, workingDays]);

  // Current tab's periods for display in the dialog
  const currentTabPeriods = useMemo(() => {
    return daySlots[activeTab] ?? [];
  }, [daySlots, activeTab]);

  // Periods grouped by day for the copy feature count display
  const periodsByDay = useMemo(() => {
    const grouped: Record<string, number> = {};
    for (const day of workingDays) {
      grouped[day] = daySlots[day]?.length ?? 0;
    }
    return grouped;
  }, [daySlots]);

  const currentDayIndex = getCurrentDayIndex(workingDays);
  const effectiveDay = selectedDay || (currentDayIndex >= 0 ? workingDays[currentDayIndex] : workingDays[0]);

  // Fetch subjects & teachers when the dialog opens
  useEffect(() => {
    if (!createDialogOpen || !selectedClass) return;
    async function fetchFormData() {
      try {
        const [subjectRes, teacherRes] = await Promise.all([
          fetch('/api/subjects'),
          fetch('/api/teachers'),
        ]);
        if (subjectRes.ok) {
          const subjectData = await subjectRes.json();
          const filtered = subjectData.filter(
            (s: { className: string }) =>
              currentClass &&
              (s.className === `${currentClass.name}-${currentClass.section}` ||
                s.className === currentClass.name),
          );
          setAvailableSubjects(filtered.length > 0 ? filtered : subjectData);
        }
        if (teacherRes.ok) {
          const teacherData = await teacherRes.json();
          setAvailableTeachers(teacherData);
        }
      } catch {
        toast({ title: 'Error', description: 'Failed to load subjects or teachers.', variant: 'destructive' });
      }
    }
    fetchFormData();
  }, [createDialogOpen, selectedClass, currentClass, toast]);

  // Load existing timetable into daySlots structure when dialog opens
  useEffect(() => {
    if (!createDialogOpen || !selectedClass) return;

    async function loadExistingTimetable() {
      try {
        const res = await fetch(`/api/timetable?classId=${selectedClass}`);
        if (res.ok) {
          const data = await res.json();
          const initial: Record<string, FormSlot[]> = {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: [],
          };
          for (const slot of data) {
            const formSlot: FormSlot = {
              id: slot.id,
              day: slot.day,
              subjectId: slot.subjectId,
              teacherId: slot.teacherId,
              startTime: slot.startTime,
              endTime: slot.endTime,
            };
            if (initial[slot.day]) {
              initial[slot.day].push(formSlot);
            }
          }
          // Sort each day's periods by start time
          for (const day of ALL_DAYS) {
            initial[day]?.sort((a, b) => a.startTime.localeCompare(b.startTime));
          }
          setDaySlots(initial);
        } else {
          setDaySlots({
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: [],
          });
        }
      } catch {
        setDaySlots({
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: [],
        });
      }
    }

    loadExistingTimetable();
  }, [createDialogOpen, selectedClass]);

  // Period helpers for day-based list
  function addPeriod() {
    const newSlot: FormSlot = {
      id: crypto.randomUUID(),
      day: activeTab,
      subjectId: '',
      teacherId: '',
      startTime: '08:00',
      endTime: '08:45',
    };
    setDaySlots((prev) => ({
      ...prev,
      [activeTab]: [...(prev[activeTab] ?? []), newSlot],
    }));
  }

  function removePeriod(periodId: string) {
    setDaySlots((prev) => ({
      ...prev,
      [activeTab]: (prev[activeTab] ?? []).filter((s) => s.id !== periodId),
    }));
  }

  function updatePeriod(periodId: string, field: keyof FormSlot, value: string) {
    // If changing the day field, move the period to the target day
    if (field === 'day' && value !== activeTab) {
      setDaySlots((prev) => {
        const currentList = prev[activeTab] ?? [];
        const period = currentList.find((s) => s.id === periodId);
        if (!period) return prev;
        const updated = { ...period, [field]: value };
        return {
          ...prev,
          [activeTab]: currentList.filter((s) => s.id !== periodId),
          [value]: [...(prev[value] ?? []), updated],
        };
      });
      return;
    }
    setDaySlots((prev) => ({
      ...prev,
      [activeTab]: (prev[activeTab] ?? []).map((s) =>
        s.id === periodId ? { ...s, [field]: value } : s,
      ),
    }));
  }

  // Copy all periods from a source day to a target day
  function handleCopyToDay(sourceDay: string, targetDay: string) {
    const sourcePeriods = daySlots[sourceDay] ?? [];
    if (sourcePeriods.length === 0) {
      toast({
        title: 'Nothing to copy',
        description: `No periods found on ${DAY_FULL_LABELS[sourceDay]}.`,
        variant: 'destructive',
      });
      return;
    }

    const copied = sourcePeriods.map((slot) => ({
      id: crypto.randomUUID(),
      day: targetDay,
      subjectId: slot.subjectId,
      teacherId: slot.teacherId,
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));

    setDaySlots((prev) => ({
      ...prev,
      [targetDay]: [...(prev[targetDay] ?? []), ...copied],
    }));

    toast({
      title: 'Periods Copied',
      description: `Copied ${copied.length} period(s) from ${DAY_FULL_LABELS[sourceDay]} to ${DAY_FULL_LABELS[targetDay]}.`,
    });
  }

  // Copy all periods from a source day to all other days
  function handleCopyToAllDays(sourceDay: string) {
    const sourcePeriods = daySlots[sourceDay] ?? [];
    if (sourcePeriods.length === 0) {
      toast({
        title: 'Nothing to copy',
        description: `No periods found on ${DAY_FULL_LABELS[sourceDay]}.`,
        variant: 'destructive',
      });
      return;
    }

    const updated = { ...daySlots };
    for (const day of workingDays) {
      if (day === sourceDay) continue;
      const copied = sourcePeriods.map((slot) => ({
        id: crypto.randomUUID(),
        day,
        subjectId: slot.subjectId,
        teacherId: slot.teacherId,
        startTime: slot.startTime,
        endTime: slot.endTime,
      }));
      updated[day] = [...(updated[day] ?? []), ...copied];
    }
    setDaySlots(updated);

    toast({
      title: 'Copied to All Days',
      description: `Copied ${sourcePeriods.length} period(s) from ${DAY_FULL_LABELS[sourceDay]} to all other days.`,
    });
  }

  // Delete all timetable slots for the selected class
  async function deleteTimetableForClass() {
    for (const slot of slots) {
      await fetch(`/api/timetable?id=${slot.id}`, { method: 'DELETE' });
    }
  }

  async function handleSave() {
    if (!selectedClass) return;
    setSaving(true);

    // Flatten all day slots into a single array
    const allFlatSlots = workingDays.flatMap((day) =>
      (daySlots[day] ?? []).map((p) => ({ ...p, day })),
    );
    const validSlots = allFlatSlots.filter(
      (p) => p.day && p.subjectId && p.teacherId && p.startTime && p.endTime,
    );

    if (validSlots.length === 0) {
      toast({ title: 'No slots to save', description: 'Please add at least one period before saving.', variant: 'destructive' });
      setSaving(false);
      return;
    }

    const allSlots = validSlots.map((p) => ({
      classId: selectedClass,
      subjectId: p.subjectId,
      teacherId: p.teacherId,
      day: p.day,
      startTime: p.startTime,
      endTime: p.endTime,
    }));

    try {
      await deleteTimetableForClass();

      const res = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots: allSlots }),
      });
      if (!res.ok) throw new Error('Failed to save timetable');
      const data = await res.json();

      toast({
        title: 'Timetable saved',
        description: `Successfully saved ${data.created ?? allSlots.length} slots${data.errors ? ` (${data.errors} errors)` : ''}.`,
      });
      setCreateDialogOpen(false);
      fetchTimetable(selectedClass);
    } catch (err) {
      toast({
        title: 'Failed to save',
        description: err instanceof Error ? err.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  // ── Working Days config handlers ──
  const openDaysConfig = useCallback(() => {
    setDaysConfigDraft([...workingDays]);
    setDaysConfigOpen(true);
  }, [workingDays]);

  const toggleDayInDraft = useCallback((day: string) => {
    setDaysConfigDraft((prev) => {
      if (prev.includes(day)) {
        // Prevent deselecting the last day
        if (prev.length <= 1) return prev;
        return prev.filter((d) => d !== day);
      }
      return [...prev, day];
    });
  }, []);

  const applyPreset = useCallback((presetDays: string[]) => {
    setDaysConfigDraft([...presetDays]);
  }, []);

  const handleDaysConfigSave = useCallback(async () => {
    setDaysConfigSaving(true);
    const tenantId = useAppStore.getState().currentTenantId;
    if (!tenantId) {
      toast({ title: 'Error', description: 'Tenant ID not found.', variant: 'destructive' });
      setDaysConfigSaving(false);
      return;
    }
    try {
      const res = await fetch('/api/tenant-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, settings: { workingDays: daysConfigDraft } }),
      });
      if (!res.ok) throw new Error('Failed to save working days');
      setWorkingDays(daysConfigDraft);
      setDaysConfigOpen(false);
      toast({ title: 'Working Days Updated', description: `School schedule set to ${daysConfigDraft.length} working days.` });
    } catch (err) {
      toast({
        title: 'Failed to save',
        description: err instanceof Error ? err.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setDaysConfigSaving(false);
    }
  }, [daysConfigDraft, toast]);

  // Sync selectedDay with today when it's invalid
  useEffect(() => {
    if (!selectedDay || !workingDays.includes(selectedDay)) {
      setSelectedDay(currentDayIndex >= 0 ? workingDays[currentDayIndex] : workingDays[0]);
    }
  }, [selectedDay, currentDayIndex, workingDays]);

  // ---------------------------------------------------------------------------
  // Error state
  // ---------------------------------------------------------------------------
  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
        <CardContent className="p-6 text-center text-red-600 dark:text-red-400">
          <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p className="font-medium">Failed to load timetable</p>
          <p className="text-sm mt-1">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Weekly Timetable</h2>
            <p className="text-sm text-muted-foreground">
              {currentClass
                ? `${currentClass.name}-${currentClass.section}`
                : 'Select a class to view timetable'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* View Mode Toggle */}
          <div className="inline-flex items-center rounded-lg border bg-muted/40 p-0.5">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              className={viewMode === 'grid' ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Grid</span>
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              className={viewMode === 'list' ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              className={viewMode === 'day' ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'}
              onClick={() => setViewMode('day')}
            >
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Day</span>
            </Button>
          </div>

          {/* Class Selector */}
          {loadingClasses ? (
            <Skeleton className="h-9 w-48 shrink-0" />
          ) : (
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}-{c.section} ({c.studentCount} students)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Working Days Config Button — visible for ALL users */}
          <Button
            variant="outline"
            onClick={openDaysConfig}
            className="shrink-0"
          >
            <Settings className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Working Days</span>
            <span className="sm:hidden">Days</span>
          </Button>

          {/* Manage Timetable Button — only if user can create */}
          {selectedClass && canCreate && (
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shrink-0"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Manage Timetable</span>
              <span className="sm:hidden">Manage</span>
            </Button>
          )}
        </div>
      </div>

      {/* Holiday indicator bar — shows when non-standard holidays are configured */}
      {workingDays.length < 7 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {ALL_DAYS.map((day) => {
            const isWorking = workingDays.includes(day);
            return (
              <Badge
                key={day}
                variant={isWorking ? 'outline' : 'secondary'}
                className={`text-[11px] px-2 py-0.5 font-medium transition-colors ${
                  isWorking
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:text-emerald-400 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500'
                }`}
              >
                {isWorking ? DAY_LABELS[day] : `${DAY_LABELS[day]} Holiday`}
              </Badge>
            );
          })}
        </div>
      )}

      {/* Read-only badge for staff without edit permissions */}
      {!canCreate && !canEdit && !canDelete && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-3 py-2">
          <Eye className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">Read-only mode — you have view permission only for this module.</span>
        </div>
      )}

      {/* Working Days Configuration Dialog */}
      <Dialog open={daysConfigOpen} onOpenChange={setDaysConfigOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Working Days &amp; Holidays
            </DialogTitle>
            <DialogDescription>
              Select which days your school is open. Unselected days will be treated as holidays.
            </DialogDescription>
          </DialogHeader>

          {/* 7-day toggle grid */}
          <div className="grid grid-cols-7 gap-2 py-2">
            {ALL_DAYS.map((day) => {
              const isSelected = daysConfigDraft.includes(day);
              const isLastOne = isSelected && daysConfigDraft.length <= 1;
              return (
                <button
                  key={day}
                  type="button"
                  disabled={isLastOne}
                  onClick={() => toggleDayInDraft(day)}
                  title={isLastOne ? 'At least one day must be selected' : `Toggle ${DAY_FULL_LABELS[day]}`}
                  className={`relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all text-center ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/40 hover:border-emerald-600 dark:hover:border-emerald-500 cursor-pointer'
                      : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer'
                  } ${isLastOne ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-emerald-500 dark:bg-emerald-600 flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                  <span className={`text-xs font-semibold leading-none ${isSelected ? 'text-emerald-700 dark:text-emerald-400 dark:text-emerald-400 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {DAY_LABELS[day]}
                  </span>
                  {!isSelected && (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">Holiday</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick presets */}
          <div className="space-y-2 py-2">
            <p className="text-xs font-medium text-muted-foreground">Quick Presets</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={`text-xs h-8 ${
                  JSON.stringify(daysConfigDraft) === JSON.stringify(DEFAULT_DAYS)
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:text-emerald-400 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : ''
                }`}
                onClick={() => applyPreset(DEFAULT_DAYS)}
              >
                Mon-Fri (Standard)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={`text-xs h-8 ${
                  JSON.stringify(daysConfigDraft) === JSON.stringify(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'])
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:text-emerald-400 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : ''
                }`}
                onClick={() => applyPreset(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'])}
              >
                Mon-Sat (6-day week)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={`text-xs h-8 ${
                  JSON.stringify(daysConfigDraft) === JSON.stringify(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'])
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:text-emerald-400 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : ''
                }`}
                onClick={() => applyPreset(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'])}
              >
                Sun-Thu (Middle East)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={`text-xs h-8 ${
                  JSON.stringify(daysConfigDraft) === JSON.stringify(ALL_DAYS)
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:text-emerald-400 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : ''
                }`}
                onClick={() => applyPreset(ALL_DAYS)}
              >
                All 7 Days
              </Button>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDaysConfigOpen(false)}
              disabled={daysConfigSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDaysConfigSave}
              disabled={daysConfigSaving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {daysConfigSaving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              {daysConfigSaving ? 'Saving...' : `Save ${daysConfigDraft.length} Working Days`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Slot Dialog */}
      {canEdit && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Edit Timetable Slot
              </DialogTitle>
              <DialogDescription>
                Update the subject, teacher, timing, or day for this period.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Subject</label>
                <Select
                  value={editForm.subjectId}
                  onValueChange={(v) => setEditForm((prev) => ({ ...prev, subjectId: v }))}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} {s.code ? `(${s.code})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Teacher</label>
                <Select
                  value={editForm.teacherId}
                  onValueChange={(v) => setEditForm((prev) => ({ ...prev, teacherId: v }))}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Day</label>
                <Select
                  value={editForm.day}
                  onValueChange={(v) => setEditForm((prev) => ({ ...prev, day: v }))}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {workingDays.map((day) => (
                      <SelectItem key={day} value={day}>
                        {DAY_FULL_LABELS[day]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Start Time</label>
                  <Input
                    type="time"
                    value={editForm.startTime}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, startTime: e.target.value }))}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">End Time</label>
                  <Input
                    type="time"
                    value={editForm.endTime}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, endTime: e.target.value }))}
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={editSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSave}
                disabled={editSaving || !editForm.subjectId || !editForm.teacherId || !editForm.day || !editForm.startTime || !editForm.endTime}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {editSaving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
                {editSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Manage Timetable Dialog — day tab system */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Manage Timetable
            </DialogTitle>
            <DialogDescription>
              {totalPeriodCount > 0 ? (
                <>
                  <span className="font-medium text-foreground">{totalPeriodCount}</span> total periods for{' '}
                  <span className="font-medium text-foreground">
                    {currentClass ? `${currentClass.name}-${currentClass.section}` : ''}
                  </span>{' '}
                  — add, edit, or remove periods across all days.
                </>
              ) : (
                <>
                  Add time slots for{' '}
                  <span className="font-medium text-foreground">
                    {currentClass ? `${currentClass.name}-${currentClass.section}` : ''}
                  </span>{' '}
                  — select day, subject, teacher, and timing for each period.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Copy from day feature */}
          <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-3">
            <Copy className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Duplicate from:</span>
            <Select value={copySourceDay} onValueChange={setCopySourceDay}>
              <SelectTrigger className="h-8 text-sm w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {workingDays.map((day) => (
                  <SelectItem key={day} value={day}>
                    {DAY_FULL_LABELS[day]} {periodsByDay[day] > 0 ? `(${periodsByDay[day]})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="text-xs h-8"
              onClick={() => handleCopyToDay(copySourceDay, activeTab)}>
              <Copy className="h-3 w-3 mr-1" />
              Copy to {DAY_LABELS[activeTab]}
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-8"
              onClick={() => handleCopyToAllDays(copySourceDay)}>
              <Copy className="h-3 w-3 mr-1" />
              Copy to All Days
            </Button>
          </div>

          {/* Day Tabs */}
          <div className="flex items-center border-b pb-0 shrink-0">
            {workingDays.map((day) => {
              const count = daySlots[day]?.length ?? 0;
              const isActive = day === activeTab;
              return (
                <button
                  key={day}
                  onClick={() => setActiveTab(day)}
                  className={`relative flex-1 px-3 py-2 text-sm font-medium transition-colors text-center border-b-2 -mb-px ${
                    isActive
                      ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="text-xs sm:text-sm">{DAY_LABELS[day]}</span>
                  {count > 0 && (
                    <Badge className="ml-1 h-4 min-w-4 px-1 text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30">
                      {count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>

          {/* Scrollable period list for active tab */}
          <ScrollArea className="flex-1 min-h-0 max-h-[45vh] -mx-6 px-6">
            <div className="py-3 space-y-2">
              {currentTabPeriods.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-25" />
                  <p className="text-sm font-medium">No periods on {DAY_FULL_LABELS[activeTab]}</p>
                  <p className="text-xs mt-1">Click &quot;Add Period&quot; below to get started.</p>
                </div>
              ) : (
                currentTabPeriods.map((period, idx) => (
                  <div
                    key={period.id}
                    className="rounded-lg border bg-muted/20 p-3"
                  >
                    {/* Period Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        Period {idx + 1}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600"
                        onClick={() => removePeriod(period.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Fields row */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {/* Day */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground">
                          Day
                        </label>
                        <Select
                          value={period.day}
                          onValueChange={(v) => updatePeriod(period.id, 'day', v)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Day" />
                          </SelectTrigger>
                          <SelectContent>
                            {workingDays.map((day) => (
                              <SelectItem key={day} value={day}>
                                {DAY_FULL_LABELS[day]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Subject */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground">
                          Subject
                        </label>
                        <Select
                          value={period.subjectId}
                          onValueChange={(v) => updatePeriod(period.id, 'subjectId', v)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableSubjects.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Teacher */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground">
                          Teacher
                        </label>
                        <Select
                          value={period.teacherId}
                          onValueChange={(v) => updatePeriod(period.id, 'teacherId', v)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTeachers.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Start Time */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground">
                          Start
                        </label>
                        <Input
                          type="time"
                          value={period.startTime}
                          onChange={(e) => updatePeriod(period.id, 'startTime', e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>

                      {/* End Time */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground">
                          End
                        </label>
                        <Input
                          type="time"
                          value={period.endTime}
                          onChange={(e) => updatePeriod(period.id, 'endTime', e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Add Period Button */}
              <Button
                variant="outline"
                className="w-full border-dashed text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:text-emerald-400"
                onClick={addPeriod}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add Period to {DAY_LABELS[activeTab]}
              </Button>
            </div>
          </ScrollArea>

          {/* Footer */}
          <DialogFooter className="pt-4 border-t gap-2 sm:gap-0 shrink-0">
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {saving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              {saving ? 'Saving...' : `Save ${workingDays.reduce((sum, d) => sum + (daySlots[d]?.length ?? 0), 0)} Periods`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subject Legend */}
      {!loadingTimetable && uniqueSubjects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {uniqueSubjects.map((subject) => (
            <div
              key={subject}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${subjectBadge(subject, uniqueSubjects, 'sm')}`}
            >
              <BookOpen className="h-3 w-3" />
              {subject}
            </div>
          ))}
        </div>
      )}

      {/* Content Area */}
      <Card>
        <CardContent className="p-0">
          {loadingTimetable ? (
            <TimetableSkeleton viewMode={viewMode} />
          ) : slots.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No timetable entries found</p>
              <p className="text-sm mt-1">
                {selectedClass
                  ? 'This class does not have a timetable configured yet.'
                  : 'Please select a class to view its timetable.'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <GridView
              timeSlots={timeSlots}
              gridData={gridData}
              uniqueSubjects={uniqueSubjects}
              workingDays={workingDays}
              currentDayIndex={currentDayIndex}
              onDeleteSlot={handleDeleteSlot}
              onEditSlot={handleEditSlot}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          ) : viewMode === 'list' ? (
            <ListView
              slotsByDay={slotsByDay}
              uniqueSubjects={uniqueSubjects}
              workingDays={workingDays}
              currentDayIndex={currentDayIndex}
              onDeleteSlot={handleDeleteSlot}
              onEditSlot={handleEditSlot}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          ) : (
            <DayView
              selectedDay={effectiveDay}
              selectedDaySlots={selectedDaySlots}
              timeSlots={timeSlots}
              uniqueSubjects={uniqueSubjects}
              workingDays={workingDays}
              currentDayIndex={currentDayIndex}
              onSelectDay={setSelectedDay}
              onDeleteSlot={handleDeleteSlot}
              onEditSlot={handleEditSlot}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grid View
// ---------------------------------------------------------------------------

function GridView({
  timeSlots,
  gridData,
  uniqueSubjects,
  workingDays,
  currentDayIndex,
  onDeleteSlot,
  onEditSlot,
  canEdit,
  canDelete,
}: {
  timeSlots: { start: string; end: string }[];
  gridData: Map<string, Map<string, TimetableSlot[]>>;
  uniqueSubjects: string[];
  workingDays: string[];
  currentDayIndex: number;
  onDeleteSlot: (id: string) => void;
  onEditSlot: (slot: TimetableSlot) => void;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const showActions = canEdit || canDelete;

  return (
    <div className="overflow-x-auto">
      {/* Desktop: HTML Table */}
      <div className="hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="py-3 px-4 text-left font-medium text-muted-foreground w-36">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Time Slot
                </div>
              </th>
              {workingDays.map((day, idx) => (
                <th
                  key={day}
                  className={`py-3 px-2 text-center font-medium ${
                    idx === currentDayIndex
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                      : 'text-muted-foreground'
                  }`}
                >
                  {DAY_LABELS[day]}
                  {idx === currentDayIndex && (
                    <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(({ start, end }, slotIdx) => (
              <tr
                key={`${start}-${end}`}
                className={slotIdx % 2 === 0 ? 'bg-background' : 'bg-muted/10'}
              >
                <td className="py-3 px-4 align-top">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">{formatTime(start)}</p>
                      <p className="text-xs text-muted-foreground">{formatTime(end)}</p>
                    </div>
                  </div>
                </td>
                {workingDays.map((day, dayIdx) => {
                  const key = `${start}-${end}`;
                  const cellSlots = gridData.get(day)?.get(key);

                  return (
                    <td
                      key={day}
                      className={`py-2 px-1.5 align-top ${
                        dayIdx === currentDayIndex ? 'bg-emerald-50/40 dark:bg-emerald-900/20' : ''
                      }`}
                    >
                      {cellSlots && cellSlots.length > 0 ? (
                        <div className="space-y-1">
                          {cellSlots.map((slot) => (
                            <div className="relative group" key={slot.id}>
                              <div
                                className={`rounded-lg border px-3 py-2.5 transition-all hover:shadow-sm ${subjectBadge(slot.subjectName, uniqueSubjects, 'md')}`}
                              >
                                <p className="font-semibold text-sm leading-tight">
                                  {slot.subjectName}
                                </p>
                                <p className="text-xs mt-1 opacity-80">
                                  {slot.teacherName}
                                </p>
                              </div>
                              {showActions && (
                                <div className="absolute -top-1.5 -right-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {canEdit && (
                                    <button
                                      onClick={() => onEditSlot(slot)}
                                      className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-200 dark:hover:bg-emerald-800"
                                      title="Edit slot"
                                    >
                                      <Pencil className="h-2.5 w-2.5" />
                                    </button>
                                  )}
                                  {canDelete && (
                                    <button
                                      onClick={() => onDeleteSlot(slot.id)}
                                      className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-800"
                                      title="Delete slot"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-muted-foreground/20 h-[52px] flex items-center justify-center">
                          <span className="text-[11px] text-muted-foreground/50">
                            Free
                          </span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: Day-by-day card layout */}
      <div className="md:hidden divide-y">
        {workingDays.map((day, dayIdx) => (
          <div
            key={day}
            className={`p-4 ${dayIdx === currentDayIndex ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <h3
                className={`font-semibold text-sm ${
                  dayIdx === currentDayIndex
                    ? 'text-emerald-700 dark:text-emerald-400 dark:text-emerald-400'
                    : 'text-foreground'
                }`}
              >
                {DAY_FULL_LABELS[day]}
              </h3>
              {dayIdx === currentDayIndex && (
                <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-[10px] px-1.5 py-0">
                  Today
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              {timeSlots.map(({ start, end }) => {
                const key = `${start}-${end}`;
                const cellSlots = gridData.get(day)?.get(key);

                return (
                  <div key={key} className="flex items-start gap-3">
                    <div className="shrink-0 w-16 text-xs text-muted-foreground pt-2">
                      <span className="font-medium">{formatTime(start).replace(' ', '')}</span>
                      <span className="mx-0.5">-</span>
                      <span>{formatTime(end).replace(' ', '')}</span>
                    </div>
                    {cellSlots && cellSlots.length > 0 ? (
                      <div className="flex-1 space-y-1">
                        {cellSlots.map((slot) => (
                          <div className="flex items-center gap-2" key={slot.id}>
                            <div
                              className={`flex-1 rounded-lg border px-3 py-2 ${subjectBadge(slot.subjectName, uniqueSubjects, 'sm')}`}
                            >
                              <p className="font-semibold text-xs leading-tight">
                                {slot.subjectName}
                              </p>
                              <p className="text-[11px] mt-0.5 opacity-80">
                                {slot.teacherName}
                              </p>
                            </div>
                            {showActions && (
                              <>
                                {canEdit && (
                                  <button
                                    onClick={() => onEditSlot(slot)}
                                    className="shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
                                    title="Edit slot"
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </button>
                                )}
                                {canDelete && (
                                  <button
                                    onClick={() => onDeleteSlot(slot.id)}
                                    className="shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                    title="Delete slot"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex-1 rounded-lg border border-dashed border-muted-foreground/20 py-2 px-3">
                        <span className="text-[11px] text-muted-foreground/50">
                          Free period
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// List View
// ---------------------------------------------------------------------------

function ListView({
  slotsByDay,
  uniqueSubjects,
  workingDays,
  currentDayIndex,
  onDeleteSlot,
  onEditSlot,
  canEdit,
  canDelete,
}: {
  slotsByDay: Map<string, TimetableSlot[]>;
  uniqueSubjects: string[];
  workingDays: string[];
  currentDayIndex: number;
  onDeleteSlot: (id: string) => void;
  onEditSlot: (slot: TimetableSlot) => void;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const showActions = canEdit || canDelete;

  return (
    <div className="divide-y">
      {workingDays.map((day, dayIdx) => {
        const daySlotsList = slotsByDay.get(day);
        if (!daySlotsList || daySlotsList.length === 0) return null;

        const isToday = dayIdx === currentDayIndex;

        return (
          <div
            key={day}
            className={`py-4 px-4 sm:px-6 ${isToday ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <h3
                className={`text-sm font-semibold ${isToday ? 'text-emerald-700 dark:text-emerald-400 dark:text-emerald-400' : 'text-foreground'}`}
              >
                {DAY_FULL_LABELS[day]}
              </h3>
              {isToday && (
                <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-[10px] px-1.5 py-0">
                  Today
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                {daySlotsList.length} {daySlotsList.length === 1 ? 'period' : 'periods'}
              </Badge>
            </div>

            <div className="space-y-1.5">
              {daySlotsList.map((slot) => {
                const isCurrent =
                  isToday && isCurrentPeriod(slot.startTime, slot.endTime);

                return (
                  <div
                    key={slot.id}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                      isCurrent
                        ? 'bg-emerald-100/60 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800'
                        : 'hover:bg-muted/40'
                    }`}
                  >
                    <div className="shrink-0 w-24 sm:w-28">
                      <span className="text-xs font-medium text-muted-foreground">
                        {formatTime(slot.startTime)}
                      </span>
                      <span className="text-xs text-muted-foreground mx-1">-</span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {formatTime(slot.endTime)}
                      </span>
                    </div>

                    <div className="shrink-0">
                      <Circle
                        className={`h-2 w-2 fill-current ${isCurrent ? 'text-emerald-500' : 'text-transparent'}`}
                      />
                    </div>

                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />

                    <div
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium shrink-0 ${subjectBadge(slot.subjectName, uniqueSubjects, 'sm')}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${subjectDot(slot.subjectName, uniqueSubjects)}`}
                      />
                      {slot.subjectName}
                    </div>

                    <div className="hidden sm:flex items-center gap-2 ml-auto text-xs text-muted-foreground">
                      <span>{slot.teacherName}</span>
                      <span className="text-muted-foreground/40">|</span>
                      <span>{slot.className}</span>
                    </div>

                    {showActions && (
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                        {canEdit && (
                          <button
                            onClick={() => onEditSlot(slot)}
                            className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground/40 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
                            title="Edit slot"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => onDeleteSlot(slot.id)}
                            className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground/40 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                            title="Delete slot"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {slotsByDay.size === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          <p className="text-sm">No schedule entries.</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Day View
// ---------------------------------------------------------------------------

function DayView({
  selectedDay,
  selectedDaySlots,
  timeSlots,
  uniqueSubjects,
  workingDays,
  currentDayIndex,
  onSelectDay,
  onDeleteSlot,
  onEditSlot,
  canEdit,
  canDelete,
}: {
  selectedDay: string;
  selectedDaySlots: TimetableSlot[][];
  timeSlots: { start: string; end: string }[];
  uniqueSubjects: string[];
  workingDays: string[];
  currentDayIndex: number;
  onSelectDay: (day: string) => void;
  onDeleteSlot: (id: string) => void;
  onEditSlot: (slot: TimetableSlot) => void;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const dayIndex = workingDays.indexOf(selectedDay);
  const isToday = dayIndex === currentDayIndex;
  const hasAnySlot = selectedDaySlots.some((group) => group.length > 0);
  const showActions = canEdit || canDelete;

  return (
    <div>
      {/* Day Selector Pills */}
      <div className="flex items-center gap-1.5 p-3 border-b bg-muted/20 overflow-x-auto">
        {workingDays.map((day, idx) => {
          const isActive = day === selectedDay;
          const isCurrentDay = idx === currentDayIndex;

          return (
            <Button
              key={day}
              size="sm"
              variant={isActive ? 'default' : 'outline'}
              className={
                isActive
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shrink-0'
                  : 'shrink-0 text-muted-foreground hover:text-foreground'
              }
              onClick={() => onSelectDay(day)}
            >
              <span className="relative flex items-center gap-1.5">
                {DAY_LABELS[day]}
                {isCurrentDay && !isActive && (
                  <span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                )}
              </span>
            </Button>
          );
        })}
      </div>

      {/* Day Header */}
      <div className="px-4 sm:px-6 pt-5 pb-2">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold text-foreground">
            {DAY_FULL_LABELS[selectedDay]}
          </h3>
          {isToday && (
            <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30">
              Today
            </Badge>
          )}
          {hasAnySlot && (
            <span className="text-xs text-muted-foreground ml-auto">
              {selectedDaySlots.filter((group) => group.length > 0).length} of{' '}
              {timeSlots.length} periods
            </span>
          )}
        </div>
      </div>

      {/* Timeline Cards */}
      <div className="px-4 sm:px-6 pb-6">
        {!hasAnySlot && timeSlots.length > 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Coffee className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="font-medium">No classes scheduled</p>
            <p className="text-sm mt-1">
              This day is completely free for the selected class.
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[19px] sm:left-[23px] top-3 bottom-3 w-px bg-border" />

            <div className="space-y-4">
              {selectedDaySlots.map((slotGroup, idx) => {
                const hasSlots = slotGroup.length > 0;
                const isCurrent =
                  isToday && hasSlots
                    ? isCurrentPeriod(slotGroup[0].startTime, slotGroup[0].endTime)
                    : false;

                return (
                  <div key={`period-${idx}`} className="relative flex gap-4">
                    <div className="relative shrink-0 z-10 mt-5">
                      <div
                        className={`h-2.5 w-2.5 rounded-full border-2 ${
                          isCurrent
                            ? 'bg-emerald-500 border-emerald-300 dark:border-emerald-600 ring-4 ring-emerald-100 dark:ring-emerald-900/40'
                            : hasSlots
                              ? 'bg-background border-emerald-400'
                              : 'bg-background border-muted-foreground/30'
                        }`}
                      />
                    </div>

                    {hasSlots ? (
                      <div className="group relative flex-1 rounded-xl border px-4 py-4 transition-all bg-card hover:shadow-sm space-y-3">
                        {isCurrent && (
                          <Badge className="bg-emerald-600 text-white hover:bg-emerald-600 text-[10px] px-1.5 py-0">
                            In Progress
                          </Badge>
                        )}
                        {slotGroup.map((slot) => (
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2" key={slot.id}>
                            <div className="flex-1 min-w-0">
                              <p className="text-lg font-semibold leading-tight">
                                {slot.subjectName}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {slot.teacherName}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {slot.className}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium ${subjectBadge(slot.subjectName, uniqueSubjects, 'sm')}`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                </div>
                              </div>
                              {showActions && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                  {canEdit && (
                                    <button
                                      onClick={() => onEditSlot(slot)}
                                      className="shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
                                      title="Edit slot"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                  {canDelete && (
                                    <button
                                      onClick={() => onDeleteSlot(slot.id)}
                                      className="shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                      title="Delete slot"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex-1 rounded-xl border border-dashed border-muted-foreground/25 px-4 py-4">
                        <p className="text-sm font-medium text-muted-foreground/50">
                          Free Period
                        </p>
                        <p className="text-xs text-muted-foreground/40 mt-0.5">
                          {formatTime(timeSlots[idx].start)} -{' '}
                          {formatTime(timeSlots[idx].end)}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------

function TimetableSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === 'grid') {
    return (
      <div className="p-6 space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-32 shrink-0" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-8 flex-1" />
          ))}
        </div>
        {[...Array(7)].map((_, rowIdx) => (
          <div key={rowIdx} className="flex gap-2">
            <Skeleton className="h-16 w-32 shrink-0" />
            {[...Array(5)].map((_, colIdx) => (
              <Skeleton key={colIdx} className="h-16 flex-1 rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="p-6 space-y-6">
        {[...Array(3)].map((_, groupIdx) => (
          <div key={groupIdx} className="space-y-2">
            <Skeleton className="h-5 w-28" />
            {[...Array(4)].map((_, itemIdx) => (
              <Skeleton key={itemIdx} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Day view skeleton
  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-14 rounded-full" />
        ))}
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-4 w-4 rounded-full mt-4" />
          <Skeleton className="h-20 flex-1 rounded-xl" />
        </div>
      ))}
    </div>
  );
}
