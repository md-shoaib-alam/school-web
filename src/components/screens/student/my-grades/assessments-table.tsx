import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GraduationCap } from "lucide-react";
import type { AssessmentGrade } from "./types";

interface AssessmentsTableProps {
  assessmentGrades: AssessmentGrade[];
}

export function AssessmentsTable({ assessmentGrades }: AssessmentsTableProps) {
  return (
    <Card className="rounded-3xl border border-border bg-card shadow-xs py-0 gap-0 overflow-hidden">
      <CardHeader className="px-5 py-4 border-b border-border flex flex-row items-center gap-3 space-y-0 text-left">
        <div className="size-8 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0">
          <GraduationCap className="size-4" />
        </div>
        <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
          All Graded Assessments
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <ScrollArea className="max-h-[500px] w-full">
          <div className="min-w-[700px] sm:min-w-full pb-4">
            {assessmentGrades.length === 0 ? (
              <div className="text-center py-14 text-muted-foreground border border-dashed border-border bg-muted/20 rounded-2xl">
                <GraduationCap className="size-9 mx-auto mb-2 opacity-30 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">
                  No assessment records graded yet
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Teacher assessments will show here once recorded
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/40 sticky top-0">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs font-semibold h-9 text-muted-foreground text-left">
                      Assessment Title
                    </TableHead>
                    <TableHead className="text-xs font-semibold h-9 text-muted-foreground text-left">Subject</TableHead>
                    <TableHead className="text-xs font-semibold h-9 text-muted-foreground text-left">Type</TableHead>
                    <TableHead className="text-center text-xs font-semibold h-9 text-muted-foreground">
                      Score
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold h-9 text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold h-9 text-muted-foreground text-left">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessmentGrades.map((g) => {
                    const isGraded = g.marksObtained !== null && g.marksObtained !== undefined;
                    const isPass = isGraded ? (g.marksObtained! >= g.passingMarks) : false;
                    return (
                      <TableRow
                        key={g.id}
                        className="border-border hover:bg-muted/40"
                      >
                        <TableCell className="font-semibold text-sm text-foreground py-3">
                          {g.title}
                        </TableCell>
                        <TableCell className="font-medium text-sm text-foreground py-3">
                          {g.subjectName}
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge
                            variant="outline"
                            className="text-[10px] capitalize bg-muted text-muted-foreground border-border font-medium px-2 py-0.5"
                          >
                            {g.type.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center py-3">
                          {isGraded ? (
                            <>
                              <span className="text-sm font-semibold text-foreground tabular-nums">
                                {Number(g.marksObtained)
                                  .toFixed(2)
                                  .replace(/\.00$/, "")}
                              </span>
                              <span className="text-xs text-muted-foreground font-normal">
                                /{g.totalMarks}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground font-medium">
                              -/{g.totalMarks}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center py-3">
                          {isGraded ? (
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-semibold px-2 py-0.5 ${
                                isPass
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                              }`}
                            >
                              {isPass ? "PASS" : "FAIL"}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-semibold px-2 py-0.5 bg-muted text-muted-foreground border-border"
                            >
                              PENDING
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate font-medium py-3">
                          {g.remarks || <span className="opacity-40">-</span>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
