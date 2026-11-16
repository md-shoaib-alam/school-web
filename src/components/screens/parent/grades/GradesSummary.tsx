"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Target, Award, Star, BookOpen } from "lucide-react";

interface GradesSummaryProps {
  avg: number;
  grade: string;
  highestSubject: string;
  highestPct: number;
  totalExams: number;
}

export function GradesSummary({
  avg,
  grade,
  highestSubject,
  highestPct,
  totalExams,
}: GradesSummaryProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <SummaryCard
        label="Average Score"
        value={`${avg}%`}
        icon={<Target className="size-4" />}
      />
      <SummaryCard
        label="Overall Grade"
        value={grade}
        icon={<Award className="size-4" />}
      />
      <SummaryCard
        label={highestSubject ? `Best: ${highestSubject}` : "Best Subject"}
        value={highestPct ? `${Math.round(highestPct)}%` : "N/A"}
        icon={<Star className="size-4" />}
      />
      <SummaryCard
        label="Total Exams"
        value={String(totalExams)}
        icon={<BookOpen className="size-4" />}
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl border border-border bg-card shadow-xs transition-colors hover:border-border">
      <CardContent className="p-4 sm:p-5 text-left flex flex-col justify-between h-full">
        <div className="flex items-center justify-between">
          <div className="p-2.5 rounded-xl bg-muted text-foreground flex items-center justify-center shrink-0">
            {icon}
          </div>
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums truncate max-w-[140px]">
            {value}
          </span>
        </div>
        <p className="text-xs font-medium text-muted-foreground mt-3 truncate">
          {label}
        </p>
      </CardContent>
    </Card>
  );
}
