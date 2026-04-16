"use client";


import { apiFetch } from "@/lib/api";
import { useState, useEffect, useCallback, Fragment } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  Plus,
  Pencil,
  Trash2,
  Shield,
  Loader2,
  Building2,
  Users,
  Receipt,
  ScrollText,
  PieChart,
  Blocks,
  Settings,
  Globe,
  Server,
  Lock,
  Eye,
  UserPlus,
  UserMinus,
  Search,
  X,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";

// ── Types ──

interface PlatformRoleRecord {
  id: string;
  name: string;
  description: string | null;
  color: string;
  permissions: string;
  createdAt: string;
  updatedAt: string;
  _count?: { users: number };
}

interface AssignedUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isActive: boolean;
}

interface AvailableUser extends AssignedUser {
  platformRoleId: string | null;
}

// ── Constants ──

const PLATFORM_MODULES = [
  {
    key: "tenants",
    label: "Schools / Tenants",
    icon: <Building2 className="h-4 w-4" />,
  },
  { key: "users", label: "All Users", icon: <Users className="h-4 w-4" /> },
  {
    key: "billing",
    label: "Billing & Revenue",
    icon: <Receipt className="h-4 w-4" />,
  },
  {
    key: "audit-logs",
    label: "Audit Logs",
    icon: <ScrollText className="h-4 w-4" />,
  },
  {
    key: "analytics",
    label: "Analytics",
    icon: <PieChart className="h-4 w-4" />,
  },
  {
    key: "feature-flags",
    label: "Feature Flags",
    icon: <Blocks className="h-4 w-4" />,
  },
  {
    key: "settings",
    label: "Settings",
    icon: <Settings className="h-4 w-4" />,
  },
  {
    key: "api",
    label: "API & Integrations",
    icon: <Globe className="h-4 w-4" />,
  },
  { key: "security", label: "Security", icon: <Lock className="h-4 w-4" /> },
  {
    key: "reports",
    label: "Reports & Export",
    icon: <Eye className="h-4 w-4" />,
  },
  {
    key: "support",
    label: "Support Tickets",
    icon: <Server className="h-4 w-4" />,
  },
];

const PERMISSION_ACTIONS = ["view", "create", "edit", "delete"] as const;
const ACTION_LABELS: Record<string, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
};

const COLOR_PRESETS = [
  "#059669",
  "#10b981",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#6366f1",
  "#84cc16",
];

const ROLE_TEMPLATES = [
  {
    name: "Support Agent",
    description: "Handle support tickets and view tenant data",
    color: "#06b6d4",
    permissions: {
      tenants: ["view"],
      users: ["view"],
      billing: ["view"],
      "audit-logs": ["view"],
      analytics: ["view"],
      support: ["view", "create", "edit"],
    },
  },
  {
    name: "Billing Manager",
    description: "Manage billing, invoices, and subscription plans",
    color: "#f59e0b",
    permissions: {
      billing: ["view", "create", "edit", "delete"],
      tenants: ["view"],
      users: ["view"],
      analytics: ["view"],
      reports: ["view", "create"],
    },
  },
  {
    name: "Content Moderator",
    description: "Manage platform content and feature flags",
    color: "#8b5cf6",
    permissions: {
      tenants: ["view"],
      "feature-flags": ["view", "edit"],
      settings: ["view"],
      api: ["view"],
    },
  },
  {
    name: "Security Analyst",
    description: "Monitor security, audit logs, and user activity",
    color: "#ef4444",
    permissions: {
      "audit-logs": ["view", "create"],
      users: ["view", "edit"],
      security: ["view", "edit"],
      settings: ["view"],
      reports: ["view", "create", "edit"],
    },
  },
  {
    name: "Read-Only Viewer",
    description: "View-only access to all platform data",
    color: "#64748b",
    permissions: Object.fromEntries(
      PLATFORM_MODULES.map((m) => [m.key, ["view"]]),
    ),
  },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ── Component ──

export function SuperAdminRoles() {
  const [roles, setRoles] = useState<PlatformRoleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<PlatformRoleRecord | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#059669");
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});

  // User assignment dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assigningRole, setAssigningRole] = useState<PlatformRoleRecord | null>(
    null,
  );
  const [assignedUsers, setAssignedUsers] = useState<AssignedUser[]>([]);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSaving, setAssignSaving] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  // Fetch roles
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
      if (editingRole) {
        const res = await apiFetch("/api/platform/roles", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingRole.id,
            name,
            description,
            color,
            permissions,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to update role");
        }
        toast.success(`Platform role "${name}" updated successfully`);
      } else {
        const res = await apiFetch("/api/platform/roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description, color, permissions }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to create role");
        }
        toast.success(`Platform role "${name}" created successfully`);
      }
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
      // Check if users are assigned
      const usersRes = await apiFetch(`/api/platform/roles/users?roleId=${id}`);
      const usersData = await usersRes.json();
      if (Array.isArray(usersData) && usersData.length > 0) {
        toast.error(
          `Cannot delete: ${usersData.length} user(s) are assigned to this role. Unassign them first.`,
        );
        return;
      }

      const res = await apiFetch(`/api/platform/roles?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete role");
      }
      toast.success("Platform role deleted successfully");
      fetchRoles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete role");
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

      if (!assignedRes.ok || !availableRes.ok)
        throw new Error("Failed to load users");

      const assignedData = await assignedRes.json();
      const availableData = await availableRes.json();

      setAssignedUsers(Array.isArray(assignedData) ? assignedData : []);
      setAvailableUsers(Array.isArray(availableData) ? availableData : []);
    } catch {
      toast.error("Failed to load users for assignment");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAssignUser = async (userId: string) => {
    if (!assigningRole) return;
    setAssignSaving(true);
    try {
      const res = await apiFetch("/api/platform/roles/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          roleId: assigningRole.id,
          action: "assign",
        }),
      });
      if (!res.ok) throw new Error("Failed to assign role");

      // Move user from available to assigned
      const user = availableUsers.find((u) => u.id === userId);
      if (user) {
        setAvailableUsers((prev) => prev.filter((u) => u.id !== userId));
        setAssignedUsers((prev) => [...prev, user]);
      }

      toast.success("Role assigned successfully");
      fetchRoles();
    } catch {
      toast.error("Failed to assign role");
    } finally {
      setAssignSaving(false);
    }
  };

  const handleUnassignUser = async (userId: string) => {
    if (!assigningRole) return;
    setAssignSaving(true);
    try {
      const res = await apiFetch("/api/platform/roles/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          roleId: assigningRole.id,
          action: "unassign",
        }),
      });
      if (!res.ok) throw new Error("Failed to unassign role");

      // Move user from assigned to available
      const user = assignedUsers.find((u) => u.id === userId);
      if (user) {
        setAssignedUsers((prev) => prev.filter((u) => u.id !== userId));
        setAvailableUsers((prev) => [
          ...prev,
          { ...user, platformRoleId: null },
        ]);
      }

      toast.success("Role unassigned successfully");
      fetchRoles();
    } catch {
      toast.error("Failed to unassign role");
    } finally {
      setAssignSaving(false);
    }
  };

  const filteredAvailable = availableUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()),
  );

  const totalPermissions = Object.values(permissions).flat().length;

  // ── Render ──

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        <span className="ml-3 text-gray-500 dark:text-gray-400">
          Loading platform roles...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-950 via-teal-900 to-teal-800 p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-teal-600/10 rounded-full translate-y-1/2" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Shield className="h-7 w-7 text-teal-200" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Platform Roles & Permissions
              </h2>
              <p className="text-teal-200 text-sm mt-0.5">
                Define granular access control and assign roles to platform
                staff
              </p>
            </div>
          </div>
          <Button
            onClick={() => openCreateDialog()}
            className="bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-sm"
          >
            <Plus className="h-4 w-4 mr-2" /> Create Role
          </Button>
        </div>
      </div>

      {/* Quick Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Blocks className="h-4 w-4 text-teal-500" />
            Role Templates
          </CardTitle>
          <CardDescription>
            Pre-configured roles — click to create instantly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {ROLE_TEMPLATES.map((template) => {
              const permCount = Object.values(template.permissions).flat()
                .length;
              return (
                <button
                  key={template.name}
                  onClick={() => openCreateDialog(template)}
                  className="flex flex-col gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-all text-left group"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: template.color }}
                    >
                      {template.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                      {template.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                    {template.description}
                  </p>
                  <Badge variant="outline" className="text-[10px] w-fit">
                    {permCount} permissions
                  </Badge>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Roles Grid */}
      {roles.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
            <Shield className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-lg font-medium">No platform roles yet</p>
            <p className="text-sm mt-1">
              Create your first role or use a template above
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => {
            const perms = JSON.parse(role.permissions || "{}");
            const permCount = Object.values(perms).flat().length;
            const moduleCount = Object.keys(perms).filter(
              (k) => (perms[k] || []).length > 0,
            ).length;
            const userCount = role._count?.users ?? 0;

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
                        className="h-8 w-8 hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-900/30"
                        onClick={() => openAssignDialog(role)}
                        title="Assign Users"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-900/30"
                        onClick={() => openEditDialog(role)}
                        title="Edit Role"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                            title="Delete Role"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Platform Role
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &quot;{role.name}
                              &quot;?{" "}
                              {userCount > 0
                                ? `${userCount} user(s) are currently assigned to this role. Unassign them first.`
                                : "This action cannot be undone."}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDelete(role.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      <span>{permCount} permissions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Blocks className="h-3 w-3" />
                      <span>{moduleCount} modules</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>
                        {userCount} user{userCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* Permission badges */}
                  {permCount > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(perms).map(([mod, actions]) =>
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
                            {PLATFORM_MODULES.find((m) => m.key === mod)
                              ?.label || mod}{" "}
                            · {ACTION_LABELS[action]}
                          </Badge>
                        )),
                      )}
                    </div>
                  )}

                  {/* Assigned Users Avatars */}
                  {userCount > 0 && (
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                      <button
                        className="flex items-center gap-2 text-xs text-teal-600 dark:text-teal-400 hover:underline w-full text-left"
                        onClick={() => openAssignDialog(role)}
                      >
                        <Users className="h-3 w-3" />
                        View & manage {userCount} assigned user
                        {userCount !== 1 ? "s" : ""}
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Role Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-teal-600" />
              {editingRole
                ? `Edit "${editingRole.name}"`
                : "Create New Platform Role"}
            </DialogTitle>
            <DialogDescription>
              {editingRole
                ? "Update platform role details and permissions"
                : "Define a new role with platform-level permissions"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Name */}
            <div className="space-y-2">
              <Label>Role Name *</Label>
              <Input
                placeholder="e.g. Support Agent"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of this role..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Color */}
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

            {/* Permission Matrix */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Permissions</Label>
                <Badge variant="outline" className="text-xs">
                  {totalPermissions} granted
                </Badge>
              </div>

              {/* Header Row */}
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

                {PLATFORM_MODULES.map((mod, idx) => (
                  <Fragment key={mod.key}>
                    <div
                      className={`flex items-center gap-2 px-3 py-2.5 text-sm ${idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-900/50"}`}
                    >
                      <span className="shrink-0 text-gray-500 dark:text-gray-400">
                        {mod.icon}
                      </span>
                      <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
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

              {/* Quick actions */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    const all: Record<string, string[]> = {};
                    PLATFORM_MODULES.forEach((m) => {
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
                    PLATFORM_MODULES.forEach((m) => {
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
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {editingRole ? "Update Role" : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Users Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-teal-600" />
              Assign Users to &quot;{assigningRole?.name}&quot;
            </DialogTitle>
            <DialogDescription>
              Add or remove super admins from this role. Changes take effect
              immediately.
            </DialogDescription>
          </DialogHeader>

          {assignLoading ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                Loading users...
              </span>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-4 -mx-1 px-1">
              {/* Currently Assigned */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-semibold flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-teal-500" />
                    Assigned Users ({assignedUsers.length})
                  </Label>
                </div>
                {assignedUsers.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-4 text-center">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      No users assigned to this role yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {assignedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/40"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="bg-teal-500 text-white text-xs">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                          disabled={assignSaving}
                          onClick={() => handleUnassignUser(user.id)}
                          title="Remove from role"
                        >
                          {assignSaving ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <X className="h-3.5 w-3.5" />
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
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-semibold flex items-center gap-1.5">
                    <UserPlus className="h-3.5 w-3.5 text-emerald-500" />
                    Available Users ({availableUsers.length})
                  </Label>
                </div>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    className="pl-9 h-8 text-xs"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
                {filteredAvailable.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-4 text-center">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {availableUsers.length === 0
                        ? "All super admins are already assigned"
                        : "No users match your search"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {filteredAvailable.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {user.email}
                            </p>
                          </div>
                          {user.platformRoleId && (
                            <Badge
                              variant="outline"
                              className="text-[10px] shrink-0 text-amber-600 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30"
                            >
                              Has role
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs shrink-0 text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:border-emerald-700 dark:hover:bg-emerald-900/30 dark:text-emerald-400"
                          disabled={assignSaving}
                          onClick={() => handleAssignUser(user.id)}
                        >
                          {assignSaving ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <Plus className="h-3 w-3 mr-1" />
                          )}
                          Assign
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="mt-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
