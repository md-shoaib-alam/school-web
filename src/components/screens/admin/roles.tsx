"use client";

import { useReducer, useMemo, useCallback, useEffect } from "react";
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

type State = {
  viewMode: 'grid' | 'table';
  dialogOpen: boolean;
  editingRole: RoleRecord | null;
  saving: boolean;
  assignOpen: boolean;
  activeRole: RoleRecord | null;
  assigningLoading: string | null;
  searchQuery: string;
  name: string;
  description: string;
  color: string;
  permissions: Record<string, string[]>;
};

type Action =
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'table' }
  | { type: 'SET_DIALOG_OPEN'; payload: boolean }
  | { type: 'OPEN_CREATE_DIALOG' }
  | { type: 'OPEN_EDIT_DIALOG'; payload: RoleRecord }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'OPEN_ASSIGN_DIALOG'; payload: RoleRecord }
  | { type: 'SET_ASSIGN_OPEN'; payload: boolean }
  | { type: 'SET_ASSIGNING_LOADING'; payload: string | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FORM'; payload: Partial<Pick<State, 'name' | 'description' | 'color' | 'permissions'>> };

const initialState: State = {
  viewMode: 'grid',
  dialogOpen: false,
  editingRole: null,
  saving: false,
  assignOpen: false,
  activeRole: null,
  assigningLoading: null,
  searchQuery: "",
  name: "",
  description: "",
  color: "#6366f1",
  permissions: {},
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_VIEW_MODE': return { ...state, viewMode: action.payload };
    case 'SET_DIALOG_OPEN': return { ...state, dialogOpen: action.payload };
    case 'OPEN_CREATE_DIALOG':
      return {
        ...state,
        editingRole: null,
        name: "",
        description: "",
        color: "#6366f1",
        permissions: {},
        dialogOpen: true
      };
    case 'OPEN_EDIT_DIALOG': {
      const role = action.payload;
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
      return {
        ...state,
        editingRole: role,
        name: role.name,
        description: role.description || "",
        color: role.color || "#6366f1",
        permissions: perms,
        dialogOpen: true
      };
    }
    case 'SET_SAVING': return { ...state, saving: action.payload };
    case 'OPEN_ASSIGN_DIALOG':
      return { ...state, activeRole: action.payload, assignOpen: true, searchQuery: "" };
    case 'SET_ASSIGN_OPEN': return { ...state, assignOpen: action.payload };
    case 'SET_ASSIGNING_LOADING': return { ...state, assigningLoading: action.payload };
    case 'SET_SEARCH_QUERY': return { ...state, searchQuery: action.payload };
    case 'SET_FORM': return { ...state, ...action.payload };
    default: return state;
  }
}

export function AdminRoles() {
  const { currentTenantId } = useAppStore();
  
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    viewMode, dialogOpen, editingRole, saving, assignOpen, activeRole,
    assigningLoading, searchQuery, name, description, color, permissions
  } = state;

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

  // Load view mode preference
  useEffect(() => {
    const saved = localStorage.getItem('roles_view_mode') as 'grid' | 'table';
    if (saved) dispatch({ type: 'SET_VIEW_MODE', payload: saved });
  }, []);

  // Save view mode preference
  const toggleView = (mode: 'grid' | 'table') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
    localStorage.setItem('roles_view_mode', mode);
  };

  // Computed lists for assignment
  const { assignedUsers, availableUsers } = useMemo(() => {
    if (!activeRole) return { assignedUsers: [], availableUsers: [] };
    const assigned = allStaff.filter(u => u.customRole?.id === activeRole.id);
    const available = allStaff.filter(u => u.customRole?.id !== activeRole.id);
    return { assignedUsers: assigned, availableUsers: available };
  }, [allStaff, activeRole]);

  // --- Handlers ---
  const handleAssignChange = async (userId: string, targetRoleId: string | null) => {
    if (!currentTenantId) return;
    dispatch({ type: 'SET_ASSIGNING_LOADING', payload: userId });
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
      dispatch({ type: 'SET_ASSIGNING_LOADING', payload: null });
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Role name is required");
      return;
    }
    dispatch({ type: 'SET_SAVING', payload: true });
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
      dispatch({ type: 'SET_DIALOG_OPEN', payload: false });
      fetchRoles();
    } catch (err: any) {
      toast.error(err.message || "Failed to save role");
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
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
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Roles & Permissions</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Create custom roles and control staff access
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-3 gap-2",
                viewMode === 'grid' && "bg-white dark:bg-zinc-700 shadow-sm text-emerald-600"
              )}
              onClick={() => toggleView('grid')}
            >
              <LayoutGrid className="size-4" />
              <span className="hidden sm:inline">Grid</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-3 gap-2",
                viewMode === 'table' && "bg-white dark:bg-zinc-700 shadow-sm text-emerald-600"
              )}
              onClick={() => toggleView('table')}
            >
              <List className="size-4" />
              <span className="hidden sm:inline">Table</span>
            </Button>
          </div>

          <Button onClick={() => dispatch({ type: 'OPEN_CREATE_DIALOG' })} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="size-4 mr-2" /> Create Role
          </Button>
        </div>
      </div>

      {roles.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-400">
            <Shield className="size-12 mb-3 opacity-40" />
            <p className="text-lg font-medium">No custom roles yet</p>
            <Button onClick={() => dispatch({ type: 'OPEN_CREATE_DIALOG' })} variant="outline" className="mt-4">
              <Plus className="size-4 mr-2" /> Create Role
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
                onEdit={(r) => dispatch({ type: 'OPEN_EDIT_DIALOG', payload: r })}
                onAssign={(r) => dispatch({ type: 'OPEN_ASSIGN_DIALOG', payload: r })}
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
          onEdit={(r) => dispatch({ type: 'OPEN_EDIT_DIALOG', payload: r })}
          onAssign={(r) => dispatch({ type: 'OPEN_ASSIGN_DIALOG', payload: r })}
          onDelete={handleDeleteRole}
        />
      )}

      <RoleDialog
        open={dialogOpen}
        onOpenChange={(v) => dispatch({ type: 'SET_DIALOG_OPEN', payload: v })}
        editingRole={editingRole}
        name={name}
        setName={(v) => dispatch({ type: 'SET_FORM', payload: { name: v } })}
        description={description}
        setDescription={(v) => dispatch({ type: 'SET_FORM', payload: { description: v } })}
        color={color}
        setColor={(v) => dispatch({ type: 'SET_FORM', payload: { color: v } })}
        permissions={permissions}
        setPermissions={(v) => dispatch({ type: 'SET_FORM', payload: { permissions: v } })}
        saving={saving}
        onSave={handleSave}
      />

      <AssignRoleDialog
        open={assignOpen}
        onOpenChange={(v) => dispatch({ type: 'SET_ASSIGN_OPEN', payload: v })}
        activeRole={activeRole}
        loading={assignLoading}
        assignedUsers={assignedUsers}
        filteredAvailable={filteredAvailable}
        searchQuery={searchQuery}
        setSearchQuery={(v) => dispatch({ type: 'SET_SEARCH_QUERY', payload: v })}
        assigningLoading={assigningLoading}
        onAssignChange={handleAssignChange}
      />
    </div>
  );
}
