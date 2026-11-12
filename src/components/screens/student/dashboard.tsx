"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/use-app-store";
import { useStudentDashboard } from "@/lib/graphql/hooks";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  GraduationCap,
  TrendingUp,
  ClipboardList,
  Calendar,
  BookOpen,
  Clock,
  Bell,
  Star,
  ChevronRight,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import { ScreenSkeleton } from "@/components/ui/full-page-skeleton";
import { ResultPublishedBanner } from "@/components/shared/result-published-banner";
import { formatTime } from "./timetable/types";

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString();
};

const getSlotStatus = (startTime: string, endTime: string) => {
  const now = new Date();
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  
  const slotStart = new Date(now);
  slotStart.setHours(startH, startM, 0, 0);
  
  const slotEnd = new Date(now);
  slotEnd.setHours(endH, endM, 0, 0);
  
  return {
    isCurrent: now >= slotStart && now <= slotEnd,
    isPast: now > slotEnd
  };
};

export function StudentDashboard() {
  const { currentUser, currentTenantName, currentTenantLogo } = useAppStore();
  const { data, isPending, fetchStatus, isError, error } = useStudentDashboard(
    currentUser?.email,
  );

  // In React Query v5, when enabled:false, isPending=true but fetchStatus='idle'
  const isActuallyLoading = isPending && fetchStatus === "fetching";

  useEffect(() => {
    if (isError) {
      toast.error("Failed to load dashboard", { description: error?.message });
    }
  }, [isError, error]);

  // Simple fetch for student context (className, rollNumber)
  const [studentInfo, setStudentInfo] = useState<{
    className: string;
    rollNumber: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (currentUser?.email) {
      apiFetch("/api/students/me")
        .then((r) => r.json())
        .then((s: any) => {
          if (s && s.id)
            setStudentInfo({
              className: s.className,
              rollNumber: s.rollNumber,
              name: s.name,
            });
        })
        .catch(() => { });
    }
  }, [currentUser?.email]);

  // Computed from GraphQL hook data
  const attendanceRate = data?.attendanceRate ?? 0;
  const avgGrade = data?.avgGrade ?? 0;
  const pendingAssignments = data?.pendingAssignments ?? 0;
  const today = new Date();
  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const todayName = dayNames[today.getDay()];
  const todayTimetable = (data?.todaySchedule ?? [])
    .filter((t) => t.day.toLowerCase() === todayName.toLowerCase())
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const recentGrades = (data?.recentGrades ?? []).slice(0, 5);
  const studentNotices = (data?.notices ?? []).filter(
    (n) => n.targetRole === "all" || n.targetRole === "student",
  );

  if (isActuallyLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="rounded-3xl border  shadow-xs overflow-hidden bg-card">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="size-14 sm:size-16 rounded-2xl bg-muted border  flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src={currentTenantLogo || "/test.webp"}
                  alt={currentTenantName || ""}
                  className="size-full object-cover"
                  loading="eager"
                />
              </div>
              <div className="text-left">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground leading-tight">
                  {studentInfo?.name || currentUser?.name || "Student"}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {studentInfo
                    ? `${studentInfo.className} • Roll ${studentInfo.rollNumber}`
                    : currentTenantName || "Student"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto w-fit shrink-0 rounded-2xl border  bg-muted px-4 py-2 text-foreground shadow-xs">
              <Calendar className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs sm:text-sm font-medium" suppressHydrationWarning>
                {today.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Result Published Notification */}
      <ResultPublishedBanner />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance"
          value={`${Number(attendanceRate).toFixed(2).replace(/\.00$/, "")}%`}
          icon={<UserCheck className="size-5" />}
          trend={attendanceRate >= 85 ? "Good" : "Needs Improvement"}
          trendUp={attendanceRate >= 85}
        />
        <StatCard
          title="Average Grade"
          value={`${Number(avgGrade).toFixed(2).replace(/\.00$/, "")}%`}
          icon={<TrendingUp className="size-5" />}
          trend={
            avgGrade >= 75
              ? "Excellent"
              : avgGrade >= 60
                ? "Good"
                : "Needs Work"
          }
          trendUp={avgGrade >= 60}
        />
        <StatCard
          title="Homework"
          value={String(pendingAssignments || 0)}
          icon={<ClipboardList className="size-5" />}
          trend={pendingAssignments > 0 ? "Pending" : "All Done"}
          trendUp={pendingAssignments === 0}
        />
        <StatCard
          title="Classes Today"
          value={String(todayTimetable.length)}
          icon={<Calendar className="size-5" />}
          trend={todayTimetable.length > 0 ? "Scheduled" : "No Classes"}
          trendUp={todayTimetable.length > 0}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Timetable */}
        <Card className="lg:col-span-2 rounded-xl shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="size-4 text-emerald-600 dark:text-emerald-400" />
                Today&apos;s Schedule
              </CardTitle>
              <Badge variant="outline" className="text-xs shadow-none">
                {todayName.charAt(0).toUpperCase() + todayName.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {todayTimetable.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="size-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No classes scheduled for today</p>
              </div>
            ) : (
              <ScrollArea className="max-h-[320px]">
                <div className="space-y-2">
                  {todayTimetable.map((slot) => {
                    const { isCurrent, isPast } = getSlotStatus(slot.startTime, slot.endTime);
                    return (
                      <div
                        key={slot.id}
                        className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${isCurrent
                          ? "bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800"
                          : isPast
                            ? "bg-muted opacity-60"
                            : "bg-muted hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20"
                          }`}
                        suppressHydrationWarning
                      >
                        <div className="flex-shrink-0 w-20 text-center">
                          <p className="text-sm font-semibold text-foreground">
                            {formatTime(slot.startTime)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTime(slot.endTime)}
                          </p>
                        </div>
                        <div
                          className={`w-0.5 h-10 rounded-full ${isCurrent ? "bg-emerald-500" : "bg-border"}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">
                            {slot.subjectName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {slot.className}
                          </p>
                        </div>
                        {isCurrent && (
                          <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold h-4 px-1.5 shadow-xs animate-pulse">
                            Live
                          </Badge>
                        )}
                        {isPast && (
                          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Recent Grades */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="size-4 text-emerald-600 dark:text-emerald-400" />
              Recent Grades
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentGrades.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <GraduationCap className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No grades yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentGrades.map((g) => {
                  const pct = Math.round((g.marks / g.maxMarks) * 100);
                  return (
                    <div
                      key={g.id}
                      className="flex items-center justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {g.subjectName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {g.examType}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Badge
                          variant="outline"
                          className={`text-xs font-semibold shadow-none ${
                            pct >= 80
                              ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                              : pct >= 60
                                ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                                : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                          }`}
                        >
                          {g.grade || "N/A"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {Number(g.marks).toFixed(2).replace(/\.00$/, "")}/{g.maxMarks}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Announcements */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="size-4 text-emerald-600 dark:text-emerald-400" />
            Announcements & Notices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {studentNotices.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Bell className="size-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No announcements</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentNotices.slice(0, 4).map((notice) => (
                <div
                  key={notice.id}
                  className={`p-4 rounded-lg border transition-colors hover:shadow-sm ${notice.priority === "urgent"
                    ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30"
                    : notice.priority === "important"
                      ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30"
                      : "bg-muted"
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <Badge
                        variant="outline"
                        className={`mb-1 text-[10px] shadow-none ${notice.priority === "urgent"
                          ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                          : notice.priority === "important"
                            ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                            : "bg-background text-muted-foreground"
                          }`}
                      >
                        {notice.priority}
                      </Badge>
                      <h4 className="font-semibold text-sm text-foreground">
                        {notice.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notice.content}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-2" suppressHydrationWarning>
                        {notice.authorName} •{" "}
                        {formatDate(notice.createdAt)}
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({
  title,
  value,
  icon,
  trend,
  trendUp,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
}) {
  return (
    <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div className="size-11 shrink-0 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        </div>
        <p
          className={`mt-3 text-[11px] font-medium ${
            trendUp
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-amber-600 dark:text-amber-400"
          }`}
        >
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}

/* ─── Skeleton ─── */
function DashboardSkeleton() {
  return <ScreenSkeleton />;
}
