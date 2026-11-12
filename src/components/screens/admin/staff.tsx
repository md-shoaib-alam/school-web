"use client";

import { useReducer, useCallback, useMemo, useEffect, useRef } from "react";
import {
  useGraphQLMutation,
  useAssignRoleToUser,
} from "@/lib/graphql/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/graphql/keys";
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
  LayoutGrid,
  List
} from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAppStore } from "@/store/use-app-store";
import { useStaff, useCustomRoles } from "@/lib/graphql/hooks";
import { useModulePermissions } from "@/hooks/use-permissions";
import { Pagination } from "@/components/shared/pagination";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { LayoutGroup, LazyMotion, domMax, m } from "framer-motion";

// Sub-components
import { StaffTable } from "./staff/StaffTable";
import { StaffCard } from "./staff/StaffCard";
import { StaffDialog } from "./staff/StaffDialog";
import { StaffSkeleton } from "./staff/StaffSkeleton";
import { StaffDetailDialog } from "./staff/StaffDetailDialog";
import { StaffProfileView } from "./staff/StaffProfileView";

// Types
import { StaffMember, StaffFormData, emptyFormData } from "./staff/types";

const premiumLayoutTransition = {
  type: "spring",
  stiffness: 280,
  damping: 28,
  mass: 0.7
} as const;

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

type State = {
  search: string;
  currentPage: number;
  viewMode: 'table' | 'grid';
  dialogOpen: boolean;
  editingMember: StaffMember | null;
  formData: StaffFormData;
  submitting: boolean;
  deleteAlertOpen: boolean;
  memberToDelete: StaffMember | null;
  viewDialogOpen: boolean;
  viewingMember: StaffMember | null;
};

type Action =
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'SET_VIEW_MODE'; payload: 'table' | 'grid' }
  | { type: 'OPEN_CREATE' }
  | { type: 'OPEN_EDIT'; payload: StaffMember }
  | { type: 'CLOSE_DIALOG' }
  | { type: 'SET_FORM_DATA'; payload: StaffFormData }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'OPEN_DELETE'; payload: StaffMember }
  | { type: 'CLOSE_DELETE' }
  | { type: 'OPEN_VIEW'; payload: StaffMember }
  | { type: 'CLOSE_VIEW' };

const initialState: State = {
  search: "",
  currentPage: 1,
  viewMode: 'table',
  dialogOpen: false,
  editingMember: null,
  formData: emptyFormData,
  submitting: false,
  deleteAlertOpen: false,
  memberToDelete: null,
  viewDialogOpen: false,
  viewingMember: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_SEARCH':
      return { ...state, search: action.payload, currentPage: 1 };
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'OPEN_CREATE':
      return { ...state, editingMember: null, formData: emptyFormData, dialogOpen: true };
    case 'OPEN_EDIT':
      return {
        ...state,
        editingMember: action.payload,
        formData: {
          ...emptyFormData,
          name: action.payload.name,
          email: action.payload.email,
          phone: action.payload.phone || "",
          address: action.payload.address || "",
          customRoleId: action.payload.customRole?.id || "",
          isActive: action.payload.isActive,
          employeeId: action.payload.employeeId || "",
          department: action.payload.department || "",
          designation: action.payload.designation || "",
          employmentType: action.payload.employmentType || "full-time",
          joiningDate: action.payload.joiningDate || "",
          dateOfBirth: action.payload.dateOfBirth || "",
          gender: action.payload.gender || "",
          bloodGroup: action.payload.bloodGroup || "",
          maritalStatus: action.payload.maritalStatus || "",
          nationality: action.payload.nationality || "",
          religion: action.payload.religion || "",
          alternatePhone: action.payload.alternatePhone || "",
          panNumber: action.payload.panNumber || "",
          aadhaarNumber: action.payload.aadhaarNumber || "",
          pfEnabled: !!action.payload.pfEnabled,
          esiEnabled: !!action.payload.esiEnabled,
          ptEnabled: !!action.payload.ptEnabled,
          avatar: action.payload.avatar || "",
        },
        dialogOpen: true,
      };
    case 'CLOSE_DIALOG':
      return { ...state, dialogOpen: false };
    case 'SET_FORM_DATA':
      return { ...state, formData: action.payload };
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.payload };
    case 'OPEN_DELETE':
      return { ...state, memberToDelete: action.payload, deleteAlertOpen: true };
    case 'CLOSE_DELETE':
      return { ...state, deleteAlertOpen: false };
    case 'OPEN_VIEW':
      return { ...state, viewingMember: action.payload, viewDialogOpen: true };
    case 'CLOSE_VIEW':
      return { ...state, viewingMember: null, viewDialogOpen: false };
    default:
      return state;
  }
}
export function AdminStaff() {
  const { currentTenantId } = useAppStore();
  const { canCreate, canEdit, canDelete } = useModulePermissions("staff");
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    search,
    currentPage,
    viewMode,
    dialogOpen,
    editingMember,
    formData,
    submitting,
    deleteAlertOpen,
    memberToDelete,
    viewDialogOpen,
    viewingMember,
  } = state;


  // --- Queries ---
  const { 
    data: staffResponse, 
    isLoading: loadingStaff, 
    refetch: refetchStaff 
  } = useStaff(
    currentTenantId || undefined, 
    "staff", 
    search || undefined, 
    currentPage, 
    12
  );
  
  const { data: roles = [] } = useCustomRoles(currentTenantId || undefined);

  // --- Mutations ---
  const { mutateAsync: createUser } = useGraphQLMutation<{ createUser: { id: string, name: string } }, any>(CREATE_USER);
  const { mutateAsync: updateUser } = useGraphQLMutation<{ updateUser: { id: string, name: string } }, any>(UPDATE_USER);
  const { mutateAsync: deleteUser } = useGraphQLMutation<{ deleteUser: boolean }, any>(DELETE_USER);
  const { mutateAsync: assignRole } = useAssignRoleToUser();

  // Load view mode preference
  useEffect(() => {
    const saved = localStorage.getItem('staff_view_mode') as 'table' | 'grid';
    if (saved) dispatch({ type: 'SET_VIEW_MODE', payload: saved });
  }, []);

  // Save view mode preference
  const toggleView = (mode: 'table' | 'grid') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
    localStorage.setItem('staff_view_mode', mode);
  };

  // --- Handlers ---

  const handleOpenCreate = () => dispatch({ type: 'OPEN_CREATE' });

  const handleOpenEdit = (member: StaffMember) => dispatch({ type: 'OPEN_EDIT', payload: member });

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || (!editingMember && !formData.password)) {
      toast.error("Please fill in all required fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    dispatch({ type: 'SET_SUBMITTING', payload: true });
    try {
      const payload: any = { ...formData, customRoleId: formData.customRoleId || null };
      const headers = { "Content-Type": "application/json" };

      if (editingMember) {
        // OPTIMISTIC UPDATE: Update the UI instantly
        const updatedStaff = {
          ...editingMember,
          ...formData,
          customRole: roles.find(r => r.id === formData.customRoleId) || editingMember.customRole
        };

        const queryKey = ["staff", currentTenantId, "staff", search || undefined, currentPage, 12];
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old || !old.staff) return old;
          return {
            ...old,
            staff: old.staff.map((m: any) => m.id === editingMember.id ? updatedStaff : m)
          };
        });

        const res = await apiFetch("/api/staff", {
          method: "PUT",
          headers,
          body: JSON.stringify({ id: editingMember.id, ...payload }),
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.error || "Failed to update staff");
        }

        toast.success("Staff member updated");
      } else {
        const res = await apiFetch("/api/staff", {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.error || "Failed to create staff");
        }
        toast.success("New staff member created");
      }
      dispatch({ type: 'CLOSE_DIALOG' });
      refetchStaff();
    } catch (err: any) {
      toast.error(err.message || "Operation failed");
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  };

  const handleDelete = async () => {
    if (!memberToDelete) return;
    try {
      await deleteUser({ id: memberToDelete.id });
      toast.success("Staff member deleted");
      dispatch({ type: 'CLOSE_DELETE' });
      refetchStaff();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  // --- Derived ---
  const staff = useMemo(() => {
    let list = (staffResponse?.staff || []) as StaffMember[];
    
    // 🔡 Sort alphabetically (Natural Sort: 1, 2, 10)
    return [...list].sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [staffResponse]);

  const totalItems = staffResponse?.total || 0;
  const totalPages = staffResponse?.totalPages || 1;

  // Only the first paint of the list arrives with a staggered entrance; a view switch
  // must not, or its items would fade while they are travelling to their new boxes.
  const painted = useRef(false);
  const enter = !painted.current;
  useEffect(() => {
    if (!loadingStaff && staff.length > 0) painted.current = true;
  }, [loadingStaff, staff]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const staffUrlParam = searchParams.get("staff") || searchParams.get("staffId");

  // Synchronize URL ?staff= query parameter into viewingMember on initial load, refresh, or URL change
  useEffect(() => {
    if (!staffUrlParam) {
      if (viewingMember) {
        dispatch({ type: 'CLOSE_VIEW' });
      }
      return;
    }

    // 1. Check if staff member is already in current staff list
    const found = staff.find(
      (m) => m.id === staffUrlParam || (m as any).username === staffUrlParam
    );
    if (found) {
      if (viewingMember?.id !== found.id) {
        dispatch({ type: 'OPEN_VIEW', payload: found });
      }
      return;
    }

    // 2. If not in current page list, fetch via API
    let isMounted = true;
    (async () => {
      try {
        const res = await apiFetch(`/api/staff?tenantId=${currentTenantId}&search=${encodeURIComponent(staffUrlParam)}`);
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : data.staff || [];
          const match = items.find(
            (m: any) => m.id === staffUrlParam || m.username === staffUrlParam
          );
          if (match && isMounted) {
            dispatch({ type: 'OPEN_VIEW', payload: match });
          }
        }
      } catch (err) {
        console.error("Failed to load staff member from URL:", err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [staffUrlParam, staff, currentTenantId, viewingMember]);

  const handleOpenView = (member: StaffMember) => {
    dispatch({ type: 'OPEN_VIEW', payload: member });
    const params = new URLSearchParams(searchParams.toString());
    params.set("staff", (member as any).username || member.id);
    const newQuery = params.toString();
    router.push(newQuery ? `${pathname}?${newQuery}` : pathname, { scroll: false });
  };

  const handleCloseView = () => {
    dispatch({ type: 'CLOSE_VIEW' });
    const params = new URLSearchParams(searchParams.toString());
    params.delete("staff");
    params.delete("staffId");
    const newQuery = params.toString();
    router.replace(newQuery ? `${pathname}?${newQuery}` : pathname, { scroll: false });
  };

  if (loadingStaff || (staffUrlParam && !viewingMember)) return <StaffSkeleton />;

  return (
    <>
      {viewingMember ? (
        <StaffProfileView
          member={viewingMember}
          roles={roles}
          onBack={handleCloseView}
          canEdit={canEdit}
          currentSession={staffResponse?.currentSession || null}
          onEditModal={(m) => {
            handleCloseView();
            handleOpenEdit(m);
          }}
        />
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <SearchInput
              id="search_staff"
              value={search}
              onChange={(val) => dispatch({ type: 'SET_SEARCH', payload: val })}
              placeholder="Search by name, email, phone..."
              delay={400}
              className="w-full sm:max-w-sm flex-1 order-2 sm:order-1"
            />

            <div className="flex items-center gap-2 self-end sm:self-auto order-1 sm:order-2">
              <div className="flex items-center bg-muted p-1 rounded-lg border ">
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
                  <span className="hidden sm:inline">List</span>
                </Button>
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
              </div>

              {canCreate && (
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-none shrink-0" onClick={handleOpenCreate}>
                  <Plus className="size-4 mr-2" /> Add Staff
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <div>
              {loadingStaff ? (
                <StaffSkeleton />
              ) : (
                <LayoutGroup id="staff">
                  {viewMode === 'table' ? (
                    <StaffTable
                      staff={staff}
                      enter={enter}
                      onEdit={handleOpenEdit}
                      onDelete={(m) => dispatch({ type: 'OPEN_DELETE', payload: m })}
                      onView={handleOpenView}
                      canEdit={canEdit}
                      canDelete={canDelete}
                    />
                  ) : (
                    <LazyMotion features={domMax}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                        {staff.map((member, index) => (
                          <m.div
                            key={member.id}
                            id={`staff-item-${member.id}`}
                            layoutId={`staff-${member.id}`}
                            initial={enter ? { y: 6 } : undefined}
                            animate={{ y: 0 }}
                            transition={enter ? { ...premiumLayoutTransition, delay: Math.min(index, 10) * 0.03 } : premiumLayoutTransition}
                          >
                            <StaffCard
                              member={member}
                              onEdit={handleOpenEdit}
                              onDelete={(m) => dispatch({ type: 'OPEN_DELETE', payload: m })}
                              onView={handleOpenView}
                              canEdit={canEdit}
                              canDelete={canDelete}
                            />
                          </m.div>
                        ))}
                      </div>
                    </LazyMotion>
                  )}
                </LayoutGroup>
              )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={12}
            onPageChange={(page) => dispatch({ type: 'SET_CURRENT_PAGE', payload: page })}
          />
        </div>
      )}

      {/* Dialogs */}
      <StaffDialog
        open={dialogOpen}
        onOpenChange={(open) => dispatch({ type: open ? 'OPEN_CREATE' : 'CLOSE_DIALOG' })}
        member={editingMember}
        formData={formData}
        setFormData={(fd) => dispatch({ type: 'SET_FORM_DATA', payload: fd })}
        roles={roles}
        submitting={submitting}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={deleteAlertOpen} onOpenChange={(open) => dispatch({ type: open ? 'CLOSE_DELETE' : 'CLOSE_DELETE' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{memberToDelete?.name}</strong> and remove their access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => dispatch({ type: 'CLOSE_DELETE' })}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>
              Delete Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
