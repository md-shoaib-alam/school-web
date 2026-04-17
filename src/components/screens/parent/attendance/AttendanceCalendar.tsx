"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { getCalendarCellColor } from "./utils";

interface AttendanceCalendarProps {
  data: { date: number; day: string; status: string | null }[];
}

export function AttendanceCalendar({ data }: AttendanceCalendarProps) {
  return (
    <Card className="rounded-xl shadow-sm shadow-none">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center gap-2 text-left">
          <Calendar className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-sm font-semibold">
            30-Day Attendance Calendar
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-left">
          Last 30 days attendance overview
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4">
          {[
            { label: "Present", color: "bg-emerald-500" },
            { label: "Absent", color: "bg-red-500" },
            { label: "Late", color: "bg-amber-500" },
            {
              label: "Weekend / No Data",
              color: "bg-gray-200 dark:bg-gray-700",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <div className={`w-3 h-3 rounded ${item.color}`} />
              {item.label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {data.map((day, i) => (
            <div
              key={i}
              className={`flex flex-col items-center justify-center rounded-lg p-1.5 min-h-[48px] ${getCalendarCellColor(day.status)}`}
              title={
                day.status
                  ? day.status.charAt(0).toUpperCase() +
                    day.status.slice(1)
                  : day.day === "S" || day.day === "S"
                    ? "Weekend"
                    : "No data"
              }
            >
              <span className="text-[10px] font-medium opacity-70">
                {day.day}
              </span>
              <span className="text-sm font-semibold">
                {day.date}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
