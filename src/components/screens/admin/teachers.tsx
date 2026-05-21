"use client";

import { useState, useEffect, useMemo } from "react";
import { useViewMode } from "@/hooks/use-view-mode";
import { goeyToast as toast } from "goey-toast";
import { useModulePermissions } from "@/hooks/use-permissions";
import { apiFetch } from "@/lib/api";
import { useAppStore } from "@/store/use-app-store";
import { useTeachers } from "@/lib/graphql/hooks/academic.hooks";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/graphql/keys";
import { Pagination } from "@/components/shared/pagination";
import { useDebounce } from "@/hooks/use-debounce";
import anime from "animejs";

// Sub-components
import { TeacherDialog } from "./teachers/TeacherDialog";
import { TeacherSkeleton } from "./teachers/TeacherSkeleton";
import { TeachersHeader } from "./teachers/TeachersHeader";
import { TeachersTableView } from "./teachers/TeachersTableView";
import { TeachersGridView } from "./teachers/TeachersGridView";
import { TeachersEmptyState } from "./teachers/TeachersEmptyState";
import { Eye } from "lucide-react";
import type { TeacherInfo } from "./teachers/types";

const emptyFormData = {
  name: "",
  email: "",
  phone: "",
  qualification: "",
  experience: "",
  password: "",
};

export function AdminTeachers() {
  const { currentTenantId } = useAppStore();
  const { canCreate, canEdit, canDelete } = useModulePermissions("teachers");

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [currentPage, setCurrentPage] = useState(1);

  const queryClient = useQueryClient();

  const { data: teachersData, isLoading: loading } = useTeachers(
    currentTenantId || undefined,
    debouncedSearch || undefined,
    currentPage,
    12,
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

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherInfo | null>(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [submitting, setSubmitting] = useState(false);
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
    const queryKey = [queryKeys.teachers, currentTenantId, debouncedSearch, currentPage, 12];

    if (isEdit && editingTeacher) {
      const updatedTeacher = { ...editingTeacher, ...formData };
      queryClient.setQueryData(queryKey, (old: any) => {
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
          const res = await apiFetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(isEdit ? { id: editingTeacher.id, ...formData } : formData),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Failed to ${isEdit ? "update" : "add"} teacher`);
          }

          setDialogOpen(false);
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
    const element = document.getElementById(`teacher-item-${id}`);
    
    const executeDeletion = async () => {
      const queryKey = [queryKeys.teachers, currentTenantId, debouncedSearch, currentPage, 12];
      const previousTeachers = queryClient.getQueryData(queryKey);
      
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old || !old.teachers) return old;
        return {
          ...old,
          teachers: old.teachers.filter((t: any) => t.id !== id),
          total: Math.max(0, old.total - 1)
        };
      });

      toast.promise(
        (async () => {
          try {
            const res = await apiFetch(`/api/teachers?id=${id}`, { method: "DELETE" });
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              throw new Error(err.error || "Deletion failed");
            }
            queryClient.invalidateQueries({ queryKey: queryKeys.teachers });
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard', currentTenantId] });
            setDeletingId(null);
            throw new Error("Teacher record removed");
          } catch (err) {
            queryClient.setQueryData(queryKey, previousTeachers);
            throw err;
          }
        })(),
        {
          loading: "Removing teacher record...",
          success: () => "",
          error: (err: any) => err.message,
        },
      );
    };

    if (element) {
      element.style.cssText += '; pointer-events: none; position: relative; z-index: 10;';
      anime({
        targets: element,
        scale: [1, 0.5],
        translateX: [0, 150],
        rotate: '6deg',
        opacity: [1, 0],
        duration: 350,
        easing: 'easeInBack',
        complete: () => executeDeletion()
      });
    } else {
      executeDeletion();
    }
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

      <TeachersHeader 
        search={search}
        onSearchChange={setSearch}
        viewMode={viewMode}
        setViewMode={setViewMode}
        canCreate={canCreate}
        onAddClick={handleOpenAdd}
      />

      {loading ? (
        <TeacherSkeleton />
      ) : teachers.length === 0 ? (
        <TeachersEmptyState />
      ) : viewMode === "table" ? (
        <TeachersTableView 
          teachers={teachers}
          canEdit={canEdit}
          canDelete={canDelete}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          deletingId={deletingId}
          setDeletingId={setDeletingId}
        />
      ) : (
        <TeachersGridView 
          teachers={teachers}
          canEdit={canEdit}
          canDelete={canDelete}
          deletingId={deletingId}
          setDeletingId={setDeletingId}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={12}
        onPageChange={setCurrentPage}
      />

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
        isFormValid={formData.name.trim() !== "" && formData.email.trim() !== ""}
      />
    </div>
  );
}
