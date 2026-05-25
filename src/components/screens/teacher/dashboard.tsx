"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { useTeacherDashboard } from "@/lib/graphql/hooks";
import { goeyToast as toast } from "goey-toast";
import { FullPageSkeleton } from "@/components/ui/full-page-skeleton";

// Sub-components
import { TeacherStats } from "./dashboard_components/TeacherStats";
import { TodaySchedule } from "./dashboard_components/TodaySchedule";
import { QuickActions } from "./dashboard_components/QuickActions";
import { TeacherSubjects } from "./dashboard_components/TeacherSubjects";
import { RecentAssignments } from "./dashboard_components/RecentAssignments";
import { MyClassesOverview } from "./dashboard_components/MyClassesOverview";

const formatTime = (time: string) => {
  try {
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${minutes} ${ampm}`;
  } catch (e) {
    return time;
  }
};

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    return dateStr;
  }
};

export function TeacherDashboard() {
  const router = useRouter();
  const { currentUser, currentTenantSlug, currentTenantId, setCurrentScreen } = useAppStore();

  const navigateTo = (screen: string) => {
    setCurrentScreen(screen);
    const tid = currentTenantSlug || currentTenantId || currentUser?.tenantSlug || currentUser?.tenantId;
    if (tid) {
      router.push(`/${tid}/${screen}`);
    } else {
      router.push(`/${screen}`);
    }
  };

  const { data, isPending, fetchStatus, isError, error } = useTeacherDashboard(
    currentUser?.name || "",
  );

  // In React Query v5, when enabled:false, isPending=true but fetchStatus='idle'
  const isActuallyLoading = isPending && fetchStatus === 'fetching';

  useEffect(() => {
    if (isError) {
      toast.error("Failed to load dashboard", { description: error?.message });
    }
  }, [isError, error]);

  const classes = data?.classes ?? [];
  const subjects = data?.subjects ?? [];
  const totalStudents = data?.totalStudents ?? 0;
  const pendingAssignments = data?.pendingAssignments ?? 0;
  const todaySchedule = data?.todaySchedule ?? [];
  const todayAttendance = data?.todayAttendance ?? { present: 0, total: 0 };
  const assignments = data?.recentAssignments ?? [];

  if (isActuallyLoading) {
    return <FullPageSkeleton />;
  }

  const attendanceRate = todayAttendance.total > 0
    ? `${Number((todayAttendance.present / todayAttendance.total) * 100).toFixed(2).replace(/\.00$/, "")}%`
    : "N/A";

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
