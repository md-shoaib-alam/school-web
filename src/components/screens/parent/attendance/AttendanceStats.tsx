"use client";

import { CheckCircle2, XCircle, PieChart } from "lucide-react";

interface AttendanceStatsProps {
  percentage: number;
  present: number;
  absent: number;
}

export function AttendanceStats({ percentage, present, absent }: AttendanceStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3 select-none">
      {/* Present Box */}
      <div className="aspect-square rounded-2xl border border-border bg-card p-2.5 sm:p-3.5 flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-center shadow-xs transition-colors hover:border-emerald-500/40">
        <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
          <CheckCircle2 className="size-4 stroke-[2.2]" />
        </div>
        <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-none tabular-nums">
          {present}
        </span>
        <span className="text-xs sm:text-[13px] font-medium text-muted-foreground leading-none">
          Present
        </span>
      </div>

      {/* Absent Box */}
      <div className="aspect-square rounded-2xl border border-border bg-card p-2.5 sm:p-3.5 flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-center shadow-xs transition-colors hover:border-rose-500/40">
        <div className="size-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
          <XCircle className="size-4 stroke-[2.2]" />
        </div>
        <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-none tabular-nums">
          {absent}
        </span>
        <span className="text-xs sm:text-[13px] font-medium text-muted-foreground leading-none">
          Absent
        </span>
      </div>

      {/* Rate Box */}
      <div className="aspect-square rounded-2xl border border-border bg-card p-2.5 sm:p-3.5 flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-center shadow-xs transition-colors hover:border-blue-500/40">
        <div className="size-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
          <PieChart className="size-4 stroke-[2.2]" />
        </div>
        <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-none tabular-nums">
          {percentage}%
        </span>
        <span className="text-xs sm:text-[13px] font-medium text-muted-foreground leading-none">
          Rate
        </span>
      </div>
    </div>
  );
}
