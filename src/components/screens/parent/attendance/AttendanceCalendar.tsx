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
    <Card className="rounded-xl shadow-sm overflow-hidden border-none bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
      <CardHeader className="p-3 sm:p-4 pb-2">
        <div className="flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center border border-amber-500/20">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100">
                Calendar
              </CardTitle>
              <CardDescription className="text-[9px] sm:text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                {currentPeriod || "Current"}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-gray-100/80 dark:bg-gray-800/80 p-0.5 sm:p-1 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
            <button
              onClick={onPrev}
              className={`p-1 sm:p-1.5 rounded-lg transition-all ${isPremium ? "hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm" : "opacity-30 cursor-not-allowed text-gray-400"}`}
              title={isPremium ? "Previous" : "Premium Only"}
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <div className="px-1 sm:px-2 text-[8px] sm:text-[9px] font-black uppercase tracking-tighter sm:tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-0.5">
              {!isPremium && <Lock className="h-2 w-2" />}
              <span>History</span>
            </div>
            <button
              onClick={onNext}
              className={`p-1 sm:p-1.5 rounded-lg transition-all ${isPremium ? "hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm" : "opacity-30 cursor-not-allowed text-gray-400"}`}
              title={isPremium ? "Next" : "Premium Only"}
            >
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-4">
        <div className="grid grid-cols-7 gap-1 mb-1.5">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-[9px] sm:text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {data.map((day, i) => (
            <div
              key={i}
              className={`flex flex-col items-center justify-center rounded-lg min-h-[36px] sm:min-h-[44px] transition-all duration-200 ${
                day.date 
                  ? `${getCalendarCellColor(day.status)} shadow-sm hover:scale-[1.02]` 
                  : "bg-transparent opacity-0"
              }`}
            >
              {day.date && (
                <span className="text-[10px] sm:text-xs font-bold">
                  {day.date}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          {[
            { label: "Present", color: "bg-emerald-500" },
            { label: "Absent", color: "bg-red-500" },
            { label: "Late", color: "bg-amber-500" },
            { label: "Off", color: "bg-gray-200 dark:bg-gray-800" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-1 text-[8px] sm:text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter sm:tracking-wide"
            >
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
              {item.label}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
