"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { useAppStore } from "@/store/use-app-store";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GraduationCap } from "lucide-react";
import type { StudentInfo, GradeRecord, AttendanceRecord } from "@/lib/types";

// Sub-components
import { StudentProfileCard } from "./children/StudentProfileCard";
import { PerformanceSection } from "./children/PerformanceSection";
import { GradesTable } from "./children/GradesTable";
import { ChildrenSkeleton } from "./children/ChildrenSkeleton";

// Utils
import { 
  getAttendanceForStudent, 
  getGradesForStudent, 
  getSubjectPerformance, 
  getOverallAvg 
} from "./children/utils";

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
        setGrades(gradesData.filter((g: GradeRecord) => studentIds.includes(g.studentId)));
        setAttendance(attendanceData.filter((a: AttendanceRecord) => studentIds.includes(a.studentId)));
        
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

  if (loading) return <ChildrenSkeleton />;

  if (students.length === 0) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardContent className="p-12 text-center">
          <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-4">No children found</h3>
          <p className="text-sm text-muted-foreground mt-1">No students are linked to your account.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-2">
        <GraduationCap className="h-5 w-5 text-amber-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-tight">
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
          const att = getAttendanceForStudent(student.id, attendance);
          const subjectPerf = getSubjectPerformance(student.id, grades);
          const overall = getOverallAvg(student.id, grades);
          const recentGrades = getGradesForStudent(student.id, grades).slice(0, 8);

          return (
            <TabsContent
              key={student.id}
              value={student.id}
              className="space-y-6 mt-6 animate-in fade-in duration-300"
            >
              <StudentProfileCard 
                student={student}
                attendancePct={att.percentage}
                overallAvg={overall.avg}
                overallGrade={overall.grade}
                subjectCount={subjectPerf.length}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PerformanceSection data={subjectPerf} />
                <GradesTable grades={recentGrades} />
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
