"use client";


import { apiFetch } from "@/lib/api";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useGraphQLQuery, useGraphQLMutation } from "@/lib/graphql/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  KeyRound,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { useAppStore } from "@/store/use-app-store";
import { useStaff, useCustomRoles } from "@/lib/graphql/hooks";

// --- Types ---

interface CustomRole {
  id: string;
  name: string;
  color: string;
  permissions: Record<string, unknown>;
  userCount?: number;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  customRole: Pick<CustomRole, "id" | "name" | "color" | "permissions"> | null;
  createdAt: string;
}

interface StaffFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  customRoleId: string;
  isActive: boolean;
}

const emptyFormData: StaffFormData = {
  name: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  customRoleId: "",
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

/** Build a Tailwind background class from a hex color string */
function hexToBgClass(hex: string): string {
  // Fallback: try to parse the hex and use a generic approach via inline style
  return "";
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
  return {
    backgroundColor: color,
    color: "#fff",
  };
}

// --- Component ---

const GET_STAFF = `
  query GetStaff($tenantId: String) {
    staff(tenantId: $tenantId) {
      id
      name
      email
      phone
      address
      isActive
      customRole {
        id
        name
        color
      }
      createdAt
    }
  }
`;

const GET_ROLES = `
  query GetRoles($tenantId: String) {
    customRoles(tenantId: $tenantId) {
      id
      name
      color
    }
  }
`;

const CREATE_USER = `
  mutation CreateStaff($data: CreateUserInput!) {
    createUser(data: $data) {
      id
      name
    }
  }
`;

const TOGGLE_STATUS = `
  mutation ToggleStaff($id: ID!, $isActive: Boolean!) {
    toggleUserStatus(id: $id, isActive: $isActive) {
      id
      isActive
    }
  }
`;

const ASSIGN_ROLE = `
  mutation AssignStaffRole($userId: ID!, $roleId: ID, $tenantId: String) {
    assignRoleToUser(userId: $userId, roleId: $roleId, tenantId: $tenantId)
  }
`;

export function AdminStaff() {
  const { currentTenantId } = useAppStore();
  const [search, setSearch] = useState("");

  // --- TanStack Queries (Updated to use standardized hooks) ---
  const { data: staffData, isLoading: loadingStaff, refetch: refetchStaff } = useStaff(currentTenantId || undefined);
  const { data: roles = [] } = useCustomRoles(currentTenantId || undefined);

  const staff = staffData?.staff || [];
  const loading = loadingStaff;

  // --- Mutations ---
  const { mutateAsync: createUser } = useGraphQLMutation(CREATE_USER);
  const { mutateAsync: toggleStatus } = useGraphQLMutation(TOGGLE_STATUS);
  const { mutateAsync: assignRole } = useGraphQLMutation(ASSIGN_ROLE);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState<StaffFormData>(emptyFormData);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered list (memoized for speed)
  const filtered = useMemo(() => {
    return staff.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        (s.phone && s.phone.toLowerCase().includes(search.toLowerCase())) ||
        (s.customRole &&
          s.customRole.name.toLowerCase().includes(search.toLowerCase())),
    );
  }, [staff, search]);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData(emptyFormData);
    setShowPassword(false);
    setDialogOpen(true);
  };

  const handleOpenEdit = (member: StaffMember) => {
    setShowPassword(false);
    setEditingStaff(member);
    setFormData({
      name: member.name,
      email: member.email,
      password: "",
      phone: member.phone || "",
      address: member.address || "",
      customRoleId: member.customRole?.id || "",
      isActive: member.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!currentTenantId) {
      toast.error("No tenant selected. Please select a school first.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingStaff) {
        // Toggle status if changed
        if (formData.isActive !== editingStaff.isActive) {
          await toggleStatus({ id: editingStaff.id, isActive: formData.isActive });
        }
        // Assign role if changed
        if (formData.customRoleId !== (editingStaff.customRole?.id || "")) {
          await assignRole({ userId: editingStaff.id, roleId: formData.customRoleId, tenantId: currentTenantId });
        }
        toast.success("Staff member updated successfully");
      } else {
        // Create new
        await createUser({
          data: {
            name: formData.name,
            email: formData.email,
            password: formData.password || "sigel2024",
            role: "staff",
            tenantId: currentTenantId,
          }
        });
        toast.success("Staff member added successfully");
      }
      
      setDialogOpen(false);
      refetchStaff();
    } catch (err: any) {
      toast.error(err.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      toast.info("Deactivating staff member...");
      await toggleStatus({ id, isActive: false });
      toast.success("Staff member deactivated");
      setDeletingId(null);
      refetchStaff();
    } catch (err: any) {
      toast.error(err.message || "Failed to deactivate");
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
        <div className="relative max-w-sm flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
          onClick={handleOpenAdd}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Staff
        </Button>
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
                {staff.length === 0
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
                    <TableHead className="hidden lg:table-cell">Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((member) => {
                    const initials = getInitials(member.name);
                    const roleColor = member.customRole?.color || "#6b7280";

                    return (
                      <TableRow
                        key={member.id}
                        className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors"
                      >
                        {/* Name column */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 shrink-0 ring-2 ring-white dark:ring-gray-800 shadow-sm">
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
                                {member.customRole && (
                                  <span
                                    className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-tight"
                                    style={roleBadgeStyle(roleColor)}
                                  >
                                    {member.customRole.name}
                                  </span>
                                )}
                              </div>
                              {/* Show email on mobile when hidden */}
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

                        {/* Role */}
                        <TableCell className="hidden lg:table-cell">
                          {member.customRole ? (
                            <Badge
                              variant="outline"
                              className="font-normal text-xs gap-1.5"
                              style={roleBadgeStyle(member.customRole.color)}
                            >
                              <Shield className="h-3 w-3" />
                              {member.customRole.name}
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
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-emerald-600"
                              onClick={() => handleOpenEdit(member)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
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
                                    <strong>{member.name}</strong>? This action
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
                                    onClick={() => handleDelete(member.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
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
                  {staff.length}
                </span>{" "}
                staff member{staff.length !== 1 ? "s" : ""}
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
            <DialogTitle>
              {editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
            </DialogTitle>
            <DialogDescription>
              {editingStaff
                ? "Update the staff member details below."
                : "Fill in the details to create a new staff member."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {/* Full Name */}
            <div className="grid gap-2">
              <Label htmlFor="staff-name">Full Name</Label>
              <Input
                id="staff-name"
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
                <Label htmlFor="staff-email">Email</Label>
                <Input
                  id="staff-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="john.doe@school.com"
                />
              </div>
            )}

            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="staff-password">
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
                  id="staff-password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={
                    editingStaff
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
              <Label htmlFor="staff-phone">Phone</Label>
              <Input
                id="staff-phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+1 234 567 890"
              />
            </div>

            {/* Address (optional) */}
            <div className="grid gap-2">
              <Label htmlFor="staff-address">
                Address{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="staff-address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="123 Main St, City"
              />
            </div>

            {/* Role dropdown */}
            <div className="grid gap-2">
              <Label htmlFor="staff-role">Role</Label>
              <Select
                value={formData.customRoleId || "__none__"}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    customRoleId: v === "__none__" ? "" : v,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">(No Role)</SelectItem>
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
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3 pt-1">
              <Checkbox
                id="staff-active"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked === true })
                }
              />
              <Label
                htmlFor="staff-active"
                className="cursor-pointer select-none"
              >
                Active
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
