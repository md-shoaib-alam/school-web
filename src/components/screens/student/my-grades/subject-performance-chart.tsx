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
} from "@/components/ui/chart";
import { BarChart3 } from "lucide-react";

interface SubjectPerformanceChartProps {
  recharts: typeof import("recharts") | null;
  latestExam: {
    data: Array<{ subject: string; marks: number; fill: string }>;
    label: string;
  };
  chartConfig: any;
}

export function SubjectPerformanceChart({
  recharts,
  latestExam,
  chartConfig,
}: SubjectPerformanceChartProps) {
  return (
    <Card className="rounded-3xl border border-border bg-card shadow-xs py-0 gap-0 overflow-hidden h-full flex flex-col">
      <CardHeader className="px-5 py-4 border-b border-border flex flex-row items-center gap-3 space-y-0 text-left">
        <div className="size-8 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0">
          <BarChart3 className="size-4" />
        </div>
        <div>
          <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
            Subject Performance
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            {latestExam.label
              ? `Latest Term: ${latestExam.label}`
              : "Academic records summary"}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-5 flex-1 flex flex-col justify-center">
        {latestExam.data.length > 0 ? (
          !recharts ? (
            <Skeleton className="h-[260px] w-full rounded-xl" />
          ) : (
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              {(() => {
                const { BarChart, Bar, XAxis, YAxis } = recharts;
                return (
                  <BarChart
                    data={latestExam.data}
                    layout="horizontal"
                    margin={{ left: 0, right: 0, top: 10, bottom: 20 }}
                  >
                    <XAxis
                      type="category"
                      dataKey="subject"
                      tick={{ fontSize: 10 }}
                      interval={0}
                      height={40}
                    />
                    <YAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="marks"
                      fill="var(--color-brand, #0A61EE)"
                      radius={[6, 6, 0, 0]}
                      barSize={32}
                    />
                  </BarChart>
                );
              })()}
            </ChartContainer>
          )
        ) : (
          <div className="h-[260px] flex items-center justify-center text-muted-foreground border border-dashed border-border rounded-2xl">
            <p className="text-sm font-medium">No subject chart data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
