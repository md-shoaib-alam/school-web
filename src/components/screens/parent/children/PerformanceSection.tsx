"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Award } from "lucide-react";

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
    <Card className="rounded-3xl border border-border bg-card shadow-xs py-0 gap-0 overflow-hidden">
      <CardHeader className="px-5 py-4 border-b border-border flex flex-row items-center gap-3 space-y-0">
        <div className="size-8 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0">
          <TrendingUp className="size-4" />
        </div>
        <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
          Subject-wise Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-4">
          {data.map((sp) => (
            <div key={sp.subject} className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  {sp.subject}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                    {sp.exams} {sp.exams === 1 ? "exam" : "exams"}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-semibold rounded-md px-2 py-0.5 bg-muted text-foreground border-border"
                  >
                    Best: {sp.bestGrade}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Progress
                  value={sp.avgPct}
                  className="h-2 flex-1 bg-muted [&>div]:bg-foreground"
                />
                <span className="text-xs font-semibold text-foreground w-10 text-right tabular-nums">
                  {sp.avgPct}%
                </span>
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Award className="size-8 mb-2 opacity-30 text-muted-foreground" />
              <p className="text-xs font-medium">No grade data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
