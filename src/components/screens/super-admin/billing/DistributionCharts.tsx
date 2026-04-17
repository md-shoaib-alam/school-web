import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart3, PieChart as PieChartIcon, Activity } from "lucide-react";
import { planRevenueConfig } from "./types";

interface DistributionChartsProps {
  loading: boolean;
  planChartData: any[];
  methodChartData: any[];
  statusChartData: any[];
}

export function DistributionCharts({
  loading,
  planChartData,
  methodChartData,
  statusChartData,
}: DistributionChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Revenue by Plan */}
      <Card className="shadow-sm border-none bg-white dark:bg-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-emerald-600" /> Revenue by Plan
          </CardTitle>
          <CardDescription>
            Active revenue and subscription count per plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[240px] w-full rounded-xl" />
          ) : (
            <ChartContainer
              config={planRevenueConfig}
              className="h-[240px] w-full"
            >
              <BarChart
                data={planChartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                  tick={{ fill: "#94a3b8" }}
                  tickFormatter={(v) =>
                    `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                  }
                />
                <YAxis
                  type="category"
                  dataKey="plan"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  width={70}
                  tick={{ fill: "#374151" }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, _name, item) => {
                        const d = item.payload as any;
                        return [
                          `₹${d.revenue.toLocaleString()} (${d.count} subs)`,
                          d.plan,
                        ];
                      }}
                    />
                  }
                />
                <Bar
                  dataKey="revenue"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={28}
                >
                  {planChartData.map((entry, i) => {
                    const planColors: Record<string, string> = {
                      Basic: "#94a3b8",
                      Standard: "#f59e0b",
                      Premium: "#10b981",
                    };
                    return (
                      <Cell
                        key={i}
                        fill={planColors[entry.plan] || "#6366f1"}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Payment Method Distribution */}
      <Card className="shadow-sm border-none bg-white dark:bg-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-emerald-600" /> Payment Methods
          </CardTitle>
          <CardDescription>
            Preferred methods by revenue volume
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[240px] w-full rounded-xl" />
          ) : (
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={methodChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="revenue"
                    nameKey="method"
                    stroke="none"
                  >
                    {methodChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RTooltip
                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Status Distribution */}
      <Card className="shadow-sm border-none bg-white dark:bg-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-600" /> Status Distribution
          </CardTitle>
          <CardDescription>
            Lifecycle of all subscription records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[240px] w-full rounded-xl" />
          ) : (
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="status"
                    stroke="none"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RTooltip
                    formatter={(value: number) => `${value} subscriptions`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
