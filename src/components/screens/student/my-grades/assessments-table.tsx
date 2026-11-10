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
    <Card className="rounded-xl shadow-sm ">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 font-semibold">
          <GraduationCap className="size-4 text-violet-500" />
          All Graded Assessments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[500px] w-full">
          <div className="min-w-[700px] sm:min-w-full pb-4">
            {assessmentGrades.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl mt-2">
                <GraduationCap className="size-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">
                  No assessment records graded yet
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="">
                    <TableHead className="font-semibold">
                      Assessment Title
                    </TableHead>
                    <TableHead className="font-semibold">Subject</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="text-center font-semibold">
                      Score
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessmentGrades.map((g) => {
                    const isGraded = g.marksObtained !== null && g.marksObtained !== undefined;
                    const isPass = isGraded ? (g.marksObtained! >= g.passingMarks) : false;
                    return (
                      <TableRow
                        key={g.id}
                        className=" hover:bg-muted"
                      >
                        <TableCell className="font-semibold text-foreground">
                          {g.title}
                        </TableCell>
                        <TableCell className="font-medium">
                          {g.subjectName}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-[11px] capitalize bg-muted  font-medium"
                          >
                            {g.type.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {isGraded ? (
                            <>
                              <span className="text-sm font-bold text-foreground">
                                {Number(g.marksObtained)
                                  .toFixed(2)
                                  .replace(/\.00$/, "")}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                /{g.totalMarks}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground font-medium">
                              -/{g.totalMarks}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {isGraded ? (
                            <Badge
                              className={`text-[11px] font-bold px-2 py-0.5 border-0 shadow-none ${
                                isPass
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                  : "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                              }`}
                            >
                              {isPass ? "PASS" : "FAIL"}
                            </Badge>
                          ) : (
                            <Badge
                              className="text-[11px] font-bold px-2 py-0.5 border-0 shadow-none bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                            >
                              PENDING
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate font-medium">
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
