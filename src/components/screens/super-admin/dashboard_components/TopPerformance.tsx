import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Crown, Building2, BarChart3 } from "lucide-react";
import { DashboardData, planChartConfig, PLAN_COLORS } from "./types";


interface TopPerformanceProps {
  loading: boolean;
  data: DashboardData | undefined;
}

export function TopPerformance({ loading, data }: TopPerformanceProps) {
  const [recharts, setRecharts] = useState<typeof import("recharts") | null>(null);

  useEffect(() => {
    import("recharts").then(setRecharts);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Top Performing Schools */}
      <Card className="lg:col-span-3 border shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Crown className="size-4 text-amber-500" /> Top Performing Schools
          </CardTitle>
          <CardDescription className="text-xs">Ranked by active subscription revenue</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-transparent">
                    <TableHead className="w-12 text-xs font-medium text-center">#</TableHead>
                    <TableHead className="text-xs font-medium">School</TableHead>
                    <TableHead className="hidden sm:table-cell text-xs font-medium text-center">Plan</TableHead>
                    <TableHead className="text-right text-xs font-medium">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.topTenants.map((tenant, index) => (
                    <TableRow key={tenant.id} className="hover:bg-emerald-50/20 dark:hover:bg-emerald-900/10 transition-colors border-b last:border-none">
                      <TableCell className="text-center font-semibold text-muted-foreground text-sm">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img src={tenant.logo || "/test.webp"} alt={tenant.name} className="size-8 rounded-lg object-cover border shadow-sm shrink-0" />
                          <div>
                            <p className="font-medium text-sm text-foreground">{tenant.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {tenant.studentCount} students &bull; {tenant._count.classes} classes
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center hidden sm:table-cell">
                        <span className="text-xs capitalize text-muted-foreground border px-2 py-0.5 rounded-full bg-muted/30">
                          {tenant.plan}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sm text-foreground">
                        ₹{(tenant.totalRevenue || 0).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Distribution Chart */}
      <Card className="lg:col-span-2 border shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <BarChart3 className="size-4 text-emerald-600" /> Plan Distribution
          </CardTitle>
          <CardDescription className="text-xs">Breakdown of schools by subscription tier</CardDescription>
        </CardHeader>
        <CardContent>
          {loading || !recharts ? (
            <Skeleton className="h-[280px] w-full rounded-2xl" />
          ) : (
            <div className="relative flex flex-col items-center">
              <ChartContainer config={planChartConfig} className="h-[210px] w-full">
                {(() => {
                  const { PieChart, Pie, Cell } = recharts;
                  return (
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent className="rounded-xl border-none shadow-xl" />} />
                      <Pie
                        data={data?.planDistribution}
                        dataKey="count"
                        nameKey="plan"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={4}
                      >
                        {data?.planDistribution.map((entry) => (
                          <Cell
                            key={entry.plan}
                            fill={PLAN_COLORS[entry.plan.toLowerCase()] || "var(--chart-1)"}
                            className="stroke-card stroke-2 hover:opacity-90 transition-opacity"
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  );
                })()}
              </ChartContainer>

              {/* Total indicator in center of donut */}
              <div className="absolute top-[105px] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-semibold text-foreground">
                  {data?.planDistribution.reduce((acc, curr) => acc + curr.count, 0) || 0}
                </span>
                <span className="text-xs uppercase font-medium tracking-wider text-muted-foreground">
                  Schools
                </span>
              </div>

              {/* Custom styled color-wise Legend */}
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-4 px-2">
                {data?.planDistribution.map((entry) => {
                  const color = PLAN_COLORS[entry.plan.toLowerCase()] || "var(--chart-1)";
                  return (
                    <div key={entry.plan} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer">
                      <div className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-xs font-medium capitalize text-muted-foreground">
                        {entry.plan}: <span className="font-semibold text-foreground">{entry.count}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
