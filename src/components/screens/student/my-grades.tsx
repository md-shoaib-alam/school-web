"use client";


import { apiFetch } from "@/lib/api";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useAppStore } from "@/store/use-app-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  PieChart,
  Pie,
} from "recharts";
import {
  TrendingUp,
  Award,
  BarChart3,
  Star,
  GraduationCap,
  CircleDot,
  CheckCircle2,
} from "lucide-react";
import type { GradeRecord, StudentInfo } from "@/lib/types";

type AssessmentGrade = {
  id: string;
  assessmentId: string;
  title: string;
  type: string;
  subjectName: string;
  marksObtained: number;
  totalMarks: number;
  passingMarks: number;
  remarks: string;
  createdAt: string;
};

export function StudentGrades({ initialTab }: { initialTab?: "exams" | "assessments" }) {
  const { currentUser } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [assessmentGrades, setAssessmentGrades] = useState<AssessmentGrade[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [topLevelTab, setTopLevelTab] = useState<"exams" | "assessments">(initialTab || "exams");

  const student = Array.isArray(students)
    ? students.find((s) => s.email === currentUser?.email) || null
    : null;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/students/me");
      if (!res.ok) throw new Error("Failed to fetch student profile");
      const targetStudent = await res.json();
      
      setStudents([targetStudent]); // Keep state compatible with other parts of the component if needed

      if (targetStudent?.id) {
        const [gradesRes, assessRes] = await Promise.all([
          apiFetch(`/api/grades?studentId=${targetStudent.id}`),
          apiFetch(`/api/assessments/student-grades?studentId=${targetStudent.id}`)
        ]);
        const gradesData = await gradesRes.json();
        const assessData = await assessRes.json();
        setGrades(Array.isArray(gradesData) ? gradesData : []);
        setAssessmentGrades(Array.isArray(assessData) ? assessData : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.email]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const studentId = student?.id || "";

  const filteredGrades = useMemo(() => {
    if (activeTab === "all") return grades;
    return grades.filter((g) => g.examType.toLowerCase() === activeTab);
  }, [grades, activeTab]);

  // Computed analytics
  const overallAvg = useMemo(() => {
    if (!grades.length) return 0;
    return Math.round(
      grades.reduce((s, g) => s + (g.marks / g.maxMarks) * 100, 0) /
        grades.length,
    );
  }, [grades]);

  const gradeDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    grades.forEach((g) => {
      const letter = g.grade || "N/A";
      dist[letter] = (dist[letter] || 0) + 1;
    });
    return Object.entries(dist)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([grade, count]) => ({ grade, count }));
  }, [grades]);

  const gradeColorMap: Record<string, string> = {
    "A+": "#8b5cf6",
    A: "#7c3aed",
    "B+": "#6366f1",
    B: "#3b82f6",
    C: "#f59e0b",
    D: "#ef4444",
    "N/A": "#9ca3af",
  };

  // Chart: bar chart of marks by subject for latest exam
  const latestExam = useMemo(() => {
    if (!grades.length) return { data: [], label: "" };
    const examTypes = [...new Set(grades.map((g) => g.examType))];
    const latest = examTypes[0];
    const examGrades = grades.filter((g) => g.examType === latest);
    const data = examGrades.map((g) => ({
      subject:
        g.subjectName.length > 15
          ? g.subjectName.slice(0, 12) + "..."
          : g.subjectName,
      marks: Math.round((g.marks / g.maxMarks) * 100),
      fill:
        (g.marks / g.maxMarks) * 100 >= 80
          ? "#8b5cf6"
          : (g.marks / g.maxMarks) * 100 >= 60
            ? "#a78bfa"
            : "#f59e0b",
    }));
    return { data, label: latest };
  }, [grades]);

  // Pie chart data for grade distribution
  const pieData = gradeDistribution.map((g) => ({
    name: g.grade,
    value: g.count,
    fill: gradeColorMap[g.grade] || "#9ca3af",
  }));

  const assessmentAvg = useMemo(() => {
    if (!assessmentGrades.length) return 0;
    return Math.round(
      assessmentGrades.reduce((s, g) => s + (g.marksObtained / g.totalMarks) * 100, 0) /
        assessmentGrades.length,
    );
  }, [assessmentGrades]);

  const latestAssessmentChartData = useMemo(() => {
    if (!assessmentGrades.length) return [];
    const grouped: Record<string, { sum: number; count: number }> = {};
    assessmentGrades.forEach((g) => {
      if (!grouped[g.subjectName]) grouped[g.subjectName] = { sum: 0, count: 0 };
      grouped[g.subjectName].sum += (g.marksObtained / g.totalMarks) * 100;
      grouped[g.subjectName].count += 1;
    });
    return Object.entries(grouped).map(([subj, val]) => {
      const avg = Math.round(val.sum / val.count);
      return {
        subject: subj.length > 15 ? subj.slice(0, 12) + "..." : subj,
        marks: avg,
        fill: avg >= 80 ? "#6366f1" : avg >= 50 ? "#818cf8" : "#ef4444",
      };
    });
  }, [assessmentGrades]);

  const chartConfig = {
    marks: { label: "Score %", color: "#8b5cf6" },
  };

  if (loading) return <GradesSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {topLevelTab === "exams" ? "School Exams" : "Class Assessments"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {topLevelTab === "exams" 
              ? "Track your official term examinations and standardized scores" 
              : "Monitor your periodic teacher assignments, classwork, and quizzes"}
          </p>
        </div>
      </div>

      {topLevelTab === "exams" ? (
        <div className="space-y-6">
          {/* School Exams Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="rounded-xl shadow-sm border-violet-100 dark:border-violet-950/30 bg-gradient-to-tr from-white to-violet-50/20 dark:from-background dark:to-violet-950/10">
              <CardContent className="p-5 text-center">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white mb-3">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {overallAvg}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1 font-medium">
                  Exam Average
                </p>
                <Progress value={overallAvg} className="mt-3 h-2" />
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm border-emerald-100 dark:border-emerald-950/30 bg-gradient-to-tr from-white to-emerald-50/20 dark:from-background dark:to-emerald-950/10">
              <CardContent className="p-5 text-center">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white mb-3">
                  <Award className="h-5 w-5" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {grades.length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1 font-medium">
                  Total Records
                </p>
                <div className="flex items-center justify-center gap-1 mt-3 text-xs text-gray-400 dark:text-gray-500 font-medium">
                  <span>
                    {[...new Set(grades.map((g) => g.subjectName))].length} subjects
                  </span>
                  <span>•</span>
                  <span>
                    {[...new Set(grades.map((g) => g.examType))].length} types
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm border-amber-100 dark:border-amber-950/30 bg-gradient-to-tr from-white to-amber-50/20 dark:from-background dark:to-amber-950/10">
              <CardContent className="p-5 text-center">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white mb-3">
                  <Star className="h-5 w-5" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {gradeDistribution.find(
                    (g) => g.grade === "A+" || g.grade === "A",
                  )?.count || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1 font-medium">
                  A/A+ Grades
                </p>
                <div className="flex items-center justify-center gap-1 mt-3">
                  {gradeDistribution.slice(0, 4).map((g) => (
                    <Badge
                      key={g.grade}
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0"
                      style={{
                        backgroundColor: gradeColorMap[g.grade] + "20",
                        color: gradeColorMap[g.grade],
                      }}
                    >
                      {g.grade}: {g.count}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* School Exams Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-xl shadow-sm border-gray-200/60 dark:border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 font-semibold">
                  <BarChart3 className="h-4 w-4 text-violet-500" />
                  Subject Performance
                </CardTitle>
                <CardDescription className="text-xs">
                  {latestExam.label ? `Latest Term: ${latestExam.label}` : "Academic records summary"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {latestExam.data.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[260px] w-full">
                    <BarChart
                      data={latestExam.data}
                      layout="vertical"
                      margin={{ left: 10, right: 10 }}
                    >
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        type="category"
                        dataKey="subject"
                        width={90}
                        tick={{ fontSize: 11 }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="marks" radius={[0, 6, 6, 0]} barSize={22}>
                        {latestExam.data.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[260px] flex items-center justify-center text-gray-400 dark:text-gray-500 border-2 border-dashed rounded-xl border-gray-100 dark:border-zinc-800">
                    <p className="text-sm">No subject chart data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm border-gray-200/60 dark:border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 font-semibold">
                  <CircleDot className="h-4 w-4 text-violet-500" />
                  Grade Distribution
                </CardTitle>
                <CardDescription className="text-xs">
                  Breakdown of terms letter grades
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <div className="flex items-center gap-6">
                    <ChartContainer
                      config={chartConfig}
                      className="h-[200px] w-[200px]"
                    >
                      <PieChart>
                        <ChartTooltip
                          content={<ChartTooltipContent nameKey="name" />}
                        />
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={index} fill={entry.fill} stroke="none" />
                          ))}
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                    <div className="flex flex-col gap-2">
                      {gradeDistribution.map((g) => (
                        <div
                          key={g.grade}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: gradeColorMap[g.grade] }}
                          />
                          <span className="text-gray-600 dark:text-gray-400 font-medium">
                            {g.grade}
                          </span>
                          <Badge variant="secondary" className="text-[10px] ml-1 font-normal">
                            {g.count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-gray-400 dark:text-gray-500 border-2 border-dashed rounded-xl border-gray-100 dark:border-zinc-800">
                    <p className="text-sm font-medium">No distribution data</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* School Exams Table */}
          <Card className="rounded-xl shadow-sm border-gray-200/60 dark:border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 font-semibold">
                <GraduationCap className="h-4 w-4 text-violet-500" />
                All Exam Grades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue="all"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <TabsList className="mb-4 bg-gray-50 dark:bg-zinc-900 p-1">
                  <TabsTrigger value="all" className="text-xs">All Exams</TabsTrigger>
                  <TabsTrigger value="midterm" className="text-xs">Midterm</TabsTrigger>
                  <TabsTrigger value="final" className="text-xs">Finals</TabsTrigger>
                  <TabsTrigger value="quiz" className="text-xs">Quizzes</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                  <ScrollArea className="max-h-[400px]">
                    {filteredGrades.length === 0 ? (
                      <div className="text-center py-12 text-gray-400 dark:text-gray-500 border border-dashed rounded-xl mt-2">
                        <GraduationCap className="h-10 w-10 mx-auto mb-2 opacity-40" />
                        <p className="text-sm font-medium">No exam grades found</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-100 dark:border-zinc-800">
                            <TableHead className="font-semibold">Subject</TableHead>
                            <TableHead className="font-semibold">Exam Type</TableHead>
                            <TableHead className="text-center font-semibold">Marks</TableHead>
                            <TableHead className="text-center font-semibold">Percentage</TableHead>
                            <TableHead className="text-center font-semibold">Grade</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredGrades.map((g) => {
                            const pct = Math.round((g.marks / g.maxMarks) * 100);
                            return (
                              <TableRow key={g.id} className="border-gray-100 dark:border-zinc-800 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                                <TableCell className="font-medium">
                                  {g.subjectName}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className="text-xs capitalize px-2.5 font-medium bg-zinc-50/50 dark:bg-zinc-900"
                                  >
                                    {g.examType}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                    {Number(g.marks).toFixed(2).replace(/\.00$/, "")}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    /{g.maxMarks}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Progress value={pct} className="w-16 h-1.5 bg-gray-100 dark:bg-zinc-800 [&>div]:bg-violet-500" />
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                      {pct}%
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge
                                    className={`text-xs font-bold border-0 px-2.5 ${
                                      pct >= 80
                                        ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                                        : pct >= 60
                                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                          : pct >= 50
                                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                            : "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                                    }`}
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
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Assessments Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="rounded-xl shadow-sm border-indigo-100 dark:border-indigo-950/30 bg-gradient-to-tr from-white to-indigo-50/20 dark:from-background dark:to-indigo-950/10">
              <CardContent className="p-5 text-center">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white mb-3">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {assessmentAvg}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1 font-medium">
                  Assessment Average
                </p>
                <Progress value={assessmentAvg} className="mt-3 h-2" />
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm border-blue-100 dark:border-blue-950/30 bg-gradient-to-tr from-white to-blue-50/20 dark:from-background dark:to-blue-950/10">
              <CardContent className="p-5 text-center">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white mb-3">
                  <Award className="h-5 w-5" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {assessmentGrades.length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                  Total Graded
                </p>
                <div className="flex items-center justify-center gap-1 mt-3 text-xs text-gray-400 dark:text-gray-500 font-medium">
                  <span>
                    {[...new Set(assessmentGrades.map((a) => a.subjectName))].length} active subjects
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm border-teal-100 dark:border-teal-950/30 bg-gradient-to-tr from-white to-teal-50/20 dark:from-background dark:to-teal-950/10">
              <CardContent className="p-5 text-center">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white mb-3">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {assessmentGrades.filter(a => a.marksObtained >= a.passingMarks).length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                  Pass Count
                </p>
                <div className="flex items-center justify-center gap-1 mt-3 text-xs text-teal-600 dark:text-teal-400 font-semibold">
                  <span>Keep it up! ✨</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assessment Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-xl shadow-sm border-gray-200/60 dark:border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 font-semibold">
                  <BarChart3 className="h-4 w-4 text-indigo-500" />
                  Assessment Performance by Subject
                </CardTitle>
                <CardDescription className="text-xs">
                  Running averages of periodic class assessments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {latestAssessmentChartData.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[260px] w-full">
                    <BarChart
                      data={latestAssessmentChartData}
                      layout="vertical"
                      margin={{ left: 10, right: 10 }}
                    >
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        type="category"
                        dataKey="subject"
                        width={90}
                        tick={{ fontSize: 11 }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="marks" radius={[0, 6, 6, 0]} barSize={22}>
                        {latestAssessmentChartData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[260px] flex items-center justify-center text-gray-400 dark:text-gray-500 border-2 border-dashed rounded-xl border-gray-100 dark:border-zinc-800">
                    <p className="text-sm">No continuous assessment data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm border-gray-200/60 dark:border-zinc-800 flex flex-col justify-between">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 font-semibold">
                  <Star className="h-4 w-4 text-indigo-500" />
                  Tips for Improvement
                </CardTitle>
                <CardDescription className="text-xs">
                  Based on your class assessment activities
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center py-6">
                <div className="space-y-4 font-medium text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <p>Regular class assessments weigh directly into your overall academic profile. Don't skip assignments!</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <p>If you scored below {assessmentAvg}% in any recent unit test, consider requesting extra practice materials from your teacher.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <p>Check teacher remarks inside the table below to find constructive feedback on individual topics.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assessment Grades Table */}
          <Card className="rounded-xl shadow-sm border-gray-200/60 dark:border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 font-semibold">
                <GraduationCap className="h-4 w-4 text-indigo-500" />
                All Graded Assessments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[400px]">
                {assessmentGrades.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 dark:text-gray-500 border border-dashed rounded-xl mt-2">
                    <GraduationCap className="h-10 w-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">No assessment records graded yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-100 dark:border-zinc-800">
                        <TableHead className="font-semibold">Assessment Title</TableHead>
                        <TableHead className="font-semibold">Subject</TableHead>
                        <TableHead className="font-semibold">Type</TableHead>
                        <TableHead className="text-center font-semibold">Score</TableHead>
                        <TableHead className="text-center font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assessmentGrades.map((g) => {
                        const isPass = g.marksObtained >= g.passingMarks;
                        return (
                          <TableRow key={g.id} className="border-gray-100 dark:border-zinc-800 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                            <TableCell className="font-semibold text-gray-900 dark:text-gray-100">
                              {g.title}
                            </TableCell>
                            <TableCell className="font-medium">
                              {g.subjectName}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="text-[11px] capitalize bg-gray-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-medium"
                              >
                                {g.type.replace(/_/g, ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                                {Number(g.marksObtained).toFixed(2).replace(/\.00$/, "")}
                              </span>
                              <span className="text-xs text-gray-400">
                                /{g.totalMarks}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                className={`text-[11px] font-bold px-2 py-0.5 border-0 shadow-none ${
                                  isPass
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                    : "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                                }`}
                              >
                                {isPass ? 'PASS' : 'FAIL'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] truncate font-medium">
                              {g.remarks || <span className="opacity-40">—</span>}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function GradesSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-32 mb-2" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}
