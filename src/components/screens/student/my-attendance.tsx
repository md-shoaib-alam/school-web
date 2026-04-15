"use client";


import { apiFetch } from "@/lib/api";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useAppStore } from "@/store/use-app-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  UserCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import type { StudentInfo } from "@/lib/types";

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  date: string;
  status: string;
}

interface MonthlyData {
  month: string;
  rate: number;
}

const chartConfig = {
  rate: { label: "Attendance %", color: "#8b5cf6" },
};

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function StudentAttendance() {
  const { currentUser } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);

  const student = useMemo(
    () =>
      students.find((s) => s.email === currentUser?.email) ||
      students[0] ||
      null,
    [students, currentUser?.email],
  );

  const studentId = student?.id || "";
  const classId = student?.classId || "";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsRes] = await Promise.all([
        apiFetch("/api/students").then((r) => r.json()),
      ]);
      setStudents(studentsRes);

      // Use the matched student's classId, or first student's classId
      const matchedStudent =
        studentsRes.find((s: StudentInfo) => s.email === currentUser?.email) ||
        studentsRes[0];
      if (!matchedStudent) {
        setLoading(false);
        return;
      }

      const attRes = await fetch(
        `/api/attendance?classId=${matchedStudent.classId}`,
      );
      const attData: AttendanceRecord[] = await attRes.json();
      setAttendanceData(
        attData.filter((a) => a.studentId === matchedStudent.id),
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.email]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Computed: attendance stats
  const stats = useMemo(() => {
    const present = attendanceData.filter((a) => a.status === "present").length;
    const absent = attendanceData.filter((a) => a.status === "absent").length;
    const late = attendanceData.filter((a) => a.status === "late").length;
    const total = attendanceData.length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    return { present, absent, late, total, rate };
  }, [attendanceData]);

  // Monthly breakdown for last 6 months
  const monthlyData: MonthlyData[] = useMemo(() => {
    const now = new Date();
    const months: MonthlyData[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const label = `${MONTH_NAMES[month]}`;

      const monthRecords = attendanceData.filter((a) => {
        const date = new Date(a.date);
        return date.getFullYear() === year && date.getMonth() === month;
      });

      const presentCount = monthRecords.filter(
        (a) => a.status === "present" || a.status === "late",
      ).length;
      const rate =
        monthRecords.length > 0
          ? Math.round((presentCount / monthRecords.length) * 100)
          : 0;

      months.push({ month: label, rate });
    }

    return months;
  }, [attendanceData]);

  // Last 30 days grid
  const last30Days = useMemo(() => {
    const days: {
      date: Date;
      status: "present" | "absent" | "late" | "none";
      dayOfWeek: number;
    }[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayOfWeek = d.getDay();
      const record = attendanceData.find((a) => a.date === dateStr);

      let status: "present" | "absent" | "late" | "none" = "none";
      if (record) {
        status = record.status as "present" | "absent" | "late";
      }
      // If no record and it's a weekend, keep as 'none'
      // If no record and weekday, also keep as 'none' (could be future or unrecorded)

      days.push({ date: d, status, dayOfWeek });
    }

    return days;
  }, [attendanceData]);

  // Circle percentage helpers
  const circleRadius = 70;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (stats.rate / 100) * circumference;

  const statusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-emerald-400";
      case "absent":
        return "bg-red-400";
      case "late":
        return "bg-amber-400";
      default:
        return "bg-gray-200 dark:bg-gray-700";
    }
  };

  if (loading) return <AttendanceSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          My Attendance
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-0.5">
          Track your daily attendance and monthly trends
        </p>
      </div>

      {/* Top Section: Circle + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Circle */}
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="relative w-44 h-44">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r={circleRadius}
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="10"
                />
                <circle
                  cx="80"
                  cy="80"
                  r={circleRadius}
                  fill="none"
                  stroke={
                    stats.rate >= 85
                      ? "#8b5cf6"
                      : stats.rate >= 75
                        ? "#f59e0b"
                        : "#ef4444"
                  }
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.rate}%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                  Attendance
                </span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-4">
              {student ? student.name : "Student"}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {student?.className || "Class"} &middot; {stats.total} total days
            </p>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <Card className="lg:col-span-2 rounded-xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-violet-500" />
              Attendance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.present}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                    Present Days
                  </p>
                </div>
                <Badge className="bg-emerald-500 text-white text-[10px] ml-auto shrink-0">
                  {stats.total > 0
                    ? Math.round((stats.present / stats.total) * 100)
                    : 0}
                  %
                </Badge>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="p-2.5 rounded-lg bg-red-100 dark:bg-red-900/40">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.absent}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                    Absent Days
                  </p>
                </div>
                <Badge className="bg-red-500 text-white text-[10px] ml-auto shrink-0">
                  {stats.total > 0
                    ? Math.round((stats.absent / stats.total) * 100)
                    : 0}
                  %
                </Badge>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.late}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                    Late Days
                  </p>
                </div>
                <Badge className="bg-amber-500 text-white text-[10px] ml-auto shrink-0">
                  {stats.total > 0
                    ? Math.round((stats.late / stats.total) * 100)
                    : 0}
                  %
                </Badge>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-5 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-emerald-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                  Present
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-red-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                  Absent
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-amber-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                  Late
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700" />
                <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                  No Data
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Bar Chart */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-violet-500" />
            Monthly Attendance Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.some((m) => m.rate > 0) ? (
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <BarChart data={monthlyData} margin={{ left: -10, right: 10 }}>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: string | number) => `${Number(v)}%`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={
                        ((v: string | number) => [
                          `${v}%`,
                          "Attendance",
                        ]) as never
                      }
                    />
                  }
                />
                <Bar
                  dataKey="rate"
                  fill="#8b5cf6"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-gray-400 dark:text-gray-500">
              <div className="text-center">
                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No monthly data available yet</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 30-Day Calendar Grid */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-violet-500" />
              Last 30 Days
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              Daily Overview
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Day labels */}
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div
                key={d}
                className="text-center text-[10px] sm:text-xs font-medium text-gray-400 dark:text-gray-500 py-1"
              >
                {d}
              </div>
            ))}

            {/* Pad to align first day */}
            {Array.from({ length: last30Days[0]?.dayOfWeek ?? 0 }).map(
              (_, i) => (
                <div key={`pad-${i}`} className="aspect-square" />
              ),
            )}

            {/* Day squares */}
            {last30Days.map(({ date, status }, idx) => {
              const isToday = date.toDateString() === new Date().toDateString();
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              const dayNum = date.getDate();

              return (
                <div
                  key={idx}
                  className={`
                    relative aspect-square rounded-lg flex items-center justify-center
                    text-[10px] sm:text-xs font-medium transition-all
                    ${statusColor(status)}
                    ${isToday ? "ring-2 ring-violet-500 ring-offset-1" : ""}
                    ${isWeekend && status === "none" ? "opacity-40" : ""}
                  `}
                  title={`${date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}: ${status === "none" ? "No data" : status.charAt(0).toUpperCase() + status.slice(1)}`}
                >
                  <span
                    className={
                      status === "none" && !isWeekend
                        ? "text-gray-400 dark:text-gray-500"
                        : isWeekend && status === "none"
                          ? "text-gray-300"
                          : "text-white"
                    }
                  >
                    {dayNum}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Skeleton ─── */
function AttendanceSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-40 mb-2" />
        <Skeleton className="h-4 w-60" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 lg:col-span-2 rounded-xl" />
      </div>
      <Skeleton className="h-72 rounded-xl" />
      <Skeleton className="h-56 rounded-xl" />
    </div>
  );
}
