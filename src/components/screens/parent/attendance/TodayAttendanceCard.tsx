"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { AttendanceRecord } from "@/types";
import { getTodayAttendance } from "./utils";

interface TodayAttendanceCardProps {
  records: AttendanceRecord[];
}

export function TodayAttendanceCard({ records }: TodayAttendanceCardProps) {
  const todayData = getTodayAttendance(records);

  const formatStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "present":
        return { label: "Present", color: "text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-950/30" };
      case "absent":
        return { label: "Absent", color: "text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/60 bg-red-50/50 dark:bg-red-950/30" };
      default:
        return { label: "Not Marked", color: "text-muted-foreground  bg-muted" };
    }
  };

  const statusInfo = formatStatus(todayData.status);

  return (
    <Card className="rounded-xl border  bg-card shadow-xs transition-all">
      <CardContent className="p-2.5 sm:p-3.5 flex flex-row items-center justify-between gap-2.5 sm:gap-4">
        <div className="text-left min-w-0 flex-1">
          <h3 className="text-xs sm:text-base font-bold text-foreground tracking-tight truncate">
            Today Attendance
          </h3>
        </div>

        <div className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg border text-[10px] sm:text-xs font-semibold tracking-wide transition-all shadow-xs shrink-0 whitespace-nowrap ${statusInfo.color}`}>
          {statusInfo.label}
        </div>
      </CardContent>
    </Card>
  );
}
