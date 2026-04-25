"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Search, Plus, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { goeyToast as toast } from "goey-toast";
import { useModulePermissions } from "@/hooks/use-permissions";
import { apiFetch } from "@/lib/api";
import { useAppStore } from "@/store/use-app-store";
import { useTeachers } from "@/lib/graphql/hooks/academic.hooks";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/graphql/keys";

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
  const [debouncedSearch, setDebouncedSearch] = useState("");
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

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
        {canCreate && (
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
            onClick={handleOpenAdd}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Teacher
          </Button>
        )}
      </div>

      {/* Teacher Grid */}
      {loading ? (
        <TeacherSkeleton />
      ) : teachers.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No teachers found</p>
            <p className="text-sm">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {teachers.map((teacher, index) => (
                <motion.div
                  key={teacher.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.8,
                    transition: { duration: 0.2 },
                  }}
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

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between py-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground order-2 sm:order-1">
              Showing{" "}
              <span className="font-medium text-foreground">
                {teachers.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">{totalItems}</span>{" "}
              teachers
            </p>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <Button
                      key={p}
                      variant={currentPage === p ? "default" : "ghost"}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </Button>
                  ),
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

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
