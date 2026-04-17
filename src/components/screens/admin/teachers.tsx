"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users, RotateCcw } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { apiFetch } from "@/lib/api";
import { useModulePermissions } from "@/hooks/use-permissions";
import { useAppStore } from "@/store/use-app-store";

// Sub-components
import { TeacherCard } from "./teachers/TeacherCard";
import { TeacherDialog } from "./teachers/TeacherDialog";
import { TeacherSkeleton } from "./teachers/TeacherSkeleton";

// Types
import type { TeacherInfo, TeacherFormData } from "./teachers/types";

const emptyFormData: TeacherFormData = {
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

  // Data states
  const [teachers, setTeachers] = useState<TeacherInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherInfo | null>(null);
  const [formData, setFormData] = useState<TeacherFormData>(emptyFormData);
  const [submitting, setSubmitting] = useState(false);

  const fetchTeachers = useCallback(async (showSkeleton = true) => {
    if (!currentTenantId) return;
    if (showSkeleton) setLoading(true);
    try {
      const res = await apiFetch(`/api/teachers?tenantId=${currentTenantId}`);
      if (res.ok) {
        const data = await res.json();
        setTeachers(data || []);
      }
    } catch (err) {
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  }, [currentTenantId]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // --- Handlers ---

  const handleOpenCreate = () => {
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

    setSubmitting(true);
    try {
      const url = "/api/teachers";
      const method = editingTeacher ? "PUT" : "POST";
      const payload = {
        ...formData,
        tenantId: currentTenantId,
        id: editingTeacher?.id,
      };

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingTeacher ? "Teacher updated successfully" : "Teacher added successfully");
        setDialogOpen(false);
        fetchTeachers(false);
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to save teacher");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await apiFetch(`/api/teachers?id=${id}&tenantId=${currentTenantId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Teacher deleted successfully");
        fetchTeachers(false);
      } else {
        toast.error("Failed to delete teacher");
      }
    } catch (err) {
      toast.error("An error occurred during deletion");
    }
  };

  // --- Derived ---
  const filtered = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.subjects?.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Teachers</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage school faculty and teaching staff
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchTeachers(true)}
            title="Refresh"
            className="h-10 w-10"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          {canCreate && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              onClick={handleOpenCreate}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Teacher
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name, email or subject..."
          className="pl-9 h-11 bg-white dark:bg-gray-900 border-none shadow-sm focus-visible:ring-emerald-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Content */}
      {loading ? (
        <TeacherSkeleton />
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
          <Users className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">No teachers found</p>
          <p className="text-sm text-gray-500 mt-1">
            {search ? "Try adjusting your search query." : "Start by adding your first teacher."}
          </p>
          {!search && canCreate && (
            <Button
              variant="outline"
              className="mt-4 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              onClick={handleOpenCreate}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Teacher
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((teacher, index) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              index={index}
              canEdit={canEdit}
              canDelete={canDelete}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Showing {filtered.length} of {teachers.length} teachers
        </p>
      )}

      <TeacherDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingTeacher={editingTeacher}
        formData={formData}
        setFormData={setFormData}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
