"use client";

import { useState, useEffect, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type * as RechartsTypes from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart3, TrendingUp, AlertTriangle } from "lucide-react";
import { ClassInfo, AttendanceRecord } from "@/lib/types";
import { AttendanceSummary, DailyAttendance, attendanceChartConfig } from "./types";
import { SummaryCardSkeleton, ChartSkeleton } from "./SummaryComponents";

export function AttendanceReport() {
  const [recharts, setRecharts] = useState<typeof import("recharts") | null>(null);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    import("recharts").then(setRecharts);
  }, []);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await apiFetch("/api/classes");
        if (!res.ok) throw new Error("Failed to fetch classes");
        setClasses(await res.json());
      } catch {
        console.error("Error fetching classes");
      }
    }
    fetchClasses();
  }, []);

  useEffect(() => {
    async function fetchAttendance() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedClass !== "all") params.set("classId", selectedClass);
        params.set("limit", "1000"); // Load wider range for reporting metrics
        const res = await apiFetch(`/api/attendance?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch attendance");
        const data = await res.json();
        setRecords(data.records || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchAttendance();
  }, [selectedClass]);

  const summary: AttendanceSummary = useMemo(() => {
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const total = records.length || 1;
    return {
      present,
      absent,
      total: records.length,
      presentPct: ((present / total) * 100).toFixed(1),
      absentPct: ((absent / total) * 100).toFixed(1),
    };
  }, [records]);

  const dailyData: DailyAttendance[] = useMemo(() => {
    const dateMap = new Map<
      string,
      { present: number; absent: number }
    >();
    for (const r of records) {
      const d = new Date(r.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const entry = dateMap.get(d) || { present: 0, absent: 0 };
      if (r.status === "present") entry.present++;
      else if (r.status === "absent") entry.absent++;
      dateMap.set(d, entry);
    }
    return Array.from(dateMap.entries())
      .slice(-7)
      .map(([date, data]) => ({ date, ...data }));
  }, [records]);

  const summaryCards = [
    {
      label: "Present",
      value: summary.present,
      pct: summary.presentPct,
      icon: <TrendingUp className="h-5 w-5 text-emerald-600" />,
      color:
        "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-800",
    },
    {
      label: "Absent",
      value: summary.absent,
      pct: summary.absentPct,
      icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
      color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
      border: "border-red-200 dark:border-red-800",
    },
  ];

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30">
        <CardContent className="p-6 text-center text-red-600 dark:text-red-400">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="font-medium">Failed to load attendance report</p>
          <p className="text-sm mt-1">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}-{c.section}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          {records.length} records
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {loading ? (
          <>
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
          </>
        ) : (
          summaryCards.map((card) => (
            <Card key={card.label} className={`border ${card.border}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {card.label}
                    </p>
                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {card.pct}%
                    </p>
                  </div>
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center ${card.color}`}
                  >
                    {card.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Daily Attendance (Last 7 Days)
          </CardTitle>
          <CardDescription>
            Present and absent counts per day
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading || !recharts ? (
            <ChartSkeleton />
          ) : dailyData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">
                No attendance data available for the selected period
              </p>
            </div>
          ) : (
            <ChartContainer
              config={attendanceChartConfig}
              className="h-[300px] w-full"
            >
              {(() => {
                const { BarChart, Bar, XAxis, YAxis, CartesianGrid } = recharts;
                return (
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                    />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="present"
                      fill="var(--color-present)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={28}
                    />
                    <Bar
                      dataKey="absent"
                      fill="var(--color-absent)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={28}
                    />
                  </BarChart>
                );
              })()}
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
