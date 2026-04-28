"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  useGraphQLMutation,
  useAssignRoleToUser,
} from "@/lib/graphql/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/graphql/keys";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  RotateCcw,
  LayoutGrid,
  List
} from "lucide-react";
import { cn } from "@/lib/utils";
import { goeyToast as toast } from "goey-toast";
import { useAppStore } from "@/store/use-app-store";
import { useStaff, useCustomRoles } from "@/lib/graphql/hooks";
import { useModulePermissions } from "@/hooks/use-permissions";

// Sub-components
import { StaffTable } from "./staff/StaffTable";
import { StaffCard } from "./staff/StaffCard";
import { StaffDialog } from "./staff/StaffDialog";
import { StaffSkeleton } from "./staff/StaffSkeleton";

// Types
import { StaffMember, StaffFormData, emptyFormData } from "./staff/types";

// --- GraphQL Operations ---

const CREATE_USER = `
  mutation CreateStaff($data: CreateUserInput!) {
    createUser(data: $data) {
      id
      name
    }
  }
`;

const UPDATE_USER = `
  mutation UpdateUser($id: ID!, $data: UpdateUserInput!) {
    updateUser(id: $id, data: $data) {
      id
      name
    }
  }
`;

const DELETE_USER = `
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

export function AdminStaff() {
  const { currentTenantId } = useAppStore();
  const { canCreate, canEdit, canDelete } = useModulePermissions("staff");
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  // --- Queries ---
  const { 
    data: staffResponse, 
    isLoading: loadingStaff, 
    refetch: refetchStaff 
  } = useStaff(currentTenantId || undefined, "staff");
  
  const { data: roles = [] } = useCustomRoles(currentTenantId || undefined);

  // --- Mutations ---
  const { mutateAsync: createUser } = useGraphQLMutation<{ createUser: { id: string, name: string } }, any>(CREATE_USER);
  const { mutateAsync: updateUser } = useGraphQLMutation<{ updateUser: { id: string, name: string } }, any>(UPDATE_USER);
  const { mutateAsync: deleteUser } = useGraphQLMutation<{ deleteUser: boolean }, any>(DELETE_USER);
  const { mutateAsync: assignRole } = useAssignRoleToUser();

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Load view mode preference
  useEffect(() => {
    const saved = localStorage.getItem('staff_view_mode') as 'table' | 'grid';
    if (saved) setViewMode(saved);
  }, []);

  // Save view mode preference
  const toggleView = (mode: 'table' | 'grid') => {
    setViewMode(mode);
    localStorage.setItem('staff_view_mode', mode);
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState<StaffFormData>(emptyFormData);
  const [submitting, setSubmitting] = useState(false);

  // Delete Alert
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<StaffMember | null>(null);

  // --- Handlers ---

  const handleOpenCreate = () => {
    setEditingMember(null);
    setFormData(emptyFormData);
    setDialogOpen(true);
  };

  const handleOpenEdit = (member: StaffMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      password: "", // Not used for edit
      phone: member.phone || "",
      address: member.address || "",
      customRoleId: member.customRole?.id || "",
      isActive: member.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || (!editingMember && !formData.password)) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      if (editingMember) {
        // OPTIMISTIC UPDATE: Update the UI instantly
        const updatedStaff = { 
          ...editingMember, 
          ...formData,
          customRole: roles.find(r => r.id === formData.customRoleId) || editingMember.customRole
        };
        
        queryClient.setQueryData(["staff", currentTenantId, "staff"], (old: any) => {
          if (!old || !old.staff) return old;
          return {
            ...old,
            staff: old.staff.map((m: any) => m.id === editingMember.id ? updatedStaff : m)
          };
        });

        // Update user
        await updateUser({
          id: editingMember.id,
          data: {
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            isActive: formData.isActive,
          },
        });
        
        // Assign/Update role
        await assignRole({
          userId: editingMember.id,
          roleId: formData.customRoleId === "none" ? "" : formData.customRoleId,
          tenantId: currentTenantId!,
        });

        toast.success("Staff member updated");
      } else {
        // Create user
        const res = await createUser({
          data: {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: "staff",
            phone: formData.phone,
            address: formData.address,
            isActive: formData.isActive,
            tenantId: currentTenantId!,
          },
        });

        if (res?.createUser?.id && formData.customRoleId && formData.customRoleId !== "none") {
          await assignRole({
            userId: res.createUser.id,
            roleId: formData.customRoleId,
            tenantId: currentTenantId!,
          });
        }
        toast.success("New staff member created");
      }
      setDialogOpen(false);
      refetchStaff();
    } catch (err: any) {
      toast.error(err.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!memberToDelete) return;
    try {
      await deleteUser({ id: memberToDelete.id });
      toast.success("Staff member deleted");
      setDeleteAlertOpen(false);
      refetchStaff();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  // --- Derived ---
  const staff = useMemo(() => {
    let list = (staffResponse?.staff || []) as StaffMember[];
    
    // 🔡 Sort alphabetically (Natural Sort: 1, 2, 10)
    list = [...list].sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );

    if (!search) return list;
    const s = search.toLowerCase();
    return list.filter(m => 
      m.name.toLowerCase().includes(s) || 
      m.email.toLowerCase().includes(s) ||
      (m.customRole?.name || "").toLowerCase().includes(s)
    );
  }, [staffResponse, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative max-w-sm flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone..."
            className="pl-9 bg-white dark:bg-gray-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mr-2">
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
              <span className="hidden sm:inline">List</span>
            </Button>
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
          </div>

          <Button variant="outline" size="icon" onClick={() => refetchStaff()} className="h-10 w-10">
            <RotateCcw className="h-4 w-4" />
          </Button>
          {canCreate && (
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-none" onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" /> Add Staff
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={cn(viewMode === 'table' ? "bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden" : "")}>
          {loadingStaff ? (
            <StaffSkeleton />
          ) : viewMode === 'table' ? (
            <StaffTable
              staff={staff}
              onEdit={handleOpenEdit}
              onDelete={(m) => { setMemberToDelete(m); setDeleteAlertOpen(true); }}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {staff.map((member) => (
                <StaffCard
                  key={member.id}
                  member={member}
                  onEdit={handleOpenEdit}
                  onDelete={(m) => { setMemberToDelete(m); setDeleteAlertOpen(true); }}
                  canEdit={canEdit}
                  canDelete={canDelete}
                />
              ))}
            </div>
          )}
      </div>

      {/* Dialogs */}
      <StaffDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        member={editingMember}
        formData={formData}
        setFormData={setFormData}
        roles={roles}
        submitting={submitting}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{memberToDelete?.name}</strong> and remove their access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>
              Delete Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
