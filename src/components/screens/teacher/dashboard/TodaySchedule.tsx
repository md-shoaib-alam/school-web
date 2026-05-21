"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CalendarDays } from "lucide-react";

interface TodayScheduleProps {
  schedule: any[];
  formatTime: (time: string) => string;
}

export function TodaySchedule({ schedule, formatTime }: TodayScheduleProps) {
  return (
    <Card className="rounded-xl shadow-sm border-0 lg:col-span-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="size-4 text-blue-500" />
            Today&apos;s Schedule
          </CardTitle>
          <Badge
            variant="secondary"
            className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs"
          >
            {schedule.length} classes
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {schedule.length === 0 ? (
          <div className="text-center py-8">
            <CalendarDays className="size-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 dark:text-zinc-500 text-sm">
              No classes scheduled for today
            </p>
            <p className="text-zinc-300 dark:text-zinc-600 text-xs mt-1">
              Enjoy your day off!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {schedule.map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <div className="text-center min-w-[70px]">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {formatTime(entry.startTime)}
                  </p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    {formatTime(entry.endTime)}
                  </p>
                </div>
                <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {entry.subjectName}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {entry.className}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] border-blue-200 dark:border-blue-800 text-blue-500 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                >
                  Period {index + 1}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
