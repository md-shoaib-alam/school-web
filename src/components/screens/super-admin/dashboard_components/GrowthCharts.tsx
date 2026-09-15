import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [recharts, setRecharts] = useState<typeof import("recharts") | null>(null);

  useEffect(() => {
    import("recharts").then(setRecharts);
  }, []);

  return (
    <Card className="border shadow-sm bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="size-4 text-emerald-600" /> Platform Growth Trends
            </CardTitle>
            <CardDescription className="text-xs">
              New schools, users, and revenue over the last 6 months
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading || !recharts ? (
          <Skeleton className="h-[320px] w-full rounded-2xl" />
        ) : (
          <ChartContainer
            config={growthChartConfig}
            className="h-[320px] w-full"
          >
            {(() => {
              const { LineChart, Line, XAxis, YAxis, CartesianGrid } = recharts;
              return (
                <LineChart data={data?.monthlyData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tickMargin={12}
                    tick={{ fill: "var(--muted-foreground)" }}
                  />
                  <YAxis
                    yAxisId="left"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tick={{ fill: "var(--muted-foreground)" }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    tick={{ fill: "var(--muted-foreground)" }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="rounded-xl border-none shadow-xl"
                        formatter={(value, name) => {
                          if (name === 'revenue') return [`₹${Number(value).toLocaleString()}`, 'Revenue'];
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
                    stroke="var(--chart-1)"
                    strokeWidth={4}
                    dot={{ r: 4, strokeWidth: 0, fill: "var(--chart-1)" }}
                    activeDot={{ r: 7, strokeWidth: 0 }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="newUsers"
                    stroke="var(--chart-2)"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ r: 3, strokeWidth: 0, fill: "var(--chart-2)" }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--chart-3)"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: "var(--background)", stroke: "var(--chart-3)" }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              );
            })()}
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
