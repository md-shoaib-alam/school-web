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
import { Building2, ArrowUpDown, IndianRupee } from "lucide-react";
import { TenantBilling, SortKey, SortDir, planBadgeConfig } from "./types";

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

  return (
    <Card className="shadow-sm border-none bg-white dark:bg-gray-800">
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
        <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-gray-900/50 hover:bg-gray-50/50">
                <TableHead
                  className="cursor-pointer hover:text-emerald-600 transition-colors"
                  onClick={() => onSort("name")}
                >
                  <div className="flex items-center gap-1 uppercase tracking-wider text-[10px] font-bold">
                    School {sortKey === "name" && <ArrowUpDown className="size-3" />}
                  </div>
                </TableHead>
                <TableHead className={isSchoolMode ? "w-[15%]" : "w-[12%]"}>
                  <div className="uppercase tracking-wider text-[10px] font-bold">Status</div>
                </TableHead>
                <TableHead 
                  className={`${isSchoolMode ? "w-[15%] text-center" : "w-[12%] text-center"} cursor-pointer hover:text-emerald-600 transition-colors`}
                  onClick={() => onSort("plan")}
                >
                  <div className="flex items-center justify-center gap-1 uppercase tracking-wider text-[10px] font-bold">
                    Active Plan {sortKey === "plan" && <ArrowUpDown className="size-3" />}
                  </div>
                </TableHead>
                
                {isSchoolMode ? (
                  <TableHead 
                    className="w-[15%] text-right cursor-pointer hover:text-emerald-600 transition-colors"
                    onClick={() => onSort("plan")}
                  >
                    <div className="flex items-center justify-end gap-1 uppercase tracking-wider text-[10px] font-bold">
                      Plan Price {sortKey === "plan" && <ArrowUpDown className="size-3" />}
                    </div>
                  </TableHead>
                ) : (
                  <>
                    <TableHead
                      className="w-[12%] text-right cursor-pointer hover:text-emerald-600 transition-colors"
                      onClick={() => onSort("activeRevenue")}
                    >
                      <div className="flex items-center justify-end gap-1 uppercase tracking-wider text-[10px] font-bold">
                        Active Rev {sortKey === "activeRevenue" && <ArrowUpDown className="size-3" />}
                      </div>
                    </TableHead>
                    <TableHead
                      className="w-[12%] text-right cursor-pointer hover:text-emerald-600 transition-colors"
                      onClick={() => onSort("totalRevenue")}
                    >
                      <div className="flex items-center justify-end gap-1 uppercase tracking-wider text-[10px] font-bold">
                        Total Rev {sortKey === "totalRevenue" && <ArrowUpDown className="size-3" />}
                      </div>
                    </TableHead>
                  </>
                )}

                {!isSchoolMode && (
                  <TableHead
                    className="w-[12%] text-center cursor-pointer hover:text-emerald-600 transition-colors"
                    onClick={() => onSort("activeSubscriptions")}
                  >
                    <div className="flex items-center justify-center gap-1 uppercase tracking-wider text-[10px] font-bold">
                      Active Subs {sortKey === "activeSubscriptions" && <ArrowUpDown className="size-3" />}
                    </div>
                  </TableHead>
                )}
                <TableHead className={isSchoolMode ? "w-[15%] text-center" : "w-[12%] text-center"}>
                  <div className="uppercase tracking-wider text-[10px] font-bold">Total Users</div>
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
                : tenants.map((tenant) => {
                    const planCfg = planBadgeConfig[tenant.plan] || planBadgeConfig.Basic;
                    const schoolPrice = SCHOOL_PRICES[tenant.plan?.toLowerCase()] || 0;

                    return (
                      <TableRow key={tenant.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                        <TableCell>
                          <div className="font-bold text-sm">{tenant.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">/{tenant.slug}</div>
                        </TableCell>
                        <TableCell>
                           <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'} className="text-[10px] capitalize h-5">
                             {tenant.status}
                           </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={`${planCfg.bg} ${planCfg.text} ${planCfg.border} text-[10px] font-bold`}
                          >
                            {tenant.plan}
                          </Badge>
                        </TableCell>

                        {isSchoolMode ? (
                          <TableCell className="text-right font-black text-blue-600 dark:text-blue-400">
                            <div className="flex items-center justify-end">
                              <IndianRupee className="size-3 mr-0.5" />
                              {schoolPrice.toLocaleString()}
                              <span className="text-[9px] text-muted-foreground ml-1 font-normal">/mo</span>
                            </div>
                          </TableCell>
                        ) : (
                          <>
                            <TableCell className="text-right font-black text-emerald-600 dark:text-emerald-400">
                              <div className="flex items-center justify-end">
                                <IndianRupee className="size-3 mr-0.5" />
                                {tenant.activeRevenue.toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-bold text-muted-foreground">
                              <div className="flex items-center justify-end">
                                <IndianRupee className="size-3 mr-0.5" />
                                {tenant.totalRevenue.toLocaleString()}
                              </div>
                            </TableCell>
                          </>
                        )}

                        {!isSchoolMode && (
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="rounded-full h-5 min-w-[20px] px-1 font-bold">
                              {tenant.activeSubscriptions}
                            </Badge>
                          </TableCell>
                        )}
                        <TableCell className="text-center">
                          <div className="text-[10px] font-bold text-muted-foreground">
                            {tenant._count?.users ?? 0}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
