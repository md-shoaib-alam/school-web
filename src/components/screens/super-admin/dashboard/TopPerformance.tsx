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
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Cell 
} from "recharts";
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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Top Performing Schools */}
      <Card className="lg:col-span-3 border-none shadow-sm bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-500" /> Top Performing Schools
          </CardTitle>
          <CardDescription className="text-xs">Ranked by active subscription revenue</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-50 dark:border-gray-900 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 dark:bg-gray-900/50 hover:bg-transparent">
                    <TableHead className="w-12 text-[10px] font-black uppercase tracking-widest text-center">#</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">School</TableHead>
                    <TableHead className="hidden sm:table-cell text-[10px] font-black uppercase tracking-widest text-center">Plan</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest">Revenue</TableHead>
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
                          <Building2 className="h-5 w-5 text-muted-foreground/60 shrink-0" />
                          <div>
                            <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{tenant.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {tenant.studentCount} students • {tenant._count.classes} classes
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
      <Card className="lg:col-span-2 border-none shadow-sm bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-emerald-600" /> Plan Distribution
          </CardTitle>
          <CardDescription className="text-xs">Breakdown of schools by subscription tier</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[280px] w-full rounded-2xl" />
          ) : (
            <ChartContainer config={planChartConfig} className="h-[280px] w-full">
              <BarChart data={data?.planDistribution} layout="vertical" margin={{ left: 15, right: 20 }}>
                {/* Removed grid lines for simplified look */}
                <XAxis type="number" hide />
                 <YAxis
                  dataKey="plan"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  fontWeight={600}
                  tick={{ fill: "#64748b" }}
                  width={60}
                />
                <ChartTooltip content={<ChartTooltipContent className="rounded-xl border-none shadow-xl" />} />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={24}>
                  {data?.planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PLAN_COLORS[entry.plan.toLowerCase()] || "#10b981"} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
