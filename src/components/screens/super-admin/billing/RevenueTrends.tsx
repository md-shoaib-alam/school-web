import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";
import { revenueTrendConfig, MonthlyTrend } from "./types";

interface RevenueTrendsProps {
  loading: boolean;
  monthlyTrend: MonthlyTrend[];
}

export function RevenueTrends({ loading, monthlyTrend }: RevenueTrendsProps) {
  return (
    <Card className="shadow-sm border-none bg-white dark:bg-gray-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" /> 
              Revenue Trend (12 Months)
            </CardTitle>
            <CardDescription className="mt-1">
              Monthly revenue, new subscriptions, and churned subscriptions
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[320px] w-full rounded-xl" />
        ) : (
          <ChartContainer
            config={revenueTrendConfig}
            className="h-[320px] w-full"
          >
            <AreaChart
              data={monthlyTrend}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="newGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="churnGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                tickMargin={12}
                tick={{ fill: "#94a3b8" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={11}
                tickMargin={12}
                tick={{ fill: "#94a3b8" }}
                tickFormatter={(v) =>
                  v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : String(v)
                }
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => {
                      if (name === "revenue")
                        return [
                          `₹${Number(value).toLocaleString()}`,
                          "Revenue",
                        ];
                      return [
                        value,
                        name === "newSubscriptions"
                          ? "New Subscriptions"
                          : "Churned",
                      ];
                    }}
                  />
                }
              />
              <Legend content={<ChartLegendContent />} verticalAlign="top" height={36} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#revenueGradient)"
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="newSubscriptions"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#newGradient)"
                strokeDasharray="5 5"
              />
              <Area
                type="monotone"
                dataKey="churned"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#churnGradient)"
                strokeDasharray="3 3"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
