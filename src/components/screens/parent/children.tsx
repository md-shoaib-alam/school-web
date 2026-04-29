import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { useAppStore } from "@/store/use-app-store";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useParentDashboard } from "@/lib/graphql/hooks";
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
  const [activeTab, setActiveTab] = useState("");

  const { data, isPending } = useParentDashboard(currentUser?.name || "");

  // Correctly handle students, grades, and attendance from GraphQL response
  const students = (data?.children || []) as StudentInfo[];
  const performanceSummary = data?.performanceSummary || [];
  
  // For specialized details not in dashboard, we still need separate data or update the dashboard query
  // But to keep it simple and consistent with the user's request, we'll focus on the children list first.
  // Actually, dashboard returns 'fees' but not full attendance/grades history.
  
  // To keep full functionality, we'll keep the separate fetches for grades/attendance but sync the student list.
  const [extraData, setExtraData] = useState<{ grades: GradeRecord[], attendance: AttendanceRecord[] }>({ grades: [], attendance: [] });

  useEffect(() => {
    if (students.length > 0 && !activeTab) {
      setActiveTab(students[0].id);
    }
  }, [students, activeTab]);

  useEffect(() => {
    async function fetchDetails() {
      if (students.length === 0) return;
      try {
        const [gradesRes, attendanceRes] = await Promise.all([
          apiFetch("/api/grades"),
          apiFetch("/api/attendance"),
        ]);
        const rawGrades = await gradesRes.json();
        const rawAttendance = await attendanceRes.json();
        
        setExtraData({
          grades: Array.isArray(rawGrades) ? rawGrades : (rawGrades.items || []),
          attendance: Array.isArray(rawAttendance) ? rawAttendance : (rawAttendance.items || [])
        });
      } catch (e) {
        console.error("Failed to fetch details", e);
      }
    }
    fetchDetails();
  }, [students.length]);

  const grades = extraData.grades;
  const attendance = extraData.attendance;

  if (isPending) return <ChildrenSkeleton />;

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
