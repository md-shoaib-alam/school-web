import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Activity, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight 
} from "lucide-react";

interface AnalyticsStatsProps {
  loading: boolean;
  metrics: {
    mrr: number;
    arr: number;
    ltv: number;
    churnRate: number;
    cac: number;
  };
}

function MetricCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-11 w-11 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsStats({ loading, metrics }: AnalyticsStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">MRR</p>
              <p className="text-2xl font-bold mt-1">${metrics.mrr.toLocaleString()}</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" /> +12.5% vs last month
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">ARR</p>
              <p className="text-2xl font-bold mt-1">${metrics.arr.toLocaleString()}</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" /> +8.3% YoY
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">LTV</p>
              <p className="text-2xl font-bold mt-1">${metrics.ltv.toLocaleString()}</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" /> +5.2% vs last quarter
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Churn Rate</p>
              <p className="text-2xl font-bold mt-1">{metrics.churnRate}%</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
            <ArrowDownRight className="h-3 w-3" /> -0.8% vs last month
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">CAC</p>
              <p className="text-2xl font-bold mt-1">${metrics.cac.toLocaleString()}</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" /> +2.1% vs last month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
