"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

interface RecentAssignmentsProps {
  assignments: any[];
  onViewAll: () => void;
  formatDate: (date: string) => string;
}

export function RecentAssignments({
  assignments,
  onViewAll,
  formatDate,
}: RecentAssignmentsProps) {
  return (
    <Card className="rounded-xl shadow-sm border-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileText className="size-4 text-blue-500" />
            Recent Assignments
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-500 dark:text-blue-400 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20"
            onClick={onViewAll}
          >
            View All <ArrowRight className="size-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-2">
          {assignments.slice(0, 5).map((assignment) => {
            const isOverdue = new Date(assignment.dueDate) < new Date();
            const progressPct =
              assignment.totalStudents > 0
                ? Math.round(
                    (assignment.submissions / assignment.totalStudents) *
                      100,
                  )
                : 0;
            return (
              <div
                key={assignment.id}
                className="p-3 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[200px]">
                    {assignment.title}
                  </p>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      isOverdue
                        ? "border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20"
                        : "border-blue-200 dark:border-blue-800 text-blue-500 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                    }`}
                  >
                    {isOverdue ? (
                      <>
                        <AlertCircle className="size-2.5 mr-0.5" />{" "}
                        Overdue
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-2.5 mr-0.5" /> Due{" "}
                        {formatDate(assignment.dueDate)}
                      </>
                    )}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 mb-2">
                  <span>
                    {assignment.subjectName} • {assignment.className}
                  </span>
                  <span>
                    {assignment.submissions}/{assignment.totalStudents}{" "}
                    submitted
                  </span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      progressPct === 100
                        ? "bg-emerald-500"
                        : isOverdue
                          ? "bg-red-400"
                          : "bg-blue-500"
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            );
          })}
          {assignments.length === 0 && (
            <div className="text-center py-6">
              <FileText className="size-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
              <p className="text-zinc-400 dark:text-zinc-500 text-sm">
                No assignments created yet
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
