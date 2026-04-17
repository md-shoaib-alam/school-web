"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";

interface SubjectPerf {
  subject: string;
  avgPct: number;
  bestGrade: string;
  exams: number;
}

interface PerformanceSectionProps {
  data: SubjectPerf[];
}

export function PerformanceSection({ data }: PerformanceSectionProps) {
  return (
    <Card className="rounded-xl shadow-sm border-gray-100 dark:border-gray-800 shadow-none">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center gap-2 text-left">
          <TrendingUp className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-sm font-semibold">
            Subject-wise Performance
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-3">
          {data.map((sp) => (
            <div key={sp.subject} className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {sp.subject}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {sp.exams} exams
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold shadow-none ${
                      sp.bestGrade.startsWith("A")
                        ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                        : sp.bestGrade.startsWith("B")
                          ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                          : "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    {sp.bestGrade}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Progress
                  value={sp.avgPct}
                  className="h-2.5 flex-1 [&>div]:bg-amber-500"
                />
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 w-10 text-right">
                  {sp.avgPct}%
                </span>
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No grade data available
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
