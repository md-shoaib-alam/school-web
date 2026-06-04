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
import { BarChart3, Star } from "lucide-react";

interface AssessmentsPerformanceChartProps {
  recharts: typeof import("recharts") | null;
  latestAssessmentChartData: Array<{
    subject: string;
    marks: number;
    fill: string;
  }>;
  chartConfig: any;
  assessmentAvg: number;
}

export function AssessmentsPerformanceChart({
  recharts,
  latestAssessmentChartData,
  chartConfig,
  assessmentAvg,
}: AssessmentsPerformanceChartProps) {
  return (
    <Card className="rounded-xl shadow-sm border-zinc-200/60 dark:border-zinc-800 w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 font-semibold">
          <BarChart3 className="size-4 text-violet-500" />
          Assessment Performance by Subject
        </CardTitle>
        <CardDescription className="text-xs">
          Running averages of periodic class assessments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {latestAssessmentChartData.length > 0 ? (
          !recharts ? (
            <Skeleton className="h-[260px] w-full" />
          ) : (
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              {(() => {
                const { BarChart, Bar, XAxis, YAxis, Cell } = recharts;
                return (
                  <BarChart
                    data={latestAssessmentChartData}
                    layout="vertical"
                    margin={{ left: 10, right: 10 }}
                  >
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="subject"
                      width={90}
                      tick={{ fontSize: 11 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="marks" radius={[0, 6, 6, 0]} barSize={22}>
                      {latestAssessmentChartData.map((entry) => (
                        <Cell key={entry.subject} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                );
              })()}
            </ChartContainer>
          )
        ) : (
          <div className="h-[260px] flex items-center justify-center text-zinc-400 dark:text-zinc-500 border-2 border-dashed rounded-xl border-zinc-100 dark:border-zinc-800">
            <p className="text-sm">No continuous assessment data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
