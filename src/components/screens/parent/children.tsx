"use client";

import { useState } from "react";
import { useAppStore } from "@/store/use-app-store";
import { Card, CardContent } from "@/components/ui/card";
import { useParentDashboard } from "@/lib/graphql/hooks";
import { 
  GraduationCap, 
  Award, 
  UserCheck, 
  BookOpen, 
  BookmarkCheck,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// Sub-components
import { StudentProfileCard } from "./children/StudentProfileCard";
import { PerformanceSection } from "./children/PerformanceSection";
import { GradesTable } from "./children/GradesTable";
import { ChildrenSkeleton } from "./children/ChildrenSkeleton";
import { ChildSelector } from "./ChildSelector";

// Utils
import { 
  getAttendanceForStudent, 
  getSubjectPerformance, 
  getOverallAvg 
} from "./children/utils";

export function ParentChildren() {
  const { currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState("");

  const { data, isPending } = useParentDashboard(currentUser?.name || "");

  const students = data?.children || [];

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    document.cookie = `lastSelectedStudent=${val}; path=/; max-age=31536000`;
  };

  if (isPending) return <ChildrenSkeleton />;

  if (students.length === 0) {
    return (
      <Card className="rounded-2xl border border-border bg-card shadow-xs">
        <CardContent className="p-16 text-center">
          <div className="size-14 rounded-2xl bg-muted flex items-center justify-center mx-auto text-foreground">
            <GraduationCap className="size-7" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mt-5">No children found</h3>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">
            No student profiles are currently linked to your parental account. Please contact administrative staff to link your children.
          </p>
        </CardContent>
      </Card>
    );
  }

  const effectiveActiveTab = activeTab || (typeof document !== "undefined" ? document.cookie
    .split("; ")
    .find((row) => row.startsWith("lastSelectedStudent="))
    ?.split("=")[1] : "") || students[0]?.id || "";

  const selectedStudent = students.find((s) => s.id === effectiveActiveTab) || students[0];

  const att = selectedStudent ? getAttendanceForStudent(selectedStudent.id, selectedStudent.attendance || []) : { percentage: 0, present: 0, absent: 0, total: 0 };
  const subjectPerf = selectedStudent ? getSubjectPerformance(selectedStudent.id, selectedStudent.grades || []) : [];
  const overall = selectedStudent ? getOverallAvg(selectedStudent.id, selectedStudent.grades || []) : { avg: 0, grade: "N/A" };
  const recentGrades = selectedStudent ? (selectedStudent.grades || []).slice(0, 8) : [];

  return (
    <div className="space-y-8 pb-12 select-none animate-fade-in">
      {/* Page Header (Only show student switcher when parent has multiple children) */}
      {students.length > 1 && (
        <div className="border-b border-border pb-5">
          <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex items-center gap-4 min-w-fit">
              <ChildSelector 
                students={students} 
                selectedStudentId={selectedStudent.id} 
                onSelect={handleTabChange} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Profile Card + Quick Actions */}
        <div className="space-y-6">
          <StudentProfileCard student={selectedStudent} />
          
          {/* Quick Actions Card */}
          <div className="rounded-2xl border border-border bg-card p-5 flex flex-col shadow-xs">
            <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-3.5">
              Quick Actions
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <a 
                href="attendance" 
                className="h-11 px-3.5 rounded-full bg-muted/60 hover:bg-muted border border-border text-foreground transition-colors flex items-center justify-center gap-2.5 shadow-2xs active:scale-[0.98] cursor-pointer"
              >
                <div className="size-7 rounded-lg bg-background border border-border/50 flex items-center justify-center text-foreground shadow-2xs shrink-0">
                  <UserCheck className="size-3.5" />
                </div>
                <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                  Attendance
                </span>
              </a>
              <a 
                href="school-exams" 
                className="h-11 px-3.5 rounded-full bg-muted/60 hover:bg-muted border border-border text-foreground transition-colors flex items-center justify-center gap-2.5 shadow-2xs active:scale-[0.98] cursor-pointer"
              >
                <div className="size-7 rounded-lg bg-background border border-border/50 flex items-center justify-center text-foreground shadow-2xs shrink-0">
                  <Award className="size-3.5" />
                </div>
                <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                  Grades
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Center/Right Column: Main Dashboard Content (Spans 2 columns on desktop) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Top Row: Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Attendance Stat Card */}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 flex flex-col justify-between min-h-[140px] shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <UserCheck className="size-5" />
                </div>
                <Badge variant="outline" className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  Live
                </Badge>
              </div>
              <div className="mt-4 text-left">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">Attendance Rate</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl sm:text-2xl font-bold text-foreground tracking-tight tabular-nums">
                    {att.percentage}%
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">({att.present}/{att.total} days)</span>
                </div>
                <Progress value={att.percentage} className="h-1.5 mt-3 bg-muted [&>div]:bg-emerald-500" />
              </div>
            </div>

            {/* GPA Stat Card */}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 flex flex-col justify-between min-h-[140px] shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Award className="size-5" />
                </div>
                <Badge variant="outline" className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  {overall.grade} Grade
                </Badge>
              </div>
              <div className="mt-4 text-left">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">Average Grade</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl sm:text-2xl font-bold text-foreground tracking-tight tabular-nums">
                    {overall.avg}%
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">Overall Avg</span>
                </div>
                <Progress value={overall.avg} className="h-1.5 mt-3 bg-muted [&>div]:bg-blue-600 dark:[&>div]:bg-blue-500" />
              </div>
            </div>

            {/* Total Courses Card */}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 flex flex-col justify-between min-h-[140px] shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <BookOpen className="size-5" />
                </div>
                <Badge variant="outline" className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  Academic
                </Badge>
              </div>
              <div className="mt-4 text-left">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">Active Courses</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl sm:text-2xl font-bold text-foreground tracking-tight tabular-nums">
                    {subjectPerf.length}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">Subjects</span>
                </div>
                <div className="text-[10px] text-muted-foreground font-medium mt-3 uppercase tracking-wider flex items-center gap-1.5">
                  <BookmarkCheck className="size-3 text-blue-600 dark:text-blue-400" /> Syllabus aligned
                </div>
              </div>
            </div>
          </div>

          {/* Visual Performance Charts & Tables grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PerformanceSection data={subjectPerf} />
            <GradesTable grades={recentGrades} />
          </div>
        </div>
      </div>
    </div>
  );
}
