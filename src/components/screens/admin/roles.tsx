"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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
import { Plus, Shield, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { goeyToast as toast } from "goey-toast";
import { useAppStore } from "@/store/use-app-store";

// Sub-components
import { RoleCard } from "./roles/RoleCard";
import { RoleTable } from "./roles/RoleTable";
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

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Load view mode preference
  useEffect(() => {
    const saved = localStorage.getItem('roles_view_mode') as 'grid' | 'table';
    if (saved) setViewMode(saved);
  }, []);

  // Save view mode preference
  const toggleView = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    localStorage.setItem('roles_view_mode', mode);
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Roles & Permissions</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create custom roles and control staff access
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-3 gap-2",
                viewMode === 'grid' && "bg-white dark:bg-gray-700 shadow-sm text-emerald-600"
              )}
              onClick={() => toggleView('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Grid</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-3 gap-2",
                viewMode === 'table' && "bg-white dark:bg-gray-700 shadow-sm text-emerald-600"
              )}
              onClick={() => toggleView('table')}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Table</span>
            </Button>
          </div>

          <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="h-4 w-4 mr-2" /> Create Role
          </Button>
        </div>
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
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role: RoleRecord) => {
            const count = allStaff.filter(u => u.customRole?.id === role.id).length;
            return (
              <RoleCard
                key={role.id}
                role={{ ...role, userCount: count }}
                onEdit={openEditDialog}
                onAssign={openAssignDialog}
                onDelete={handleDeleteRole}
              />
            );
          })}
        </div>
      ) : (
        <RoleTable 
          roles={roles.map(role => ({
            ...role,
            userCount: allStaff.filter(u => u.customRole?.id === role.id).length
          }))}
          onEdit={openEditDialog}
          onAssign={openAssignDialog}
          onDelete={handleDeleteRole}
        />
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
