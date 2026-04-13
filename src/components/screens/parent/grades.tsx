"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/use-app-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  TrendingUp,
  Award,
  BookOpen,
  BarChart3,
  Target,
  Star,
} from "lucide-react";
import type { StudentInfo, GradeRecord } from "@/lib/types";

const chartConfig = {
  percentage: { label: "Score %", color: "#f59e0b" },
} satisfies ChartConfig;

const gradeBadgeClasses = (grade?: string) =>
  grade?.startsWith("A")
    ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
    : grade?.startsWith("B")
      ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
      : "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";

export function ParentGrades() {
  const { currentUser } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [studentsRes, gradesRes] = await Promise.all([
          fetch("/api/students"),
          fetch("/api/grades"),
        ]);
        const studentsData = await studentsRes.json();
        const gradesData = await gradesRes.json();

        const parentStudents = studentsData.filter(
          (s: StudentInfo) => s.parentName === currentUser?.name,
        );
        const studentIds = parentStudents.map((s: StudentInfo) => s.id);

        setStudents(parentStudents);
        setGrades(
          gradesData.filter((g: GradeRecord) =>
            studentIds.includes(g.studentId),
          ),
        );
        if (parentStudents.length > 0) {
          setActiveTab(parentStudents[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currentUser?.name]);

  const getGradesForStudent = (studentId: string) => {
    return grades.filter((g) => g.studentId === studentId);
  };

  const getSubjectChartData = (studentId: string) => {
    const studentGrades = getGradesForStudent(studentId);
    const subjectMap = new Map<string, { totalPct: number; count: number }>();

    studentGrades.forEach((g) => {
      const pct = (g.marks / g.maxMarks) * 100;
      if (!subjectMap.has(g.subjectName)) {
        subjectMap.set(g.subjectName, { totalPct: 0, count: 0 });
      }
      const entry = subjectMap.get(g.subjectName)!;
      entry.totalPct += pct;
      entry.count++;
    });

    return Array.from(subjectMap.entries()).map(([subject, data]) => ({
      subject,
      percentage: Math.round(data.totalPct / data.count),
    }));
  };

  const getOverallStats = (studentId: string) => {
    const studentGrades = getGradesForStudent(studentId);
    if (studentGrades.length === 0)
      return {
        avg: 0,
        grade: "N/A",
        highest: { subject: "N/A", pct: 0 },
        lowest: { subject: "N/A", pct: 0 },
        totalExams: 0,
      };

    const avg =
      studentGrades.reduce((sum, g) => sum + (g.marks / g.maxMarks) * 100, 0) /
      studentGrades.length;
    const grade =
      avg >= 90
        ? "A+"
        : avg >= 80
          ? "A"
          : avg >= 70
            ? "B+"
            : avg >= 60
              ? "B"
              : avg >= 50
                ? "C"
                : "D";

    let highest = { subject: "", pct: 0 };
    let lowest = { subject: "", pct: 100 };
    studentGrades.forEach((g) => {
      const pct = (g.marks / g.maxMarks) * 100;
      if (pct > highest.pct) highest = { subject: g.subjectName, pct };
      if (pct < lowest.pct) lowest = { subject: g.subjectName, pct };
    });

    return {
      avg: Math.round(avg),
      grade,
      highest,
      lowest,
      totalExams: studentGrades.length,
    };
  };

  if (loading) return <GradesSkeleton />;

  if (students.length === 0) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardContent className="p-12 text-center">
          <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-4">
            No data available
          </h3>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-amber-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Children&apos;s Grades
        </h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-amber-50 dark:bg-amber-900/30 p-1">
          {students.map((student) => (
            <TabsTrigger
              key={student.id}
              value={student.id}
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400 data-[state=active]:shadow-sm px-4"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {student.name}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {students.map((student) => {
          const studentGrades = getGradesForStudent(student.id);
          const chartData = getSubjectChartData(student.id);
          const stats = getOverallStats(student.id);

          return (
            <TabsContent
              key={student.id}
              value={student.id}
              className="space-y-6 mt-6"
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="rounded-xl shadow-sm">
                  <CardContent className="p-4 text-center">
                    <Target className="h-5 w-5 mx-auto text-amber-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.avg}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Average Score
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-xl shadow-sm">
                  <CardContent className="p-4 text-center">
                    <Award className="h-5 w-5 mx-auto text-amber-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.grade}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Overall Grade
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-xl shadow-sm">
                  <CardContent className="p-4 text-center">
                    <Star className="h-5 w-5 mx-auto text-emerald-600 mb-2" />
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                      {stats.highest.subject}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Best Subject ({Math.round(stats.highest.pct)}%)
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-xl shadow-sm">
                  <CardContent className="p-4 text-center">
                    <BookOpen className="h-5 w-5 mx-auto text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.totalExams}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Exams</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Performance Chart */}
                <Card className="lg:col-span-2 rounded-xl shadow-sm">
                  <CardHeader className="p-4 pb-0">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-amber-600" />
                      Performance by Subject
                    </CardTitle>
                    <CardDescription>Average score percentage</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    {chartData.length > 0 ? (
                      <ChartContainer
                        config={chartConfig}
                        className="h-[280px] w-full"
                      >
                        <BarChart
                          data={chartData}
                          layout="vertical"
                          margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={false}
                          />
                          <XAxis
                            type="number"
                            domain={[0, 100]}
                            tickFormatter={(v) => `${v}%`}
                          />
                          <YAxis
                            type="category"
                            dataKey="subject"
                            width={80}
                            tick={{ fontSize: 12 }}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar
                            dataKey="percentage"
                            fill="var(--color-percentage)"
                            radius={[0, 4, 4, 0]}
                            maxBarSize={24}
                          />
                        </BarChart>
                      </ChartContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
                        No grade data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Grade Table */}
                <Card className="lg:col-span-3 rounded-xl shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-600" />
                      Detailed Grades
                    </CardTitle>
                    <CardDescription>
                      All exam results for {student.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="max-h-[340px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Subject</TableHead>
                            <TableHead className="text-xs">Exam Type</TableHead>
                            <TableHead className="text-xs text-right">
                              Marks
                            </TableHead>
                            <TableHead className="text-xs text-center">
                              Score
                            </TableHead>
                            <TableHead className="text-xs text-center">
                              Grade
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {studentGrades.map((g, i) => {
                            const pct = Math.round(
                              (g.marks / g.maxMarks) * 100,
                            );
                            return (
                              <TableRow key={`${g.id}-${i}`}>
                                <TableCell className="text-sm py-2 font-medium">
                                  {g.subjectName}
                                </TableCell>
                                <TableCell className="text-sm py-2 text-muted-foreground capitalize">
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] mr-1"
                                  >
                                    {g.examType}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm py-2 text-right font-medium">
                                  {g.marks}
                                  <span className="text-muted-foreground">
                                    /{g.maxMarks}
                                  </span>
                                </TableCell>
                                <TableCell className="text-sm py-2 text-center">
                                  <span
                                    className={`font-semibold ${pct >= 80 ? "text-emerald-600 dark:text-emerald-400" : pct >= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}
                                  >
                                    {pct}%
                                  </span>
                                </TableCell>
                                <TableCell className="text-center py-2">
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] font-bold ${gradeBadgeClasses(g.grade)}`}
                                  >
                                    {g.grade || "N/A"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          {studentGrades.length === 0 && (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="text-center text-sm text-muted-foreground py-8"
                              >
                                No grades available
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

function GradesSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-10 w-72" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    </div>
  );
}
