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
  percentage: { label: "Score %", color: "var(--color-brand, #0A61EE)" },
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
    <Card className="rounded-3xl border border-border bg-card shadow-xs py-0 gap-0 overflow-hidden h-full flex flex-col">
      <CardHeader className="px-5 py-4 border-b border-border flex flex-row items-center gap-3 space-y-0 text-left">
        <div className="size-8 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0">
          <BarChart3 className="size-4" />
        </div>
        <div>
          <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
            Performance by Subject
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Average score percentage
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-5 flex-1 flex flex-col justify-center">
        {data.length > 0 ? (
          !recharts ? (
            <div className="h-[280px] w-full animate-pulse bg-muted rounded-xl" />
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
                    layout="horizontal"
                    margin={{ left: 0, right: 0, top: 10, bottom: 30 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      className="stroke-border/40"
                    />
                    <XAxis
                      type="category"
                      dataKey="subject"
                      tick={{ fontSize: 11 }}
                      interval={0}
                      height={50}
                    />
                    <YAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="percentage"
                      fill="var(--color-percentage)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={32}
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
