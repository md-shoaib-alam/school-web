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
  const students = data?.children || [];

  useEffect(() => {
    if (students.length > 0) {
      const savedTab = document.cookie
        .split("; ")
        .find((row) => row.startsWith("lastSelectedStudent="))
        ?.split("=")[1];
      
      if (savedTab && students.some(s => s.id === savedTab)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
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

  if (isPending) return <ChildrenSkeleton />;

  if (students.length === 0) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardContent className="p-12 text-center">
          <GraduationCap className="size-12 mx-auto text-muted-foreground/40" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mt-4">No children found</h3>
          <p className="text-sm text-muted-foreground mt-1">No students are linked to your account.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-2">
        <GraduationCap className="size-5 text-amber-600" />
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
          My Children&apos;s Details
        </h2>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="bg-amber-50 dark:bg-amber-900/30 p-1">
          {students.map((student) => (
            <TabsTrigger
              key={student.id}
              value={student.id}
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400 data-[state=active]:shadow-sm px-4 transition-all hover:bg-amber-100/30 dark:hover:bg-amber-900/20 hover:text-amber-800 dark:hover:text-amber-300"
            >
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-amber-400" />
                {student.name}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {students.map((student) => {
          const att = getAttendanceForStudent(student.id, student.attendance || []);
          const subjectPerf = getSubjectPerformance(student.id, student.grades || []);
          const overall = getOverallAvg(student.id, student.grades || []);
          const recentGrades = (student.grades || []).slice(0, 8);

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
