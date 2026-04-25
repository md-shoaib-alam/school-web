"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/use-app-store";
import { useAdminDashboard } from "@/lib/graphql/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Bell,
  Calendar,
  Clock,
  FileText,
  ClipboardList,
  GraduationCap,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  School,
} from "lucide-react";

export function StaffDashboard() {
  const { currentUser, currentTenantName, setCurrentScreen } = useAppStore();
  const customRoleName = currentUser?.customRole?.name;

  const { data, isPending, fetchStatus } = useAdminDashboard(currentUser?.tenantId || "");

  // In React Query v5, when enabled:false, isPending=true but fetchStatus='idle'
  const isLoading = isPending && fetchStatus === 'fetching';

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-20 w-48 rounded-xl" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 shadow-sm bg-white dark:bg-gray-900">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-7 w-12" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Bottom Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Students",
      value: data?.totalStudents.toLocaleString() || "0",
      icon: <GraduationCap className="h-5 w-5" />,
      color:
        "bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
    },
    {
      label: "Active Classes",
      value: data?.totalClasses.toLocaleString() || "0",
      icon: <School className="h-5 w-5" />,
      color:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
    {
      label: "Total Teachers",
      value: data?.totalTeachers.toLocaleString() || "0",
      icon: <Users className="h-5 w-5" />,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    },
    {
      label: "Attendance Rate",
      value: `${data?.attendanceRate || 0}%`,
      icon: <TrendingUp className="h-5 w-5" />,
      color:
        "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    },
  ];

  const quickActions = [
    {
      label: "View Notices",
      icon: <Bell className="h-5 w-5" />,
      screen: "notices",
      color: "bg-amber-500 hover:bg-amber-600",
    },
    {
      label: "Calendar",
      icon: <Calendar className="h-5 w-5" />,
      screen: "calendar",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      label: "Timetable",
      icon: <Clock className="h-5 w-5" />,
      screen: "timetable",
      color: "bg-emerald-500 hover:bg-emerald-600",
    },
    {
      label: "Classes",
      icon: <School className="h-5 w-5" />,
      screen: "classes",
      color: "bg-violet-500 hover:bg-violet-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {currentUser?.name?.split(" ")[0]}! 👋
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Here&apos;s what&apos;s happening at{" "}
            {currentTenantName || "your school"} today.
          </p>
          <div className="flex items-center gap-2 mt-2">
            {customRoleName && (
              <Badge className="bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/50 text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {customRoleName}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              Staff
            </Badge>
          </div>
        </div>
        <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30">
          <CardContent className="p-4">
            <div className="text-sm font-medium opacity-90">
              Today&apos;s Date
            </div>
            <div className="text-lg font-bold">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.screen}
              onClick={() => setCurrentScreen(action.screen)}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all hover:border-transparent text-left group"
            >
              <div
                className={`p-2 rounded-lg text-white ${action.color} transition-transform group-hover:scale-110`}
              >
                {action.icon}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              Recent Broadcasts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data?.recentNotices || []).length > 0 ? (
                data?.recentNotices.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 py-2 border-b border-gray-50 dark:border-gray-800/50 last:border-0"
                  >
                    <div className="mt-0.5 shrink-0">
                      <Bell className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 line-clamp-1">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {activity.content.substring(0, 60)}...
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">
                  No recent notices found.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              School Composition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium">Students Enrolled</span>
                </div>
                <span className="text-sm font-bold text-emerald-600">
                  {data?.totalStudents}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center gap-3">
                  <School className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">
                    Registered Classes
                  </span>
                </div>
                <span className="text-sm font-bold text-blue-600">
                  {data?.totalClasses}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-violet-500" />
                  <span className="text-sm font-medium">
                    Monthly Attendance
                  </span>
                </div>
                <span className="text-sm font-bold text-violet-600">
                  {data?.attendanceRate}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
