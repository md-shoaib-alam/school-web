"use client";

import { useState, useEffect, useMemo } from "react";
import { useViewMode } from "@/hooks/use-view-mode";
import { goeyToast as toast } from "goey-toast";
import api from "@/lib/axios";
import { useAppStore } from "@/store/use-app-store";
import {
  useParents,
  useClassesMin,
} from "@/lib/graphql/hooks/academic.hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/graphql/keys";
import { Pagination } from "@/components/shared/pagination";
import { useDebounce } from "@/hooks/use-debounce";

// Sub-components
import { ParentsHeader } from "./parents/ParentsHeader";
import { ParentsTableView } from "./parents/ParentsTableView";
import { ParentsGridView } from "./parents/ParentsGridView";
import { ParentsEmptyState } from "./parents/ParentsEmptyState";
import {
  CreateParentDialog,
  EditParentDialog,
  LinkChildDialog,
} from "./parents/ParentDialog";
import { ParentSkeleton } from "./parents/ParentSkeleton";
import { ParentInfo, StudentInfo } from "./parents/types";

export function AdminParents() {
  const { currentTenantId } = useAppStore();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useViewMode("parents", "grid");

  // Filter & Search states
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [currentPage, setCurrentPage] = useState(1);

  // Queries
  const { 
    data: parentsData, 
    isLoading: loadingParents 
  } = useParents(currentTenantId || undefined, debouncedSearch || undefined, currentPage, 12);

  const { data: classesData } = useClassesMin(currentTenantId || undefined);

  // Link child dialog states
  const [linkOpen, setLinkOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<ParentInfo | null>(null);
  const [selectedClass, setSelectedClass] = useState("all");
  const [linking, setLinking] = useState(false);

  // Students for linking (filtered by class if selected) - Using optimized min-data REST API
  const { 
    data: studentData, 
    isLoading: loadingStudents,
    isFetching: fetchingStudents
  } = useQuery({
    queryKey: ['students-min', selectedClass],
    queryFn: async () => {
      try {
        const params: any = { mode: 'min', limit: '1000' };
        if (selectedClass && selectedClass !== 'all') params.classId = selectedClass;
        const res = await api.get('/students', { params });
        const data = res as any;
        return (data?.items ? data : { items: [] }) as { items: StudentInfo[] };
      } catch (err) {
        console.error("Failed to fetch students for linking:", err);
        return { items: [] } as { items: StudentInfo[] };
      }
    },
    enabled: linkOpen,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });


  const parents = useMemo(() => {
    const list = parentsData?.parents || [];
    return [...list].sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [parentsData]);
  const totalItems = parentsData?.total || 0;
  const totalPages = parentsData?.totalPages || 1;

  const students = studentData?.items || [];
  const classes = classesData?.classes || [];
  const loading = loadingParents;

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "", email: "", phone: "", occupation: "", password: "", 
  });
  const [creating, setCreating] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<ParentInfo | null>(null);
  const [editForm, setEditForm] = useState({
    name: "", email: "", phone: "", occupation: "",
  });
  const [editing, setEditing] = useState(false);

  const filteredStudents = useMemo(() => {
    return students.filter(
      (s) => !s.parentId && !selectedParent?.children.some((c) => c.id === s.id)
    );
  }, [students, selectedParent]);

  const handleCreate = async () => {
    if (!createForm.name || !createForm.email) { toast.error("Name and email are required"); return; }
    toast.promise(
      (async () => {
        setCreating(true);
        try {
          await api.post("/parents", { action: "create", ...createForm });
          setCreateOpen(false);
          setCreateForm({ name: "", email: "", phone: "", occupation: "", password: "", });
          queryClient.invalidateQueries({ queryKey: queryKeys.parents });
          return "Parent account created";
        } finally { setCreating(false); }
      })(),
      { loading: "Creating parent account...", success: (msg) => msg, error: (err: any) => err.message, },
    );
  };

  const handleLinkChild = async (studentId: string) => {
    if (!selectedParent) return;
    toast.promise(
      (async () => {
        setLinking(true);
        try {
          await api.post("/parents", { action: "link", parentId: selectedParent.id, studentId, });
          queryClient.invalidateQueries({ queryKey: queryKeys.parents });
          queryClient.invalidateQueries({ queryKey: ['students-min'] });
          return "Student linked successfully";
        } finally { setLinking(false); }
      })(),
      { loading: "Linking child to parent...", success: (msg: any) => msg, error: (err: any) => err.message, },
    );
  };

  const handleUnlinkChild = async (parentId: string, studentId: string) => {
    toast.promise(
      (async () => {
        await api.post("/parents", { action: "unlink", parentId, studentId, });
        queryClient.invalidateQueries({ queryKey: queryKeys.parents });
        queryClient.invalidateQueries({ queryKey: ['students-min'] });
        throw new Error("Child record unlinked");
      })(),
      { loading: "Unlinking child...", success: () => "", error: (err: any) => err.message, },
    );
  };

  const handleEditSave = async () => {
    if (!editingParent || !editForm.name || !editForm.email) { toast.error("Name and email are required"); return; }
    const updatedParent = { ...editingParent, ...editForm };
    queryClient.setQueriesData({ queryKey: queryKeys.parents }, (old: any) => {
      if (!old || !old.parents) return old;
      return { ...old, parents: old.parents.map((p: any) => p.id === editingParent.id ? updatedParent : p) };
    });
    toast.promise(
      (async () => {
        setEditing(true);
        try {
          await api.put("/parents", { id: editingParent.id, ...editForm });
          setEditOpen(false);
          queryClient.invalidateQueries({ queryKey: queryKeys.parents });
          return "Parent details updated";
        } finally { setEditing(false); }
      })(),
      { loading: "Saving changes...", success: (msg) => msg, error: (err: any) => err.message, },
    );
  };

  const handleDelete = async (id: string) => {
    toast.promise(
      (async () => {
        await api.delete(`/parents?id=${id}`);
        queryClient.invalidateQueries({ queryKey: queryKeys.parents });
        throw new Error("Parent record removed");
      })(),
      { loading: "Removing parent record...", success: () => "", error: (err: any) => err.message, },
    );
  };

  if (loading && parents.length === 0) return <ParentSkeleton />;

  return (
    <div className="space-y-6">
      <ParentsHeader 
        search={search}
        onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }}
        totalParents={parents.length}
        totalChildren={parents.reduce((s, p) => s + p.children.length, 0)}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onAddClick={() => setCreateOpen(true)}
      />

      {parents.length === 0 ? (
        <ParentsEmptyState />
      ) : viewMode === "table" ? (
        <ParentsTableView 
          parents={parents}
          onEdit={(p) => { setEditingParent(p); setEditForm({ name: p.name, email: p.email, phone: p.phone || "", occupation: p.occupation || "" }); setEditOpen(true); }}
          onDelete={handleDelete}
          onLinkOpen={(p) => { setSelectedParent(p); setLinkOpen(true); setSelectedClass("all"); }}
        />
      ) : (
        <ParentsGridView 
          parents={parents}
          linking={linking}
          onEdit={(p) => { setEditingParent(p); setEditForm({ name: p.name, email: p.email, phone: p.phone || "", occupation: p.occupation || "" }); setEditOpen(true); }}
          onDelete={handleDelete}
          onLinkOpen={(p) => { setSelectedParent(p); setLinkOpen(true); setSelectedClass("all"); }}
          onUnlinkChild={handleUnlinkChild}
        />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={12}
        onPageChange={setCurrentPage}
      />

      <CreateParentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        createForm={createForm}
        setCreateForm={setCreateForm}
        onCreate={handleCreate}
        creating={creating}
      />

      <EditParentDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editForm={editForm}
        setEditForm={setEditForm}
        onSave={handleEditSave}
        editing={editing}
      />

      <LinkChildDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        selectedParent={selectedParent}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        classes={classes}
        filteredStudents={filteredStudents}
        linking={linking}
        loading={loadingStudents || fetchingStudents}
        onLinkChild={handleLinkChild}
        onUnlinkChild={handleUnlinkChild}
      />
    </div>
  );
}
