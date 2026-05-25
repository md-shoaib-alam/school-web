"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

const attendanceChartConfig = {
  rate: { label: "Attendance Rate (%)", color: "#10b981" },
} satisfies ChartConfig;

interface AttendanceTrendProps {
  isLoading: boolean;
  data: any[];
  recharts: any;
}

export function AttendanceTrend({ isLoading, data, recharts }: AttendanceTrendProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="size-4 text-teal-600" />
          Monthly Attendance Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading || !recharts ? (
          <Skeleton className="h-[280px] w-full" />
        ) : (
          (() => {
            const { BarChart, Bar, XAxis, YAxis, CartesianGrid } = recharts;
            return (
              <ChartContainer config={attendanceChartConfig} className="h-[280px] w-full">
                <BarChart data={data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} unit="%" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="rate" fill="var(--color-rate)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ChartContainer>
            );
          })()
        )}
      </CardContent>
    </Card>
  );
}
