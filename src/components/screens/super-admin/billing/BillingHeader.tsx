import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, IndianRupee, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface BillingHeaderProps {
  onRefresh: () => void;
}

export function BillingHeader({
  onRefresh,
}: BillingHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-6 md:p-8 text-white shadow-xl">
      <div className="absolute top-0 right-0 size-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
      <div className="absolute bottom-0 left-1/3 size-56 bg-white/5 rounded-full translate-y-1/2 blur-xl" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner">
              <IndianRupee className="size-7" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Billing & Revenue</h2>
              <p className="text-emerald-50 text-sm opacity-90">
                Platform-wide financial analytics and subscription insights
              </p>
            </div>
          </div>
          <Button
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md w-fit rounded-xl px-6 h-11 transition-all hover:scale-105 active:scale-95 shadow-lg"
            onClick={onRefresh}
          >
            <Activity className="size-4 mr-2" /> Refresh Data
          </Button>
        </div>
      </div>
    </div>
  );
}
