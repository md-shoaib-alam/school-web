"use client";

import { useState, useMemo, useCallback } from "react";
import { SchoolDetail } from "./school-detail";
import {
  useTenants,
  useCreateTenant,
  useUpdateTenant,
  useDeleteTenant,
  useToggleTenantStatus,
  useCreateUser,
} from "@/lib/graphql/hooks";
import { useModulePermissions } from "@/hooks/use-permissions";

// Sub-components
import { TenantStats } from "./tenants/TenantStats";
import { TenantFilters } from "./tenants/TenantFilters";
import { TenantTable } from "./tenants/TenantTable";
import { TenantDialogs } from "./tenants/TenantDialogs";
import { 
  Tenant, 
  TenantFormData, 
  ViewMode, 
  ITEMS_PER_PAGE, 
  emptyFormData 
} from "./tenants/types";

export function SuperAdminTenants() {
  const { canCreate, canEdit, canDelete } = useModulePermissions("tenants");
  
  // -- State --
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);

  // -- GraphQL Hooks --
  const { data: tenantsData, isLoading: loading } = useTenants({
    status: statusFilter !== "all" ? statusFilter : undefined,
    plan: planFilter !== "all" ? planFilter : undefined,
    search: search || undefined,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });
  
  const tenants = (tenantsData?.tenants ?? []) as Tenant[];
  const totalPages = tenantsData?.totalPages ?? 1;

  const createTenant = useCreateTenant();
  const updateTenant = useUpdateTenant();
  const deleteTenant = useDeleteTenant();
  const toggleTenantStatus = useToggleTenantStatus();
  const createUser = useCreateUser();

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [viewingTenant, setViewingTenant] = useState<Tenant | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);
  const [targetTenantForAdmin, setTargetTenantForAdmin] = useState<Tenant | null>(null);
  
  const [formData, setFormData] = useState<TenantFormData>(emptyFormData);
  const [submitting, setSubmitting] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);
  
  const [adminFormData, setAdminFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // -- Computed Stats --
  const stats = useMemo(() => {
    return {
      total: tenantsData?.total || 0,
      active: tenants.filter(t => t.status === "active").length, // Note: This only counts current page, ideally server should return these stats
      trial: tenants.filter(t => t.status === "trial").length,
      suspended: tenants.filter(t => t.status === "suspended").length,
    };
  }, [tenantsData, tenants]);

  // -- Helpers --
  const generateSlug = (name: string) => {
    return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  };

  // -- Handlers --
  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      ...(autoSlug ? { slug: generateSlug(name) } : {}),
    }));
  };

  const handleOpenAddDialog = () => {
    setEditingTenant(null);
    setFormData(emptyFormData);
    setAutoSlug(true);
    setFormDialogOpen(true);
  };

  const handleOpenAddAdmin = (tenant: Tenant) => {
    setTargetTenantForAdmin(tenant);
    setAdminFormData({ name: "", email: "", phone: "", password: "" });
    setAdminModalOpen(true);
  };

  const handleOpenEditDialog = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      slug: tenant.slug,
      email: tenant.email || "",
      phone: tenant.phone || "",
      address: tenant.address || "",
      website: tenant.website || "",
      plan: tenant.plan,
      maxStudents: tenant.maxStudents,
      maxTeachers: tenant.maxTeachers,
      maxParents: tenant.maxParents,
      maxClasses: tenant.maxClasses,
      status: tenant.status,
    });
    setAutoSlug(false);
    setFormDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.slug.trim()) return;
    setSubmitting(true);
    try {
      if (editingTenant) {
        await updateTenant.mutateAsync({ id: editingTenant.id, data: formData as any });
      } else {
        await createTenant.mutateAsync(formData);
      }
      setFormDialogOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (tenant: Tenant) => {
    const newStatus = tenant.status === "active" ? "suspended" : "active";
    await toggleTenantStatus.mutateAsync({ id: tenant.id, status: newStatus });
  };

  const handleDelete = async () => {
    if (!deletingTenant) return;
    await deleteTenant.mutateAsync(deletingTenant.id);
    setDeleteDialogOpen(false);
    setDeletingTenant(null);
  };

  const handleCreateAdmin = async () => {
    if (!targetTenantForAdmin || !adminFormData.name || !adminFormData.email || !adminFormData.password) return;
    setSubmitting(true);
    try {
      await createUser.mutateAsync({
        ...adminFormData,
        role: "admin",
        tenantId: targetTenantForAdmin.id,
      });
      setAdminModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  // -- Layout Switch --
  if (selectedTenant) {
    return (
      <SchoolDetail
        tenantId={selectedTenant.id}
        tenantName={selectedTenant.name}
        tenantSlug={selectedTenant.slug}
        tenantPlan={selectedTenant.plan}
        onBack={() => setSelectedTenant(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <TenantStats stats={stats} />
      
      <TenantFilters 
        search={search}
        onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }}
        planFilter={planFilter}
        onPlanFilterChange={(v) => { setPlanFilter(v); setCurrentPage(1); }}
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddClick={handleOpenAddDialog}
        canCreate={canCreate}
      />

      <TenantTable 
        tenants={tenants}
        loading={loading}
        viewMode={viewMode}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onView={setViewingTenant} // This opens the view details dialog
        onEdit={handleOpenEditDialog}
        onToggleStatus={handleToggleStatus}
        onDelete={(t) => { setDeletingTenant(t); setDeleteDialogOpen(true); }}
        onManageData={setSelectedTenant} // This switches to SchoolDetail view
        onAddAdmin={handleOpenAddAdmin}
      />

      <TenantDialogs 
        formOpen={formDialogOpen}
        onFormOpenChange={setFormDialogOpen}
        editingTenant={editingTenant}
        formData={formData}
        setFormData={setFormData}
        autoSlug={autoSlug}
        setAutoSlug={setAutoSlug}
        onNameChange={handleNameChange}
        onSubmit={handleSubmit}
        submitting={submitting}
        
        detailOpen={!!viewingTenant}
        onDetailOpenChange={(open) => !open && setViewingTenant(null)}
        viewingTenant={viewingTenant}
        onEditClick={handleOpenEditDialog}

        deleteOpen={deleteDialogOpen}
        onDeleteOpenChange={setDeleteDialogOpen}
        deletingTenant={deletingTenant}
        onDeleteConfirm={handleDelete}

        adminOpen={adminModalOpen}
        onAdminOpenChange={setAdminModalOpen}
        targetTenant={targetTenantForAdmin}
        adminFormData={adminFormData}
        setAdminFormData={setAdminFormData}
        showAdminPassword={showAdminPassword}
        setShowAdminPassword={setShowAdminPassword}
        onCreateAdmin={handleCreateAdmin}
      />
    </div>
  );
}
