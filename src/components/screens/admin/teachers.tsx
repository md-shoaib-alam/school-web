"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Search, Plus, Eye, LayoutGrid, List, Mail, Phone, Briefcase, Pencil, Trash2 } from "lucide-react";
import { useViewMode } from "@/hooks/use-view-mode";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { avatarColors } from "./teachers/types";
import { motion, AnimatePresence } from "framer-motion";
import { goeyToast as toast } from "goey-toast";
import { useModulePermissions } from "@/hooks/use-permissions";
import { apiFetch } from "@/lib/api";
import { useAppStore } from "@/store/use-app-store";
import { useTeachers } from "@/lib/graphql/hooks/academic.hooks";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/graphql/keys";
import { Pagination } from "@/components/shared/pagination";
import { useDebounce } from "@/hooks/use-debounce";

// Sub-components
import { TeacherCard } from "./teachers/TeacherCard";
import { TeacherDialog } from "./teachers/TeacherDialog";
import { TeacherSkeleton } from "./teachers/TeacherSkeleton";
import type { TeacherInfo } from "./teachers/types";

const emptyFormData = {
  name: "",
  email: "",
  phone: "",
  qualification: "",
  experience: "",
  password: "", // Added for consistency
};

export function AdminTeachers() {
  const { currentTenantId } = useAppStore();
  const { canCreate, canEdit, canDelete } = useModulePermissions("teachers");

  // Filter & Search states
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [currentPage, setCurrentPage] = useState(1);

  const queryClient = useQueryClient();

  // Queries
  const { data: teachersData, isLoading: loading } = useTeachers(
    currentTenantId || undefined,
    debouncedSearch || undefined,
    currentPage,
    12, // ITEMS_PER_PAGE
  );

  const teachers = useMemo(() => {
    const list = teachersData?.teachers || [];
    return [...list].sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [teachersData]);
  const totalItems = teachersData?.total || 0;
  const totalPages = teachersData?.totalPages || 1;
  const [viewMode, setViewMode] = useViewMode("teachers", "grid");

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherInfo | null>(
    null,
  );
  const [formData, setFormData] = useState(emptyFormData);
  const [submitting, setSubmitting] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData(emptyFormData);
    setDialogOpen(true);
  };

  const handleOpenEdit = (teacher: TeacherInfo) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone || "",
      qualification: teacher.qualification || "",
      experience: teacher.experience || "",
      password: "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Name and Email are required");
      return;
    }

    const isEdit = !!editingTeacher;

    // OPTIMISTIC UPDATE: Update the UI instantly if editing
    if (isEdit && editingTeacher) {
      const updatedTeacher = { ...editingTeacher, ...formData };
      queryClient.setQueriesData({ queryKey: queryKeys.teachers }, (old: any) => {
        if (!old || !old.teachers) return old;
        return {
          ...old,
          teachers: old.teachers.map((t: any) => t.id === editingTeacher.id ? updatedTeacher : t)
        };
      });
    }

    toast.promise(
      (async () => {
        setSubmitting(true);
        try {
          const url = "/api/teachers";
          const method = isEdit ? "PUT" : "POST";
          const body = isEdit
            ? { id: editingTeacher.id, ...formData }
            : formData;

          const res = await apiFetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(
              err.error || `Failed to ${isEdit ? "update" : "add"} teacher`,
            );
          }

          setDialogOpen(false);
          setEditingTeacher(null);
          setFormData(emptyFormData);
          queryClient.invalidateQueries({ queryKey: queryKeys.teachers });
          queryClient.invalidateQueries({ queryKey: ['admin-dashboard', currentTenantId] });
          return isEdit ? "Teacher updated" : "Teacher added";
        } finally {
          setSubmitting(false);
        }
      })(),
      {
        loading: `${editingTeacher ? "Updating" : "Adding"} teacher...`,
        success: (msg) => msg,
        error: (err: any) => err.message || "Action failed",
      },
    );
  };

  const handleDelete = async (id: string) => {
    toast.promise(
      (async () => {
        const res = await apiFetch(`/api/teachers?id=${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Deletion failed");
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.teachers });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard', currentTenantId] });
        setDeletingId(null);

        // We throw a "success" message to force a RED morphing pill for deletion
        throw new Error("Teacher record removed");
      })(),
      {
        loading: "Removing teacher record...",
        success: () => "", // Not reached
        error: (err: any) => err.message, // Shows the red pill
      },
    );
  };

  const isFormValid =
    formData.name.trim() !== "" && formData.email.trim() !== "";

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

      {/* Header with search and add button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teachers..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
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
          {canCreate && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 shadow-sm"
              onClick={handleOpenAdd}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Teacher
            </Button>
          )}
        </div>
      </div>

      {/* Teacher Content */}
      {loading ? (
        <TeacherSkeleton />
      ) : teachers.length === 0 ? (
        <Card className="border-dashed border-2 bg-transparent">
          <CardContent className="py-20 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No teachers found</p>
            <p className="text-sm">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        <Card className="shadow-sm border-0 overflow-hidden mb-4">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Teacher</th>
                    <th className="px-6 py-4">Experience</th>
                    <th className="px-6 py-4">Qualification</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {teachers.map((teacher, index) => {
                    const initials = teacher.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                    const color = avatarColors[index % avatarColors.length];
                    return (
                      <tr key={teacher.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className={`${color} text-white text-[10px] font-bold`}>
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 dark:text-gray-100">{teacher.name}</span>
                              <span className="text-xs text-muted-foreground">{teacher.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-medium">
                          {teacher.experience || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="font-normal text-xs">{teacher.qualification || 'N/A'}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {canEdit && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-emerald-600" onClick={() => handleOpenEdit(teacher)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600" onClick={() => setDeletingId(teacher.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {teachers.map((teacher, index) => (
              <motion.div
                key={teacher.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              >
                <TeacherCard
                  teacher={teacher}
                  index={index}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  deletingId={deletingId}
                  setDeletingId={setDeletingId}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
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

      {/* Add/Edit Teacher Dialog */}
      <TeacherDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingTeacher(null);
            setFormData(emptyFormData);
          }
        }}
        editingTeacher={editingTeacher}
        formData={formData}
        setFormData={setFormData}
        submitting={submitting}
        onSubmit={handleSubmit}
        isFormValid={isFormValid}
      />
    </div>
  );
}
