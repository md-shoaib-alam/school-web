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
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";
import { DashboardData, growthChartConfig } from "./types";

interface GrowthChartsProps {
  loading: boolean;
  data: DashboardData | undefined;
}

export function GrowthCharts({ loading, data }: GrowthChartsProps) {
  return (
    <Card className="border-none shadow-sm bg-white dark:bg-gray-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" /> Platform Growth Trends
            </CardTitle>
            <CardDescription className="text-xs">
              New schools, users, and revenue over the last 6 months
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[320px] w-full rounded-2xl" />
        ) : (
          <ChartContainer
            config={growthChartConfig}
            className="h-[320px] w-full"
          >
            <LineChart data={data?.monthlyData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                tickMargin={12}
                tick={{ fill: "#94a3b8", fontWeight: 600 }}
              />
              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                tick={{ fill: "#94a3b8", fontWeight: 600 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fill: "#94a3b8", fontWeight: 600 }}
              />
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    className="rounded-xl border-none shadow-xl"
                    formatter={(value, name) => {
                      if (name === 'revenue') return [`$${Number(value).toLocaleString()}`, 'Revenue'];
                      return [value, name === 'newTenants' ? 'New Schools' : 'New Users'];
                    }}
                  />
                } 
              />
              <ChartLegend content={<ChartLegendContent />} verticalAlign="top" height={40} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="newTenants"
                stroke="#059669"
                strokeWidth={4}
                dot={{ r: 4, strokeWidth: 0, fill: "#059669" }}
                activeDot={{ r: 7, strokeWidth: 0 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="newUsers"
                stroke="#10b981"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 3, strokeWidth: 0, fill: "#10b981" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#047857"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#047857" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
