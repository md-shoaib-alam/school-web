import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { TrendingUp, Users } from "lucide-react";
import { tenantGrowthConfig, userGrowthConfig } from "./utils";

interface GrowthChartsProps {
  loading: boolean;
  tenantGrowth: any[];
  userGrowth: any[];
}

function ChartSkeleton() {
  return <Skeleton className="h-[300px] w-full rounded-xl" />;
}

export function GrowthCharts({ loading, tenantGrowth, userGrowth }: GrowthChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Tenant Growth Chart */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-teal-500" />
            Tenant Growth
          </CardTitle>
          <CardDescription>
            Cumulative tenant count over 12 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ChartContainer
              config={tenantGrowthConfig}
              className="h-[300px] w-full"
            >
              <LineChart data={tenantGrowth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickMargin={10}
                />
                <YAxis tickLine={false} axisLine={false} fontSize={12} tickMargin={10} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="tenants"
                  stroke="var(--color-tenants)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "var(--color-tenants)", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 7, strokeWidth: 0 }}
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* User Growth Chart - Stacked Area */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-500" />
            User Growth by Role
          </CardTitle>
          <CardDescription>Users breakdown over 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ChartContainer
              config={userGrowthConfig}
              className="h-[300px] w-full"
            >
              <AreaChart data={userGrowth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickMargin={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickMargin={10}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v
                  }
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  type="monotone"
                  dataKey="students"
                  stackId="1"
                  stroke="var(--color-students)"
                  fill="var(--color-students)"
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="parents"
                  stackId="1"
                  stroke="var(--color-parents)"
                  fill="var(--color-parents)"
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="teachers"
                  stackId="1"
                  stroke="var(--color-teachers)"
                  fill="var(--color-teachers)"
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="admins"
                  stackId="1"
                  stroke="var(--color-admins)"
                  fill="var(--color-admins)"
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
