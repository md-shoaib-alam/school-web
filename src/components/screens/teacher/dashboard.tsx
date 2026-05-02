"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { useTeacherDashboard } from "@/lib/graphql/hooks";
import { goeyToast as toast } from "goey-toast";
import {
  School,
  Users,
  FileText,
  UserCheck,
  Clock,
  ArrowRight,
  BookOpen,
  ClipboardList,
  CalendarDays,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

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
  const { data, isLoading, isPending, fetchStatus, isError, error } = useTeacherDashboard(
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (isActuallyLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "My Classes",
      value: classes.length,
      icon: <School className="h-5 w-5" />,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/30",
    },
    {
      title: "Total Students",
      value: totalStudents,
      icon: <Users className="h-5 w-5" />,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/30",
    },
    {
      title: "Pending Assignments",
      value: pendingAssignments,
      icon: <FileText className="h-5 w-5" />,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/30",
    },
    {
      title: "Today's Attendance",
      value:
        todayAttendance.total > 0
          ? `${Math.round((todayAttendance.present / todayAttendance.total) * 100)}%`
          : "N/A",
      icon: <UserCheck className="h-5 w-5" />,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-900/30",
    },
  ];

  const quickActions = [
    {
      label: "Take Attendance",
      icon: <UserCheck className="h-4 w-4" />,
      screen: "take-attendance",
    },
    {
      label: "Manage Grades",
      icon: <ClipboardList className="h-4 w-4" />,
      screen: "grade-management",
    },
    {
      label: "Create Assignment",
      icon: <FileText className="h-4 w-4" />,
      screen: "assignments",
    },
    {
      label: "View Timetable",
      icon: <CalendarDays className="h-4 w-4" />,
      screen: "timetable",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {getGreeting()}, {currentUser?.name || "Mr. John Smith"} 👋
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Here&apos;s an overview of your classes and activities today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="rounded-xl shadow-sm border-0 hover:shadow-md transition-shadow"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <span className={stat.color}>{stat.icon}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <Card className="rounded-xl shadow-sm border-0 lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Today&apos;s Schedule
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs"
              >
                {todaySchedule.length} classes
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {todaySchedule.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  No classes scheduled for today
                </p>
                <p className="text-gray-300 dark:text-gray-600 text-xs mt-1">
                  Enjoy your day off!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {todaySchedule.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <div className="text-center min-w-[70px]">
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {formatTime(entry.startTime)}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">
                        {formatTime(entry.endTime)}
                      </p>
                    </div>
                    <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {entry.subjectName}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {entry.className}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] border-blue-200 dark:border-blue-800 text-blue-500 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                    >
                      Period {index + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="rounded-xl shadow-sm border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Button
                  key={action.screen}
                  variant="ghost"
                  className="w-full justify-start gap-3 h-11 px-3 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => navigateTo(action.screen)}
                >
                  <span className="text-blue-500">{action.icon}</span>
                  {action.label}
                  <ArrowRight className="h-3.5 w-3.5 ml-auto text-gray-300 dark:text-gray-600" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assignments & Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Subjects */}
        <Card className="rounded-xl shadow-sm border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                My Subjects
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs"
              >
                {subjects.length} subjects
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2">
              {subjects.slice(0, 5).map((subject) => (
                <div
                  key={subject.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {subject.name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {subject.className} • {subject.code}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {subjects.length === 0 && (
                <div className="text-center py-6">
                  <BookOpen className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    No subjects assigned
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Assignments */}
        <Card className="rounded-xl shadow-sm border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                Recent Assignments
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-500 dark:text-blue-400 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={() => navigateTo("assignments")}
              >
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2">
              {assignments.slice(0, 5).map((assignment) => {
                const isOverdue = new Date(assignment.dueDate) < new Date();
                const progressPct =
                  assignment.totalStudents > 0
                    ? Math.round(
                        (assignment.submissions / assignment.totalStudents) *
                          100,
                      )
                    : 0;
                return (
                  <div
                    key={assignment.id}
                    className="p-3 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[200px]">
                        {assignment.title}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          isOverdue
                            ? "border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20"
                            : "border-blue-200 dark:border-blue-800 text-blue-500 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                        }`}
                      >
                        {isOverdue ? (
                          <>
                            <AlertCircle className="h-2.5 w-2.5 mr-0.5" />{" "}
                            Overdue
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Due{" "}
                            {formatDate(assignment.dueDate)}
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mb-2">
                      <span>
                        {assignment.subjectName} • {assignment.className}
                      </span>
                      <span>
                        {assignment.submissions}/{assignment.totalStudents}{" "}
                        submitted
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          progressPct === 100
                            ? "bg-emerald-500"
                            : isOverdue
                              ? "bg-red-400"
                              : "bg-blue-500"
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {assignments.length === 0 && (
                <div className="text-center py-6">
                  <FileText className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    No assignments created yet
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Classes Overview */}
      <Card className="rounded-xl shadow-sm border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <School className="h-4 w-4 text-blue-500" />
              My Classes
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-500 dark:text-blue-400 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20"
              onClick={() => navigateTo("my-classes")}
            >
              View All <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => navigateTo("my-classes")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <School className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {cls.name}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Section {cls.section}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    <Users className="h-3 w-3 inline mr-1" />
                    {cls.studentCount} Students
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
