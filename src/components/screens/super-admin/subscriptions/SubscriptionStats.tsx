import { Crown, IndianRupee, Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SubscriptionStatsProps {
  stats: any;
  selectedTenant: string;
  onTenantChange: (value: string) => void;
  tenants: any[];
  onNewSetup: () => void;
  parentsTotal: number;
}

export function SubscriptionStats({
  stats,
  selectedTenant,
  onTenantChange,
  tenants,
  onNewSetup,
  parentsTotal,
}: SubscriptionStatsProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-950 via-teal-900 to-teal-800 p-6 text-white shadow-lg">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Crown className="h-6 w-6 text-teal-200" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Parent Subscriptions
              </h2>
              <p className="text-teal-200 text-sm">
                Manage premium access across all schools
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-1 flex items-center gap-2">
              <Building2 className="h-4 w-4 ml-2 text-teal-200" />
              <Select
                value={selectedTenant}
                onValueChange={onTenantChange}
              >
                <SelectTrigger className="w-[200px] bg-transparent border-0 text-white focus:ring-0">
                  <SelectValue placeholder="Select School" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  {tenants.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedTenant !== "all" && (
              <Button
                className="bg-white/20 border-white/30 hover:bg-white/30 text-white"
                onClick={onNewSetup}
              >
                <Plus className="h-4 w-4 mr-2" /> New Setup
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <p className="text-teal-200 text-[10px] font-medium uppercase tracking-wider">
              Active Plans
            </p>
            <p className="text-xl font-bold mt-0.5">
              {stats?.activeSubscriptions || 0}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <p className="text-teal-200 text-[10px] font-medium uppercase tracking-wider">
              Total Revenue
            </p>
            <p className="text-xl font-bold mt-0.5 flex items-center gap-1">
              <IndianRupee className="h-3.5 w-3.5" />
              {(stats?.totalRevenue || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <p className="text-teal-200 text-[10px] font-medium uppercase tracking-wider">
              Avg Plan Value
            </p>
            <p className="text-xl font-bold mt-0.5 flex items-center gap-1">
              <IndianRupee className="h-3.5 w-3.5" />
              {stats?.totalSubscriptions
                ? Math.round(
                    stats.totalRevenue / stats.totalSubscriptions,
                  ).toLocaleString()
                : 0}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <p className="text-teal-200 text-[10px] font-medium uppercase tracking-wider">
              Non-Subscribers
            </p>
            <p className="text-xl font-bold mt-0.5 text-emerald-300">
              {selectedTenant === "all"
                ? "—"
                : Math.max(0, parentsTotal - (stats?.totalSubscriptions || 0))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
