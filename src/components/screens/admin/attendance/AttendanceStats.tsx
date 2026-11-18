"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AttendanceStatsProps {
  summaryCards: any[];
  loading: boolean;
  statusConfig: any;
  total?: number;
  presentCount?: number;
  absentCount?: number;
  presentRate?: string;
}

export function AttendanceStats({
  summaryCards,
  loading,
  statusConfig,
  total,
  presentCount,
  absentCount,
  presentRate,
}: AttendanceStatsProps) {
  const pCount = presentCount ?? summaryCards[0]?.count ?? 0;
  const aCount = absentCount ?? summaryCards[1]?.count ?? 0;
  const pRate = presentRate ?? (summaryCards[2]?.count ? String(summaryCards[2].count).replace('%', '') : "0");
  const totalStudents = total ?? (Number(pCount) + Number(aCount));

  return (
    <div>
      {/* Mobile View: 2 Compact Tiles + Below Row for Total & Rate (matches take-attendance style) */}
      <Card className="rounded-xl shadow-sm border py-0 gap-0 sm:hidden">
        <CardContent className="p-2.5 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 border border-emerald-100 dark:border-emerald-900/30">
              <span className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {loading ? <Skeleton className="h-6 w-8" /> : pCount}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Present
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-red-50 dark:bg-red-950/20 px-3 py-1.5 border border-red-100 dark:border-red-900/30">
              <span className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">
                {loading ? <Skeleton className="h-6 w-8" /> : aCount}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <span className="size-1.5 rounded-full bg-red-500" />
                Absent
              </span>
            </div>
          </div>

          <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-muted">
            <div
              className="bg-emerald-500 transition-all rounded-full"
              style={{ width: `${totalStudents > 0 ? (Number(pCount) / totalStudents) * 100 : 0}%` }}
            />
            <div
              className="bg-red-500 transition-all rounded-full"
              style={{ width: `${totalStudents > 0 ? (Number(aCount) / totalStudents) * 100 : 0}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground px-0.5">
            <span>
              Total: <strong className="font-semibold text-foreground">{totalStudents}</strong> Students
            </span>
            <span>
              Rate: <strong className="font-semibold text-emerald-600 dark:text-emerald-400">{pRate}%</strong>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Desktop View: 3 Stat Cards */}
      <div className="hidden sm:grid sm:grid-cols-3 sm:gap-4">
        {summaryCards.map((card) => (
          <Card
            key={card.label}
            className={`border ${card.borderColor} shadow-sm`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {card.label}
                  </p>
                  <div className="text-2xl font-bold mt-1 text-foreground">
                    {loading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      card.count
                    )}
                  </div>
                </div>
                <div className={`p-2.5 rounded-xl ${card.color}`}>
                  {card.icon}
                </div>
              </div>
              {card.percentage && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${statusConfig[card.label.toLowerCase()]?.dot || "bg-blue-500"}`}
                      style={{ width: `${card.percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {card.percentage}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
