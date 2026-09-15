import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, ArrowUpDown, IndianRupee, ChevronLeft, ChevronRight } from "lucide-react";
import { TenantBilling, SortKey, SortDir, planBadgeConfig } from "./types";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { StatusBadge } from "@/components/ui/status-badge";

interface TenantBillingTableProps {
  loading: boolean;
  tenants: TenantBilling[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  viewMode?: 'school' | 'parent';
}

const SCHOOL_PRICES: Record<string, number> = {
  basic: 499,
  standard: 1499,
  premium: 3999,
};

export function TenantBillingTable({
  loading,
  tenants,
  sortKey,
  sortDir,
  onSort,
  viewMode = 'parent'
}: TenantBillingTableProps) {
  const isSchoolMode = viewMode === 'school';
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [tenants]);

  const totalItems = tenants.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedTenants = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return tenants.slice(start, start + itemsPerPage);
  }, [tenants, currentPage, itemsPerPage]);

  const getAriaSort = (key: SortKey) => {
    if (sortKey !== key) return "none" as const;
    return sortDir === "asc" ? ("ascending" as const) : ("descending" as const);
  };

  return (
    <Card className="border rounded-xl bg-card">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="size-4 text-emerald-600" /> {isSchoolMode ? "School Revenue" : "Revenue by Tenant"}
        </CardTitle>
        <CardDescription>
          {isSchoolMode
            ? "Platform income generated from school license plans"
            : "Detailed breakdown of parent subscription contribution from each school"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead aria-sort={getAriaSort("name")}>
                  <button type="button" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={() => onSort("name")}>
                    School {sortKey === "name" && <ArrowUpDown className="size-3" />}
                  </button>
                </TableHead>
                <TableHead className={isSchoolMode ? "w-[15%]" : "w-[12%]"}>
                  <span className="text-xs font-medium text-muted-foreground">Status</span>
                </TableHead>
                <TableHead
                  className={`${isSchoolMode ? "w-[15%] text-center" : "w-[12%] text-center"}`}
                  aria-sort={getAriaSort("plan")}
                >
                  <button type="button" className="inline-flex items-center justify-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full" onClick={() => onSort("plan")}>
                    Active Plan {sortKey === "plan" && <ArrowUpDown className="size-3" />}
                  </button>
                </TableHead>

                {isSchoolMode ? (
                  <TableHead
                    className="w-[15%] text-right"
                    aria-sort={getAriaSort("plan")}
                  >
                    <button type="button" className="inline-flex items-center justify-end gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full" onClick={() => onSort("plan")}>
                      Plan Price {sortKey === "plan" && <ArrowUpDown className="size-3" />}
                    </button>
                  </TableHead>
                ) : (
                  <>
                    <TableHead
                      className="w-[12%] text-right"
                      aria-sort={getAriaSort("activeRevenue")}
                    >
                      <button type="button" className="inline-flex items-center justify-end gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full" onClick={() => onSort("activeRevenue")}>
                        Active Rev {sortKey === "activeRevenue" && <ArrowUpDown className="size-3" />}
                      </button>
                    </TableHead>
                    <TableHead
                      className="w-[12%] text-right"
                      aria-sort={getAriaSort("totalRevenue")}
                    >
                      <button type="button" className="inline-flex items-center justify-end gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full" onClick={() => onSort("totalRevenue")}>
                        Total Rev {sortKey === "totalRevenue" && <ArrowUpDown className="size-3" />}
                      </button>
                    </TableHead>
                  </>
                )}

                {!isSchoolMode && (
                  <TableHead
                    className="w-[12%] text-center"
                    aria-sort={getAriaSort("activeSubscriptions")}
                  >
                    <button type="button" className="inline-flex items-center justify-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full" onClick={() => onSort("activeSubscriptions")}>
                      Active Subs {sortKey === "activeSubscriptions" && <ArrowUpDown className="size-3" />}
                    </button>
                  </TableHead>
                )}
                <TableHead className={isSchoolMode ? "w-[15%] text-center" : "w-[12%] text-center"}>
                  <span className="text-xs font-medium text-muted-foreground">Total Users</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? [...Array(10)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(isSchoolMode ? 5 : 7)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : paginatedTenants.map((tenant) => {
                    const planCfg = planBadgeConfig[tenant.plan] || planBadgeConfig.Basic;
                    const schoolPrice = SCHOOL_PRICES[tenant.plan?.toLowerCase()] || 0;

                    return (
                      <TableRow key={tenant.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div className="font-semibold text-sm">{tenant.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">/{tenant.slug}</div>
                        </TableCell>
                        <TableCell>
                           <StatusBadge tone={tenant.status === 'active' ? 'positive' : tenant.status === 'trial' ? 'warning' : ['suspended', 'expired', 'inactive'].includes(tenant.status) ? 'negative' : 'neutral'}>
                             {tenant.status}
                           </StatusBadge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={`${planCfg.bg} ${planCfg.text} ${planCfg.border} text-xs font-medium`}
                          >
                            {tenant.plan}
                          </Badge>
                        </TableCell>

                        {isSchoolMode ? (
                          <TableCell className="text-right font-semibold text-emerald-600 dark:text-emerald-400">
                            <div className="flex items-center justify-end">
                              <IndianRupee className="size-3 mr-0.5" />
                              {schoolPrice.toLocaleString()}
                              <span className="text-xs text-muted-foreground ml-1 font-normal">/mo</span>
                            </div>
                          </TableCell>
                        ) : (
                          <>
                            <TableCell className="text-right font-semibold text-emerald-600 dark:text-emerald-400">
                              <div className="flex items-center justify-end">
                                <IndianRupee className="size-3 mr-0.5" />
                                {tenant.activeRevenue.toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium text-muted-foreground">
                              <div className="flex items-center justify-end">
                                <IndianRupee className="size-3 mr-0.5" />
                                {tenant.totalRevenue.toLocaleString()}
                              </div>
                            </TableCell>
                          </>
                        )}

                        {!isSchoolMode && (
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="rounded-full h-5 min-w-[20px] px-1 font-medium">
                              {tenant.activeSubscriptions}
                            </Badge>
                          </TableCell>
                        )}
                        <TableCell className="text-center">
                          <div className="text-xs font-medium text-muted-foreground">
                            {tenant._count?.users ?? 0}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </div>
        {!loading && totalPages > 1 && (
          <div className="mt-4 pt-4 border-t">
            <DataTablePagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              summary={`Showing ${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems} entries`}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
