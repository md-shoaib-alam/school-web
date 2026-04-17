import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
  CartesianGrid, 
  Cell 
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Crown, Building2, BarChart3, Users, DollarSign, IndianRupee } from "lucide-react";
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
                      <TableCell className="text-center">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black text-white mx-auto shadow-sm ${
                          index === 0 ? "bg-amber-500" : index === 1 ? "bg-slate-400" : index === 2 ? "bg-amber-700" : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                        }`}>
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shadow-inner">
                            <Building2 className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{tenant.name}</p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
                              <span className="flex items-center gap-1"><Users className="h-2.5 w-2.5" />{tenant.studentCount}u</span>
                              <span className="flex items-center gap-1"><BarChart3 className="h-2.5 w-2.5" />{tenant._count.classes}c</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center hidden sm:table-cell">
                        <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest h-5 px-2 border-none ${
                          tenant.plan === 'premium' ? 'bg-amber-50 text-amber-700' : 
                          tenant.plan === 'enterprise' ? 'bg-purple-50 text-purple-700' : 
                          'bg-emerald-50 text-emerald-700'
                        }`}>
                          {tenant.plan}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end font-black text-sm text-emerald-600">
                          <IndianRupee className="h-3.5 w-3.5 mr-0.5" />
                          {tenant.totalRevenue.toLocaleString()}
                        </div>
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
              <BarChart data={data?.planDistribution} layout="vertical" margin={{ left: -10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="plan"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  fontWeight={600}
                  tick={{ fill: "#64748b" }}
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
