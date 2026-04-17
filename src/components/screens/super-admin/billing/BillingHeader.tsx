import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Activity, IndianRupee, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface BillingHeaderProps {
  loading: boolean;
  totalRevenue: number;
  totalActiveRevenue: number;
  mrr: number;
  revenueGrowth: number | null;
  churnRate: number;
  churnedSubscriptions: number;
  onRefresh: () => void;
}

export function BillingHeader({
  loading,
  totalRevenue,
  totalActiveRevenue,
  mrr,
  revenueGrowth,
  churnRate,
  churnedSubscriptions,
  onRefresh,
}: BillingHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-6 md:p-8 text-white shadow-xl">
      <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
      <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-white/5 rounded-full translate-y-1/2 blur-xl" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner">
              <DollarSign className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Billing & Revenue</h2>
              <p className="text-emerald-50 text-sm opacity-90">
                Platform-wide financial analytics and subscription insights
              </p>
            </div>
          </div>
          <Button
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md w-fit rounded-xl px-6 h-11 transition-all hover:scale-105 active:scale-95 shadow-lg"
            onClick={onRefresh}
          >
            <Activity className="h-4 w-4 mr-2" /> Refresh Data
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/10 shadow-lg">
                <Skeleton className="h-3 w-20 bg-white/20" />
                <Skeleton className="h-8 w-24 bg-white/20 mt-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/10 shadow-lg hover:bg-white/15 transition-colors">
              <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Total Revenue</p>
              <p className="text-2xl font-extrabold flex items-center gap-1">
                <IndianRupee className="h-5 w-5" />
                {totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/10 shadow-lg hover:bg-white/15 transition-colors">
              <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Active Revenue</p>
              <p className="text-2xl font-extrabold flex items-center gap-1">
                <IndianRupee className="h-5 w-5" />
                {totalActiveRevenue.toLocaleString()}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/10 shadow-lg hover:bg-white/15 transition-colors">
              <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">MRR</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-extrabold flex items-center gap-1">
                  <IndianRupee className="h-5 w-5" />
                  {mrr.toLocaleString()}
                </p>
                {revenueGrowth !== null && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${revenueGrowth >= 0 ? "bg-emerald-400/30 text-emerald-100" : "bg-red-400/30 text-red-100"}`}>
                    {revenueGrowth >= 0 ? "+" : ""}{revenueGrowth}%
                  </span>
                )}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/10 shadow-lg hover:bg-white/15 transition-colors">
              <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Churn Rate</p>
              <p className="text-2xl font-extrabold">
                {churnRate}%
                <span className="text-xs font-medium text-emerald-100/70 ml-2">
                  ({churnedSubscriptions} subs)
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
