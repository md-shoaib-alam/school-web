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
    <div className="space-y-5">
      {/* Top Title & Cross-Tenant View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage and monitor all users across all tenant schools
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800/80 text-slate-700 dark:text-slate-300 rounded-xl px-3.5 py-1.5 text-xs font-semibold shadow-2xs transition-colors self-start sm:self-auto cursor-default"
        >
          <Globe className="size-3.5 text-slate-500 dark:text-slate-400" />
          <span>Cross-Tenant View</span>
        </button>
      </div>

      {/* 6 Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
        {STAT_CARDS.map((stat) => {
          const count = getCount(stat.key);
          const Icon = stat.icon;

          return (
            <div
              key={stat.key}
              className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 p-4 shadow-xs flex flex-col justify-between"
            >
              {/* Top Row: Icon + Label */}
              <div className="flex items-center gap-2.5">
                <div className={`size-8 rounded-xl flex items-center justify-center shrink-0 ${stat.iconBg}`}>
                  <Icon className="size-4" />
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate">
                  {stat.label}
                </span>
              </div>

              {/* Middle Row: Large Count + Trend Pill */}
              <div className="flex items-baseline gap-2 mt-3.5">
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {count.toLocaleString()}
                </span>
                <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                  {stat.trend}
                </span>
              </div>

              {/* Bottom Row: Subtext + Mini Sparkline Wave */}
              <div className="flex items-end justify-between mt-2 pt-1">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate">
                  {stat.subtext}
                </span>

                {/* Mini SVG wave sparkline */}
                <div className="w-14 h-6 shrink-0 -mb-1 ml-1 opacity-90">
                  <svg viewBox="0 0 60 26" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id={stat.gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={stat.stroke} stopOpacity="0.28" />
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
