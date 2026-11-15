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
    <Card className="rounded-xl shadow-sm overflow-hidden border  bg-card">
      <CardHeader className="p-3 sm:p-4 pb-2">
        <div className="flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="size-8 sm:size-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <Calendar className="size-4 sm:size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Calendar
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                {currentPeriod || "Current"}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-muted p-0.5 sm:p-1 rounded-xl border">
            <button
              type="button"
              onClick={onPrev}
              className={`p-1 sm:p-1.5 rounded-lg transition-all ${isPremium ? "hover:bg-accent text-foreground shadow-sm" : "opacity-30 cursor-not-allowed text-muted-foreground"}`}
              title={isPremium ? "Previous" : "Premium Only"}
            >
              <ChevronLeft className="size-3.5 sm:size-4" />
            </button>
            <div className="px-1.5 sm:px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-0.5">
              {!isPremium && <Lock className="size-2" />}
              <span>History</span>
            </div>
            <button
              type="button"
              onClick={onNext}
              className={`p-1 sm:p-1.5 rounded-lg transition-all ${isPremium ? "hover:bg-accent text-foreground shadow-sm" : "opacity-30 cursor-not-allowed text-muted-foreground"}`}
              title={isPremium ? "Next" : "Premium Only"}
            >
              <ChevronRight className="size-3.5 sm:size-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-4">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-1.5">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground uppercase py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {data.map((day, i) => (
            <div
              key={day.date ? `date-${day.date}` : `empty-${i}`}
              className={`flex flex-col items-center justify-center rounded-lg min-h-[36px] sm:min-h-[44px] transition-all duration-200 w-full ${
                day.date 
                  ? `${getCalendarCellColor(day.status)} shadow-sm hover:scale-[1.02]` 
                  : "bg-transparent opacity-0"
              }`}
            >
              {day.date && (
                <span className="text-xs font-medium">
                  {day.date}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 mt-4 pt-3 border-t">
          {[
            { label: "Present", color: "bg-emerald-500" },
            { label: "Absent", color: "bg-red-500" },
            { label: "Off", color: "bg-muted" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              <div className={`size-2 rounded-full ${item.color}`} />
              {item.label}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
