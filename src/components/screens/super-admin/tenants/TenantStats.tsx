import { memo } from "react";
import { Building2, CheckCircle2, Clock, Ban, ArrowUp, ArrowDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  cardBg: string;
  cardBorder: string;
  trendText?: string;
  trendType?: "up" | "down" | "neutral";
}

const StatCard = memo(function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBg,
  cardBg,
  cardBorder,
  trendText,
  trendType = "neutral",
}: StatCardProps) {
  return (
    <div className={`rounded-2xl p-4 sm:p-5 border ${cardBg} ${cardBorder} transition-all duration-200 shadow-xs hover:shadow-sm`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {value}
            </span>
            {trendText && (
              <span
                className={`inline-flex items-center text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
                  trendType === "up"
                    ? "text-emerald-700 bg-emerald-100/80 dark:text-emerald-400 dark:bg-emerald-950/50"
                    : trendType === "down"
                    ? "text-rose-700 bg-rose-100/80 dark:text-rose-400 dark:bg-rose-950/50"
                    : "text-amber-700 bg-amber-100/80 dark:text-amber-400 dark:bg-amber-950/50"
                }`}
              >
                {trendType === "up" && <ArrowUp className="size-2.5 mr-0.5 inline stroke-[2.5]" />}
                {trendType === "down" && <ArrowDown className="size-2.5 mr-0.5 inline stroke-[2.5]" />}
                {trendType === "neutral" && <Minus className="size-2.5 mr-0.5 inline stroke-[2.5]" />}
                {trendText}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500/90 dark:text-slate-400/90 mt-1.5 font-normal truncate">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      <StatCard
        title="TOTAL SCHOOLS"
        value={stats.total}
        subtitle="All registered schools"
        icon={<Building2 className="size-6 text-blue-600 dark:text-blue-400" />}
        iconBg="bg-blue-100 dark:bg-blue-900/40"
        cardBg="bg-blue-50/50 dark:bg-blue-950/15"
        cardBorder="border-blue-100 dark:border-blue-900/30"
        trendText="+20%"
        trendType="up"
      />
      <StatCard
        title="ACTIVE SCHOOLS"
        value={stats.active}
        subtitle="Currently active and operational"
        icon={<CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400" />}
        iconBg="bg-emerald-100 dark:bg-emerald-900/40"
        cardBg="bg-emerald-50/50 dark:bg-emerald-950/15"
        cardBorder="border-emerald-100 dark:border-emerald-900/30"
        trendText={stats.total > 0 ? `+${Math.round((stats.active / stats.total) * 100)}%` : "+25%"}
        trendType="up"
      />
      <StatCard
        title="TRIAL SCHOOLS"
        value={stats.trial}
        subtitle="In trial period"
        icon={<Clock className="size-6 text-amber-600 dark:text-amber-400" />}
        iconBg="bg-amber-100 dark:bg-amber-900/40"
        cardBg="bg-amber-50/50 dark:bg-amber-950/15"
        cardBorder="border-amber-100 dark:border-amber-900/30"
        trendText="0%"
        trendType="neutral"
      />
      <StatCard
        title="SUSPENDED"
        value={stats.suspended}
        subtitle="Temporarily suspended"
        icon={<Ban className="size-6 text-rose-600 dark:text-rose-400" />}
        iconBg="bg-rose-100 dark:bg-rose-900/40"
        cardBg="bg-rose-50/50 dark:bg-rose-950/15"
        cardBorder="border-rose-100 dark:border-rose-900/30"
        trendText={stats.suspended > 0 ? `+${stats.suspended}%` : "+0%"}
        trendType={stats.suspended > 0 ? "down" : "neutral"}
      />
    </div>
  );
}
