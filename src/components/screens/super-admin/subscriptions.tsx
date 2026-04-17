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

export function SuperAdminSubscriptions() {
  const [selectedTenant, setSelectedTenant] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;
  const queryClient = useQueryClient();

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedTenant, statusFilter, search]);

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

  const { data: subsData, isLoading: loadingSubs } = useSubscriptions({
    tenantId: selectedTenant === "all" ? undefined : selectedTenant,
    status: statusFilter === "all" ? undefined : statusFilter,
    search: search || undefined,
    page,
    limit,
  });

  const { data: parentsData, isLoading: loadingParents } = useParents(
    selectedTenant === "all" ? undefined : selectedTenant,
    page,
    limit,
  );

  const loading = loadingSubs || (selectedTenant !== "all" && loadingParents);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
    queryClient.invalidateQueries({ queryKey: queryKeys.parents });
  };

  // -- Unified Data Logic --
  const unifiedData = useMemo(() => {
    if (selectedTenant === "all") {
      return (subsData?.subscriptions || []).map((s) => ({
        id: s.id,
        parent: s.parent,
        subscription: s,
        status: s.status,
      }));
    }

    return (parentsData?.parents || []).map((p) => {
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
    setDeleting(true);
    try {
      await apiFetch(`/api/subscriptions?id=${deleteDialog.id}`, { method: "DELETE" });
      toast.success("Subscription deleted");
      invalidate();
      setDeleteDialog(null);
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handleCreate = async () => {
    if (!createForm.parentId) {
      toast.error("Please select a parent");
      return;
    }
    setProcessing(true);
    try {
      const res = await apiFetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "admin-create", ...createForm }),
      });
      if (!res.ok) throw new Error();
      toast.success("Subscription created");
      invalidate();
      setCreateDialogOpen(false);
    } catch {
      toast.error("Failed to create");
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = async () => {
    if (!editDialogOpen) return;
    setProcessing(true);
    try {
      await apiFetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin-update",
          subscriptionId: editDialogOpen.id,
          ...editForm,
        }),
      });
      toast.success("Subscription updated");
      invalidate();
      setEditDialogOpen(null);
    } catch {
      toast.error("Failed to update");
    } finally {
      setProcessing(false);
    }
  };

  const handleExtend = async () => {
    if (!extendDialogOpen || !extendDays || Number(extendDays) <= 0) {
      toast.error("Enter valid days");
      return;
    }
    setProcessing(true);
    try {
      await apiFetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin-extend",
          subscriptionId: extendDialogOpen.id,
          days: Number(extendDays),
        }),
      });
      toast.success(`Extended by ${extendDays} days`);
      invalidate();
      setExtendDialogOpen(null);
    } catch {
      toast.error("Failed to extend");
    } finally {
      setProcessing(false);
    }
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
        parents={parentsData?.parents || []}
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
