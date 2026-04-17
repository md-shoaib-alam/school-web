"use client";

import { useState, useEffect, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart3, GraduationCap } from "lucide-react";
import { GradeRecord } from "@/lib/types";
import { SubjectAverage, gradeChartConfig } from "./types";
import { ChartSkeleton, TableSkeleton } from "./SummaryComponents";

export function AcademicReport() {
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGrades() {
      try {
        const res = await apiFetch("/api/grades");
        if (!res.ok) throw new Error("Failed to fetch grades");
        setGrades(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchGrades();
  }, []);

  const gradeDistribution = useMemo(() => {
    const order = ["A+", "A", "B+", "B", "C", "D"];
    const counts: Record<string, number> = {};
    for (const g of order) counts[g] = 0;
    for (const r of grades) {
      if (r.grade in counts) counts[r.grade]++;
    }
    return order.map((grade) => ({ grade, count: counts[grade] }));
  }, [grades]);

  const subjectAverages = useMemo((): SubjectAverage[] => {
    const subjectMap = new Map<
      string,
      { totalMarks: number; totalMax: number; count: number; grades: string[] }
    >();
    for (const r of grades) {
      const entry = subjectMap.get(r.subjectName) || {
        totalMarks: 0,
        totalMax: 0,
        count: 0,
        grades: [],
      };
      entry.totalMarks += r.marks;
      entry.totalMax += r.maxMarks;
      entry.count++;
      entry.grades.push(r.grade);
      subjectMap.set(r.subjectName, entry);
    }
    const gradeRank: Record<string, number> = {
      "A+": 6,
      A: 5,
      "B+": 4,
      B: 3,
      C: 2,
      D: 1,
    };
    return Array.from(subjectMap.entries())
      .map(([subject, data]) => ({
        subject,
        averageMarks: Math.round(data.totalMarks / data.count),
        maxMarks: Math.round(data.totalMax / data.count),
        studentCount: data.count,
        highestGrade:
          data.grades.sort(
            (a, b) => (gradeRank[b] ?? 0) - (gradeRank[a] ?? 0),
          )[0] || "N/A",
      }))
      .sort((a, b) => b.averageMarks - a.averageMarks);
  }, [grades]);

  const getPerformanceColor = (avg: number, max: number) => {
    const pct = (avg / max) * 100;
    if (pct >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (pct >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getPerformanceBadge = (avg: number, max: number) => {
    const pct = (avg / max) * 100;
    if (pct >= 80)
      return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400";
    if (pct >= 60)
      return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
    return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
  };

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30">
        <CardContent className="p-6 text-center text-red-600 dark:text-red-400">
          <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="font-medium">Failed to load academic report</p>
          <p className="text-sm mt-1">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Grade Distribution</CardTitle>
          <CardDescription>
            Number of students by grade across all subjects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ChartSkeleton />
          ) : grades.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <GraduationCap className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No grade data available</p>
            </div>
          ) : (
            <ChartContainer
              config={gradeChartConfig}
              className="h-[300px] w-full"
            >
              <BarChart data={gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="grade"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  allowDecimals={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={52}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Subject-wise Average Performance
          </CardTitle>
          <CardDescription>
            Average marks, student count, and highest grade per subject
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={6} />
          ) : subjectAverages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No subject data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-center hidden sm:table-cell">
                      Students
                    </TableHead>
                    <TableHead className="text-center">Avg. Marks</TableHead>
                    <TableHead className="text-center hidden sm:table-cell">
                      Max Marks
                    </TableHead>
                    <TableHead className="text-center">Highest Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjectAverages.map((row) => (
                    <TableRow key={row.subject}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                            <GraduationCap className="h-3.5 w-3.5" />
                          </div>
                          {row.subject}
                        </div>
                      </TableCell>
                      <TableCell className="text-center hidden sm:table-cell">
                        {row.studentCount}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`font-semibold ${getPerformanceColor(row.averageMarks, row.maxMarks)}`}
                        >
                          {row.averageMarks}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {" "}
                          / {row.maxMarks}
                        </span>
                      </TableCell>
                      <TableCell className="text-center hidden sm:table-cell">
                        {row.maxMarks}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={`font-medium ${getPerformanceBadge(row.averageMarks, row.maxMarks)}`}
                        >
                          {row.highestGrade}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
