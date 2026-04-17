import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DollarSign, 
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
  mrr: number;
  revenueGrowth: number | null;
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
  mrr,
  revenueGrowth,
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="shadow-sm border-none bg-white dark:bg-gray-800">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total Active Revenue */}
      <Card className="shadow-sm hover:shadow-md transition-all border-none bg-white dark:bg-gray-800 group">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="h-5 w-5" />
            </div>
            <Badge variant="outline" className="text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 text-[10px]">
              <ArrowUpRight className="h-3 w-3 mr-0.5" /> Active
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Active Revenue</p>
          <p className="text-2xl font-black text-foreground mt-1 flex items-center">
            <IndianRupee className="h-4 w-4" />
            {totalActiveRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            From {activeCount} active subs
          </p>
        </CardContent>
      </Card>

      {/* Monthly Recurring Revenue */}
      <Card className="shadow-sm hover:shadow-md transition-all border-none bg-white dark:bg-gray-800 group">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
            {revenueGrowth !== null && (
              <Badge
                variant="outline"
                className={`text-[10px] ${revenueGrowth >= 0 ? "text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30" : "text-red-700 dark:text-red-400 border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/30"}`}
              >
                {revenueGrowth >= 0 ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                {Math.abs(revenueGrowth)}%
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">MRR</p>
          <p className="text-2xl font-black text-foreground mt-1 flex items-center">
            <IndianRupee className="h-4 w-4" />
            {mrr.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            vs last month
          </p>
        </CardContent>
      </Card>

      {/* Total Subscriptions */}
      <Card className="shadow-sm hover:shadow-md transition-all border-none bg-white dark:bg-gray-800 group">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Receipt className="h-5 w-5" />
            </div>
            <Badge variant="outline" className="text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 text-[10px]">
              <BarChart3 className="h-3 w-3 mr-0.5" /> Total
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Subscriptions</p>
          <p className="text-2xl font-black text-foreground mt-1">
            {totalSubscriptions}
          </p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            {activeCount} active, {churnedSubscriptions} churned
          </p>
        </CardContent>
      </Card>

      {/* Avg Revenue Per Tenant */}
      <Card className="shadow-sm hover:shadow-md transition-all border-none bg-white dark:bg-gray-800 group">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-violet-50 dark:bg-violet-900/30 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="h-5 w-5" />
            </div>
            <Badge variant="outline" className="text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/30 text-[10px]">
              <Users className="h-3 w-3 mr-0.5" /> {tenantCount} tenants
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">ARPT</p>
          <p className="text-2xl font-black text-foreground mt-1 flex items-center">
            <IndianRupee className="h-4 w-4" />
            {avgRevenuePerTenant.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Average per tenant
          </p>
        </CardContent>
      </Card>

      {/* Churn Analytics */}
      <Card className="shadow-sm hover:shadow-md transition-all border-none bg-white dark:bg-gray-800 group">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowDownRight className="h-5 w-5" />
            </div>
            <Badge variant="outline" className="text-red-700 dark:text-red-400 border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/30 text-[10px]">
              {churnRate}% rate
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Churn Analytics</p>
          <p className="text-2xl font-black text-foreground mt-1">
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
