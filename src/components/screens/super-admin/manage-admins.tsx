"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// Select is available but not used in Manage Admins (no role assignment for full-access admins)
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
  ShieldCheck,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Mail,
  Eye,
  EyeOff,
  Lock,
  Clock,
  LockKeyhole,
} from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/store/use-app-store";

// --- Types ---

interface PlatformRoleOption {
  id: string;
  name: string;
  color: string;
}

interface AdminRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  platformRoleId: string | null;
  platformRole: PlatformRoleOption | null;
  createdAt: string;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  isActive: boolean;
}

const emptyFormData: FormData = {
  name: "",
  email: "",
  password: "",
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// --- Component ---

export function SuperAdminManage() {
  const { currentUser } = useAppStore();
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminRecord | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Root admin is the first one in the list (ordered by createdAt asc)
  const rootAdminId = admins.length > 0 ? admins[0].id : null;

  // --- Fetch ---

  const fetchAdmins = useCallback(async () => {
    try {
      const res = await fetch("/api/super-admins?type=admins");
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

  const filtered = admins.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()),
  );

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

      const res = await fetch("/api/super-admins", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(
          err?.error || `Failed to ${isEdit ? "update" : "create"} super admin`,
        );
      }

      toast.success(
        `Super admin ${isEdit ? "updated" : "created"} successfully`,
      );
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
      const res = await fetch(`/api/super-admins?id=${id}`, {
        method: "DELETE",
      });
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

  const isFormValid =
    formData.name.trim() !== "" &&
    (!editingAdmin
      ? formData.email.trim() !== "" && formData.password.trim().length >= 6
      : true);

  // --- Render ---

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Manage Admins
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create and manage platform super administrator accounts
          </p>
        </div>
        <div className="flex gap-3 items-center w-full sm:w-auto">
          <div className="relative max-w-xs flex-1 sm:flex-none w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            className="bg-rose-600 hover:bg-rose-700 text-white shrink-0"
            onClick={handleOpenAdd}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Super Admin
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <div className="rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-800/30 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-rose-800 dark:text-rose-300">
              Platform Admin Accounts
            </p>
            <p className="text-rose-700/80 dark:text-rose-400/80 mt-0.5">
              Super admins have full access to all schools, billing, and
              platform settings. The root platform owner is protected and cannot
              be modified.
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <ShieldCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium text-base">No super admin accounts</p>
              <p className="text-sm mt-1">
                {admins.length === 0
                  ? "Create your first super admin account to get started."
                  : "No admins match your search criteria."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="min-w-[250px]">Name</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Email
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Created
                    </TableHead>
                    <TableHead className="w-[100px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((admin) => {
                    const isRoot = admin.id === rootAdminId;
                    return (
                      <TableRow
                        key={admin.id}
                        className="hover:bg-rose-50/50 dark:hover:bg-rose-900/10 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 shrink-0 ring-2 ring-white dark:ring-gray-700 shadow-sm">
                              <AvatarFallback className="bg-rose-500 text-white text-xs font-bold">
                                {getInitials(admin.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-sm truncate">
                                  {admin.name}
                                </p>
                                {isRoot && (
                                  <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-[10px] gap-1 px-1.5 py-0">
                                    <LockKeyhole className="h-3 w-3" />
                                    Root Owner
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate sm:hidden">
                                {admin.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-sm truncate">
                              {admin.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={admin.isActive ? "default" : "destructive"}
                            className={
                              admin.isActive
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30"
                            }
                          >
                            {admin.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDate(admin.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {isRoot ? (
                            <Tooltip text="Root owner cannot be modified">
                              <div className="flex items-center justify-end gap-1 opacity-40">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  disabled
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  disabled
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </Tooltip>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-rose-600"
                                onClick={() => handleOpenEdit(admin)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog
                                open={deletingId === admin.id}
                                onOpenChange={(open) => {
                                  if (!open) setDeletingId(null);
                                }}
                              >
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                    onClick={() => setDeletingId(admin.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Super Admin
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete{" "}
                                      <strong>{admin.name}</strong>? This action
                                      cannot be undone.
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
                                      onClick={() => handleDelete(admin.id)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Footer */}
          {!loading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {filtered.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {admins.length}
                </span>{" "}
                super admin{admins.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingAdmin(null);
            setFormData(emptyFormData);
            setShowPassword(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              {editingAdmin ? "Edit Super Admin" : "Add New Super Admin"}
            </DialogTitle>
            <DialogDescription>
              {editingAdmin
                ? "Update the super admin details below."
                : "Create a new platform super administrator with full access."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Full Name */}
            <div className="grid gap-2">
              <Label htmlFor="sa-name">Full Name</Label>
              <Input
                id="sa-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="James Wilson"
              />
            </div>

            {/* Email (only for creating) */}
            {!editingAdmin && (
              <div className="grid gap-2">
                <Label htmlFor="sa-email">Email</Label>
                <Input
                  id="sa-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="admin@schoolsaas.com"
                />
              </div>
            )}

            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="sa-password">
                {editingAdmin ? "New Password" : "Password"}
                {!editingAdmin && (
                  <span className="text-red-500 ml-0.5">*</span>
                )}
                {editingAdmin && (
                  <span className="text-muted-foreground font-normal text-xs ml-2">
                    (leave blank to keep current)
                  </span>
                )}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="sa-password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={
                    editingAdmin
                      ? "Leave blank to keep current password"
                      : "Set login password"
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
              {!editingAdmin &&
                formData.password &&
                formData.password.length < 6 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Password must be at least 6 characters
                  </p>
                )}
            </div>

            {/* Active toggle */}
            {editingAdmin && (
              <div className="flex items-center gap-3 pt-1">
                <Checkbox
                  id="sa-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked === true })
                  }
                />
                <Label
                  htmlFor="sa-active"
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
                  {editingAdmin ? "Updating..." : "Creating..."}
                </>
              ) : editingAdmin ? (
                "Update Super Admin"
              ) : (
                "Create Super Admin"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Simple tooltip wrapper
function Tooltip({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
        {text}
      </div>
    </div>
  );
}
