"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
const chartConfig = {
  percentage: { label: "Score %", color: "#f59e0b" },
} satisfies ChartConfig;

interface PerformanceChartProps {
  data: any[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const [recharts, setRecharts] = useState<typeof import("recharts") | null>(null);

  useEffect(() => {
    import("recharts").then(setRecharts);
  }, []);

  return (
    <Card className="rounded-xl shadow-sm shadow-none border-zinc-100 dark:border-zinc-800">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-left">
          <BarChart3 className="size-4 text-amber-600" />
          Performance by Subject
        </CardTitle>
        <CardDescription className="text-left">Average score percentage</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {data.length > 0 ? (
          !recharts ? (
            <div className="h-[280px] w-full animate-pulse bg-muted rounded-lg" />
          ) : (
            <ChartContainer
              config={chartConfig}
              className="h-[280px] w-full"
            >
              {(() => {
                const { Bar, BarChart, XAxis, YAxis, CartesianGrid } = recharts;
                return (
                  <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="subject"
                      width={80}
                      tick={{ fontSize: 12 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="percentage"
                      fill="var(--color-percentage)"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={24}
                    />
                  </BarChart>
                );
              })()}
            </ChartContainer>
          )
        ) : (
          <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
            No grade data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
