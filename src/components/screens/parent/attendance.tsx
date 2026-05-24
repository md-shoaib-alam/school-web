"use client";

import { useState, useEffect, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import { useAppStore } from "@/store/use-app-store";
import { useParentDashboard } from "@/lib/graphql/hooks";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserCheck } from "lucide-react";
import type { StudentInfo, AttendanceRecord } from "@/lib/types";

// Sub-components
import { AttendanceStats } from "./attendance/AttendanceStats";
import { AttendanceChart } from "./attendance/AttendanceChart";
import { AttendanceCalendar } from "./attendance/AttendanceCalendar";
import { AttendanceSkeleton } from "./attendance/AttendanceSkeleton";

// Utils
import { getAttendanceStats, getMonthlyData, getCalendarData } from "./attendance/utils";

export function ParentAttendance() {
  const { currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState("");

  const [calendarOffset, setCalendarOffset] = useState(0);

  const baseDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - calendarOffset);
    return d;
  }, [calendarOffset]);

  const periodLabel = useMemo(() => {
    try {
      return baseDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch (e) {
      return "";
    }
  }, [baseDate]);

  const { data, isPending, refetch } = useParentDashboard(currentUser?.name || "");
  const students = (data?.children || []) as any[];
  const isPremium = data?.subscriptionPlan?.toLowerCase() === 'premium';

  // Persistence logic
  useEffect(() => {
    if (students.length > 0) {
      const savedTab = document.cookie
        .split("; ")
        .find((row) => row.startsWith("lastSelectedStudent="))
        ?.split("=")[1];
      
      if (savedTab && students.some(s => s.id === savedTab)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveTab(savedTab);
      } else if (!activeTab) {
        setActiveTab(students[0].id);
      }
    }
  }, [students]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setCalendarOffset(0);
    // Save to cookie
    document.cookie = `lastSelectedStudent=${val}; path=/; max-age=31536000`;
  };

  if (isPending) return <AttendanceSkeleton />;

  if (students.length === 0) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardContent className="p-12 text-center">
          <UserCheck className="size-12 mx-auto text-muted-foreground/40" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mt-4">
            No children found
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            No students are linked to your account.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck className="size-5 text-amber-600" />
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
            Attendance Overview
          </h2>
        </div>
        <button 
          type="button"
          onClick={() => refetch()}
          className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-all"
        >
          Refresh Data
        </button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="bg-amber-50 dark:bg-amber-900/30 p-1">
          {students.map((student: any) => (
            <TabsTrigger
              key={student.id}
              value={student.id}
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400 data-[state=active]:shadow-sm px-4 transition-all hover:bg-amber-100/30 dark:hover:bg-amber-900/20 hover:text-amber-800 dark:hover:text-amber-300"
            >
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-amber-400" />
                {student.name}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {students.map((student: any) => {
          const currentAttendance = student.attendance || [];
          const currentStats = getAttendanceStats(currentAttendance);
          const currentMonthly = getMonthlyData(currentAttendance);
          
          const currentCalendar = getCalendarData(currentAttendance, baseDate);

          return (
            <TabsContent
              key={student.id}
              value={student.id}
              className="space-y-6 mt-6 animate-in fade-in duration-300"
              suppressHydrationWarning
            >
              <AttendanceStats 
                percentage={currentStats.percentage}
                present={currentStats.present}
                absent={currentStats.absent}
              />

              <AttendanceCalendar 
                data={currentCalendar} 
                isPremium={isPremium}
                currentPeriod={periodLabel}
                onPrev={() => isPremium && setCalendarOffset(prev => prev + 1)}
                onNext={() => isPremium && setCalendarOffset(prev => Math.max(0, prev - 1))}
              />
              
              <AttendanceChart 
                data={currentMonthly} 
                isPremium={isPremium} 
              />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
