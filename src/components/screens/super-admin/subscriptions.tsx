"use client";

import { apiFetch } from "@/lib/api";
import { useReducer, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useParents,
  useSubscriptions,
  useTenantsInfinite,
  queryKeys,
} from "@/lib/graphql/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { CreditCard } from "lucide-react";

// Sub-components
import { SubscriptionStats } from "./subscriptions/SubscriptionStats";
import { SubscriptionFilters } from "./subscriptions/SubscriptionFilters";
import { SubscriptionTable } from "./subscriptions/SubscriptionTable";
import { SubscriptionDialogs } from "./subscriptions/SubscriptionDialogs";
import { SubscriptionRecord } from "./subscriptions/types";

const ITEMS_PER_PAGE = 25;

type State = {
  selectedTenant: string;
  search: string;
  debouncedSearch: string;
  statusFilter: string;
  page: number;
  limit: number;
  deleteDialog: SubscriptionRecord | null;
  deleting: boolean;
  createDialogOpen: boolean;
  editDialogOpen: SubscriptionRecord | null;
  extendDialogOpen: SubscriptionRecord | null;
  extendDays: string;
  processing: boolean;
  createForm: {
    parentId: string;
    planId: string;
    planName: string;
    amount: number;
    period: string;
    paymentMethod: string;
  };
  editForm: {
    planId: string;
    planName: string;
    amount: number;
    period: string;
    autoRenew: boolean;
    paymentMethod: string;
    status: string;
    endDate: string;
  };
};

type Action =
  | { type: 'SET_SELECTED_TENANT'; payload: string }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_DEBOUNCED_SEARCH'; payload: string }
  | { type: 'SET_STATUS_FILTER'; payload: string }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_LIMIT'; payload: number }
  | { type: 'SET_DELETE_DIALOG'; payload: SubscriptionRecord | null }
  | { type: 'SET_DELETING'; payload: boolean }
  | { type: 'SET_CREATE_DIALOG_OPEN'; payload: boolean }
  | { type: 'OPEN_EDIT_DIALOG'; payload: SubscriptionRecord }
  | { type: 'SET_EDIT_DIALOG_OPEN'; payload: SubscriptionRecord | null }
  | { type: 'SET_EXTEND_DIALOG_OPEN'; payload: SubscriptionRecord | null }
  | { type: 'SET_EXTEND_DAYS'; payload: string }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_CREATE_FORM'; payload: Partial<State['createForm']> | ((prev: State['createForm']) => State['createForm']) }
  | { type: 'SET_EDIT_FORM'; payload: Partial<State['editForm']> | ((prev: State['editForm']) => State['editForm']) }
  | { type: 'PREPARE_ASSIGN'; payload: string };

const initialState: State = {
  selectedTenant: "",
  search: "",
  debouncedSearch: "",
  statusFilter: "all",
  page: 1,
  limit: 25,
  deleteDialog: null,
  deleting: false,
  createDialogOpen: false,
  editDialogOpen: null,
  extendDialogOpen: null,
  extendDays: "30",
  processing: false,
  createForm: {
    parentId: "",
    planId: "standard",
    planName: "Standard",
    amount: 299,
    period: "yearly",
    paymentMethod: "card",
  },
  editForm: {
    planId: "",
    planName: "",
    amount: 0,
    period: "",
    autoRenew: true,
    paymentMethod: "",
    status: "",
    endDate: "",
  },
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_SELECTED_TENANT': return { ...state, selectedTenant: action.payload, page: 1 };
    case 'SET_SEARCH': return { ...state, search: action.payload };
    case 'SET_DEBOUNCED_SEARCH': return { ...state, debouncedSearch: action.payload, page: 1 };
    case 'SET_STATUS_FILTER': return { ...state, statusFilter: action.payload, page: 1 };
    case 'SET_PAGE': return { ...state, page: action.payload };
    case 'SET_LIMIT': return { ...state, limit: action.payload, page: 1 };
    case 'SET_DELETE_DIALOG': return { ...state, deleteDialog: action.payload };
    case 'SET_DELETING': return { ...state, deleting: action.payload };
    case 'SET_CREATE_DIALOG_OPEN': return { ...state, createDialogOpen: action.payload };
    case 'OPEN_EDIT_DIALOG':
      return {
        ...state,
        editDialogOpen: action.payload,
        editForm: {
          planId: action.payload.planId,
          planName: action.payload.planName,
          amount: action.payload.amount,
          period: action.payload.period,
          autoRenew: action.payload.autoRenew,
          paymentMethod: action.payload.paymentMethod,
          status: action.payload.status,
          endDate: action.payload.endDate || "",
        }
      };
    case 'SET_EDIT_DIALOG_OPEN': return { ...state, editDialogOpen: action.payload };
    case 'SET_EXTEND_DIALOG_OPEN': return { ...state, extendDialogOpen: action.payload };
    case 'SET_EXTEND_DAYS': return { ...state, extendDays: action.payload };
    case 'SET_PROCESSING': return { ...state, processing: action.payload };
    case 'SET_CREATE_FORM':
      return {
        ...state,
        createForm: typeof action.payload === 'function' ? action.payload(state.createForm) : { ...state.createForm, ...action.payload }
      };
    case 'SET_EDIT_FORM':
      return {
        ...state,
        editForm: typeof action.payload === 'function' ? action.payload(state.editForm) : { ...state.editForm, ...action.payload }
      };
    case 'PREPARE_ASSIGN': return { ...state, createForm: { ...state.createForm, parentId: action.payload }, createDialogOpen: true };
    default: return state;
  }
}

export function SuperAdminSubscriptions() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    selectedTenant, search, debouncedSearch, statusFilter, page, limit,
    deleteDialog, deleting, createDialogOpen, editDialogOpen,
    extendDialogOpen, extendDays, processing, createForm, editForm
  } = state;

  const queryClient = useQueryClient();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: 'SET_DEBOUNCED_SEARCH', payload: search });
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const [tenantSearch, setTenantSearch] = useState("");
  const [debouncedTenantSearch, setDebouncedTenantSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTenantSearch(tenantSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [tenantSearch]);

  // Scroll to top on pagination / limit change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, limit]);

  // -- Queries --
  const { 
    data: tenantsInfiniteData, 
    fetchNextPage: fetchNextTenantsPage, 
    hasNextPage: hasNextTenantsPage, 
    isFetchingNextPage: isFetchingNextTenantsPage 
  } = useTenantsInfinite({ 
    search: debouncedTenantSearch.trim() || undefined,
    limit: 40 
  });

  const tenants = useMemo(() => {
    if (!tenantsInfiniteData) return [];
    return tenantsInfiniteData.pages.flatMap((page) => page.tenants || []);
  }, [tenantsInfiniteData]);

  const useSubsData = ["active", "cancelled", "expired"].includes(statusFilter);

  const { data: subsData, isLoading: loadingSubs } = useSubscriptions({
    tenantId: selectedTenant || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    search: debouncedSearch || undefined,
    page,
    limit
  }, {
    enabled: useSubsData && !!selectedTenant
  });

  const { data: statsSubsData } = useSubscriptions({
    tenantId: selectedTenant || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    search: debouncedSearch || undefined,
    page: 1,
    limit: 100
  }, {
    enabled: !!selectedTenant
  });

  const { data: parentsData, isLoading: loadingParents } = useParents(
    selectedTenant || undefined,
    debouncedSearch || undefined, // search
    page,
    limit,
    {
      enabled: !useSubsData && !!selectedTenant
    }
  );

  const loading = useSubsData ? loadingSubs : (selectedTenant ? loadingParents : false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
    queryClient.invalidateQueries({ queryKey: queryKeys.parents });
  };

  // -- Unified Data Logic --

  const unifiedData = useMemo(() => {
    if (useSubsData) {
      const list = subsData?.subscriptions;
      if (!Array.isArray(list)) return [];
      return list.map((s) => ({
        id: s.id,
        parent: s.parent,
        subscription: s,
        status: s.status,
      }));
    }

    const list = parentsData?.parents;
    if (!Array.isArray(list)) return [];
    const mapped = list.map((p) => {
      const sub = p.subscription;
      return {
        id: p.id,
        parent: {
          id: p.id,
          name: p.name,
          email: p.email,
          phone: p.phone,
          user: { name: p.name, email: p.email, phone: p.phone },
          students: p.children || [],
        },
        subscription: sub || null,
        status: sub ? sub.status : "none",
      };
    });

    if (statusFilter === "none") {
      return mapped.filter(item => item.status === "none" || item.status === "cancelled" || item.status === "expired");
    }
    return mapped;
  }, [parentsData, subsData, selectedTenant, statusFilter, useSubsData]);

  const stats = statsSubsData?.stats || null;
  const totalPages = useSubsData ? subsData?.totalPages || 1 : parentsData?.totalPages || 1;
  const totalEntries = useSubsData ? subsData?.total || 0 : parentsData?.total || 0;

  // -- Handlers --
  const handleDelete = async () => {
    if (!deleteDialog) return;
    toast.promise(
      (async () => {
        dispatch({ type: 'SET_DELETING', payload: true });
        try {
          const res = await apiFetch(`/api/subscriptions?id=${deleteDialog.id}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Failed to delete subscription");
          invalidate();
          dispatch({ type: 'SET_DELETE_DIALOG', payload: null });
          return "Subscription deleted successfully";
        } finally {
          dispatch({ type: 'SET_DELETING', payload: false });
        }
      })(),
      {
        loading: "Deleting subscription...",
        success: (msg) => msg,
        error: (err: any) => err.message,
      }
    );
  };

  const handleCreate = async () => {
    if (!createForm.parentId) {
      toast.error("Please select a parent");
      return;
    }
    toast.promise(
      (async () => {
        dispatch({ type: 'SET_PROCESSING', payload: true });
        try {
          const res = await apiFetch("/api/subscriptions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "admin-create", ...createForm }),
          });
          if (!res.ok) throw new Error("Failed to create subscription");
          invalidate();
          dispatch({ type: 'SET_CREATE_DIALOG_OPEN', payload: false });
          return "Subscription created successfully";
        } finally {
          dispatch({ type: 'SET_PROCESSING', payload: false });
        }
      })(),
      {
        loading: "Creating subscription...",
        success: (msg) => msg,
        error: (err: any) => err.message,
      }
    );
  };

  const handleEdit = async () => {
    if (!editDialogOpen) return;
    toast.promise(
      (async () => {
        dispatch({ type: 'SET_PROCESSING', payload: true });
        try {
          const res = await apiFetch("/api/subscriptions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "admin-update",
              subscriptionId: editDialogOpen.id,
              ...editForm,
            }),
          });
          if (!res.ok) throw new Error("Failed to update subscription");
          invalidate();
          dispatch({ type: 'SET_EDIT_DIALOG_OPEN', payload: null });
          return "Subscription updated successfully";
        } finally {
          dispatch({ type: 'SET_PROCESSING', payload: false });
        }
      })(),
      {
        loading: "Updating subscription...",
        success: (msg) => msg,
        error: (err: any) => err.message,
      }
    );
  };

  const handleExtend = async () => {
    if (!extendDialogOpen || !extendDays || Number(extendDays) <= 0) {
      toast.error("Enter valid days");
      return;
    }
    toast.promise(
      (async () => {
        dispatch({ type: 'SET_PROCESSING', payload: true });
        try {
          const res = await apiFetch("/api/subscriptions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "admin-extend",
              subscriptionId: extendDialogOpen.id,
              days: Number(extendDays),
            }),
          });
          if (!res.ok) throw new Error("Failed to extend subscription");
          invalidate();
          dispatch({ type: 'SET_EXTEND_DIALOG_OPEN', payload: null });
          return `Extended by ${extendDays} days successfully`;
        } finally {
          dispatch({ type: 'SET_PROCESSING', payload: false });
        }
      })(),
      {
        loading: `Extending subscription by ${extendDays} days...`,
        success: (msg) => msg,
        error: (err: any) => err.message,
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="size-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <CreditCard className="size-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">B2C Parent Subscriptions</h2>
          <p className="text-muted-foreground mt-1">Manage individual parent plan enrollments across all schools.</p>
        </div>
      </div>

      <SubscriptionStats 
        stats={stats}
        selectedTenant={selectedTenant}
        onTenantChange={(v) => dispatch({ type: 'SET_SELECTED_TENANT', payload: v })}
        tenants={tenants}
        onNewSetup={() => dispatch({ type: 'SET_CREATE_DIALOG_OPEN', payload: true })}
        parentsTotal={parentsData?.total || 0}
        fetchNextPage={fetchNextTenantsPage}
        hasNextPage={hasNextTenantsPage}
        isFetchingNextPage={isFetchingNextTenantsPage}
        tenantSearch={tenantSearch}
        onTenantSearchChange={setTenantSearch}
      />

      <SubscriptionFilters 
        search={search}
        onSearchChange={(v) => dispatch({ type: 'SET_SEARCH', payload: v })}
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => dispatch({ type: 'SET_STATUS_FILTER', payload: v })}
      />

      <SubscriptionTable 
        unifiedData={unifiedData}
        loading={loading}
        selectedTenant={selectedTenant}
        page={page}
        limit={limit}
        totalPages={totalPages}
        totalEntries={totalEntries}
        onPageChange={(v) => dispatch({ type: 'SET_PAGE', payload: v })}
        onLimitChange={(v) => dispatch({ type: 'SET_LIMIT', payload: v })}
        onEdit={(sub) => dispatch({ type: 'OPEN_EDIT_DIALOG', payload: sub })}
        onExtend={(v) => dispatch({ type: 'SET_EXTEND_DIALOG_OPEN', payload: v })}
        onDelete={(v) => dispatch({ type: 'SET_DELETE_DIALOG', payload: v })}
        onAssign={(item) => dispatch({ type: 'PREPARE_ASSIGN', payload: item.id })}
      />

      <SubscriptionDialogs 
        createOpen={createDialogOpen}
        onCreateOpenChange={(v) => dispatch({ type: 'SET_CREATE_DIALOG_OPEN', payload: v })}
        createForm={createForm}
        setCreateForm={(v) => dispatch({ type: 'SET_CREATE_FORM', payload: v })}
        parents={Array.isArray(parentsData?.parents) ? parentsData.parents : []}
        onCreateSubmit={handleCreate}
        processing={processing}

        editOpen={editDialogOpen}
        onEditOpenChange={(v) => dispatch({ type: 'SET_EDIT_DIALOG_OPEN', payload: v })}
        editForm={editForm}
        setEditForm={(v) => dispatch({ type: 'SET_EDIT_FORM', payload: v })}
        onEditSubmit={handleEdit}

        extendOpen={extendDialogOpen}
        onExtendOpenChange={(v) => dispatch({ type: 'SET_EXTEND_DIALOG_OPEN', payload: v })}
        extendDays={extendDays}
        setExtendDays={(v) => dispatch({ type: 'SET_EXTEND_DAYS', payload: v })}
        onExtendSubmit={handleExtend}

        deleteOpen={deleteDialog}
        onDeleteOpenChange={(v) => dispatch({ type: 'SET_DELETE_DIALOG', payload: v })}
        onDeleteConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  );
}
