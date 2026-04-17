"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Search, Plus, Eye } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { useModulePermissions } from "@/hooks/use-permissions";
import { apiFetch } from "@/lib/api";
import { useAppStore } from "@/store/use-app-store";

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

  // Initializing state from localStorage to avoid skeletons on revisit
  const [teachers, setTeachers] = useState<TeacherInfo[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`teachers_cache_${currentTenantId}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [loading, setLoading] = useState(teachers.length === 0);
  const [search, setSearch] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherInfo | null>(
    null,
  );
  const [formData, setFormData] = useState(emptyFormData);
  const [submitting, setSubmitting] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTeachers = useCallback(async (showSkeleton = false) => {
    try {
      if (showSkeleton) setLoading(true);
      const res = await apiFetch("/api/teachers");
      if (!res.ok) throw new Error("Failed to fetch teachers");
      const json = await res.json();
      setTeachers(json);
      // Cache the result for next time
      if (typeof window !== "undefined" && currentTenantId) {
        localStorage.setItem(`teachers_cache_${currentTenantId}`, JSON.stringify(json));
      }
    } catch (err) {
      console.error("Error fetching teachers:", err);
      // Don't show toast on initial background load to avoid noise
    } finally {
      setLoading(false);
    }
  }, [currentTenantId]);

  // Initial load when tenant is ready
  useEffect(() => {
    if (currentTenantId) {
        // If we have cached items, fetch silently in background
        // If no cached items, show skeleton
        fetchTeachers(teachers.length === 0);
    }
  }, [currentTenantId, fetchTeachers]);

  const filtered = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      (t.subjects && t.subjects.some((s) => s.toLowerCase().includes(search.toLowerCase()))),
  );

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
    toast.promise(
      (async () => {
        setSubmitting(true);
        try {
          const isEdit = !!editingTeacher;
          const url = "/api/teachers";
          const method = isEdit ? "PUT" : "POST";
          const body = isEdit ? { id: editingTeacher.id, ...formData } : formData;

          const res = await apiFetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `Failed to ${isEdit ? "update" : "add"} teacher`);
          }
          
          setDialogOpen(false);
          setEditingTeacher(null);
          setFormData(emptyFormData);
          fetchTeachers();
          return isEdit ? "Teacher updated" : "Teacher added";
        } finally {
          setSubmitting(false);
        }
      })(),
      {
        loading: `${editingTeacher ? "Updating" : "Adding"} teacher...`,
        success: (msg) => msg,
        error: (err: any) => err.message || "Action failed",
      }
    );
  };

  const handleDelete = async (id: string) => {
    toast.promise(
      (async () => {
        const res = await apiFetch(`/api/teachers?id=${id}`, { method: "DELETE" });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Deletion failed");
        }
        setTeachers((prev) => prev.filter((t) => t.id !== id));
        setDeletingId(null);
        
        // We throw a "success" message to force a RED morphing pill for deletion
        throw new Error("Teacher record removed");
      })(),
      {
        loading: "Removing teacher record...",
        success: () => "", // Not reached
        error: (err: any) => err.message, // Shows the red pill
      }
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
            onChange={(e) => setSearch(e.target.value)}
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
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No teachers found</p>
            <p className="text-sm">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((teacher, index) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              index={index}
              canEdit={canEdit}
              canDelete={canDelete}
              deletingId={deletingId}
              setDeletingId={setDeletingId}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Showing count */}
      {!loading && filtered.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Showing {filtered.length} of {teachers.length} teachers
        </p>
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
