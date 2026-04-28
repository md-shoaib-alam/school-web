"use client";

import { useState, useMemo } from "react";
import { useAuditLogs } from "@/lib/graphql/hooks";

// Sub-components
import { LogStats } from "./audit-logs/LogStats";
import { LogTable } from "./audit-logs/LogTable";

export function SuperAdminAuditLogs() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch via GraphQL
  const {
    data,
    isLoading: loading,
  } = useAuditLogs({
    action: actionFilter !== "all" ? actionFilter : undefined,
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

  return (
    <div className="space-y-8 pb-12">
      <LogStats 
        loading={loading} 
        totalLogs={totalLogs} 
        actionTypes={data?.actionTypes || []} 
      />

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
        actionTypes={data?.actionTypes || []}
      />
    </div>
  );
}
