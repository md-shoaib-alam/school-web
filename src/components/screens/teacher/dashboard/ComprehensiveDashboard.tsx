"use client";

import { TeacherStats } from "../dashboard_components/TeacherStats";
import { TodaySchedule } from "../dashboard_components/TodaySchedule";
import { QuickActions } from "../dashboard_components/QuickActions";
import { TeacherSubjects } from "../dashboard_components/TeacherSubjects";
import { RecentAssignments } from "../dashboard_components/RecentAssignments";
import { MyClassesOverview } from "../dashboard_components/MyClassesOverview";

interface ComprehensiveDashboardProps {
  classes: any[];
  subjects: any[];
  totalStudents: number;
  pendingAssignments: number;
  todaySchedule: any[];
  attendanceRate: string;
  assignments: any[];
  currentUser: any;
  formatTime: (time: string) => string;
  formatDate: (dateStr: string) => string;
  navigateTo: (screen: string) => void;
}

export function ComprehensiveDashboard({
  classes,
  subjects,
  totalStudents,
  pendingAssignments,
  todaySchedule,
  attendanceRate,
  assignments,
  currentUser,
  formatTime,
  formatDate,
  navigateTo,
}: ComprehensiveDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {currentUser?.name || "Teacher"}
        </h2>
      </div>

      <TeacherStats 
        totalClasses={classes.length}
        totalStudents={totalStudents}
        pendingAssignments={pendingAssignments}
        attendanceRate={attendanceRate}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TodaySchedule 
          schedule={todaySchedule}
          formatTime={formatTime}
        />
        <QuickActions onNavigate={navigateTo} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeacherSubjects subjects={subjects} />
        <RecentAssignments 
          assignments={assignments}
          onViewAll={() => navigateTo("homework")}
          formatDate={formatDate}
        />
      </div>

      <MyClassesOverview 
        classes={classes}
        onViewAll={() => navigateTo("my-classes")}
      />
    </div>
  );
}
