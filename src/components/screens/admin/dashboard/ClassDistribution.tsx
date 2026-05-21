"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

const pieChartConfig = {
  students: { label: "Students", color: "#10b981" },
} satisfies ChartConfig;

const COLORS = [
  "#10b981",
  "#059669",
  "#047857",
  "#065f46",
  "#34d399",
  "#6ee7b7",
  "#a7f3d0",
  "#d1fae5",
];

interface ClassDistributionProps {
  isLoading: boolean;
  data: any[];
  recharts: any;
}

export function ClassDistribution({ isLoading, data, recharts }: ClassDistributionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <GraduationCap className="size-4 text-cyan-600" />
          Class Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading || !recharts ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          (() => {
            const { PieChart, Pie, Cell } = recharts;
            return (
              <ChartContainer config={pieChartConfig} className="h-[300px] w-full">
                <PieChart>
                  <Pie
                    data={data ?? []}
                    cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={2}
                    dataKey="students" nameKey="name"
                    label={({ name, percent }) => `${name.split("-")[0]} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false} fontSize={10}
                  >
                    {(data ?? []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            );
          })()
        )}
      </CardContent>
    </Card>
  );
}
