"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, UserPlus, LayoutGrid, List, Pencil, Trash2, Link as LinkIcon, Mail, Phone, Briefcase } from "lucide-react";
import { useViewMode } from "@/hooks/use-view-mode";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { avatarColors } from "./teachers/types";
import { motion, AnimatePresence } from "framer-motion";
import { goeyToast as toast } from "goey-toast";
import api from "@/lib/axios";
import { useAppStore } from "@/store/use-app-store";
import {
  useParents,
  useStudents,
  useClassesMin,
} from "@/lib/graphql/hooks/academic.hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/graphql/keys";
import { Pagination } from "@/components/shared/pagination";
import { useDebounce } from "@/hooks/use-debounce";

import { ParentCard } from "./parents/ParentCard";
import {
  CreateParentDialog,
  EditParentDialog,
  LinkChildDialog,
} from "./parents/ParentDialog";
import { ParentSkeleton } from "./parents/ParentSkeleton";
import { ParentInfo, StudentInfo } from "./parents/types";
import { Card, CardContent } from "@/components/ui/card";

export function AdminParents() {
  const { currentTenantId } = useAppStore();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useViewMode("parents", "grid");

  // Filter & Search states
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

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
        // axios interceptor returns response.data directly
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
    name: "",
    email: "",
    phone: "",
    occupation: "",
    password: "", 
  });
  const [creating, setCreating] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<ParentInfo | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    occupation: "",
  });
  const [editing, setEditing] = useState(false);


  const filtered = parents; // GraphQL handle search now? Wait, no, let's keep frontend search for now if needed, or use useParents search
  // Actually, I'll use the search prop in useParents above.

  const filteredStudents = useMemo(() => {
    return students.filter(
      (s) => !s.parentId && !selectedParent?.children.some((c) => c.id === s.id)
    );
  }, [students, selectedParent]);

  const handleCreate = async () => {
    if (!createForm.name || !createForm.email) {
      toast.error("Name and email are required");
      return;
    }
    toast.promise(
      (async () => {
        setCreating(true);
        try {
          await api.post("/parents", { action: "create", ...createForm });
          setCreateOpen(false);
          setCreateForm({
            name: "", email: "", phone: "", occupation: "", password: "",
          });
          queryClient.invalidateQueries({ queryKey: queryKeys.parents });
          return "Parent account created";
        } finally {
          setCreating(false);
        }
      })(),
      {
        loading: "Creating parent account...",
        success: (msg) => msg,
        error: (err: any) => err.message,
      },
    );
  };

  const handleLinkChild = async (studentId: string) => {
    if (!selectedParent) return;
    toast.promise(
      (async () => {
        setLinking(true);
        try {
          await api.post("/parents", {
            action: "link",
            parentId: selectedParent.id,
            studentId,
          });
          // Invalidate both parents and students-min cache to get fresh data
          queryClient.invalidateQueries({ queryKey: queryKeys.parents });
          queryClient.invalidateQueries({ queryKey: ['students-min'] });
          return "Student linked successfully";
        } finally {
          setLinking(false);
        }
      })(),
      {
        loading: "Linking child to parent...",
        success: (msg: any) => msg,
        error: (err: any) => err.message,
      },
    );
  };

  const handleUnlinkChild = async (parentId: string, studentId: string) => {
    toast.promise(
      (async () => {
        await api.post("/parents", {
          action: "unlink",
          parentId,
          studentId,
        });
        // Invalidate both parents and students-min cache to get fresh data
        queryClient.invalidateQueries({ queryKey: queryKeys.parents });
        queryClient.invalidateQueries({ queryKey: ['students-min'] });

        // Force red pill morph
        throw new Error("Child record unlinked");
      })(),
      {
        loading: "Unlinking child...",
        success: () => "",
        error: (err: any) => err.message,
      },
    );
  };

  const handleEdit = (parent: ParentInfo) => {
    setEditingParent(parent);
    setEditForm({
      name: parent.name,
      email: parent.email,
      phone: parent.phone || "",
      occupation: parent.occupation || "",
    });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingParent || !editForm.name || !editForm.email) {
      toast.error("Name and email are required");
      return;
    }

    // OPTIMISTIC UPDATE: Update the UI instantly
    const updatedParent = { ...editingParent, ...editForm };
    queryClient.setQueriesData({ queryKey: queryKeys.parents }, (old: any) => {
      if (!old || !old.parents) return old;
      return {
        ...old,
        parents: old.parents.map((p: any) => p.id === editingParent.id ? updatedParent : p)
      };
    });

    toast.promise(
      (async () => {
        setEditing(true);
        try {
          await api.put("/parents", { id: editingParent.id, ...editForm });
          setEditOpen(false);
          // Refresh from server to ensure total accuracy
          queryClient.invalidateQueries({ queryKey: queryKeys.parents });
          return "Parent details updated";
        } finally {
          setEditing(false);
        }
      })(),
      {
        loading: "Saving changes...",
        success: (msg) => msg,
        error: (err: any) => err.message,
      },
    );
  };

  const handleDelete = async (id: string) => {
    toast.promise(
      (async () => {
        await api.delete(`/parents?id=${id}`);
        queryClient.invalidateQueries({ queryKey: queryKeys.parents });

        // Force red pill morph
        throw new Error("Parent record removed");
      })(),
      {
        loading: "Removing parent record...",
        success: () => "",
        error: (err: any) => err.message,
      },
    );
  };

  return loading && parents.length === 0 ? (
    <ParentSkeleton />
  ) : (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Parents
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {parents.length} parents registered •{" "}
            {parents.reduce((s, p) => s + p.children.length, 0)} children linked
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className={`h-8 w-8 p-0 ${viewMode === "table" ? "bg-white dark:bg-gray-700 shadow-sm" : ""}`}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`h-8 w-8 p-0 ${viewMode === "grid" ? "bg-white dark:bg-gray-700 shadow-sm" : ""}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            onClick={() => setCreateOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" /> Add Parent
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <Input
          placeholder="Search parents or children..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Parent Content */}
      {loading && parents.length === 0 ? (
        <ParentSkeleton />
      ) : parents.length === 0 ? (
        <div className="text-center py-20 bg-gray-50/30 dark:bg-gray-800/10 rounded-2xl border-dashed border-2">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No parents found</p>
          <p className="text-sm text-muted-foreground">Add a parent or adjust your search</p>
        </div>
      ) : viewMode === "table" ? (
        <Card className="shadow-sm border-0 overflow-hidden mb-4">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Parent</th>
                    <th className="px-6 py-4 hidden sm:table-cell">Children</th>
                    <th className="px-6 py-4 hidden lg:table-cell">Occupation</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {parents.map((parent, index) => {
                    const initials = parent.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                    const color = avatarColors[index % avatarColors.length];
                    return (
                      <tr key={parent.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className={`${color} text-white text-[10px] font-bold`}>
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-gray-900 dark:text-gray-100 truncate">{parent.name}</span>
                              <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{parent.email}</span>
                              {/* Mobile-only info */}
                              <div className="sm:hidden flex flex-wrap gap-1 mt-1">
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-1 rounded">
                                  {parent.children.length} {parent.children.length === 1 ? 'Child' : 'Children'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {parent.children.map((child) => (
                              <Badge key={child.id} variant="secondary" className="text-[10px] py-0">
                                {child.name}
                              </Badge>
                            ))}
                            {parent.children.length === 0 && <span className="text-xs text-gray-400 italic">None linked</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell text-gray-600 dark:text-gray-400 font-medium">
                          {parent.occupation || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-2 text-xs border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                              onClick={() => {
                                setSelectedParent(parent);
                                setLinkOpen(true);
                                setSelectedClass("all");
                              }}
                            >
                              <LinkIcon className="h-3.5 w-3.5" />
                              Link
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-emerald-600" onClick={() => handleEdit(parent)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600" onClick={() => handleDelete(parent.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {parents.map((parent) => (
            <div key={parent.id}>
              <ParentCard
                parent={parent}
                linking={linking}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onLinkOpen={(p) => {
                  setSelectedParent(p);
                  setLinkOpen(true);
                  setSelectedClass("all");
                }}
                onUnlinkChild={handleUnlinkChild}
              />
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={12}
        onPageChange={setCurrentPage}
      />

      {/* Dialogs */}
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
        loading={loadingStudents || fetchingStudents} // Show spinner on initial load AND class changes!
        onLinkChild={handleLinkChild}
        onUnlinkChild={handleUnlinkChild}
      />
    </div>
  );
}
