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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Card className="rounded-xl shadow-sm shadow-none border-gray-100 dark:border-gray-800">
        <CardContent className="p-4 text-center">
          <Target className="h-5 w-5 mx-auto text-amber-600 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{avg}%</p>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">Average Score</p>
        </CardContent>
      </Card>
      <Card className="rounded-xl shadow-sm shadow-none border-gray-100 dark:border-gray-800">
        <CardContent className="p-4 text-center">
          <Award className="h-5 w-5 mx-auto text-amber-600 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{grade}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">Overall Grade</p>
        </CardContent>
      </Card>
      <Card className="rounded-xl shadow-sm shadow-none border-gray-100 dark:border-gray-800">
        <CardContent className="p-4 text-center">
          <Star className="h-5 w-5 mx-auto text-emerald-600 mb-2" />
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{highestSubject}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">
            Best Subject ({Math.round(highestPct)}%)
          </p>
        </CardContent>
      </Card>
      <Card className="rounded-xl shadow-sm shadow-none border-gray-100 dark:border-gray-800">
        <CardContent className="p-4 text-center">
          <BookOpen className="h-5 w-5 mx-auto text-blue-600 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalExams}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">Total Exams</p>
        </CardContent>
      </Card>
    </div>
  );
}
