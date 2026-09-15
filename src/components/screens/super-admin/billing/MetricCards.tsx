import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  Receipt,
  Building2,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  BarChart3
} from "lucide-react";

interface MetricCardsProps {
  loading: boolean;
  totalActiveRevenue: number;
  activeCount: number;
  totalSubscriptions: number;
  churnedSubscriptions: number;
  expiredCount: number;
  cancelledCount: number;
  avgRevenuePerTenant: number;
  tenantCount: number;
  churnRate: number;
}

export function MetricCards({
  loading,
  totalActiveRevenue,
  activeCount,
  totalSubscriptions,
  churnedSubscriptions,
  expiredCount,
  cancelledCount,
  avgRevenuePerTenant,
  tenantCount,
  churnRate,
}: MetricCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border rounded-xl bg-card">
            <CardContent className="p-5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-20 mt-3" />
              <Skeleton className="h-3 w-16 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Active Revenue */}
      <Card className="border rounded-xl bg-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="size-5" />
            </div>
            <Badge variant="outline" className="text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 text-xs font-medium">
              <ArrowUpRight className="size-3 mr-0.5" /> Active
            </Badge>
          </div>
          <p className="text-xs font-medium text-muted-foreground">Active revenue</p>
          <p className="text-2xl font-semibold text-foreground mt-1 flex items-center">
            <IndianRupee className="size-4" />
            {totalActiveRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            From {activeCount} active subs
          </p>
        </CardContent>
      </Card>

      {/* Total Subscriptions */}
      <Card className="border rounded-xl bg-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="size-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
              <Receipt className="size-5" />
            </div>
            <Badge variant="outline" className="text-muted-foreground border-border bg-muted text-xs font-medium">
              <BarChart3 className="size-3 mr-0.5" /> Total
            </Badge>
          </div>
          <p className="text-xs font-medium text-muted-foreground">Subscriptions</p>
          <p className="text-2xl font-semibold text-foreground mt-1">
            {totalSubscriptions}
          </p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            {activeCount} active, {churnedSubscriptions} churned
          </p>
        </CardContent>
      </Card>

      {/* Avg Revenue Per Tenant */}
      <Card className="border rounded-xl bg-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="size-10 rounded-xl bg-violet-50 dark:bg-violet-900/30 text-violet-600 flex items-center justify-center">
              <Building2 className="size-5" />
            </div>
            <Badge variant="outline" className="text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/30 text-xs font-medium">
              <Users className="size-3 mr-0.5" /> {tenantCount} tenants
            </Badge>
          </div>
          <p className="text-xs font-medium text-muted-foreground">ARPT</p>
          <p className="text-2xl font-semibold text-foreground mt-1 flex items-center">
            <IndianRupee className="size-4" />
            {avgRevenuePerTenant.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Average per tenant
          </p>
        </CardContent>
      </Card>

      {/* Churn Analytics */}
      <Card className="border rounded-xl bg-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="size-10 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 flex items-center justify-center">
              <ArrowDownRight className="size-5" />
            </div>
            <Badge variant="outline" className="text-red-700 dark:text-red-400 border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/30 text-xs font-medium">
              {churnRate}% rate
            </Badge>
          </div>
          <p className="text-xs font-medium text-muted-foreground">Churn analytics</p>
          <p className="text-2xl font-semibold text-foreground mt-1">
            {churnedSubscriptions}
          </p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            {expiredCount} expired, {cancelledCount} cancelled
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
