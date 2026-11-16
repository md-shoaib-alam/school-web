"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAppStore } from "@/store/use-app-store";
import { useParentDashboard } from "@/lib/graphql/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, BookOpen, Award, CheckCircle2, ClipboardList, GraduationCap, FileText } from "lucide-react";
import type { StudentInfo, GradeRecord } from "@/types";

// Sub-components
import { GradesSummary } from "./grades/GradesSummary";
import { PerformanceChart } from "./grades/PerformanceChart";
import { GradesTable } from "./grades/GradesTable";
import { GradesSkeleton } from "./grades/GradesSkeleton";
import { ResultPublishedBanner } from "@/components/shared/result-published-banner";
import { ChildSelector } from "./ChildSelector";

// Utils
import { getGradesForStudent, getSubjectChartData, getOverallStats } from "./grades/utils";

interface AssessmentGrade {
  id: string;
  assessmentId: string;
  title: string;
  type: string;
  subjectName: string;
  marksObtained: number;
  totalMarks: number;
  passingMarks: number;
  remarks: string | null;
  createdAt: string;
}

export function ParentGrades({ initialTab = "exams" }: { initialTab?: "exams" | "assessments" }) {
  const { currentUser } = useAppStore();
  const params = useParams();
  const { push } = useRouter();
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const topLevelTab = initialTab;
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [activeTab, setActiveTab] = useState("");
  
  // State for Assessment view
  const [assessmentGrades, setAssessmentGrades] = useState<AssessmentGrade[]>([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);

  const { data, isPending } = useParentDashboard(currentUser?.name || "");
  const students = (data?.children || []) as StudentInfo[];

  useEffect(() => {
    if (students.length > 0) {
      const savedTab = document.cookie
        .split("; ")
        .find((row) => row.startsWith("lastSelectedStudent="))
        ?.split("=")[1];
      
      if (savedTab && students.some(s => s.id === savedTab)) {
        setActiveTab(savedTab);
      } else if (!activeTab) {
        setActiveTab(students[0].id);
      }
    }
  }, [students]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    document.cookie = `lastSelectedStudent=${val}; path=/; max-age=31536000`;
  };

  const handleViewMarksheet = () => {
    if (activeTab && slug) {
      push(`/${slug}/view-marksheet?studentId=${activeTab}`);
    }
  };

  // Fetch Exam Grades (Loads everything for all students at once)
  useEffect(() => {
    async function fetchGrades() {
      if (students.length === 0 || topLevelTab !== "exams") return;
      try {
        const res = await apiFetch("/api/grades");
        const raw = await res.json();
        setGrades(Array.isArray(raw) ? raw : (raw.items || []));
      } catch (e) {
        console.error("Failed to fetch grades", e);
      }
    }
    fetchGrades();
  }, [students.length, topLevelTab]);

  // Fetch Assessments for the active student
  const fetchAssessmentsForStudent = useCallback(async (studentId: string) => {
    if (!studentId || topLevelTab !== "assessments") return;
    setLoadingAssessments(true);
    try {
      const res = await apiFetch(`/api/assessments/student-grades?studentId=${studentId}`);
      if (res.ok) {
        const raw = await res.json();
        setAssessmentGrades(Array.isArray(raw) ? raw : []);
      } else {
        setAssessmentGrades([]);
      }
    } catch (e) {
      console.error("Failed to fetch assessment grades", e);
      setAssessmentGrades([]);
    } finally {
      setLoadingAssessments(false);
    }
  }, [topLevelTab]);

  useEffect(() => {
    if (activeTab && topLevelTab === "assessments") {
      fetchAssessmentsForStudent(activeTab);
    }
  }, [activeTab, topLevelTab, fetchAssessmentsForStudent]);

  // Process continuous assessment data
  const assessmentStats = useMemo(() => {
    if (assessmentGrades.length === 0) return { avg: 0, total: 0, passCount: 0 };
    
    const totalPct = assessmentGrades.reduce((sum, item) => sum + (item.marksObtained / item.totalMarks) * 100, 0);
    const passCount = assessmentGrades.filter((a) => a.marksObtained >= a.passingMarks).length;

    return {
      avg: Math.round(totalPct / assessmentGrades.length),
      total: assessmentGrades.length,
      passCount,
    };
  }, [assessmentGrades]);

  const assessmentChartData = useMemo(() => {
    const subjectMap = new Map<string, { totalPct: number; count: number }>();
    assessmentGrades.forEach((g) => {
      const pct = (g.marksObtained / g.totalMarks) * 100;
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
  }, [assessmentGrades]);

  if (isPending) return <GradesSkeleton />;

  if (students.length === 0) {
    return (
      <Card className="rounded-xl shadow-sm ">
        <CardContent className="p-12 text-center flex flex-col items-center">
          <TrendingUp className="size-12 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold text-foreground mt-4">No children linked</h3>
          <p className="text-sm text-muted-foreground mt-1">Contact account services to enroll or link students.</p>
        </CardContent>
      </Card>
    );
  }

  const selectedStudent = students.find((s) => s.id === activeTab) || students[0];
  const studentGrades = getGradesForStudent(selectedStudent.id, grades);
  const chartData = getSubjectChartData(selectedStudent.id, grades);
  const stats = getOverallStats(selectedStudent.id, grades);

  return (
    <div className="space-y-6 pb-10 animate-fade-in select-none">
      <div className="flex flex-col gap-4 border-b border-border pb-5">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-muted text-foreground flex items-center justify-center">
              {topLevelTab === "exams" ? (
                <GraduationCap className="size-4" />
              ) : (
                <ClipboardList className="size-4" />
              )}
            </div>
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              {topLevelTab === "exams" ? "School Exams" : "Class Assessments"}
            </h2>
          </div>

          {/* Top-Right Action Button */}
          {topLevelTab === "exams" && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs font-medium rounded-xl border-border bg-card text-foreground hover:bg-muted/70 shadow-xs cursor-pointer"
              onClick={handleViewMarksheet}
            >
              <FileText className="size-3.5 text-muted-foreground" />
              View Marksheet
            </Button>
          )}
        </div>

        {students.length > 1 && (
          <div className="text-left">
            {/* Children Switcher Dropdown */}
            <ChildSelector 
              students={students}
              selectedStudentId={selectedStudent.id}
              onSelect={handleTabChange}
            />
          </div>
        )}
      </div>

      {topLevelTab === "exams" && (
        <ResultPublishedBanner studentId={selectedStudent.id} />
      )}

      <div className="space-y-6 mt-6 animate-in fade-in duration-300 text-left">
        {topLevelTab === "exams" ? (
          // RENDER OFFICIAL EXAMS VIEW
          <>
            <GradesSummary 
              avg={stats.avg}
              grade={stats.grade}
              highestSubject={stats.highest.subject}
              highestPct={stats.highest.pct}
              totalExams={stats.totalExams}
            />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2">
                <PerformanceChart data={chartData} />
              </div>
              <div className="lg:col-span-3">
                <GradesTable studentName={selectedStudent.name} grades={studentGrades} />
              </div>
            </div>
          </>
        ) : (
          // RENDER CONTINUOUS ASSESSMENTS VIEW
          <>
            {loadingAssessments ? (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-muted animate-pulse rounded-2xl" />)}
                </div>
                <div className="h-80 bg-muted animate-pulse rounded-3xl" />
              </div>
            ) : (
              <>
                {/* Assessment Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="rounded-2xl border border-border bg-card shadow-xs transition-colors hover:border-border">
                    <CardContent className="p-4 sm:p-5 text-left flex flex-col justify-between h-full">
                      <div className="flex items-center justify-between">
                        <div className="p-2.5 rounded-xl bg-muted text-foreground flex items-center justify-center shrink-0">
                          <TrendingUp className="size-4" />
                        </div>
                        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
                          {assessmentStats.avg}%
                        </span>
                      </div>
                      <p className="text-xs font-medium text-muted-foreground mt-3">
                        Average Score
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border border-border bg-card shadow-xs transition-colors hover:border-border">
                    <CardContent className="p-4 sm:p-5 text-left flex flex-col justify-between h-full">
                      <div className="flex items-center justify-between">
                        <div className="p-2.5 rounded-xl bg-muted text-foreground flex items-center justify-center shrink-0">
                          <Award className="size-4" />
                        </div>
                        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
                          {assessmentStats.total}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-muted-foreground mt-3">
                        Total Assessments
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border border-border bg-card shadow-xs transition-colors hover:border-border">
                    <CardContent className="p-4 sm:p-5 text-left flex flex-col justify-between h-full">
                      <div className="flex items-center justify-between">
                        <div className="p-2.5 rounded-xl bg-muted text-foreground flex items-center justify-center shrink-0">
                          <CheckCircle2 className="size-4" />
                        </div>
                        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
                          {assessmentStats.passCount}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-muted-foreground mt-3">
                        Passed Assessments
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Re-use exams performance chart with mapped assessment data */}
                  <div className="lg:col-span-2">
                    <PerformanceChart data={assessmentChartData} />
                  </div>

                  {/* List Assessments */}
                  <div className="lg:col-span-3">
                    <Card className="rounded-3xl border border-border bg-card shadow-xs py-0 gap-0 overflow-hidden h-full">
                      <CardHeader className="px-5 py-4 border-b border-border flex flex-row items-center gap-3 space-y-0">
                        <div className="size-8 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0">
                          <ClipboardList className="size-4" />
                        </div>
                        <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
                          {selectedStudent.name}&apos;s Assessments
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ScrollArea className="h-[300px]">
                          {assessmentGrades.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                              <BookOpen className="size-8 opacity-30 mb-2" />
                              <p className="text-xs font-semibold">No assessments recorded yet</p>
                            </div>
                          ) : (
                            <Table>
                              <TableHeader className="bg-muted/40 sticky top-0">
                                <TableRow className="border-border hover:bg-transparent">
                                  <TableHead className="text-xs font-semibold h-9 text-muted-foreground">Subject/Title</TableHead>
                                  <TableHead className="text-xs font-semibold h-9 text-muted-foreground">Type</TableHead>
                                  <TableHead className="text-center text-xs font-semibold h-9 text-muted-foreground">Score</TableHead>
                                  <TableHead className="text-center text-xs font-semibold h-9 text-muted-foreground">Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {assessmentGrades.map((g) => {
                                  const pct = Math.round((g.marksObtained / g.totalMarks) * 100);
                                  const isPass = g.marksObtained >= g.passingMarks;
                                  return (
                                    <TableRow key={g.id} className="border-border hover:bg-muted/40">
                                      <TableCell className="py-2.5 text-left">
                                        <div className="flex flex-col text-left">
                                          <span className="text-xs font-semibold text-foreground">{g.title}</span>
                                          <span className="text-[10px] text-muted-foreground">{g.subjectName}</span>
                                        </div>
                                      </TableCell>
                                      <TableCell className="py-2.5">
                                        <Badge variant="outline" className="text-[9px] bg-muted text-muted-foreground px-2 py-0.5 font-medium uppercase tracking-wide border-border">
                                          {g.type.replace(/_/g, " ")}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="py-2.5 text-center">
                                        <span className="text-xs font-semibold text-foreground tabular-nums">
                                          {Number(g.marksObtained).toFixed(2).replace(/\.00$/, "")}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">/{g.totalMarks}</span>
                                      </TableCell>
                                      <TableCell className="py-2.5 text-center">
                                        <Badge variant="outline" className={`text-[10px] font-semibold px-2 py-0.5 ${
                                          isPass 
                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                        }`}>
                                          {isPass ? "PASS" : "FAIL"}
                                        </Badge>
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
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
