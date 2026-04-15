"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/use-app-store";
import { useParentDashboard } from "@/lib/graphql/hooks";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  Bell,
  DollarSign,
  Calendar,
  GraduationCap,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export function ParentDashboard() {
  const { currentUser } = useAppStore();
  const { data, isLoading, isError, error } = useParentDashboard(
    currentUser?.name || "",
  );

  useEffect(() => {
    if (isError) {
      toast.error("Failed to load dashboard", { description: error?.message });
    }
  }, [isError, error]);

  // Data from GraphQL hook
  const children = data?.children ?? [];
  const fees = data?.fees ?? [];
  const performanceSummary = data?.performanceSummary ?? [];
  const allNotices = data?.notices ?? [];

  // Helper: get attendance rate for a child by name
  const getAttendanceForStudent = (studentName: string) => {
    const perf = performanceSummary.find((p) => p.name === studentName);
    return perf?.attendanceRate ?? 0;
  };

  // Helper: get average grade for a child by name
  const getAvgGradeForStudent = (studentName: string) => {
    const perf = performanceSummary.find((p) => p.name === studentName);
    if (!perf) return { avg: 0, grade: "N/A" };
    return { avg: perf.avgGrade, grade: perf.grade };
  };

  // Computed
  const pendingFees = fees.filter(
    (f) => f.status === "pending" || f.status === "overdue",
  );
  const overdueFees = fees.filter((f) => f.status === "overdue");
  const parentNotices = allNotices.filter(
    (n) => n.targetRole === "parent" || n.targetRole === "all",
  );
  const urgentNotices = parentNotices.filter((n) => n.priority === "urgent");

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="border-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md rounded-xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                Welcome back, {currentUser?.name?.split(" ")[0]}! 👋
              </h2>
              <p className="text-amber-100 mt-1">
                Here&apos;s an overview of your children&apos;s progress at
                Sigel School.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30">
              <Users className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Children</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {children.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Notices</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {parentNotices.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30">
              <DollarSign className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Fees</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                $
                {pendingFees
                  .reduce((s, f) => s + f.amount - f.paidAmount, 0)
                  .toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Children Overview - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Your Children
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {children.map((student) => {
              const attPct = getAttendanceForStudent(student.name);
              const { avg: avgPct, grade } = getAvgGradeForStudent(
                student.name,
              );
              return (
                <Card
                  key={student.id}
                  className="rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-400 font-bold text-sm">
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {student.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {student.className}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                      >
                        Roll {student.rollNumber}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">
                            Attendance
                          </span>
                          <span
                            className={`font-medium ${attPct >= 80 ? "text-emerald-600" : attPct >= 60 ? "text-amber-600" : "text-red-600"}`}
                          >
                            {attPct}%
                          </span>
                        </div>
                        <Progress
                          value={attPct}
                          className="h-2 [&>div]:bg-amber-500"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">
                            Average Score
                          </span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {avgPct}% ({grade})
                          </span>
                        </div>
                        <Progress
                          value={avgPct}
                          className="h-2 [&>div]:bg-blue-500"
                        />
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {student.gender === "male" ? "👦" : "👧"}{" "}
                        {student.gender === "male" ? "Male" : "Female"}
                      </span>
                      {student.dateOfBirth && (
                        <span>
                          DOB:{" "}
                          {new Date(student.dateOfBirth).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Overdue Fee Alert */}
          {overdueFees.length > 0 && (
            <Card className="rounded-xl shadow-sm border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <CardTitle className="text-sm font-semibold text-red-800">
                    Fee Payment Overdue
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                {overdueFees.slice(0, 3).map((fee) => (
                  <div
                    key={fee.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="font-medium text-red-900">
                        {fee.studentName}
                      </p>
                      <p className="text-xs text-red-600">
                        {fee.type} - Due: {fee.dueDate}
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      ${fee.amount}
                    </Badge>
                  </div>
                ))}
                {overdueFees.length > 3 && (
                  <p className="text-xs text-red-500">
                    +{overdueFees.length - 3} more overdue
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Upcoming Events & Notices */}
          <Card className="rounded-xl shadow-sm">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-sm font-semibold">
                  Recent Notices
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ScrollArea className="max-h-72">
                <div className="space-y-3">
                  {parentNotices.slice(0, 5).map((notice) => (
                    <div key={notice.id} className="space-y-1 group">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                          {notice.title}
                        </h4>
                        <Badge
                          variant="outline"
                          className={`shrink-0 text-[10px] ${
                            notice.priority === "urgent"
                              ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                              : notice.priority === "important"
                                ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                                : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {notice.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notice.content}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(notice.createdAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" },
                        )}
                      </p>
                    </div>
                  ))}
                  {parentNotices.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No notices at this time
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card className="rounded-xl shadow-sm">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-sm font-semibold">
                  Performance Summary
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              {children.map((student) => {
                const { avg, grade } = getAvgGradeForStudent(student.name);
                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {student.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {avg}%
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs font-bold ${
                          grade.startsWith("A")
                            ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                            : grade.startsWith("B")
                              ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                              : "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {grade}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner Skeleton */}
      <Skeleton className="h-28 w-full rounded-xl" />

      {/* Quick Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-52 w-full rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
