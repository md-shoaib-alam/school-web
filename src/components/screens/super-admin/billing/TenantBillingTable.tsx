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
}

export function TenantBillingTable({
  loading,
  tenants,
  sortKey,
  sortDir,
  onSort,
}: TenantBillingTableProps) {
  return (
    <Card className="shadow-sm border-none bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="h-4 w-4 text-emerald-600" /> Revenue by Tenant
        </CardTitle>
        <CardDescription>
          Detailed breakdown of financial contribution from each school
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
                    Tenant {sortKey === "name" && <ArrowUpDown className="h-3 w-3" />}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="uppercase tracking-wider text-[10px] font-bold">Plan</div>
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:text-emerald-600 transition-colors"
                  onClick={() => onSort("activeRevenue")}
                >
                  <div className="flex items-center justify-end gap-1 uppercase tracking-wider text-[10px] font-bold">
                    Active Rev {sortKey === "activeRevenue" && <ArrowUpDown className="h-3 w-3" />}
                  </div>
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:text-emerald-600 transition-colors"
                  onClick={() => onSort("totalRevenue")}
                >
                  <div className="flex items-center justify-end gap-1 uppercase tracking-wider text-[10px] font-bold">
                    Total Rev {sortKey === "totalRevenue" && <ArrowUpDown className="h-3 w-3" />}
                  </div>
                </TableHead>
                <TableHead
                  className="text-center cursor-pointer hover:text-emerald-600 transition-colors"
                  onClick={() => onSort("activeSubscriptions")}
                >
                  <div className="flex items-center justify-center gap-1 uppercase tracking-wider text-[10px] font-bold">
                    Active Subs {sortKey === "activeSubscriptions" && <ArrowUpDown className="h-3 w-3" />}
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="uppercase tracking-wider text-[10px] font-bold">Usage</div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? [...Array(10)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(6)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : tenants.map((tenant) => {
                    const planCfg = planBadgeConfig[tenant.plan] || planBadgeConfig.Basic;
                    return (
                      <TableRow key={tenant.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                        <TableCell>
                          <div className="font-bold text-sm">{tenant.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">/{tenant.slug}</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${planCfg.bg} ${planCfg.text} ${planCfg.border} text-[10px] font-bold`}
                          >
                            {tenant.plan}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-black text-emerald-600 dark:text-emerald-400">
                          <div className="flex items-center justify-end">
                            <IndianRupee className="h-3 w-3 mr-0.5" />
                            {tenant.activeRevenue.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-muted-foreground">
                          <div className="flex items-center justify-end">
                            <IndianRupee className="h-3 w-3 mr-0.5" />
                            {tenant.totalRevenue.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="rounded-full h-5 min-w-[20px] px-1 font-bold">
                            {tenant.activeSubscriptions}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-[10px] font-bold text-muted-foreground">
                            {tenant._count?.users ?? 0}u | {tenant._count?.classes ?? 0}c
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
