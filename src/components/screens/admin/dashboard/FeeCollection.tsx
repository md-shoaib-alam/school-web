"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

const feeChartConfig = {
  collected: { label: "Collected", color: "#10b981" },
  pending: { label: "Pending", color: "#f59e0b" },
} satisfies ChartConfig;

interface FeeCollectionProps {
  isLoading: boolean;
  data: any[];
  recharts: any;
}

export function FeeCollection({ isLoading, data, recharts }: FeeCollectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <IndianRupee className="size-4 text-emerald-600" />
          Fee Collection
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading || !recharts ? (
          <Skeleton className="h-[280px] w-full" />
        ) : (
          (() => {
            const { BarChart, Bar, XAxis, YAxis, CartesianGrid } = recharts;
            return (
              <ChartContainer config={feeChartConfig} className="h-[280px] w-full">
                <BarChart data={data ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="type" tickLine={false} axisLine={false} fontSize={12} width={70} tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="collected" fill="var(--color-collected)" radius={[0, 4, 4, 0]} maxBarSize={20} />
                  <Bar dataKey="pending" fill="var(--color-pending)" radius={[0, 4, 4, 0]} maxBarSize={20} />
                </BarChart>
              </ChartContainer>
            );
          })()
        )}
      </CardContent>
    </Card>
  );
}
