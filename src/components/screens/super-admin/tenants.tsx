"use client";

import { useMemo, useReducer } from "react";
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
import { toast } from "sonner";

// Sub-components
import { TenantStats } from "./tenants/TenantStats";
import { TenantFilters } from "./tenants/TenantFilters";
import { TenantTable } from "./tenants/TenantTable";
import { TenantDialogs } from "./tenants/TenantDialogs";
import { 
  Tenant, 
  ITEMS_PER_PAGE, 
  emptyFormData 
} from "./tenants/types";
import { tenantsReducer, initialState } from "./tenants/reducer";

export function SuperAdminTenants() {
  const { canCreate, canEdit, canDelete } = useModulePermissions("tenants");
  const [state, dispatch] = useReducer(tenantsReducer, initialState);

  const {
    search,
    planFilter,
    statusFilter,
    viewMode,
    currentPage,
    formDialogOpen,
    deleteDialogOpen,
    adminModalOpen,
    selectedTenant,
    editingTenant,
    viewingTenant,
    deletingTenant,
    targetTenantForAdmin,
    formData,
    submitting,
    autoSlug,
    adminFormData,
    showAdminPassword,
  } = state;

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

  // -- Computed Stats --
  const stats = useMemo(() => {
    if (tenantsData?.stats) {
      return tenantsData.stats;
    }
    return {
      total: tenantsData?.total || 0,
      active: 0,
      trial: 0,
      suspended: 0,
    };
  }, [tenantsData]);

  // -- Helpers --
  const generateSlug = (name: string) => {
    return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  };

  // -- Handlers --
  const handleNameChange = (name: string) => {
    dispatch({
      type: "SET_FORM_DATA",
      data: {
        name,
        ...(autoSlug ? { slug: generateSlug(name) } : {}),
      }
    });
  };

  const handleOpenAddDialog = () => {
    dispatch({ type: "SET_EDITING_TENANT", tenant: null });
    dispatch({ type: "RESET_FORM_DATA" });
    dispatch({ type: "SET_AUTO_SLUG", autoSlug: true });
    dispatch({ type: "SET_FORM_DIALOG_OPEN", open: true });
  };

  const handleOpenAddAdmin = (tenant: Tenant) => {
    dispatch({ type: "SET_TARGET_TENANT_FOR_ADMIN", tenant });
    dispatch({ type: "SET_ADMIN_FORM_DATA", data: { name: "", email: "", phone: "", password: "" } });
    dispatch({ type: "SET_ADMIN_MODAL_OPEN", open: true });
  };

  const handleOpenEditDialog = (tenant: Tenant) => {
    dispatch({
      type: "SET_EDITING_TENANT",
      tenant,
      formData: {
        name: tenant.name,
        slug: tenant.slug,
        logo: tenant.logo || "",
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
      }
    });

    dispatch({ type: "SET_AUTO_SLUG", autoSlug: false });
    dispatch({ type: "SET_FORM_DIALOG_OPEN", open: true });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.slug.trim()) return;
    dispatch({ type: "SET_SUBMITTING", submitting: true });
    try {
      if (editingTenant) {
        await updateTenant.mutateAsync({ id: editingTenant.id, data: formData as any });
      } else {
        await createTenant.mutateAsync(formData);
      }
      dispatch({ type: "SET_FORM_DIALOG_OPEN", open: false });
    } finally {
      dispatch({ type: "SET_SUBMITTING", submitting: false });
    }
  };

  const handleToggleStatus = async (tenant: Tenant) => {
    const newStatus = tenant.status === "active" ? "suspended" : "active";
    await toggleTenantStatus.mutateAsync({ id: tenant.id, status: newStatus });
  };

  const handleDelete = async () => {
    if (!deletingTenant) return;
    await deleteTenant.mutateAsync(deletingTenant.id);
    dispatch({ type: "SET_DELETE_DIALOG_OPEN", open: false });
    dispatch({ type: "SET_DELETING_TENANT", tenant: null });
  };

  const handleCreateAdmin = async () => {
    if (!targetTenantForAdmin || !adminFormData.name || !adminFormData.email || !adminFormData.password) return;
    dispatch({ type: "SET_SUBMITTING", submitting: true });
    try {
      await createUser.mutateAsync({
        ...adminFormData,
        role: "admin",
        tenantId: targetTenantForAdmin.id,
      });
      toast.success('Admin account created successfully');
      dispatch({ type: "SET_ADMIN_MODAL_OPEN", open: false });
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create admin account');
    } finally {
      dispatch({ type: "SET_SUBMITTING", submitting: false });
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
        onBack={() => dispatch({ type: "SET_SELECTED_TENANT", tenant: null })}
      />
    );
  }

  return (
    <div className="space-y-6">
      <TenantStats stats={stats} />
      
      <TenantFilters 
        search={search}
        onSearchChange={(v) => dispatch({ type: "SET_SEARCH", search: v })}
        planFilter={planFilter}
        onPlanFilterChange={(v) => dispatch({ type: "SET_PLAN_FILTER", filter: v })}
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => dispatch({ type: "SET_STATUS_FILTER", filter: v })}
        viewMode={viewMode}
        onViewModeChange={(v) => dispatch({ type: "SET_VIEW_MODE", mode: v })}
        onAddClick={handleOpenAddDialog}
        canCreate={canCreate}
      />

      <TenantTable 
        tenants={tenants}
        loading={loading}
        viewMode={viewMode}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => dispatch({ type: "SET_CURRENT_PAGE", page: p })}
        onView={(t) => dispatch({ type: "SET_VIEWING_TENANT", tenant: t })} 
        onEdit={handleOpenEditDialog}
        onToggleStatus={handleToggleStatus}
        onDelete={(t) => {
          dispatch({ type: "SET_DELETING_TENANT", tenant: t });
          dispatch({ type: "SET_DELETE_DIALOG_OPEN", open: true });
        }}
        onManageData={(t) => dispatch({ type: "SET_SELECTED_TENANT", tenant: t })} 
        onAddAdmin={handleOpenAddAdmin}
      />

      <TenantDialogs 
        formOpen={formDialogOpen}
        onFormOpenChange={(v) => dispatch({ type: "SET_FORM_DIALOG_OPEN", open: v })}
        editingTenant={editingTenant}
        formData={formData}
        setFormData={(data) => {
           if (typeof data === 'function') {
             dispatch({ type: "SET_FORM_DATA", data: (data as any)(formData) });
           } else {
             dispatch({ type: "SET_FORM_DATA", data });
           }
        }}
        autoSlug={autoSlug}
        setAutoSlug={(v) => dispatch({ type: "SET_AUTO_SLUG", autoSlug: v })}
        onNameChange={handleNameChange}
        onSubmit={handleSubmit}
        submitting={submitting}
        
        detailOpen={!!viewingTenant}
        onDetailOpenChange={(open) => !open && dispatch({ type: "SET_VIEWING_TENANT", tenant: null })}
        viewingTenant={viewingTenant}
        onEditClick={handleOpenEditDialog}

        deleteOpen={deleteDialogOpen}
        onDeleteOpenChange={(v) => dispatch({ type: "SET_DELETE_DIALOG_OPEN", open: v })}
        deletingTenant={deletingTenant}
        onDeleteConfirm={handleDelete}

        adminOpen={adminModalOpen}
        onAdminOpenChange={(v) => dispatch({ type: "SET_ADMIN_MODAL_OPEN", open: v })}
        targetTenant={targetTenantForAdmin}
        adminFormData={adminFormData}
        setAdminFormData={(data) => {
          if (typeof data === 'function') {
            dispatch({ type: "SET_ADMIN_FORM_DATA", data: (data as any)(adminFormData) });
          } else {
            dispatch({ type: "SET_ADMIN_FORM_DATA", data });
          }
        }}
        showAdminPassword={showAdminPassword}
        setShowAdminPassword={(v) => dispatch({ type: "SET_SHOW_ADMIN_PASSWORD", show: v })}
        onCreateAdmin={handleCreateAdmin}
      />
    </div>
  );
}
