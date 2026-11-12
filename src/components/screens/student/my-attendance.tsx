"use client";


import { apiFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useAppStore } from "@/store/use-app-store";
import type { StudentInfo, AttendanceRecord } from "@/types";

export function StudentAttendance() {
  const { currentUser } = useAppStore();
  const [calendarOffset, setCalendarOffset] = useState(0);

  const baseDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - calendarOffset);
    return d;
  }, [calendarOffset]);

  const periodLabel = useMemo(() => {
    try {
      return baseDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
    } catch (e) {
      return "";
    }
  }, [baseDate]);

  const { data: student, isPending: profileLoading } = useQuery({
    queryKey: ["students", "me"],
    queryFn: async () => {
      const res = await apiFetch("/api/students/me");
      if (!res.ok) throw new Error("Failed to fetch student profile");
      return (await res.json()) as StudentInfo;
    },
  });

  const { data: attendanceData = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ["attendance", "mine", student?.id],
    enabled: !!student?.id,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", "1000");
      const res = await apiFetch(`/api/attendance?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch attendance");
      const data = await res.json();
      const records = Array.isArray(data.records) ? data.records : [];
      return records.filter((a: AttendanceRecord) => a.studentId === student!.id) as AttendanceRecord[];
    },
  });

  const loading = profileLoading || attendanceLoading;

  const stats = useMemo(() => getAttendanceStats(attendanceData), [attendanceData]);
  const calendarData = useMemo(() => getCalendarData(attendanceData, baseDate), [attendanceData, baseDate]);

  if (loading) return <AttendanceSkeleton />;

  return (
    <div className="space-y-6 pb-10 animate-fade-in select-none">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          My Attendance
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Track your daily attendance and view monthly progress.
        </p>
      </div>

      <div className="space-y-6 mt-2 animate-in fade-in duration-300" suppressHydrationWarning>
        <AttendanceStats 
          percentage={stats.percentage}
          present={stats.present}
          absent={stats.absent}
        />

        <TodayAttendanceCard records={attendanceData} />

        <div className="w-full">
          <AttendanceCalendar 
            data={calendarData} 
            isPremium={true}
            currentPeriod={periodLabel}
            onPrev={() => setCalendarOffset(prev => prev + 1)}
            onNext={() => setCalendarOffset(prev => Math.max(0, prev - 1))}
          />
        </div>
      </div>
    </div>
  );
}

// Reuse Parent components and utils by importing them or moving them to common location
import { AttendanceStats } from "../parent/attendance/AttendanceStats";
import { AttendanceCalendar } from "../parent/attendance/AttendanceCalendar";
import { TodayAttendanceCard } from "../parent/attendance/TodayAttendanceCard";
import { AttendanceSkeleton } from "../parent/attendance/AttendanceSkeleton";
import { getAttendanceStats, getCalendarData } from "../parent/attendance/utils";
