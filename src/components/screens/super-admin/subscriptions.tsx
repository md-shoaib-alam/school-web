"use client";

import { apiFetch } from "@/lib/api";
import { useState, useEffect, useMemo } from "react";
import { goeyToast as toast } from "goey-toast";
import {
  useParents,
  useSubscriptions,
  useTenants,
  queryKeys,
} from "@/lib/graphql/hooks";
import { useQueryClient } from "@tanstack/react-query";

// Sub-components
import { SubscriptionStats } from "./subscriptions/SubscriptionStats";
import { SubscriptionFilters } from "./subscriptions/SubscriptionFilters";
import { SubscriptionTable } from "./subscriptions/SubscriptionTable";
import { SubscriptionDialogs } from "./subscriptions/SubscriptionDialogs";
import { SubscriptionRecord } from "./subscriptions/types";
const ITEMS_PER_PAGE = 25;

export function SuperAdminSubscriptions() {
  const [selectedTenant, setSelectedTenant] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedTenant, statusFilter]);

  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState<SubscriptionRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState<SubscriptionRecord | null>(null);
  const [extendDialogOpen, setExtendDialogOpen] = useState<SubscriptionRecord | null>(null);
  
  const [extendDays, setExtendDays] = useState("30");
  const [processing, setProcessing] = useState(false);

  // Forms
  const [createForm, setCreateForm] = useState({
    parentId: "",
    planId: "standard",
    planName: "Standard",
    amount: 299,
    period: "yearly",
    paymentMethod: "card",
  });
  
  const [editForm, setEditForm] = useState({
    planName: "",
    amount: 0,
    period: "",
    autoRenew: true,
    paymentMethod: "",
    status: "",
  });

  // -- Queries --
  const { data: tenantsData } = useTenants({ page: 1, limit: 100 });
  const tenants = tenantsData?.tenants || [];

  const { data: subsData, isLoading: loadingSubs } = useSubscriptions(
    selectedTenant === "all" ? undefined : selectedTenant,
    statusFilter === "all" ? undefined : statusFilter,
    debouncedSearch || undefined,
    page,
    ITEMS_PER_PAGE
  );

  // FIXED: Correct parameters for useParents and increased limit for dropdown
  const { data: parentsData, isLoading: loadingParents } = useParents(
    selectedTenant === "all" ? undefined : selectedTenant,
    undefined, // search
    page,
    ITEMS_PER_PAGE, // Use the same limit here
  );

  const loading = loadingSubs || (selectedTenant !== "all" && loadingParents);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
    queryClient.invalidateQueries({ queryKey: queryKeys.parents });
  };

  // -- Unified Data Logic --
  const unifiedData = useMemo(() => {
    if (selectedTenant === "all") {
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
    return list.map((p) => {
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
  }, [parentsData, subsData, selectedTenant]);

  const stats = subsData?.stats || null;
  const totalPages = selectedTenant === "all" ? subsData?.totalPages || 1 : parentsData?.totalPages || 1;
  const totalEntries = selectedTenant === "all" ? subsData?.total || 0 : parentsData?.total || 0;

  // -- Handlers --
  const handleDelete = async () => {
    if (!deleteDialog) return;
    toast.promise(
      (async () => {
        setDeleting(true);
        try {
          const res = await apiFetch(`/api/subscriptions?id=${deleteDialog.id}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Failed to delete subscription");
          invalidate();
          setDeleteDialog(null);
          return "Subscription deleted successfully";
        } finally {
          setDeleting(false);
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
        setProcessing(true);
        try {
          const res = await apiFetch("/api/subscriptions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "admin-create", ...createForm }),
          });
          if (!res.ok) throw new Error("Failed to create subscription");
          invalidate();
          setCreateDialogOpen(false);
          return "Subscription created successfully";
        } finally {
          setProcessing(false);
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
        setProcessing(true);
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
          setEditDialogOpen(null);
          return "Subscription updated successfully";
        } finally {
          setProcessing(false);
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
        setProcessing(true);
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
          setExtendDialogOpen(null);
          return `Extended by ${extendDays} days successfully`;
        } finally {
          setProcessing(false);
        }
      })(),
      {
        loading: `Extending subscription by ${extendDays} days...`,
        success: (msg) => msg,
        error: (err: any) => err.message,
      }
    );
  };

  const openEditDialog = (sub: SubscriptionRecord) => {
    setEditForm({
      planName: sub.planName,
      amount: sub.amount,
      period: sub.period,
      autoRenew: sub.autoRenew,
      paymentMethod: sub.paymentMethod,
      status: sub.status,
    });
    setEditDialogOpen(sub);
  };

  return (
    <div className="space-y-6">
      <SubscriptionStats 
        stats={stats}
        selectedTenant={selectedTenant}
        onTenantChange={setSelectedTenant}
        tenants={tenants}
        onNewSetup={() => setCreateDialogOpen(true)}
        parentsTotal={parentsData?.total || 0}
      />

      <SubscriptionFilters 
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onRefresh={invalidate}
      />

      <SubscriptionTable 
        unifiedData={unifiedData}
        loading={loading}
        selectedTenant={selectedTenant}
        page={page}
        limit={ITEMS_PER_PAGE}
        totalPages={totalPages}
        totalEntries={totalEntries}
        onPageChange={setPage}
        onEdit={openEditDialog}
        onExtend={setExtendDialogOpen}
        onDelete={setDeleteDialog}
        onAssign={(item) => {
          setCreateForm(p => ({ ...p, parentId: item.id }));
          setCreateDialogOpen(true);
        }}
      />

      <SubscriptionDialogs 
        createOpen={createDialogOpen}
        onCreateOpenChange={setCreateDialogOpen}
        createForm={createForm}
        setCreateForm={setCreateForm}
        parents={Array.isArray(parentsData?.parents) ? parentsData.parents : []}
        onCreateSubmit={handleCreate}
        processing={processing}

        editOpen={editDialogOpen}
        onEditOpenChange={setEditDialogOpen}
        editForm={editForm}
        setEditForm={setEditForm}
        onEditSubmit={handleEdit}

        extendOpen={extendDialogOpen}
        onExtendOpenChange={setExtendDialogOpen}
        extendDays={extendDays}
        setExtendDays={setExtendDays}
        onExtendSubmit={handleExtend}

        deleteOpen={deleteDialog}
        onDeleteOpenChange={setDeleteDialog}
        onDeleteConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  );
}
