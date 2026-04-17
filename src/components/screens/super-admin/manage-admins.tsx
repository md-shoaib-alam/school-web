"use client";

import { apiFetch } from "@/lib/api";
import { useState, useEffect, useCallback, useMemo } from "react";
import { goeyToast as toast } from "goey-toast";

// Sub-components
import { AdminHeader } from "./manage-admins/AdminHeader";
import { AdminTable } from "./manage-admins/AdminTable";
import { AdminDialogs } from "./manage-admins/AdminDialogs";
import { AdminRecord, AdminFormData, emptyFormData } from "./manage-admins/types";

export function SuperAdminManage() {
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminRecord | null>(null);
  const [formData, setFormData] = useState<AdminFormData>(emptyFormData);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Root admin is the first one in the list (ordered by createdAt asc)
  const rootAdminId = admins.length > 0 ? admins[0].id : null;

  // --- Fetch ---
  const fetchAdmins = useCallback(async () => {
    try {
      const res = await apiFetch("/api/super-admins?type=admins");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setAdmins(json);
    } catch {
      console.error("Error fetching super admins");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // --- Filtering ---
  const filtered = useMemo(() => {
    return admins.filter(
      (a) =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase()),
    );
  }, [admins, search]);

  // --- Handlers ---
  const handleOpenAdd = () => {
    setEditingAdmin(null);
    setFormData(emptyFormData);
    setShowPassword(false);
    setDialogOpen(true);
  };

  const handleOpenEdit = (admin: AdminRecord) => {
    if (admin.id === rootAdminId) {
      toast.error("Cannot edit the root platform owner");
      return;
    }
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: "",
      isActive: admin.isActive,
    });
    setShowPassword(false);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const isEdit = !!editingAdmin;
      const method = isEdit ? "PUT" : "POST";

      const body = isEdit
        ? {
            id: editingAdmin.id,
            name: formData.name,
            ...(formData.password ? { password: formData.password } : {}),
            isActive: formData.isActive,
          }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
          };

      const res = await apiFetch("/api/super-admins", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || `Failed to ${isEdit ? "update" : "create"} super admin`);
      }

      toast.success(`Super admin ${isEdit ? "updated" : "created"} successfully`);
      setDialogOpen(false);
      fetchAdmins();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await apiFetch(`/api/super-admins?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Failed to delete");
      }
      toast.success("Super admin deleted successfully");
      setAdmins((prev) => prev.filter((a) => a.id !== id));
      setDeletingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const isFormValid = formData.name.trim() !== "" &&
    (!editingAdmin
      ? formData.email.trim() !== "" && formData.password.trim().length >= 6
      : true);

  return (
    <div className="space-y-6">
      <AdminHeader 
        search={search}
        onSearchChange={setSearch}
        onAddClick={handleOpenAdd}
      />

      <AdminTable 
        admins={admins}
        filteredAdmins={filtered}
        loading={loading}
        rootAdminId={rootAdminId}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        deletingId={deletingId}
        setDeletingId={setDeletingId}
      />

      <AdminDialogs 
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingAdmin(null);
            setFormData(emptyFormData);
            setShowPassword(false);
          }
        }}
        editingAdmin={editingAdmin}
        formData={formData}
        setFormData={setFormData}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        onSubmit={handleSubmit}
        submitting={submitting}
        isFormValid={isFormValid}
      />
    </div>
  );
}
