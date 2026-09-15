import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Users,
  IndianRupee,
  CreditCard,
} from "lucide-react";
import { DashboardData } from "./types";
import { formatINR } from "@/lib/format";

interface DashboardHeroProps {
  loading: boolean;
  data: DashboardData | undefined;
}

export function DashboardHero({ loading, data }: DashboardHeroProps) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Platform Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Overview of schools, users, revenue, and active subscriptions.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-muted/40 px-4 py-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-8 w-12 mt-2" />
            </div>
          ))
        ) : (
          <>
            <div className="rounded-lg border bg-muted/40 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Schools</p>
              <p className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <Building2 className="size-5 text-muted-foreground" />
                {data?.tenants.total ?? 0}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/40 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Users</p>
              <p className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <Users className="size-5 text-muted-foreground" />
                {data?.users.total ?? 0}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/40 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Revenue</p>
              <p className="text-2xl font-semibold text-foreground flex items-center gap-1">
                <IndianRupee className="size-5 text-muted-foreground" />
                {formatINR(data?.revenue.total ?? 0)}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/40 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Subscriptions</p>
              <p className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <CreditCard className="size-5 text-muted-foreground" />
                {data?.subscriptions.active ?? 0}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
