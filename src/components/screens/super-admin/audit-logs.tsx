"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ScrollText } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { useAuditLogs, useTenants } from "@/lib/graphql/hooks";

import { LogExplorer } from "./audit-logs/LogExplorer";
import { parse, rowOf, rowPasses } from "./audit-logs/explorer-query";

/** How often the live pill asks for new events, and how many a page holds. */
const POLL_MS = 30_000;
const LIMIT = 25;

export function SuperAdminAuditLogs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const pageParam = searchParams.get("page");
  const rawPage = pageParam ? Number(pageParam) : 1;
  const initialPage = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [tenantFilter, setTenantFilter] = useState<string>("all");
  const [page, setPage] = useState(initialPage);
  // The stream only runs while the reader is looking at the newest events, so leaving page 1 stops it.
  const [live, setLive] = useState(initialPage === 1);

  const updateUrlParams = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 1) params.set("page", String(newPage)); else params.delete("page");
    const newQuery = params.toString();
    router.replace(newQuery ? `${pathname}?${newQuery}` : pathname, { scroll: false });
  };

  const { data: tenantsData } = useTenants({ limit: 100 });

  const { data, isLoading: loading } = useAuditLogs(
    {
      action: actionFilter !== "all" ? actionFilter : undefined,
      role: roleFilter !== "all" ? roleFilter : undefined,
      tenantId: tenantFilter !== "all" ? tenantFilter : undefined,
      page,
      limit: LIMIT,
    },
    { refetchInterval: live && page === 1 ? POLL_MS : undefined },
  );

  const rows = useMemo(() => (data?.logs ?? []).map(rowOf), [data]);
  const terms = useMemo(() => parse(query), [query]);
  const filtered = useMemo(() => rows.filter((row) => rowPasses(terms, row)), [rows, terms]);

  const totalLogs = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const changeFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
    updateUrlParams(1);
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        icon={<ScrollText />}
        title="Audit Logs"
        description="Every change made across the platform, newest first. Type to filter the events on this page."
      />

      <LogExplorer
        loading={loading}
        rows={filtered}
        pageRows={rows.length}
        total={totalLogs}
        page={page}
        totalPages={totalPages}
        limit={LIMIT}
        onPageChange={(next) => {
          setPage(next);
          if (next !== 1) setLive(false);
          updateUrlParams(next);
        }}
        query={query}
        onQueryChange={setQuery}
        live={live}
        onLiveChange={setLive}
        roleFilter={roleFilter}
        onRoleFilterChange={changeFilter(setRoleFilter)}
        tenantFilter={tenantFilter}
        onTenantFilterChange={changeFilter(setTenantFilter)}
        actionFilter={actionFilter}
        onActionFilterChange={changeFilter(setActionFilter)}
        tenants={tenantsData?.tenants ?? []}
        actionTypes={data?.actionTypes ?? []}
      />
    </div>
  );
}
