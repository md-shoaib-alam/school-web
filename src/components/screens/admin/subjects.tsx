"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useModulePermissions } from "@/hooks/use-permissions";
import { useAppStore } from "@/store/use-app-store";
import { useViewMode } from "@/hooks/use-view-mode";
import { goeyToast as toast } from "goey-toast";

// Sub-components
import { SubjectsHeader } from "./subjects/SubjectsHeader";
import { SubjectsFilters } from "./subjects/SubjectsFilters";
import { SubjectsTableView } from "./subjects/SubjectsTableView";
import { SubjectsGridView } from "./subjects/SubjectsGridView";
import { SubjectDialogs } from "./subjects/SubjectDialogs";
import { Skeleton } from "@/components/ui/skeleton";

interface SubjectInfo {
  id: string;
  name: string;
  code: string;
  className: string;
  teacherName?: string;
  classId: string;
  teacherId: string;
}

const emptyForm = { name: "", code: "", classId: "", teacherId: "" };

export function AdminSubjects() {
  const { currentTenantId } = useAppStore();
  const { canCreate, canEdit, canDelete } = useModulePermissions("subjects");
  const queryClient = useQueryClient();

  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ["subjects", currentTenantId],
    queryFn: async () => {
      const res = await apiFetch("/api/subjects");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: ["classes", "min"],
    queryFn: async () => {
      const res = await apiFetch("/api/classes?mode=min");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: teachers = [], isLoading: teachersLoading } = useQuery({
    queryKey: ["teachers", "min"],
    queryFn: async () => {
      const res = await apiFetch("/api/teachers?mode=min");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [viewMode, setViewMode] = useViewMode("subjects", "table");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ id: "", ...emptyForm });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SubjectInfo | null>(null);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create subject");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subjects"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch("/api/subjects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update subject");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subjects"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/subjects?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete subject");
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subjects"] }),
  });

  const loading = (subjectsLoading && subjects.length === 0) || (classesLoading && classes.length === 0);

  const filtered = (subjects as SubjectInfo[]).filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.code.toLowerCase().includes(search.toLowerCase()) || 
      s.className.toLowerCase().includes(search.toLowerCase()) ||
      (s.teacherName && s.teacherName.toLowerCase().includes(search.toLowerCase()));
    const matchesClass = classFilter === "all" || s.classId === classFilter;
    return matchesSearch && matchesClass;
  });

  const handleCreate = async () => {
    if (!form.name || !form.code || !form.classId) {
      toast.error("Please fill in all required fields");
      return;
    }
    const promise = createMutation.mutateAsync({ ...form, teacherId: form.teacherId || null });
    toast.promise(promise, { loading: "Creating subject...", success: "Subject created successfully!", error: (err: any) => err.message || "Failed to create subject" });
    try { await promise; setCreateOpen(false); setForm({ ...emptyForm }); } catch {}
  };

  const handleEdit = async () => {
    if (!editForm.name || !editForm.code || !editForm.classId) {
      toast.error("Please fill in all required fields");
      return;
    }
    const promise = updateMutation.mutateAsync({ ...editForm, teacherId: editForm.teacherId || null });
    toast.promise(promise, { loading: "Updating subject...", success: "Subject updated successfully!", error: (err: any) => err.message || "Failed to update subject" });
    try { await promise; setEditOpen(false); setEditForm({ id: "", ...emptyForm }); } catch {}
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const promise = (async () => {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      throw new Error("Subject record removed");
    })();
    toast.promise(promise, { loading: "Deleting subject...", success: () => "", error: (err: any) => err.message });
    try { await promise; } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Read-only banner */}
      {!canCreate && !canEdit && !canDelete && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 px-3 py-2">
          <Eye className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
            Read-only mode, you have view permission only for this module.
          </span>
        </div>
      )}

      <SubjectsHeader 
        totalSubjects={subjects.length}
        canCreate={canCreate}
        onAddClick={() => setCreateOpen(true)}
      />

      <SubjectsFilters 
        search={search}
        onSearchChange={setSearch}
        classFilter={classFilter}
        onClassFilterChange={setClassFilter}
        classes={classes}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-40">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-2 bg-transparent">
          <CardContent className="py-20 text-center text-muted-foreground">
            <BookOpen className="size-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No subjects found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        <SubjectsTableView 
          filtered={filtered}
          canEdit={canEdit}
          canDelete={canDelete}
          onEdit={(s) => { setEditForm({ id: s.id, name: s.name, code: s.code, classId: s.classId, teacherId: s.teacherId || "" }); setEditOpen(true); }}
          onDelete={(s) => { setDeleteTarget(s); setDeleteDialogOpen(true); }}
        />
      ) : (
        <SubjectsGridView 
          filtered={filtered}
          canEdit={canEdit}
          canDelete={canDelete}
          onEdit={(s) => { setEditForm({ id: s.id, name: s.name, code: s.code, classId: s.classId, teacherId: s.teacherId || "" }); setEditOpen(true); }}
          onDelete={(s) => { setDeleteTarget(s); setDeleteDialogOpen(true); }}
        />
      )}

      <SubjectDialogs 
        createOpen={createOpen}
        setCreateOpen={setCreateOpen}
        form={form}
        setForm={setForm}
        classes={classes}
        teachers={teachers}
        onCreate={handleCreate}
        creating={createMutation.isPending}
        editOpen={editOpen}
        setEditOpen={setEditOpen}
        editForm={editForm}
        setEditForm={setEditForm}
        onEdit={handleEdit}
        updating={updateMutation.isPending}
        deleteOpen={deleteDialogOpen}
        setDeleteOpen={setDeleteDialogOpen}
        deleteTarget={deleteTarget}
        onDelete={handleDelete}
      />
    </div>
  );
}
