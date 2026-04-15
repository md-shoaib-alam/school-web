"use client";


import { apiFetch } from "@/lib/api";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Phone,
  Mail,
  Shield,
  UserCircle,
  Eye,
  EyeOff,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/store/use-app-store";
import { hasPermission } from "@/lib/permissions";

// --- Types ---

interface PlatformRole {
  id: string;
  name: string;
  color: string;
  permissions: string;
}

interface StaffRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  platformRoleId: string | null;
  platformRole: Pick<PlatformRole, "id" | "name" | "color"> | null;
  createdAt: string;
}

interface StaffFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  platformRoleId: string;
  isActive: boolean;
}

const emptyFormData: StaffFormData = {
  name: "",
  email: "",
  password: "",
  phone: "",
  platformRoleId: "none",
  isActive: true,
};

// --- Helpers ---

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function roleBadgeStyle(color: string): React.CSSProperties {
  return {
    backgroundColor: `${color}18`,
    color: color,
    borderColor: `${color}40`,
    borderWidth: 1,
    borderStyle: "solid",
  };
}

function avatarStyle(color: string): React.CSSProperties {
  return { backgroundColor: color, color: "#fff" };
}

// --- Component ---

export function SuperAdminStaff() {
  const { currentUser } = useAppStore();
  // Data state
  const [staffList, setStaffList] = useState<StaffRecord[]>([]);
  const [roles, setRoles] = useState<PlatformRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffRecord | null>(null);
  const [formData, setFormData] = useState<StaffFormData>(emptyFormData);
  const [submitting, setSubmitting] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Permission checks
  const canCreate = hasPermission(currentUser, "staff", "create");
  const canEdit = hasPermission(currentUser, "staff", "edit");
  const canDelete = hasPermission(currentUser, "staff", "delete");

  // --- Fetch data ---

  const fetchStaff = useCallback(async () => {
    try {
      const res = await apiFetch("/api/super-admins?type=staff");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setStaffList(json);
    } catch {
      console.error("Error fetching staff");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await apiFetch("/api/platform/roles");
      if (res.ok) {
        const json = await res.json();
        setRoles(
          json.map((r: { id: string; name: string; color: string }) => ({
            id: r.id,
            name: r.name,
            color: r.color,
          })),
        );
      }
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchStaff();
    fetchRoles();
  }, [fetchStaff, fetchRoles]);

  // --- Filtering ---

  const filtered = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone && s.phone.toLowerCase().includes(search.toLowerCase())) ||
      (s.platformRole &&
        s.platformRole.name.toLowerCase().includes(search.toLowerCase())),
  );

  // --- Handlers ---

  const handleOpenAdd = () => {
    if (!canCreate) {
      toast.error("You don't have permission to create staff");
      return;
    }
    setEditingStaff(null);
    setFormData(emptyFormData);
    setShowPassword(false);
    setDialogOpen(true);
  };

  const handleOpenEdit = (member: StaffRecord) => {
    if (!canEdit) {
      toast.error("You don't have permission to edit staff");
      return;
    }
    setShowPassword(false);
    setEditingStaff(member);
    setFormData({
      name: member.name,
      email: member.email,
      password: "",
      phone: member.phone || "",
      platformRoleId: member.platformRoleId || "none",
      isActive: member.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const isEdit = !!editingStaff;

      if (isEdit) {
        const res = await apiFetch("/api/super-admins", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingStaff.id,
            name: formData.name,
            ...(formData.password ? { password: formData.password } : {}),
            phone: formData.phone,
            platformRoleId:
              formData.platformRoleId === "none"
                ? null
                : formData.platformRoleId,
            isActive: formData.isActive,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.error || "Failed to update staff");
        }
        toast.success("Staff member updated successfully");
      } else {
        const res = await apiFetch("/api/super-admins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone || null,
            platformRoleId:
              formData.platformRoleId === "none"
                ? null
                : formData.platformRoleId,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.error || "Failed to add staff");
        }
        toast.success("Staff member added successfully");
      }

      setDialogOpen(false);
      setEditingStaff(null);
      setFormData(emptyFormData);
      fetchStaff();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await apiFetch(`/api/super-admins?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Failed to delete staff");
      }
      toast.success("Staff member deleted successfully");
      setStaffList((prev) => prev.filter((s) => s.id !== id));
      setDeletingId(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete staff",
      );
    }
  };

  const isFormValid =
    formData.name.trim() !== "" &&
    (!editingStaff
      ? formData.email.trim() !== "" && formData.password.trim().length >= 6
      : true);

  // --- Render ---

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Staff Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create platform staff accounts with restricted role-based
            permissions
          </p>
        </div>
        <div className="flex gap-3 items-center w-full sm:w-auto">
          <div className="relative max-w-xs flex-1 sm:flex-none w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, phone..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {canCreate && (
            <Button
              className="bg-rose-600 hover:bg-rose-700 text-white shrink-0"
              onClick={handleOpenAdd}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-800/30 p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-rose-800 dark:text-rose-300">
              Platform Staff Accounts
            </p>
            <p className="text-rose-700/80 dark:text-rose-400/80 mt-0.5">
              Staff members have restricted access based on their assigned
              platform role. They can log in via the &quot;Email Login&quot;
              tab. The root platform owner is not shown here.
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium text-base">No staff members yet</p>
              <p className="text-sm mt-1">
                {staffList.length === 0
                  ? 'Click "Add Staff" to create your first staff member.'
                  : "No staff match your search criteria."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="min-w-[220px]">Name</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Email
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Phone
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Assigned Role
                    </TableHead>
                    <TableHead>Status</TableHead>
                    {(canEdit || canDelete) && (
                      <TableHead className="w-[100px] text-right">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((member) => {
                    const initials = getInitials(member.name);
                    const roleColor = member.platformRole?.color || "#6b7280";

                    return (
                      <TableRow
                        key={member.id}
                        className="hover:bg-rose-50/50 dark:hover:bg-rose-900/10 transition-colors"
                      >
                        {/* Name column */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 shrink-0 ring-2 ring-white dark:ring-gray-700 shadow-sm">
                              <AvatarFallback
                                className="text-xs font-bold"
                                style={avatarStyle(roleColor)}
                              >
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-sm truncate">
                                  {member.name}
                                </p>
                                {member.platformRole && (
                                  <span
                                    className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-tight"
                                    style={roleBadgeStyle(roleColor)}
                                  >
                                    {member.platformRole.name}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate sm:hidden">
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Email */}
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-sm truncate">
                              {member.email}
                            </span>
                          </div>
                        </TableCell>

                        {/* Phone */}
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-sm truncate">
                              {member.phone || "—"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Assigned Role */}
                        <TableCell className="hidden lg:table-cell">
                          {member.platformRole ? (
                            <Badge
                              variant="outline"
                              className="font-normal text-xs gap-1.5"
                              style={roleBadgeStyle(member.platformRole.color)}
                            >
                              <Shield className="h-3 w-3" />
                              {member.platformRole.name}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <UserCircle className="h-3.5 w-3.5" />
                              No Role
                            </span>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge
                            variant={
                              member.isActive ? "default" : "destructive"
                            }
                            className={
                              member.isActive
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30"
                            }
                          >
                            {member.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>

                        {/* Actions */}
                        {(canEdit || canDelete) && (
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {canEdit && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-rose-600"
                                  onClick={() => handleOpenEdit(member)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <AlertDialog
                                  open={deletingId === member.id}
                                  onOpenChange={(open) => {
                                    if (!open) setDeletingId(null);
                                  }}
                                >
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                      onClick={() => setDeletingId(member.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Staff Member
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete{" "}
                                        <strong>{member.name}</strong>? This
                                        action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel
                                        onClick={() => setDeletingId(null)}
                                      >
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                        onClick={() => handleDelete(member.id)}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Count footer */}
          {!loading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {filtered.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {staffList.length}
                </span>{" "}
                staff member{staffList.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Staff Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingStaff(null);
            setFormData(emptyFormData);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              {editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
            </DialogTitle>
            <DialogDescription>
              {editingStaff
                ? "Update staff details and role assignment below."
                : "Create a new platform staff account and assign a role."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Full Name */}
            <div className="grid gap-2">
              <Label htmlFor="sa-staff-name">Full Name</Label>
              <Input
                id="sa-staff-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>

            {/* Email (only for creating) */}
            {!editingStaff && (
              <div className="grid gap-2">
                <Label htmlFor="sa-staff-email">Email</Label>
                <Input
                  id="sa-staff-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="john.doe@schoolsaas.com"
                />
              </div>
            )}

            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="sa-staff-password">
                {editingStaff ? "New Password" : "Password"}
                {!editingStaff && (
                  <span className="text-red-500 ml-0.5">*</span>
                )}
                {editingStaff && (
                  <span className="text-muted-foreground font-normal text-xs ml-2">
                    (leave blank to keep current)
                  </span>
                )}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="sa-staff-password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={
                    editingStaff
                      ? "Leave blank to keep current password"
                      : "Set login password (min 6 chars)"
                  }
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {!editingStaff &&
                formData.password &&
                formData.password.length < 6 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Password must be at least 6 characters
                  </p>
                )}
            </div>

            {/* Phone */}
            <div className="grid gap-2">
              <Label htmlFor="sa-staff-phone">Phone</Label>
              <Input
                id="sa-staff-phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+1 234 567 890"
              />
            </div>

            {/* Platform Role dropdown */}
            <div className="grid gap-2">
              <Label
                htmlFor="sa-staff-role"
                className="flex items-center gap-1.5"
              >
                <Shield className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
                Platform Role
              </Label>
              <Select
                value={formData.platformRoleId}
                onValueChange={(v) =>
                  setFormData({ ...formData, platformRoleId: v })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: role.color }}
                        />
                        {role.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Assign a platform role to control this staff member&apos;s
                permissions.
              </p>
            </div>

            {/* Active toggle */}
            {editingStaff && (
              <div className="flex items-center gap-3 pt-1">
                <Checkbox
                  id="sa-staff-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked === true })
                  }
                />
                <Label
                  htmlFor="sa-staff-active"
                  className="cursor-pointer select-none"
                >
                  Active
                </Label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={handleSubmit}
              disabled={submitting || !isFormValid}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editingStaff ? "Updating..." : "Adding..."}
                </>
              ) : editingStaff ? (
                "Update Staff"
              ) : (
                "Add Staff"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
