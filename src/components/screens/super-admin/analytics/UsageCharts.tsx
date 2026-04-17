import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { 
  Zap, 
  Server, 
  Wifi, 
  Clock, 
  UserCheck, 
  ArrowUpRight, 
  ArrowDownRight 
} from "lucide-react";
import { featureUsageConfig, featureUsageData } from "./utils";

interface UsageChartsProps {
  loading: boolean;
  serverUptime: number;
  avgResponseTime: number;
  activeUsers: number;
  platformData: any;
}

function ChartSkeleton() {
  return <Skeleton className="h-[340px] w-full rounded-xl" />;
}

export function UsageCharts({
  loading,
  serverUptime,
  avgResponseTime,
  activeUsers,
  platformData,
}: UsageChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Feature Usage */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            Feature Usage
          </CardTitle>
          <CardDescription>
            Most used platform features across all tenants
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ChartContainer
              config={featureUsageConfig}
              className="h-[340px] w-full"
            >
              <BarChart data={featureUsageData} layout="vertical" margin={{ left: 10, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  unit="%"
                />
                <YAxis
                  type="category"
                  dataKey="feature"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  width={100}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="usage" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {featureUsageData.map((_, index) => (
                    <Cell
                      key={`feature-${index}`}
                      fill={
                        index < 3
                          ? "#10b981"
                          : index < 6
                            ? "#3b82f6"
                            : "#f59e0b"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Server className="h-4 w-4 text-emerald-500" />
            Performance Metrics
          </CardTitle>
          <CardDescription>
            Real-time platform health indicators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          {/* Server Uptime */}
          <div className="space-y-3 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-800/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shadow-sm">
                  <Wifi className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-tight">
                    Server Uptime
                  </p>
                  <p className="text-[10px] text-emerald-600 font-medium">Last 30 days</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                  {serverUptime}%
                </p>
                <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 justify-end">
                  <ArrowUpRight className="h-3 w-3" /> 99.7% LTM
                </p>
              </div>
            </div>
            <Progress
              value={serverUptime}
              className="h-1.5 bg-emerald-100 dark:bg-emerald-900/30 [&>div]:bg-emerald-500"
            />
          </div>

          {/* Avg Response Time */}
          <div className="space-y-3 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shadow-sm">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-900 dark:text-blue-300 uppercase tracking-tight">
                    Avg Response Time
                  </p>
                  <p className="text-[10px] text-blue-600 font-medium">API Endpoints</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {avgResponseTime}ms
                </p>
                <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 justify-end">
                  <ArrowDownRight className="h-3 w-3" /> -12ms WoW
                </p>
              </div>
            </div>
            <Progress
              value={82}
              className="h-1.5 bg-blue-100 dark:bg-blue-900/30 [&>div]:bg-blue-500"
            />
          </div>

          {/* Active Users Today */}
          <div className="space-y-3 p-4 rounded-xl bg-teal-50/50 dark:bg-teal-900/10 border border-teal-100/50 dark:border-teal-800/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white dark:bg-teal-900/30 text-teal-600 flex items-center justify-center shadow-sm">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-teal-900 dark:text-teal-300 uppercase tracking-tight">
                    Active Users Today
                  </p>
                  <p className="text-[10px] text-teal-600 font-medium">Global Pulse</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-teal-700 dark:text-teal-400">
                  {activeUsers.toLocaleString()}
                </p>
                <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 justify-end">
                  <ArrowUpRight className="h-3 w-3" /> +18% vs yesterday
                </p>
              </div>
            </div>
            <Progress
              value={68}
              className="h-1.5 bg-teal-100 dark:bg-teal-900/30 [&>div]:bg-teal-500"
            />
          </div>

          {/* Platform Summary Tiles */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="text-center p-3 rounded-xl bg-muted/30 border border-muted-foreground/5">
              <p className="text-lg font-bold text-foreground">
                {platformData?.tenants?.total || 42}
              </p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tenants</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/30 border border-muted-foreground/5">
              <p className="text-lg font-bold text-foreground">
                {platformData?.users?.total?.toLocaleString() || "3.4k"}
              </p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Users</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/30 border border-muted-foreground/5">
              <p className="text-lg font-bold text-foreground">99.9%</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">SLA</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
