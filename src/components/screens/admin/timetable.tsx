"use client";

import { apiFetch } from "@/lib/api";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  LayoutGrid,
  List,
  CalendarDays,
  Plus,
  Settings,
  Eye,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { useModulePermissions } from "@/hooks/use-permissions";
import { useAppStore } from "@/store/use-app-store";
import type { ClassInfo } from "@/lib/types";

// Sub-components
import { GridView } from "./timetable/GridView";
import { ListView } from "./timetable/ListView";
import { DayView } from "./timetable/DayView";
import { TimetableSkeleton } from "./timetable/TimetableSkeleton";
import { CreateTimetableDialog } from "./timetable/CreateTimetableDialog";
import { EditSlotDialog } from "./timetable/EditSlotDialog";
import { WorkingDaysDialog } from "./timetable/WorkingDaysDialog";

// Constants & Helpers
import { 
  DEFAULT_DAYS, 
  ALL_DAYS, 
  DAY_LABELS, 
  DAY_FULL_LABELS 
} from "./timetable/constants";
import { 
  getCurrentDayIndex, 
} from "./timetable/helpers";
import type { 
  ViewMode, 
  TimetableSlot, 
  FormSlot, 
  AvailableSubject, 
  AvailableTeacher 
} from "./timetable/types";

export function AdminTimetable() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedDay, setSelectedDay] = useState<string>("monday");
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Working days from tenant settings
  const [workingDays, setWorkingDays] = useState<string[]>(DEFAULT_DAYS);

  // Create timetable dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [daySlots, setDaySlots] = useState<Record<string, FormSlot[]>>({
    monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
  });
  const [availableSubjects, setAvailableSubjects] = useState<AvailableSubject[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<AvailableTeacher[]>([]);
  const [saving, setSaving] = useState(false);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [editForm, setEditForm] = useState({
    subjectId: "",
    teacherId: "",
    startTime: "",
    endTime: "",
    day: "",
  });
  const [editSaving, setEditSaving] = useState(false);

  // Working Days config dialog state
  const [daysConfigOpen, setDaysConfigOpen] = useState(false);
  const [daysConfigSaving, setDaysConfigSaving] = useState(false);
  const [daysConfigDraft, setDaysConfigDraft] = useState<string[]>(workingDays);

  const currentClass = classes.find((c) => c.id === selectedClass);
  const { canCreate, canEdit, canDelete } = useModulePermissions("timetable");

  // ── Data Fetching ──

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await apiFetch("/api/classes");
        if (!res.ok) throw new Error("Failed to fetch classes");
        const data = await res.json();
        setClasses(data);
        if (data.length > 0) setSelectedClass(data[0].id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoadingClasses(false);
      }
    }
    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchWorkingDays = async () => {
      const tenantId = useAppStore.getState().currentTenantId;
      if (!tenantId) return;
      try {
        const res = await apiFetch(`/api/tenant-settings?tenantId=${tenantId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.settings?.workingDays) setWorkingDays(data.settings.workingDays);
        }
      } catch {}
    };
    fetchWorkingDays();
  }, []);

  const fetchTimetable = useCallback(async (classId: string) => {
    setLoadingTimetable(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/timetable?classId=${classId}`);
      if (!res.ok) throw new Error("Failed to fetch timetable");
      const data = await res.json();
      setSlots(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingTimetable(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClass) fetchTimetable(selectedClass);
  }, [selectedClass, fetchTimetable]);

  // Load form data (subjects/teachers)
  useEffect(() => {
    if (!createDialogOpen && !editDialogOpen) return;
    async function fetchFormData() {
      try {
        const [subjectRes, teacherRes] = await Promise.all([
          apiFetch("/api/subjects"),
          apiFetch("/api/staff?role=teacher"),
        ]);
        if (subjectRes.ok) {
          const subjectData = await subjectRes.json();
          const filtered = currentClass
            ? subjectData.filter((s: any) => s.className === currentClass.name)
            : subjectData;
          setAvailableSubjects(filtered.length > 0 ? filtered : subjectData);
        }
        if (teacherRes.ok) setAvailableTeachers(await teacherRes.json());
      } catch {
        toast.error("Failed to load subjects or teachers.");
      }
    }
    fetchFormData();
  }, [createDialogOpen, editDialogOpen, selectedClass, currentClass]);

  // Load existing timetable into daySlots when managing
  useEffect(() => {
    if (!createDialogOpen || !selectedClass) return;
    async function loadExistingTimetable() {
      try {
        const res = await apiFetch(`/api/timetable?classId=${selectedClass}`);
        if (res.ok) {
          const data = await res.json();
          const initial: Record<string, FormSlot[]> = {
            monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
          };
          data.forEach((slot: any) => {
            if (initial[slot.day]) initial[slot.day].push({ ...slot });
          });
          ALL_DAYS.forEach(day => {
            initial[day]?.sort((a, b) => a.startTime.localeCompare(b.startTime));
          });
          setDaySlots(initial);
        }
      } catch {}
    }
    loadExistingTimetable();
  }, [createDialogOpen, selectedClass]);

  // ── Handlers ──

  const handleDeleteSlot = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this slot?")) return;
    try {
      const res = await apiFetch(`/api/timetable?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Slot deleted");
        fetchTimetable(selectedClass);
      } else {
        toast.error("Failed to delete slot");
      }
    } catch {
      toast.error("Error deleting slot");
    }
  };

  const handleEditSlot = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setEditForm({
      subjectId: slot.subjectId,
      teacherId: slot.teacherId,
      startTime: slot.startTime,
      endTime: slot.endTime,
      day: slot.day,
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingSlot) return;
    setEditSaving(true);
    try {
      const res = await apiFetch(`/api/timetable?id=${editingSlot.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        toast.success("Slot updated");
        setEditDialogOpen(false);
        fetchTimetable(selectedClass);
      } else {
        toast.error("Failed to update slot");
      }
    } catch {
      toast.error("Error updating slot");
    } finally {
      setEditSaving(false);
    }
  };

  const handleBulkSave = async () => {
    if (!selectedClass) return;
    setSaving(true);
    const allFlatSlots = workingDays.flatMap(day => (daySlots[day] ?? []));
    const validSlots = allFlatSlots.filter(p => p.subjectId && p.teacherId && p.startTime && p.endTime);

    if (validSlots.length === 0) {
      toast.error("Please add at least one valid period.");
      setSaving(false);
      return;
    }

    try {
      // Clear existing for this class first (as per original logic)
      for (const slot of slots) {
        await apiFetch(`/api/timetable?id=${slot.id}`, { method: "DELETE" });
      }

      const res = await apiFetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slots: validSlots.map(p => ({
            classId: selectedClass,
            ...p
          }))
        }),
      });
      if (res.ok) {
        toast.success("Timetable saved successfully");
        setCreateDialogOpen(false);
        fetchTimetable(selectedClass);
      } else {
        throw new Error("Failed to save");
      }
    } catch (err) {
      toast.error("Failed to save timetable");
    } finally {
      setSaving(false);
    }
  };

  const handleWorkingDaysSave = async () => {
    setDaysConfigSaving(true);
    const tenantId = useAppStore.getState().currentTenantId;
    try {
      const res = await apiFetch("/api/tenant-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, settings: { workingDays: daysConfigDraft } }),
      });
      if (res.ok) {
        setWorkingDays(daysConfigDraft);
        setDaysConfigOpen(false);
        toast.success("Working days updated");
      }
    } catch {
      toast.error("Failed to update working days");
    } finally {
      setDaysConfigSaving(false);
    }
  };

  const handleCopyToDay = (sourceDay: string, targetDay: string) => {
    const sourcePeriods = daySlots[sourceDay] ?? [];
    if (sourcePeriods.length === 0) return;
    const copied = sourcePeriods.map(slot => ({ ...slot, id: crypto.randomUUID(), day: targetDay }));
    setDaySlots(prev => ({ ...prev, [targetDay]: [...(prev[targetDay] ?? []), ...copied] }));
    toast.success(`Copied to ${DAY_LABELS[targetDay]}`);
  };

  const handleCopyToAllDays = (sourceDay: string) => {
    const sourcePeriods = daySlots[sourceDay] ?? [];
    if (sourcePeriods.length === 0) return;
    const updated = { ...daySlots };
    workingDays.forEach(day => {
      if (day === sourceDay) return;
      const copied = sourcePeriods.map(slot => ({ ...slot, id: crypto.randomUUID(), day }));
      updated[day] = [...(updated[day] ?? []), ...copied];
    });
    setDaySlots(updated);
    toast.success("Copied to all days");
  };

  // ── Derived State ──

  const uniqueSubjects = useMemo(() => Array.from(new Set(slots.map(s => s.subjectName))), [slots]);
  const currentDayIndex = useMemo(() => getCurrentDayIndex(workingDays), [workingDays]);
  
  const timeSlots = useMemo(() => {
    const unique = new Map<string, { start: string, end: string }>();
    slots.forEach(s => unique.set(`${s.startTime}-${s.endTime}`, { start: s.startTime, end: s.endTime }));
    return Array.from(unique.values()).sort((a, b) => a.start.localeCompare(b.start));
  }, [slots]);

  const gridData = useMemo(() => {
    const data = new Map<string, Map<string, TimetableSlot[]>>();
    slots.forEach(slot => {
      if (!data.has(slot.day)) data.set(slot.day, new Map());
      const dayMap = data.get(slot.day)!;
      const timeKey = `${slot.startTime}-${slot.endTime}`;
      if (!dayMap.has(timeKey)) dayMap.set(timeKey, []);
      dayMap.get(timeKey)!.push(slot);
    });
    return data;
  }, [slots]);

  const slotsByDay = useMemo(() => {
    const data = new Map<string, TimetableSlot[]>();
    slots.forEach(slot => {
      if (!data.has(slot.day)) data.set(slot.day, []);
      data.get(slot.day)!.push(slot);
    });
    data.forEach(list => list.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    return data;
  }, [slots]);

  const effectiveDay = workingDays.includes(selectedDay) ? selectedDay : (workingDays[currentDayIndex] || workingDays[0]);
  const selectedDaySlots = useMemo(() => {
    return timeSlots.map(({ start, end }) => {
      const key = `${start}-${end}`;
      return gridData.get(effectiveDay)?.get(key) || [];
    });
  }, [effectiveDay, timeSlots, gridData]);

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center text-red-600">
          <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p className="font-medium">Failed to load timetable</p>
          <p className="text-sm mt-1">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Weekly Timetable</h2>
            <p className="text-sm text-muted-foreground">
              {currentClass ? `${currentClass.name}-${currentClass.section}` : "Select a class"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="inline-flex items-center rounded-lg border bg-muted/40 p-0.5">
            <Button size="sm" variant={viewMode === "grid" ? "default" : "ghost"} onClick={() => setViewMode("grid")}>
              <LayoutGrid className="h-4 w-4 mr-1.5" /><span className="hidden sm:inline">Grid</span>
            </Button>
            <Button size="sm" variant={viewMode === "list" ? "default" : "ghost"} onClick={() => setViewMode("list")}>
              <List className="h-4 w-4 mr-1.5" /><span className="hidden sm:inline">List</span>
            </Button>
            <Button size="sm" variant={viewMode === "day" ? "default" : "ghost"} onClick={() => setViewMode("day")}>
              <CalendarDays className="h-4 w-4 mr-1.5" /><span className="hidden sm:inline">Day</span>
            </Button>
          </div>

          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}-{c.section}</SelectItem>)}
            </SelectContent>
          </Select>

          {canEdit && (
            <Button variant="outline" onClick={() => { setDaysConfigDraft([...workingDays]); setDaysConfigOpen(true); }}>
              <Settings className="h-4 w-4 sm:mr-1.5" /><span className="hidden sm:inline">Settings</span>
            </Button>
          )}

          {selectedClass && canCreate && (
            <Button onClick={() => setCreateDialogOpen(true)} className="bg-emerald-600 text-white hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-1.5" />Manage
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loadingTimetable ? (
            <TimetableSkeleton viewMode={viewMode} />
          ) : slots.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No timetable found.</p>
            </div>
          ) : viewMode === "grid" ? (
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
          ) : viewMode === "list" ? (
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

      <WorkingDaysDialog
        open={daysConfigOpen}
        onOpenChange={setDaysConfigOpen}
        draft={daysConfigDraft}
        setDraft={setDaysConfigDraft}
        onSave={handleWorkingDaysSave}
        saving={daysConfigSaving}
      />

      <EditSlotDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        form={editForm}
        setForm={setEditForm}
        onSave={handleEditSave}
        saving={editSaving}
        availableSubjects={availableSubjects}
        availableTeachers={availableTeachers}
        workingDays={workingDays}
      />

      <CreateTimetableDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        currentClass={currentClass}
        workingDays={workingDays}
        daySlots={daySlots}
        setDaySlots={setDaySlots}
        availableSubjects={availableSubjects}
        availableTeachers={availableTeachers}
        onSave={handleBulkSave}
        saving={saving}
        onCopyToDay={handleCopyToDay}
        onCopyToAllDays={handleCopyToAllDays}
      />
    </div>
  );
}
