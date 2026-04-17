"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Plus, Search, RotateCcw } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { apiFetch } from "@/lib/api";
import { useAppStore } from "@/store/use-app-store";

// Sub-components
import { ParentCard } from "./parents/ParentCard";
import { ParentDialog } from "./parents/ParentDialog";
import { ParentSkeleton } from "./parents/ParentSkeleton";

// Types
import type { ParentInfo, StudentInfo, ParentFormData } from "./parents/types";

const emptyFormData: ParentFormData = {
  name: "",
  email: "",
  phone: "",
  occupation: "",
  password: "",
};

export function AdminParents() {
  const { currentTenantId } = useAppStore();

  // Data states
  const [parents, setParents] = useState<ParentInfo[]>([]);
  const [allStudents, setAllStudents] = useState<StudentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<ParentInfo | null>(null);
  const [formData, setFormData] = useState<ParentFormData>(emptyFormData);
  const [submitting, setSubmitting] = useState(false);
  const [linking, setLinking] = useState(false);

  const fetchParents = useCallback(async (showSkeleton = true) => {
    if (!currentTenantId) return;
    if (showSkeleton) setLoading(true);
    try {
      const res = await apiFetch(`/api/parents?tenantId=${currentTenantId}`);
      if (res.ok) {
        const data = await res.json();
        setParents(data || []);
      }
    } catch (err) {
      toast.error("Failed to load parents");
    } finally {
      setLoading(false);
    }
  }, [currentTenantId]);

  const fetchAllStudents = useCallback(async () => {
    if (!currentTenantId) return;
    try {
      const res = await apiFetch(`/api/students?tenantId=${currentTenantId}&limit=1000`);
      if (res.ok) {
        const data = await res.json();
        setAllStudents(
          (data.items || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            rollNumber: s.rollNumber || "N/A",
            className: s.class ? `${s.class.name}-${s.class.section}` : "Unassigned",
            classId: s.classId,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch students for linking:", err);
    }
  }, [currentTenantId]);

  useEffect(() => {
    fetchParents();
    fetchAllStudents();
  }, [fetchParents, fetchAllStudents]);

  // --- Handlers ---

  const handleOpenCreate = () => {
    setEditingParent(null);
    setFormData(emptyFormData);
    setDialogOpen(true);
  };

  const handleOpenEdit = (parent: ParentInfo) => {
    setEditingParent(parent);
    setFormData({
      name: parent.name,
      email: parent.email,
      phone: parent.phone || "",
      occupation: parent.occupation || "",
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
      const url = "/api/parents";
      const method = editingParent ? "PUT" : "POST";
      const payload = {
        ...formData,
        tenantId: currentTenantId,
        id: editingParent?.id,
      };

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingParent ? "Profile updated" : "Account created");
        setDialogOpen(false);
        fetchParents(false);
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to save parent");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await apiFetch(`/api/parents?id=${id}&tenantId=${currentTenantId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Account deleted successfully");
        fetchParents(false);
      } else {
        toast.error("Failed to delete account");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleLinkChild = async (parentId: string, studentId: string) => {
    setLinking(true);
    try {
      const res = await apiFetch("/api/parents/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId, studentId, tenantId: currentTenantId }),
      });

      if (res.ok) {
        toast.success("Child linked successfully");
        fetchParents(false);
        // Update local editing parent to reflect change
        if (editingParent && editingParent.id === parentId) {
          const student = allStudents.find((s) => s.id === studentId);
          if (student) {
            setEditingParent({
              ...editingParent,
              children: [
                ...editingParent.children,
                {
                  id: student.id,
                  name: student.name,
                  email: "", // Not returned by link
                  rollNumber: student.rollNumber,
                  className: student.className,
                  classId: student.classId || "",
                  gender: "",
                },
              ],
            });
          }
        }
      } else {
        toast.error("Failed to link child");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLinking(false);
    }
  };

  const handleUnlinkChild = async (parentId: string, studentId: string) => {
    try {
      const res = await apiFetch("/api/parents/unlink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId, studentId, tenantId: currentTenantId }),
      });

      if (res.ok) {
        toast.success("Child unlinked successfully");
        fetchParents(false);
      } else {
        toast.error("Failed to unlink child");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  // --- Derived ---
  const filtered = parents.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.children.some((c) => c.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Parent Accounts</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage parent profiles and link them to students
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchParents(true)}
            className="h-10 w-10"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
            onClick={handleOpenCreate}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Parent
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by parent or child name..."
          className="pl-9 h-11 bg-white dark:bg-gray-900 border-none shadow-sm focus-visible:ring-amber-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Content */}
      {loading ? (
        <ParentSkeleton />
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
          <Heart className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">No parent accounts found</p>
          <p className="text-sm text-gray-500 mt-1">
            {search ? "Try adjusting your search query." : "Start by registering a parent."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((parent, index) => (
            <ParentCard
              key={parent.id}
              parent={parent}
              index={index}
              canEdit={true}
              canDelete={true}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onUnlink={handleUnlinkChild}
            />
          ))}
        </div>
      )}

      <ParentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingParent={editingParent}
        formData={formData}
        setFormData={setFormData}
        submitting={submitting}
        onSubmit={handleSubmit}
        allStudents={allStudents}
        onLinkChild={handleLinkChild}
        linking={linking}
      />
    </div>
  );
}
