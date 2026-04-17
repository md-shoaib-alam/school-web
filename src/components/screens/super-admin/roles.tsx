"use client";

import { apiFetch } from "@/lib/api";
import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { goeyToast as toast } from "goey-toast";

// Sub-components
import { RoleHeader } from "./roles/RoleHeader";
import { RoleTemplates } from "./roles/RoleTemplates";
import { RoleGrid } from "./roles/RoleGrid";
import { RoleDialogs } from "./roles/RoleDialogs";

// Types
import { 
  PlatformRoleRecord, 
  AssignedUser, 
  AvailableUser, 
  ROLE_TEMPLATES 
} from "./roles/types";

export function SuperAdminRoles() {
  const [roles, setRoles] = useState<PlatformRoleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create/Edit Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<PlatformRoleRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#059669");
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});

  // User Assignment Dialog State
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assigningRole, setAssigningRole] = useState<PlatformRoleRecord | null>(null);
  const [assignedUsers, setAssignedUsers] = useState<AssignedUser[]>([]);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSaving, setAssignSaving] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  const fetchRoles = useCallback(async () => {
    try {
      const res = await apiFetch("/api/platform/roles");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRoles(data);
    } catch {
      toast.error("Failed to load platform roles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // ── Role CRUD handlers ──

  const openCreateDialog = (template?: (typeof ROLE_TEMPLATES)[0]) => {
    setEditingRole(null);
    if (template) {
      setName(template.name);
      setDescription(template.description);
      setColor(template.color);
      setPermissions({ ...template.permissions });
    } else {
      setName("");
      setDescription("");
      setColor("#059669");
      setPermissions({});
    }
    setDialogOpen(true);
  };

  const openEditDialog = (role: PlatformRoleRecord) => {
    setEditingRole(role);
    setName(role.name);
    setDescription(role.description || "");
    setColor(role.color);
    setPermissions(JSON.parse(role.permissions || "{}"));
    setDialogOpen(true);
  };

  const togglePermission = (module: string, action: string) => {
    setPermissions((prev) => {
      const current = prev[module] || [];
      const updated = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];
      return { ...prev, [module]: updated };
    });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Role name is required");
      return;
    }
    setSaving(true);
    try {
      const body = { id: editingRole?.id, name, description, color, permissions };
      const res = await apiFetch("/api/platform/roles", {
        method: editingRole ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to ${editingRole ? "update" : "create"} role`);
      }
      toast.success(`Platform role "${name}" ${editingRole ? "updated" : "created"} successfully`);
      setDialogOpen(false);
      fetchRoles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save role");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const usersRes = await apiFetch(`/api/platform/roles/users?roleId=${id}`);
      const usersData = await usersRes.json();
      if (Array.isArray(usersData) && usersData.length > 0) {
        toast.error(`Cannot delete: ${usersData.length} user(s) are assigned to this role.`);
        return;
      }

      const res = await apiFetch(`/api/platform/roles?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Deletion failed");
      toast.success("Platform role deleted successfully");
      fetchRoles();
    } catch {
      toast.error("Failed to delete role");
    }
  };

  // ── User Assignment handlers ──

  const openAssignDialog = async (role: PlatformRoleRecord) => {
    setAssigningRole(role);
    setAssignedUsers([]);
    setAvailableUsers([]);
    setUserSearch("");
    setAssignDialogOpen(true);
    setAssignLoading(true);

    try {
      const [assignedRes, availableRes] = await Promise.all([
        apiFetch(`/api/platform/roles/users?roleId=${role.id}`),
        apiFetch(`/api/platform/roles/available-users?excludeRoleId=${role.id}`),
      ]);
      if (!assignedRes.ok || !availableRes.ok) throw new Error();
      setAssignedUsers(await assignedRes.json());
      setAvailableUsers(await availableRes.json());
    } catch {
      toast.error("Failed to load users");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAssignAction = async (userId: string, action: "assign" | "unassign") => {
    if (!assigningRole) return;
    setAssignSaving(true);
    try {
      const res = await apiFetch("/api/platform/roles/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, roleId: assigningRole.id, action }),
      });
      if (!res.ok) throw new Error();

      if (action === "assign") {
        const user = availableUsers.find(u => u.id === userId);
        if (user) {
          setAvailableUsers(prev => prev.filter(u => u.id !== userId));
          setAssignedUsers(prev => [...prev, user]);
        }
      } else {
        const user = assignedUsers.find(u => u.id === userId);
        if (user) {
          setAssignedUsers(prev => prev.filter(u => u.id !== userId));
          setAvailableUsers(prev => [...prev, { ...user, platformRoleId: null }]);
        }
      }
      toast.success(`Role ${action}ed successfully`);
      fetchRoles();
    } catch {
      toast.error(`Failed to ${action} role`);
    } finally {
      setAssignSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
        <p className="text-sm font-bold text-muted-foreground animate-pulse">Syncing platform permissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RoleHeader onCreateRole={() => openCreateDialog()} />

      <RoleTemplates onSelectTemplate={(t) => openCreateDialog(t)} />

      <RoleGrid 
        roles={roles}
        onEdit={openEditDialog}
        onDelete={handleDelete}
        onAssignUsers={openAssignDialog}
      />

      <RoleDialogs 
        dialogOpen={dialogOpen} setDialogOpen={setDialogOpen}
        editingRole={editingRole}
        name={name} setName={setName}
        description={description} setDescription={setDescription}
        color={color} setColor={setColor}
        permissions={permissions} togglePermission={togglePermission}
        onSave={handleSave} saving={saving}

        assignDialogOpen={assignDialogOpen} setAssignDialogOpen={setAssignDialogOpen}
        assigningRole={assigningRole}
        assignedUsers={assignedUsers}
        availableUsers={availableUsers}
        assignLoading={assignLoading}
        assignSaving={assignSaving}
        userSearch={userSearch} setUserSearch={setUserSearch}
        onAssign={(uid) => handleAssignAction(uid, "assign")}
        onUnassign={(uid) => handleAssignAction(uid, "unassign")}
      />
    </div>
  );
}
