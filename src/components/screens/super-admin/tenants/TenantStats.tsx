import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, CheckCircle2, Activity, Ban } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend: string | null;
}

const StatCard = memo(function StatCard({
  title,
  value,
  icon,
  iconBg,
  iconColor,
  trend,
}: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                <span className="text-[10px] text-emerald-600 font-medium">
                  +{trend}
                </span>
              )}
            </div>
          </div>
          <div
            className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

interface TenantStatsProps {
  stats: {
    total: number;
    active: number;
    trial: number;
    suspended: number;
  };
}

export function TenantStats({ stats }: TenantStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Schools"
        value={stats.total}
        icon={<Building2 className="h-5 w-5" />}
        iconBg="bg-teal-100 dark:bg-teal-900/30"
        iconColor="text-teal-600"
        trend={null}
      />
      <StatCard
        title="Active Schools"
        value={stats.active}
        icon={<CheckCircle2 className="h-5 w-5" />}
        iconBg="bg-emerald-100 dark:bg-emerald-900/30"
        iconColor="text-emerald-600"
        trend={
          stats.total > 0
            ? `${Math.round((stats.active / stats.total) * 100)}%`
            : null
        }
      />
      <StatCard
        title="Trial Schools"
        value={stats.trial}
        icon={<Activity className="h-5 w-5" />}
        iconBg="bg-blue-100 dark:bg-blue-900/30"
        iconColor="text-blue-600"
        trend={null}
      />
      <StatCard
        title="Suspended"
        value={stats.suspended}
        icon={<Ban className="h-5 w-5" />}
        iconBg="bg-red-100 dark:bg-red-900/30"
        iconColor="text-red-600"
        trend={null}
      />
    </div>
  );
}
