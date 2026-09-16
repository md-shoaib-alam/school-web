import { Globe } from "lucide-react";
import { STAT_CARDS } from "./types";

interface UserHeaderProps {
  totalCount: number;
  roleCountsMap: Record<string, number>;
}

export function UserHeader({ totalCount, roleCountsMap }: UserHeaderProps) {
  const getCount = (key: string) => {
    if (key === "total") return totalCount;
    if (key === "admin") {
      return (roleCountsMap["admin"] ?? 0) + (roleCountsMap["super_admin"] ?? 0);
    }
    return roleCountsMap[key] ?? 0;
  };

  return (
    <div className="space-y-4">
      {/* Top Title & Cross-Tenant View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            User Management
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage and monitor all users across all tenant schools
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 border border-border bg-card hover:bg-muted/50 text-foreground rounded-lg px-3 py-1.5 text-xs font-medium shadow-2xs transition-colors self-start sm:self-auto cursor-default"
        >
          <Globe className="size-3.5 text-muted-foreground" />
          <span>Cross-Tenant View</span>
        </button>
      </div>

      {/* 6 Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {STAT_CARDS.map((stat) => {
          const count = getCount(stat.key);
          const Icon = stat.icon;

          return (
            <div
              key={stat.key}
              className="relative overflow-hidden rounded-xl border border-border bg-card p-3.5 shadow-2xs flex flex-col justify-between"
            >
              {/* Top Row: Icon + Label */}
              <div className="flex items-center gap-2">
                <div className={`size-7 rounded-lg flex items-center justify-center shrink-0 ${stat.iconBg}`}>
                  <Icon className="size-3.5" />
                </div>
                <span className="text-xs font-medium text-muted-foreground truncate">
                  {stat.label}
                </span>
              </div>

              {/* Middle Row: Count + Trend Pill */}
              <div className="flex items-baseline gap-1.5 mt-2.5">
                <span className="text-xl font-bold tracking-tight text-foreground">
                  {count.toLocaleString()}
                </span>
                <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                  {stat.trend}
                </span>
              </div>

              {/* Bottom Row: Subtext + Mini Sparkline */}
              <div className="flex items-end justify-between mt-1.5 pt-0.5">
                <span className="text-[11px] text-muted-foreground font-normal truncate">
                  {stat.subtext}
                </span>

                {/* Mini SVG wave sparkline */}
                <div className="w-12 h-5 shrink-0 -mb-0.5 ml-1 opacity-80">
                  <svg viewBox="0 0 60 26" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id={stat.gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={stat.stroke} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={stat.stroke} stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 20 Q 14 8, 28 16 T 60 6 L 60 26 L 0 26 Z"
                      fill={`url(#${stat.gradientId})`}
                    />
                    <path
                      d="M 0 20 Q 14 8, 28 16 T 60 6"
                      fill="none"
                      stroke={stat.stroke}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
