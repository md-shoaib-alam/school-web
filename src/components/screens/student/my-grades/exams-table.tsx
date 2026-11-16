import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GraduationCap } from "lucide-react";
import type { GradeRecord } from "@/types";

interface ExamsTableProps {
  activeTab: string;
  onActiveTabChange: (tab: string) => void;
  filteredGrades: GradeRecord[];
}

export function ExamsTable({
  activeTab,
  onActiveTabChange,
  filteredGrades,
}: ExamsTableProps) {
  return (
    <Card className="rounded-3xl border border-border bg-card shadow-xs py-0 gap-0 overflow-hidden">
      <CardHeader className="px-5 py-4 border-b border-border flex flex-row items-center gap-3 space-y-0 text-left">
        <div className="size-8 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0">
          <GraduationCap className="size-4" />
        </div>
        <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
          All Exam Grades
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={onActiveTabChange}
        >
          <TabsList className="mb-4 bg-muted p-1 rounded-xl border border-border">
            <TabsTrigger value="all" className="text-xs rounded-lg">
              All Exams
            </TabsTrigger>
            <TabsTrigger value="midterm" className="text-xs rounded-lg">
              Midterm
            </TabsTrigger>
            <TabsTrigger value="final" className="text-xs rounded-lg">
              Finals
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <ScrollArea className="max-h-[500px] w-full">
              <div className="min-w-[600px] sm:min-w-full pb-4">
                {filteredGrades.length === 0 ? (
                  <div className="text-center py-14 text-muted-foreground border border-dashed border-border bg-muted/20 rounded-2xl mt-2">
                    <GraduationCap className="size-9 mx-auto mb-2 opacity-30 text-muted-foreground" />
                    <p className="text-sm font-semibold text-foreground">No exam grades found</p>
                    <p className="text-xs text-muted-foreground mt-0.5">No exams recorded for this filter</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-muted/40 sticky top-0">
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-xs font-semibold h-9 text-muted-foreground text-left">Subject</TableHead>
                        <TableHead className="text-xs font-semibold h-9 text-muted-foreground text-left">
                          Exam Type
                        </TableHead>
                        <TableHead className="text-center text-xs font-semibold h-9 text-muted-foreground">
                          Marks
                        </TableHead>
                        <TableHead className="text-center text-xs font-semibold h-9 text-muted-foreground">
                          Percentage
                        </TableHead>
                        <TableHead className="text-center text-xs font-semibold h-9 text-muted-foreground">
                          Grade
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGrades.map((g) => {
                        const pct = Math.round((g.marks / g.maxMarks) * 100);
                        return (
                          <TableRow
                            key={g.id}
                            className="border-border hover:bg-muted/40"
                          >
                            <TableCell className="font-medium text-sm text-foreground py-3">
                              {g.subjectName}
                            </TableCell>
                            <TableCell className="py-3">
                              <Badge
                                variant="outline"
                                className="text-[10px] capitalize px-2 py-0.5 font-medium bg-muted text-muted-foreground border-border"
                              >
                                {g.examType.replace(/_/g, " ")}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center py-3">
                              <span className="text-sm font-semibold text-foreground tabular-nums">
                                {Number(g.marks)
                                  .toFixed(2)
                                  .replace(/\.00$/, "")}
                              </span>
                              <span className="text-xs text-muted-foreground font-normal">
                                /{g.maxMarks}
                              </span>
                            </TableCell>
                            <TableCell className="text-center py-3">
                              <div className="flex items-center justify-center gap-2">
                                <Progress
                                  value={pct}
                                  className="w-16 h-1.5 bg-muted [&>div]:bg-foreground"
                                />
                                <span className="text-xs font-semibold text-foreground tabular-nums">
                                  {pct}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center py-3">
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
                    </TableBody>
                  </Table>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
