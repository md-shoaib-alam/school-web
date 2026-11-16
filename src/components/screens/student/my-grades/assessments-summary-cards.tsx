import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Award, CheckCircle2 } from "lucide-react";

interface AssessmentsSummaryCardsProps {
  assessmentAvg: number;
  totalGraded: number;
  uniqueSubjectsCount: number;
  passedCount: number;
}

export function AssessmentsSummaryCards({
  assessmentAvg,
  totalGraded,
  uniqueSubjectsCount,
  passedCount,
}: AssessmentsSummaryCardsProps) {
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
                {assessmentAvg}%
              </p>
            </div>
            <p className="text-xs font-medium text-muted-foreground mt-3">
              Average Score
            </p>
          </div>
          <Progress value={assessmentAvg} className="mt-3 h-1.5 bg-muted [&>div]:bg-foreground" />
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border bg-card shadow-xs transition-colors hover:border-border">
        <CardContent className="p-4 sm:p-5 text-left flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-muted text-foreground flex items-center justify-center shrink-0">
              <Award className="size-4" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
              {totalGraded}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mt-3">
              Total Graded
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Across {uniqueSubjectsCount} subjects
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border bg-card shadow-xs transition-colors hover:border-border">
        <CardContent className="p-4 sm:p-5 text-left flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-muted text-foreground flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-4" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
              {passedCount}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mt-3">
              Passed Assessments
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Completed successfully
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
