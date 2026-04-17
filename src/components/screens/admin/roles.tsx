"use client";

import { useState, useMemo, useCallback } from "react";
import { 
  useCustomRoles, 
  useStaff, 
  useCreateCustomRole, 
  useUpdateCustomRole, 
  useDeleteCustomRole, 
  useAssignRoleToUser 
} from "@/lib/graphql/hooks";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Shield } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { useAppStore } from "@/store/use-app-store";

// Sub-components
import { RoleCard } from "./roles/RoleCard";
import { RoleDialog } from "./roles/RoleDialog";
import { AssignRoleDialog } from "./roles/AssignRoleDialog";

// Types & Constants
import type { RoleRecord } from "./roles/types";
import { RoleSkeleton } from "./roles/RoleSkeleton";

export function AdminRoles() {
  const { currentTenantId } = useAppStore();
  
  // --- Queries ---
  const { 
    data: roles = [], 
    isLoading: loading, 
    refetch: fetchRoles 
  } = useCustomRoles(currentTenantId || "");

  const { 
    data: staffResponse, 
    refetch: refetchStaff,
    isLoading: assignLoading
  } = useStaff(currentTenantId || "", "staff");

  const allStaff = staffResponse?.staff || [];

  // --- Mutations ---
  const { mutateAsync: createRole } = useCreateCustomRole();
  const { mutateAsync: updateRole } = useUpdateCustomRole();
  const { mutateAsync: deleteRole } = useDeleteCustomRole();
  const { mutateAsync: assignRoleMut } = useAssignRoleToUser();

  // --- State ---
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleRecord | null>(null);
  const [saving, setSaving] = useState(false);

  // Assign dialog state
  const [assignOpen, setAssignOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<RoleRecord | null>(null);
  const [assigningLoading, setAssigningLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});

  // Computed lists for assignment
  const { assignedUsers, availableUsers } = useMemo(() => {
    if (!activeRole) return { assignedUsers: [], availableUsers: [] };
    const assigned = allStaff.filter(u => u.customRole?.id === activeRole.id);
    const available = allStaff.filter(u => u.customRole?.id !== activeRole.id);
    return { assignedUsers: assigned, availableUsers: available };
  }, [allStaff, activeRole]);

  // --- Handlers ---
  const openCreateDialog = () => {
    setEditingRole(null);
    setName("");
    setDescription("");
    setColor("#6366f1");
    setPermissions({});
    setDialogOpen(true);
  };

  const openEditDialog = (role: RoleRecord) => {
    setEditingRole(role);
    setName(role.name);
    setDescription(role.description || "");
    setColor(role.color || "#6366f1");
    
    let perms = {};
    if (typeof role.permissions === 'string') {
      try {
        if (role.permissions !== "[object Object]") {
          perms = JSON.parse(role.permissions || "{}");
        }
      } catch (e) {
        console.error("Malformed permissions JSON:", e);
      }
    } else {
      perms = role.permissions || {};
    }
    setPermissions(perms);
    setDialogOpen(true);
  };

  const openAssignDialog = (role: RoleRecord) => {
    setActiveRole(role);
    setAssignOpen(true);
    setSearchQuery("");
  };

  const handleAssignChange = async (userId: string, targetRoleId: string | null) => {
    if (!currentTenantId) return;
    setAssigningLoading(userId);
    try {
      await assignRoleMut({
        userId,
        roleId: targetRoleId,
        tenantId: currentTenantId,
      });
      refetchStaff();
      fetchRoles();
    } catch (err: any) {
      toast.error(err.message || "Assignment failed");
    } finally {
      setAssigningLoading(null);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Role name is required");
      return;
    }
    setSaving(true);
    try {
      if (editingRole) {
        await updateRole({
          id: editingRole.id,
          name,
          description,
          color,
          permissions,
        });
      } else {
        await createRole({
          tenantId: currentTenantId!,
          name,
          description,
          color,
          permissions,
        });
      }
      setDialogOpen(false);
      fetchRoles();
    } catch (err: any) {
      toast.error(err.message || "Failed to save role");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (id: string) => {
    try {
      await deleteRole(id);
      fetchRoles();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete role");
    }
  };

  const filteredAvailable = availableUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // --- Rendering ---
  if (loading) {
    return <RoleSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Roles & Permissions</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create custom roles and control staff access
          </p>
        </div>
        <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> Create Role
        </Button>
      </div>

      {roles.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Shield className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-lg font-medium">No custom roles yet</p>
            <Button onClick={openCreateDialog} variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-2" /> Create Role
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role: RoleRecord) => (
            <RoleCard
              key={role.id}
              role={role}
              onEdit={openEditDialog}
              onAssign={openAssignDialog}
              onDelete={handleDeleteRole}
            />
          ))}
        </div>
      )}

      <RoleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingRole={editingRole}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        color={color}
        setColor={setColor}
        permissions={permissions}
        setPermissions={setPermissions}
        saving={saving}
        onSave={handleSave}
      />

      <AssignRoleDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        activeRole={activeRole}
        loading={assignLoading}
        assignedUsers={assignedUsers}
        filteredAvailable={filteredAvailable}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        assigningLoading={assigningLoading}
        onAssignChange={handleAssignChange}
      />
    </div>
  );
}
