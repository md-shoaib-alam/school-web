"use client";


import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/use-app-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  GraduationCap,
  User,
  Calendar,
  Hash,
  BookOpen,
  TrendingUp,
  Award,
  Clock,
} from "lucide-react";
import type { StudentInfo, GradeRecord, AttendanceRecord } from "@/lib/types";

export function ParentChildren() {
  const { currentUser } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [studentsRes, gradesRes, attendanceRes] = await Promise.all([
          apiFetch("/api/students"),
          apiFetch("/api/grades"),
          apiFetch("/api/attendance"),
        ]);
        const studentsData = await studentsRes.json();
        const gradesData = await gradesRes.json();
        const attendanceData = await attendanceRes.json();

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
        setAttendance(
          attendanceData.filter((a: AttendanceRecord) =>
            studentIds.includes(a.studentId),
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

  const getAttendanceForStudent = (studentId: string) => {
    const records = attendance.filter((a) => a.studentId === studentId);
    if (records.length === 0)
      return { percentage: 0, present: 0, absent: 0, late: 0, total: 0 };
    const present = records.filter((a) => a.status === "present").length;
    const absent = records.filter((a) => a.status === "absent").length;
    const late = records.filter((a) => a.status === "late").length;
    return {
      percentage: Math.round(((present + late) / records.length) * 100),
      present,
      absent,
      late,
      total: records.length,
    };
  };

  const getGradesForStudent = (studentId: string) => {
    return grades.filter((g) => g.studentId === studentId);
  };

  const getSubjectPerformance = (studentId: string) => {
    const studentGrades = getGradesForStudent(studentId);
    const subjectMap = new Map<
      string,
      { marks: number[]; maxMarks: number[]; grades: string[] }
    >();

    studentGrades.forEach((g) => {
      if (!subjectMap.has(g.subjectName)) {
        subjectMap.set(g.subjectName, { marks: [], maxMarks: [], grades: [] });
      }
      const entry = subjectMap.get(g.subjectName)!;
      entry.marks.push(g.marks);
      entry.maxMarks.push(g.maxMarks);
      if (g.grade) entry.grades.push(g.grade);
    });

    return Array.from(subjectMap.entries()).map(([subject, data]) => {
      const avgPct =
        data.marks.reduce(
          (sum, m, i) => sum + (m / data.maxMarks[i]) * 100,
          0,
        ) / data.marks.length;
      const bestGrade =
        data.grades.sort((a, b) => {
          const order = ["A+", "A", "B+", "B", "C", "D"];
          return order.indexOf(a) - order.indexOf(b);
        })[0] || "N/A";
      return {
        subject,
        avgPct: Math.round(avgPct),
        bestGrade,
        exams: data.marks.length,
      };
    });
  };

  const getOverallAvg = (studentId: string) => {
    const studentGrades = getGradesForStudent(studentId);
    if (studentGrades.length === 0) return { avg: 0, grade: "N/A" };
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
    return { avg: Math.round(avg), grade };
  };

  if (loading) {
    return <ChildrenSkeleton />;
  }

  if (students.length === 0) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardContent className="p-12 text-center">
          <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-4">
            No children found
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            No students are linked to your account.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <GraduationCap className="h-5 w-5 text-amber-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          My Children&apos;s Details
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
          const att = getAttendanceForStudent(student.id);
          const subjectPerf = getSubjectPerformance(student.id);
          const overall = getOverallAvg(student.id);
          const recentGrades = getGradesForStudent(student.id).slice(0, 8);

          return (
            <TabsContent
              key={student.id}
              value={student.id}
              className="space-y-6 mt-6"
            >
              {/* Student Info Card */}
              <Card className="rounded-xl shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <User className="h-3 w-3" /> Full Name
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {student.name}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <GraduationCap className="h-3 w-3" /> Class
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {student.className}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Hash className="h-3 w-3" /> Roll Number
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {student.rollNumber}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <User className="h-3 w-3" /> Gender
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {student.gender === "male" ? "Male" : "Female"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" /> Date of Birth
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {student.dateOfBirth
                            ? new Date(student.dateOfBirth).toLocaleDateString(
                                "en-US",
                                {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : "N/A"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" /> Attendance
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={att.percentage}
                            className="h-2 w-16 [&>div]:bg-amber-500"
                          />
                          <p
                            className={`text-sm font-bold ${att.percentage >= 80 ? "text-emerald-600 dark:text-emerald-400" : att.percentage >= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}
                          >
                            {att.percentage}%
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Award className="h-3 w-3" /> Average Grade
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {overall.avg}%
                          </span>
                          <Badge
                            variant="outline"
                            className={`font-bold text-xs ${
                              overall.grade.startsWith("A")
                                ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                : overall.grade.startsWith("B")
                                  ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                  : "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                            }`}
                          >
                            {overall.grade}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <BookOpen className="h-3 w-3" /> Subjects
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {subjectPerf.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subject-wise Performance */}
                <Card className="rounded-xl shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-amber-600" />
                      <CardTitle className="text-sm font-semibold">
                        Subject-wise Performance
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-3">
                      {subjectPerf.map((sp) => (
                        <div key={sp.subject} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {sp.subject}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {sp.exams} exams
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-bold ${
                                  sp.bestGrade.startsWith("A")
                                    ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                    : sp.bestGrade.startsWith("B")
                                      ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                      : "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                                }`}
                              >
                                {sp.bestGrade}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Progress
                              value={sp.avgPct}
                              className="h-2.5 flex-1 [&>div]:bg-amber-500"
                            />
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 w-10 text-right">
                              {sp.avgPct}%
                            </span>
                          </div>
                        </div>
                      ))}
                      {subjectPerf.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No grade data available
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Grades */}
                <Card className="rounded-xl shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center gap-2">
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
                          <TableHead className="text-xs text-right">
                            Marks
                          </TableHead>
                          <TableHead className="text-xs text-center">
                            Grade
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentGrades.map((g) => (
                          <TableRow key={g.id}>
                            <TableCell className="text-sm py-2">
                              {g.subjectName}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground py-2 capitalize">
                              {g.examType}
                            </TableCell>
                            <TableCell className="text-sm text-right font-medium py-2">
                              {g.marks}/{g.maxMarks}
                            </TableCell>
                            <TableCell className="text-center py-2">
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-bold ${
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
                        {recentGrades.length === 0 && (
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
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

function ChildrenSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-10 w-72" />
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
