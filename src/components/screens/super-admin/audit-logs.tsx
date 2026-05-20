"use client";

import { useState, useMemo } from "react";
import { useAuditLogs, useTenants } from "@/lib/graphql/hooks";

// Sub-components
import { LogStats } from "./audit-logs/LogStats";
import { LogTable } from "./audit-logs/LogTable";

export function SuperAdminAuditLogs() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [tenantFilter, setTenantFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch simple list of tenants for selection
  const { data: tenantsData } = useTenants({ limit: 100 });

  // Fetch via GraphQL
  const {
    data,
    isLoading: loading,
  } = useAuditLogs({
    action: actionFilter !== "all" ? actionFilter : undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
    tenantId: tenantFilter !== "all" ? tenantFilter : undefined,
    page,
    limit,
  });

  const filteredLogs = useMemo(() => {
    const list = data?.logs;
    if (!Array.isArray(list)) return [];
    
    return list.filter((log) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.resource.toLowerCase().includes(q) ||
        log.details?.toLowerCase().includes(q) ||
        log.tenant?.name?.toLowerCase().includes(q)
      );
    });
  }, [data, search]);

  const totalLogs = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const handleActionFilterChange = (val: string) => {
    setActionFilter(val);
    setPage(1);
  };

  const handleRoleFilterChange = (val: string) => {
    setRoleFilter(val);
    setPage(1);
  };

  const handleTenantFilterChange = (val: string) => {
    setTenantFilter(val);
    setPage(1);
  };

  return (
    <div className="space-y-8 pb-12">

      <LogTable 
        loading={loading}
        logs={filteredLogs}
        totalLogs={totalLogs}
        page={page}
        totalPages={totalPages}
        limit={limit}
        onPageChange={setPage}
        search={search}
        onSearchChange={setSearch}
        actionFilter={actionFilter}
        onActionFilterChange={handleActionFilterChange}
        roleFilter={roleFilter}
        onRoleFilterChange={handleRoleFilterChange}
        tenantFilter={tenantFilter}
        onTenantFilterChange={handleTenantFilterChange}
        tenants={tenantsData?.tenants || []}
        actionTypes={data?.actionTypes || []}
      />
    </div>
  );
}
