"use client";

import { useState, useMemo } from "react";
import { useUsers, useToggleUserStatus } from "@/lib/graphql/hooks";
import { goeyToast as toast } from "goey-toast";

// Sub-components
import { UserHeader } from "./users/UserHeader";
import { UserFilters } from "./users/UserFilters";
import { UserTable } from "./users/UserTable";
import { UserDetailSheet } from "./users/UserDetailSheet";

// Types
import { PlatformUser, PAGE_SIZE, TenantInfo } from "./users/types";

export function SuperAdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("admin");
  const [tenantFilter, setTenantFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Detail sheet
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Status toggle mutation
  const toggleStatus = useToggleUserStatus();

  // Fetch users via GraphQL
  const { data, isLoading: loading } = useUsers({
    role: roleFilter !== "all" ? roleFilter : undefined,
    tenantId: tenantFilter !== "all" ? tenantFilter : undefined,
    search: search.trim() || undefined,
    page: currentPage,
    limit: PAGE_SIZE,
  });

  // Role counts map
  const roleCountsMap = useMemo(() => {
    const map: Record<string, number> = {};
    const roleCounts = data?.roleCounts;
    if (Array.isArray(roleCounts)) {
      roleCounts.forEach((rc) => {
        map[rc.role] = rc.count;
      });
    }
    return map;
  }, [data]);

  const totalCount = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // Derive unique tenants from user data for the filter dropdown
  const tenants = useMemo(() => {
    const users = data?.users;
    if (!Array.isArray(users)) return [];
    const map = new Map<string, TenantInfo>();
    users.forEach((u) => {
      if (u.tenant?.id && u.tenant?.name && !map.has(u.tenant.id)) {
        map.set(u.tenant.id, {
          id: u.tenant.id,
          name: u.tenant.name,
          slug: u.tenant.slug || "",
        });
      }
    });
    return Array.from(map.values());
  }, [data]);

  // Handlers
  const handleRoleChange = (v: string) => {
    setRoleFilter(v);
    setCurrentPage(1);
  };

  const handleTenantChange = (v: string) => {
    setTenantFilter(v);
    setCurrentPage(1);
  };

  const handleSearchChange = (v: string) => {
    setSearch(v);
    setCurrentPage(1);
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      if (!selectedUser) return;
      await toggleStatus.mutateAsync({ 
        id: userId, 
        isActive: !selectedUser.isActive 
      });
      // Update selected user in sheet if open for immediate UI feedback
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, isActive: !selectedUser.isActive });
      }
    } catch (err) {
      // Error handled by hook
    }
  };

  // Date Formatters
  const formatDate = (dateValue: string) => {
    if (!dateValue) return "—";
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateValue: string) => {
    if (!dateValue) return "—";
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleUserClick = (user: PlatformUser) => {
    setSelectedUser(user);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-6 pb-10">
      <UserHeader 
        totalCount={totalCount} 
        roleCountsMap={roleCountsMap} 
      />

      <UserFilters 
        search={search}
        onSearchChange={handleSearchChange}
        roleFilter={roleFilter}
        onRoleFilterChange={handleRoleChange}
        tenantFilter={tenantFilter}
        onTenantFilterChange={handleTenantChange}
        tenants={tenants}
      />

      <UserTable 
        loading={loading}
        users={Array.isArray(data?.users) ? data.users : []}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onUserClick={handleUserClick}
        formatDate={formatDate}
      />

      <UserDetailSheet 
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        user={selectedUser}
        onToggleStatus={handleToggleStatus}
        toggling={toggleStatus.isPending}
        formatDateTime={formatDateTime}
      />
    </div>
  );
}
