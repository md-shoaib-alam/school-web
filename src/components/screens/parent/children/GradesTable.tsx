"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Award } from "lucide-react";
import type { GradeRecord } from "@/lib/types";

interface GradesTableProps {
  grades: GradeRecord[];
}

export function GradesTable({ grades }: GradesTableProps) {
  return (
    <Card className="rounded-xl shadow-sm border-gray-100 dark:border-gray-800 shadow-none">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center gap-2 text-left">
          <Award className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-sm font-semibold">
            Recent Grades
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Subject</TableHead>
              <TableHead className="text-xs">Exam</TableHead>
              <TableHead className="text-xs text-right">Marks</TableHead>
              <TableHead className="text-xs text-center">Grade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grades.map((g) => (
              <TableRow key={g.id}>
                <TableCell className="text-sm py-2 text-left">{g.subjectName}</TableCell>
                <TableCell className="text-sm text-muted-foreground py-2 capitalize text-left">
                  {g.examType}
                </TableCell>
                <TableCell className="text-sm text-right font-medium py-2">
                  {g.marks}/{g.maxMarks}
                </TableCell>
                <TableCell className="text-center py-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold shadow-none ${
                      g.grade?.startsWith("A")
                        ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                        : g.grade?.startsWith("B")
                          ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                          : "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    {g.grade || "N/A"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {grades.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-sm text-muted-foreground py-6"
                >
                  No grades available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
