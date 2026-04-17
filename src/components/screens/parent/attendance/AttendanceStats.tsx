"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface AttendanceStatsProps {
  percentage: number;
  present: number;
  absent: number;
  late: number;
}

export function AttendanceStats({ percentage, present, absent, late }: AttendanceStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Percentage circle */}
      <Card className="rounded-xl shadow-sm col-span-2 md:col-span-1 shadow-none">
        <CardContent className="p-6 flex flex-col items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
              <circle
                cx="64" cy="64" r="56"
                fill="none" stroke="#f3f4f6" strokeWidth="10"
                className="dark:stroke-gray-700"
              />
              <circle
                cx="64" cy="64" r="56"
                fill="none"
                stroke={percentage >= 80 ? "#10b981" : percentage >= 60 ? "#f59e0b" : "#ef4444"}
                strokeWidth="10"
                strokeDasharray={`${(percentage / 100) * 352} 352`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${percentage >= 80 ? "text-emerald-600 dark:text-emerald-400" : percentage >= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                {percentage}%
              </span>
              <span className="text-xs text-muted-foreground">Attendance</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stat cards */}
      <Card className="rounded-xl shadow-sm border-emerald-200 dark:border-emerald-800 shadow-none">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Present Days</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{present}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-sm border-red-200 dark:border-red-800 shadow-none">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Absent Days</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{absent}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-sm border-amber-200 dark:border-amber-800 shadow-none">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Late Days</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{late}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
