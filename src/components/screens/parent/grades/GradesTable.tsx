"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
import type { GradeRecord } from "@/types";

interface GradesTableProps {
  studentName: string;
  grades: GradeRecord[];
}

export function GradesTable({ studentName, grades }: GradesTableProps) {
  return (
    <Card className="rounded-3xl border border-border bg-card shadow-xs py-0 gap-0 overflow-hidden h-full flex flex-col">
      <CardHeader className="px-5 py-4 border-b border-border flex flex-row items-center gap-3 space-y-0 text-left">
        <div className="size-8 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0">
          <Award className="size-4" />
        </div>
        <div>
          <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
            Detailed Grades
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            All exam results for {studentName}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <div className="max-h-[340px] overflow-y-auto">
          <Table>
            <TableHeader className="bg-muted/40 sticky top-0">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs font-semibold h-9 text-muted-foreground text-left pl-5">Subject</TableHead>
                <TableHead className="text-xs font-semibold h-9 text-muted-foreground text-left">Exam Type</TableHead>
                <TableHead className="text-xs font-semibold h-9 text-muted-foreground text-right">Marks</TableHead>
                <TableHead className="text-xs font-semibold h-9 text-muted-foreground text-center">Score</TableHead>
                <TableHead className="text-xs font-semibold h-9 text-muted-foreground text-center pr-5">Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map((g, i) => {
                const pct = Math.round((g.marks / g.maxMarks) * 100);
                return (
                  <TableRow key={`${g.id}-${i}`} className="border-border hover:bg-muted/40">
                    <TableCell className="text-sm py-3 font-medium text-left pl-5 text-foreground">
                      {g.subjectName}
                    </TableCell>
                    <TableCell className="text-sm py-3 text-left">
                      <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground border-border font-medium capitalize">
                        {g.examType.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm py-3 text-right font-medium tabular-nums text-foreground">
                      {Number(g.marks).toFixed(2).replace(/\.00$/, "")}
                      <span className="text-xs text-muted-foreground font-normal">/{g.maxMarks}</span>
                    </TableCell>
                    <TableCell className="text-sm py-3 text-center">
                      <span className="font-semibold text-foreground tabular-nums">
                        {pct}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center py-3 pr-5">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-semibold rounded-full px-2.5 py-0.5 bg-muted text-foreground border-border"
                      >
                        {g.grade || "N/A"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {grades.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-12">
                    No grades available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
