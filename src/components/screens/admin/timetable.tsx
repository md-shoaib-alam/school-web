"use client";

import { apiFetch } from "@/lib/api";
import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
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
import { TimetableHeader } from "./timetable/TimetableHeader";
import { EmptyTimetableState } from "./timetable/EmptyTimetableState";

// Constants & Helpers
import {
  DEFAULT_DAYS,
  ALL_DAYS,
  DAY_LABELS,
} from "./timetable/constants";
import { getCurrentDayIndex } from "./timetable/helpers";
import type { ViewMode, TimetableSlot, FormSlot } from "./timetable/types";

export function AdminTimetable() {
  const queryClient = useQueryClient();
  const { currentTenantId } = useAppStore();

  const [selectedClass, setSelectedClass] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedDay, setSelectedDay] = useState<string>("");

  // Create timetable dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [daySlots, setDaySlots] = useState<Record<string, FormSlot[]>>({
    monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [],
  });
  const [saving, setSaving] = useState(false);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [editForm, setEditForm] = useState({
    subjectId: "", teacherId: "", startTime: "", endTime: "", day: "", label: "",
  });
  const [editSaving, setEditSaving] = useState(false);

  // Working Days config dialog state
  const [daysConfigOpen, setDaysConfigOpen] = useState(false);
  const [daysConfigSaving, setDaysConfigSaving] = useState(false);
  const [daysConfigDraft, setDaysConfigDraft] = useState<string[]>([]);

  const { canCreate, canEdit, canDelete } = useModulePermissions("timetable");

  // ── Queries ──

  const { data: classes = [], isLoading: isLoadingClasses } = useQuery<ClassInfo[]>({
    queryKey: ["classes", currentTenantId, "min"],
    queryFn: async () => {
      const res = await apiFetch("/api/classes?mode=min");
      if (!res.ok) throw new Error("Failed to fetch classes");
      const data = await res.json();
      if (data.length > 0 && !selectedClass) setSelectedClass(data[0].id);
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: workingDays = DEFAULT_DAYS } = useQuery<string[]>({
    queryKey: ["working-days", currentTenantId],
    queryFn: async () => {
      const res = await apiFetch(`/api/tenant-settings?tenantId=${currentTenantId}`);
      if (res.ok) {
        const data = await res.json();
        return data.workingDays || DEFAULT_DAYS;
      }
      return DEFAULT_DAYS;
    },
    enabled: !!currentTenantId,
  });

  const { data: slots = [], isLoading: isLoadingTimetable } = useQuery<TimetableSlot[]>({
    queryKey: ["timetable", selectedClass],
    queryFn: async () => {
      if (!selectedClass) return [];
      const res = await apiFetch(`/api/timetable?classId=${selectedClass}`);
      if (!res.ok) throw new Error("Failed to fetch timetable");
      return await res.json();
    },
    enabled: !!selectedClass,
  });

  const { data: availableSubjects = [] } = useQuery({
    queryKey: ["subjects", currentTenantId, "min"],
    queryFn: async () => {
      const res = await apiFetch("/api/subjects?mode=min");
      if (!res.ok) return [];
      return await res.json();
    },
    enabled: createDialogOpen || editDialogOpen,
  });

  const { data: availableTeachers = [] } = useQuery({
    queryKey: ["teachers", currentTenantId, "min"],
    queryFn: async () => {
      const res = await apiFetch("/api/teachers?mode=min");
      if (!res.ok) return [];
      return await res.json();
    },
    enabled: createDialogOpen || editDialogOpen,
  });

  const filteredSubjects = useMemo(() => {
    if (!selectedClass) return availableSubjects;
    return availableSubjects.filter((s: any) => s.classId === selectedClass);
  }, [availableSubjects, selectedClass]);

  // ── Mutations ──

  const bulkSaveMutation = useMutation({
    mutationFn: async (payload: { slots: any[]; classId: string }) => {
      const res = await apiFetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: (_data, variables) => {
      const currentClassInfo = classes.find((c) => c.id === selectedClass);
      const className = currentClassInfo ? `${currentClassInfo.name}-${currentClassInfo.section}` : "";
      const updatedSlots = variables.slots.map((s) => {
        const sub = availableSubjects.find((sub: any) => sub.id === s.subjectId);
        const teach = availableTeachers.find((t: any) => t.id === s.teacherId);
        return { ...s, subjectName: sub?.name || "", teacherName: teach?.name || "", className: className };
      });
      queryClient.setQueryData(["timetable", selectedClass], updatedSlots);
      toast.success("Timetable updated");
      setCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["timetable", selectedClass] });
    },
    onError: () => toast.error("Failed to save timetable"),
    onSettled: () => setSaving(false),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/timetable?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: (_data, deletedId) => {
      queryClient.setQueryData(["timetable", selectedClass], (old: any[] | undefined) => old ? old.filter((s) => s.id !== deletedId) : []);
      toast.success("Slot deleted");
      queryClient.invalidateQueries({ queryKey: ["timetable", selectedClass] });
    },
    onError: () => toast.error("Failed to delete slot"),
  });

  // ── Handlers ──

  const handleOpenManage = useCallback(async () => {
    const initial: Record<string, FormSlot[]> = { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] };
    slots.forEach((slot: any) => { if (initial[slot.day]) { initial[slot.day].push({ ...slot, subjectId: slot.subjectId ?? "", teacherId: slot.teacherId ?? "", label: slot.label ?? undefined }); } });
    ALL_DAYS.forEach((day) => { initial[day]?.sort((a, b) => a.startTime.localeCompare(b.startTime)); });
    setDaySlots(initial);
    setCreateDialogOpen(true);
  }, [slots]);

  const handleBulkSave = () => {
    if (!selectedClass) return;
    setSaving(true);
    const allFlatSlots = workingDays.flatMap((day) => daySlots[day] ?? []);
    const validSlots = allFlatSlots.filter((p) => (p.subjectId && p.teacherId) || p.label);
    if (validSlots.length === 0) { toast.error("Please add at least one valid period."); setSaving(false); return; }
    bulkSaveMutation.mutate({ slots: validSlots.map((p) => ({ classId: selectedClass, ...p })), classId: selectedClass });
  };

  const handleEditSlot = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setEditForm({
      subjectId: slot.subjectId ?? "", teacherId: slot.teacherId ?? "", startTime: slot.startTime ?? "", endTime: slot.endTime ?? "", day: slot.day ?? "", label: (slot as any).label ?? "",
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingSlot) return;
    setEditSaving(true);
    try {
      const res = await apiFetch(`/api/timetable?id=${editingSlot.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
      if (res.ok) {
        const sub = availableSubjects.find((s: any) => s.id === editForm.subjectId);
        const teach = availableTeachers.find((t: any) => t.id === editForm.teacherId);
        queryClient.setQueryData(["timetable", selectedClass], (old: any[] | undefined) => {
          if (!old) return [];
          return old.map((s) => s.id === editingSlot.id ? { ...s, ...editForm, subjectName: sub?.name || s.subjectName, teacherName: teach?.name || s.teacherName } : s);
        });
        toast.success("Slot updated");
        setEditDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ["timetable", selectedClass] });
      } else { toast.error("Failed to update slot"); }
    } finally { setEditSaving(false); }
  };

  const handleWorkingDaysSave = async () => {
    setDaysConfigSaving(true);
    try {
      const res = await apiFetch("/api/tenant-settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tenantId: currentTenantId, settings: { workingDays: daysConfigDraft } }) });
      if (res.ok) { queryClient.invalidateQueries({ queryKey: ["working-days", currentTenantId] }); setDaysConfigOpen(false); toast.success("Working days updated"); }
    } finally { setDaysConfigSaving(false); }
  };

  const currentClass = useMemo(() => classes.find((c) => c.id === selectedClass), [classes, selectedClass]);
  const uniqueSubjects = useMemo(() => Array.from(new Set(slots.map((s) => s.subjectName))), [slots]);
  const currentDayIndex = useMemo(() => getCurrentDayIndex(workingDays), [workingDays]);

  const timeSlots = useMemo(() => {
    const unique = new Map<string, { start: string; end: string }>();
    slots.forEach((s) => unique.set(`${s.startTime}-${s.endTime}`, { start: s.startTime, end: s.endTime }));
    return Array.from(unique.values()).sort((a, b) => a.start.localeCompare(b.start));
  }, [slots]);

  const gridData = useMemo(() => {
    const data = new Map<string, Map<string, TimetableSlot[]>>();
    slots.forEach((slot) => {
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
    slots.forEach((slot) => { if (!data.has(slot.day)) data.set(slot.day, []); data.get(slot.day)!.push(slot); });
    data.forEach((list) => list.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    return data;
  }, [slots]);

  const effectiveDay = workingDays.includes(selectedDay) ? selectedDay : workingDays[currentDayIndex] || workingDays[0];
  const selectedDaySlots = useMemo(() => {
    return timeSlots.map(({ start, end }) => { const key = `${start}-${end}`; return gridData.get(effectiveDay)?.get(key) || []; });
  }, [effectiveDay, timeSlots, gridData]);

  return (
    <div className="space-y-6">
      <TimetableHeader 
        currentClass={currentClass}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedClass={selectedClass}
        onClassChange={setSelectedClass}
        classes={classes}
        canEdit={canEdit}
        canCreate={canCreate}
        onSettingsClick={() => { setDaysConfigDraft([...workingDays]); setDaysConfigOpen(true); }}
        onManageClick={handleOpenManage}
      />

      <Card className="border-none shadow-sm shadow-emerald-600/5 overflow-hidden">
        <CardContent className="p-0">
          {isLoadingTimetable || isLoadingClasses ? (
            <TimetableSkeleton viewMode={viewMode} />
          ) : slots.length === 0 ? (
            <EmptyTimetableState />
          ) : viewMode === "grid" ? (
            <GridView timeSlots={timeSlots} gridData={gridData} uniqueSubjects={uniqueSubjects} workingDays={workingDays} currentDayIndex={currentDayIndex} onDeleteSlot={(id) => deleteMutation.mutate(id)} onEditSlot={handleEditSlot} canEdit={canEdit} canDelete={canDelete} />
          ) : viewMode === "list" ? (
            <ListView slotsByDay={slotsByDay} uniqueSubjects={uniqueSubjects} workingDays={workingDays} currentDayIndex={currentDayIndex} onDeleteSlot={(id) => deleteMutation.mutate(id)} onEditSlot={handleEditSlot} canEdit={canEdit} canDelete={canDelete} />
          ) : (
            <DayView selectedDay={effectiveDay} selectedDaySlots={selectedDaySlots} timeSlots={timeSlots} uniqueSubjects={uniqueSubjects} workingDays={workingDays} currentDayIndex={currentDayIndex} onSelectDay={setSelectedDay} onDeleteSlot={(id) => deleteMutation.mutate(id)} onEditSlot={handleEditSlot} canEdit={canEdit} canDelete={canDelete} />
          )}
        </CardContent>
      </Card>

      <WorkingDaysDialog open={daysConfigOpen} onOpenChange={setDaysConfigOpen} draft={daysConfigDraft} setDraft={setDaysConfigDraft} onSave={handleWorkingDaysSave} saving={daysConfigSaving} />
      <EditSlotDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} form={editForm} setForm={setEditForm} onSave={handleEditSave} saving={editSaving} availableSubjects={filteredSubjects} availableTeachers={availableTeachers} workingDays={workingDays} isBreak={!!(editingSlot as any)?.label} />
      <CreateTimetableDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
        currentClass={currentClass} 
        workingDays={workingDays} 
        daySlots={daySlots} 
        setDaySlots={setDaySlots} 
        availableSubjects={filteredSubjects} 
        availableTeachers={availableTeachers} 
        onSave={handleBulkSave} 
        saving={saving} 
        onCopyToDay={(src, tar) => {
          const sourcePeriods = daySlots[src] ?? [];
          if (sourcePeriods.length === 0) return;
          const copied = sourcePeriods.map((slot) => ({ ...slot, id: typeof window !== "undefined" ? window.crypto.randomUUID() : "", day: tar }));
          setDaySlots((prev) => ({ ...prev, [tar]: copied }));
          toast.success(`Copied to ${DAY_LABELS[tar]}`);
        }}
        onCopyToAllDays={(src) => {
          const sourcePeriods = daySlots[src] ?? [];
          if (sourcePeriods.length === 0) return;
          const updated = { ...daySlots };
          workingDays.forEach((day) => { if (day === src) return; const copied = sourcePeriods.map((slot) => ({ ...slot, id: typeof window !== "undefined" ? window.crypto.randomUUID() : "", day })); updated[day] = copied; });
          setDaySlots(updated);
          toast.success("Copied to all days");
        }}
      />
    </div>
  );
}
