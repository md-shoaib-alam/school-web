"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { getCalendarCellColor } from "./utils";

interface AttendanceCalendarProps {
  data: { date: number | null; day: string | null; status: string | null }[];
  isPremium?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  currentPeriod?: string;
}

export function AttendanceCalendar({ data, isPremium, onPrev, onNext, currentPeriod }: AttendanceCalendarProps) {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card className="rounded-xl shadow-sm shadow-none overflow-hidden border-none bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
      <CardHeader className="p-4 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-left">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  Attendance Calendar
                </CardTitle>
                <CardDescription className="text-[10px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  {currentPeriod || "Current Month"}
                </CardDescription>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-xl self-start sm:self-center border border-gray-200/50 dark:border-gray-700/50">
            <button
              onClick={onPrev}
              className={`p-1.5 rounded-lg transition-all ${isPremium ? "hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm" : "opacity-30 cursor-not-allowed text-gray-400"}`}
              title={isPremium ? "Previous Month" : "Premium Only"}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="px-2.5 text-[9px] font-bold uppercase tracking-[0.1em] text-gray-500 dark:text-gray-400 flex items-center gap-1">
              {!isPremium && <Lock className="h-2.5 w-2.5" />}
              <span>History</span>
            </div>
            <button
              onClick={onNext}
              className={`p-1.5 rounded-lg transition-all ${isPremium ? "hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm" : "opacity-30 cursor-not-allowed text-gray-400"}`}
              title={isPremium ? "Next Month" : "Premium Only"}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {data.map((day, i) => (
            <div
              key={i}
              className={`flex flex-col items-center justify-center rounded-lg min-h-[44px] transition-all duration-200 ${
                day.date 
                  ? `${getCalendarCellColor(day.status)} shadow-sm hover:scale-[1.02]` 
                  : "bg-transparent opacity-0"
              }`}
              title={
                day.date 
                  ? (day.status
                      ? day.status.charAt(0).toUpperCase() + day.status.slice(1)
                      : day.day === "S" || day.day === "S"
                        ? "Weekend"
                        : "No data")
                  : ""
              }
            >
              {day.date && (
                <span className="text-xs font-bold">
                  {day.date}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          {[
            { label: "Present", color: "bg-emerald-500" },
            { label: "Absent", color: "bg-red-500" },
            { label: "Late", color: "bg-amber-500" },
            { label: "Holiday", color: "bg-gray-200 dark:bg-gray-700" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide"
            >
              <div className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-sm`} />
              {item.label}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
