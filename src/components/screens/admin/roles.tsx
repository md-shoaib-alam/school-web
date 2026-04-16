"use client";


import { apiFetch } from "@/lib/api";
import { useState, useEffect, useCallback, Fragment, useMemo } from "react";
import { useGraphQLQuery, useGraphQLMutation, useAssignRoleToUser, useStaff, useCustomRoles, useCreateCustomRole, useUpdateCustomRole, useDeleteCustomRole } from "@/lib/graphql/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Pencil,
  Trash2,
  Shield,
  Users,
  Loader2,
  UserPlus,
  UserMinus,
  Search,
  X,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { useAppStore } from "@/store/use-app-store";

interface RoleRecord {
  id: string;
  name: string;
  description: string | null;
  color: string;
  permissions: string;
  userCount: number;
  createdAt: string;
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  customRoleId?: string | null;
  customRole?: { id: string; name: string; color: string } | null;
}

const PERMISSION_MODULES = [
  { key: "students", label: "Students", icon: "👨‍🎓" },
  { key: "teachers", label: "Teachers", icon: "👨‍🏫" },
  { key: "parents", label: "Parents", icon: "👨‍👦" },
  { key: "classes", label: "Classes", icon: "🏫" },
  { key: "subjects", label: "Subjects", icon: "📚" },
  { key: "attendance", label: "Attendance", icon: "📋" },
  { key: "fees", label: "Fees", icon: "💰" },
  { key: "grades", label: "Grades", icon: "📝" },
  { key: "notices", label: "Notices", icon: "📢" },
  { key: "timetable", label: "Timetable", icon: "📅" },
  { key: "calendar", label: "Calendar", icon: "📆" },
  { key: "reports", label: "Reports", icon: "📊" },
  { key: "subscriptions", label: "Subscriptions", icon: "💳" },
];

const PERMISSION_ACTIONS = ["view", "create", "edit", "delete"] as const;
const ACTION_LABELS: Record<string, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
};

const COLOR_PRESETS = [
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
];

// ... (rest of imports same)

// Using centralized hooks from @/lib/graphql/hooks

// Using standardized useAssignRoleToUser hook

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
      if (editingRole) {
        await updateRole({
          id: editingRole.id,
          name,
          description,
          color,
          permissions,
        });
        // Toast handled by hook

      } else {
        await createRole({
          tenantId: currentTenantId,
          name,
          description,
          color,
          permissions,
        });
        // Toast handled by hook

      }
      setDialogOpen(false);
      fetchRoles();
    } catch (err: any) {
      toast.error(err.message || "Failed to save role");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDelete = async (id: string) => {
    try {
      await deleteRole({ id });
      // Toast handled by hook

      fetchRoles();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete role");
    }
  };

  const totalPermissions = Object.values(permissions).flat().length;

  const filteredAvailable = availableUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="ml-3 text-gray-500 dark:text-gray-400">
          Loading roles...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Roles & Permissions
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create custom roles, assign them to staff, and control access
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" /> Create Role
        </Button>
      </div>

      {/* Roles Grid */}
      {roles.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
            <Shield className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-lg font-medium">No custom roles yet</p>
            <p className="text-sm mt-1">
              Create your first role to manage staff permissions
            </p>
            <Button
              onClick={openCreateDialog}
              variant="outline"
              className="mt-4 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            >
              <Plus className="h-4 w-4 mr-2" /> Create Role
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => {
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
            const permCount = Object.values(perms).flat().length;

            return (
              <Card key={role.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold"
                        style={{ backgroundColor: role.color }}
                      >
                        {role.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-base">{role.name}</CardTitle>
                        {role.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                            {role.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30"
                        onClick={() => openAssignDialog(role)}
                        title="Assign staff"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/30"
                        onClick={() => openEditDialog(role)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Role</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &quot;{role.name}
                              &quot;?{" "}
                              {role.userCount > 0
                                ? `${role.userCount} staff member(s) will lose this role.`
                                : "This action cannot be undone."}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleToggleDelete(role.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <button
                      onClick={() => openAssignDialog(role)}
                      className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      <Users className="h-3 w-3" />
                      <span>{role.userCount} staff</span>
                    </button>
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      <span>{permCount} permissions</span>
                    </div>
                  </div>
                  {permCount > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {Object.entries(perms).map(
                        ([mod, actions]) =>
                          Array.isArray(actions) &&
                          (actions as string[]).map((action: string) => (
                            <Badge
                              key={`${mod}-${action}`}
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0"
                              style={{
                                borderColor: role.color + "40",
                                backgroundColor: role.color + "10",
                                color: role.color,
                              }}
                            >
                              {
                                PERMISSION_MODULES.find((m) => m.key === mod)
                                  ?.label
                              }{" "}
                              · {ACTION_LABELS[action]}
                            </Badge>
                          )),
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              {editingRole ? `Edit "${editingRole.name}"` : "Create New Role"}
            </DialogTitle>
            <DialogDescription>
              {editingRole
                ? "Update role details and permissions"
                : "Define a new role with specific permissions"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label>Role Name *</Label>
              <Input
                placeholder="e.g. Finance Manager"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of this role..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      borderColor: color === c ? c : "transparent",
                    }}
                    onClick={() => setColor(c)}
                  >
                    {color === c && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Permissions</Label>
                <Badge variant="outline" className="text-xs">
                  {totalPermissions} granted
                </Badge>
              </div>

              <div className="grid grid-cols-[1fr_repeat(4,_minmax(0,_1fr))] gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Module
                </div>
                {PERMISSION_ACTIONS.map((action) => (
                  <div
                    key={action}
                    className="bg-gray-100 dark:bg-gray-800 px-2 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 text-center"
                  >
                    {ACTION_LABELS[action]}
                  </div>
                ))}

                {PERMISSION_MODULES.map((mod, idx) => (
                  <Fragment key={mod.key}>
                    <div
                      className={`flex items-center gap-2 px-3 py-2.5 text-sm ${idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-900/50"}`}
                    >
                      <span className="mr-1">{mod.icon}</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {mod.label}
                      </span>
                    </div>
                    {PERMISSION_ACTIONS.map((action) => (
                      <div
                        key={action}
                        className={`flex items-center justify-center py-2.5 ${idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-900/50"}`}
                      >
                        <Checkbox
                          checked={(permissions[mod.key] || []).includes(
                            action,
                          )}
                          onCheckedChange={() =>
                            togglePermission(mod.key, action)
                          }
                        />
                      </div>
                    ))}
                  </Fragment>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    const all: Record<string, string[]> = {};
                    PERMISSION_MODULES.forEach((m) => {
                      all[m.key] = ["view", "create", "edit", "delete"];
                    });
                    setPermissions(all);
                  }}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    const viewOnly: Record<string, string[]> = {};
                    PERMISSION_MODULES.forEach((m) => {
                      viewOnly[m.key] = ["view"];
                    });
                    setPermissions(viewOnly);
                  }}
                >
                  View Only
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setPermissions({})}
                >
                  Clear All
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {editingRole ? "Update Role" : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Staff Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              Manage Staff — {activeRole?.name}
            </DialogTitle>
            <DialogDescription>
              Assign or remove this role from teachers and staff members
            </DialogDescription>
          </DialogHeader>

          {assignLoading ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            </div>
          ) : (
            <>
              {/* Assigned Users */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-500" />
                    Assigned Staff ({assignedUsers.length})
                  </h4>
                  {assignedUsers.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      No staff assigned yet. Add from the list below.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {assignedUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-3 p-3 rounded-lg border bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50"
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: activeRole?.color }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {user.email}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[10px] capitalize shrink-0"
                          >
                            {user.role}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                            onClick={() => handleAssignChange(user.id, null)}
                            disabled={assigningLoading === user.id}
                          >
                            {assigningLoading === user.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <UserMinus className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Available Users */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-blue-500" />
                    Available to Assign ({filteredAvailable.length})
                  </h4>
                  {/* Search */}
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                      placeholder="Search teachers & staff..."
                      className="pl-9 h-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <ScrollArea className="max-h-[200px]">
                    {filteredAvailable.length === 0 ? (
                      <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">
                        {searchQuery
                          ? "No users found matching your search."
                          : "All users already have a role assigned."}
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {filteredAvailable.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-bold shrink-0">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800 dark:text-gray-200 truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                {user.email}
                              </p>
                            </div>
                            {user.customRole && (
                              <Badge
                                variant="outline"
                                className="text-[10px] shrink-0 hidden sm:inline-flex"
                                style={{
                                  borderColor: user.customRole.color + "40",
                                  color: user.customRole.color,
                                }}
                              >
                                {user.customRole.name}
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className="text-[10px] capitalize shrink-0"
                            >
                              {user.role}
                            </Badge>
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                              onClick={() => handleAssignChange(user.id, activeRole?.id || null)}
                              disabled={assigningLoading === user.id}
                            >
                              {assigningLoading === user.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                              ) : (
                                <UserPlus className="h-3 w-3 mr-1" />
                              )}
                              Assign
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
