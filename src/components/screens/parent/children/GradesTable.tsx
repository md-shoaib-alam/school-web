"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, BookOpen, GraduationCap, ChevronRight } from "lucide-react";
import type { GradeRecord } from "@/types";

interface GradesTableProps {
  grades: GradeRecord[];
}

export function GradesTable({ grades }: GradesTableProps) {
  return (
    <Card className="rounded-3xl border border-border bg-card shadow-xs py-0 gap-0 overflow-hidden">
      <CardHeader className="px-5 py-4 border-b border-border flex flex-row items-center gap-3 space-y-0">
        <div className="size-8 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0">
          <Award className="size-4" />
        </div>
        <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
          Recent Grades
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-2.5">
          {grades.map((g) => (
            <div 
              key={g.id} 
              className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors group text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
                  <GraduationCap className="size-4" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-semibold text-foreground truncate">
                    {g.subjectName}
                  </h5>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight mt-0.5">
                    {g.examType}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    {Number(g.marks).toFixed(2).replace(/\.00$/, "")}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium block">
                    /{g.maxMarks} max
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] font-semibold rounded-full px-2.5 py-0.5 bg-muted text-foreground border-border">
                  {g.grade || "N/A"}
                </Badge>
                <ChevronRight className="size-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
          {grades.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-center">
              <BookOpen className="size-9 mb-2 opacity-30 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">No grades available</p>
              <p className="text-xs text-muted-foreground mt-0.5">Academic marks will appear here once recorded</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
