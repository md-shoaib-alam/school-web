import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award, Star } from "lucide-react";
import type { GradeDistributionItem } from "./types";

interface ExamsSummaryCardsProps {
  overallAvg: number;
  totalRecords: number;
  uniqueSubjectsCount: number;
  uniqueExamTypesCount: number;
  highGradesCount: number;
  gradeDistribution: GradeDistributionItem[];
  gradeColorMap: Record<string, string>;
}

export function ExamsSummaryCards({
  overallAvg,
  totalRecords,
  uniqueSubjectsCount,
  uniqueExamTypesCount,
  highGradesCount,
  gradeDistribution,
}: ExamsSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      <Card className="col-span-2 sm:col-span-1 rounded-2xl border border-border bg-card shadow-xs transition-colors hover:border-border">
        <CardContent className="p-4 sm:p-5 text-left flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-muted text-foreground flex items-center justify-center shrink-0">
                <TrendingUp className="size-4" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
                {overallAvg}%
              </p>
            </div>
            <p className="text-xs font-medium text-muted-foreground mt-3">
              Average Score
            </p>
          </div>
          <Progress value={overallAvg} className="mt-3 h-1.5 bg-muted [&>div]:bg-foreground" />
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border bg-card shadow-xs transition-colors hover:border-border">
        <CardContent className="p-4 sm:p-5 text-left flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-muted text-foreground flex items-center justify-center shrink-0">
              <Award className="size-4" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
              {totalRecords}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mt-3">
              Total Results
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Across {uniqueSubjectsCount} subjects ({uniqueExamTypesCount} exams)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border bg-card shadow-xs transition-colors hover:border-border">
        <CardContent className="p-4 sm:p-5 text-left flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-muted text-foreground flex items-center justify-center shrink-0">
              <Star className="size-4" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
              {highGradesCount}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mt-3">
              Top Grades
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              {gradeDistribution.slice(0, 3).map((g) => (
                <Badge
                  key={g.grade}
                  variant="outline"
                  className="text-[10px] font-semibold bg-muted text-foreground border-border px-2 py-0.5"
                >
                  {g.grade}: {g.count}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
