'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { AttendanceMetrics } from './types';

interface AttendanceBreakdownCardProps {
  metrics: AttendanceMetrics;
}

export function AttendanceBreakdownCard({ metrics }: AttendanceBreakdownCardProps) {
  const total = metrics.recordedDays || 0;

  const presentPct = total > 0 ? (metrics.present / total) * 100 : 0;
  const absentPct = total > 0 ? (metrics.absent / total) * 100 : 0;
  const leavePct = total > 0 ? (metrics.leave / total) * 100 : 0;
  const holidayPct = total > 0 ? (metrics.holiday / total) * 100 : 0;

  const presentOffset = 0;
  const absentOffset = -presentPct;
  const leaveOffset = -(presentPct + absentPct);
  const holidayOffset = -(presentPct + absentPct + leavePct);

  const circlePath = "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831";

  return (
    <Card className="rounded-xl border bg-card p-4 space-y-3">
      <h3 className="text-base font-semibold text-foreground">
        Current Month Breakdown
      </h3>

      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        {/* Circular Radial Donut Ring */}
        <div className="relative size-24 sm:size-28 shrink-0 flex items-center justify-center">
          <svg className="size-full -rotate-90" viewBox="0 0 36 36">
            {/* Background circle */}
            <path
              className="text-muted-foreground"
              strokeWidth="3.8"
              stroke="currentColor"
              fill="none"
              d={circlePath}
            />
            {/* Green segment (Present) */}
            {presentPct > 0 && (
              <path
                className="text-emerald-500 transition-all duration-500"
                strokeDasharray={`${presentPct}, 100`}
                strokeDashoffset={presentOffset}
                strokeWidth="3.8"
                stroke="currentColor"
                fill="none"
                d={circlePath}
              />
            )}
            {/* Rose segment (Absent) */}
            {absentPct > 0 && (
              <path
                className="text-rose-500 transition-all duration-500"
                strokeDasharray={`${absentPct}, 100`}
                strokeDashoffset={absentOffset}
                strokeWidth="3.8"
                stroke="currentColor"
                fill="none"
                d={circlePath}
              />
            )}
            {/* Amber segment (Leave) */}
            {leavePct > 0 && (
              <path
                className="text-amber-500 transition-all duration-500"
                strokeDasharray={`${leavePct}, 100`}
                strokeDashoffset={leaveOffset}
                strokeWidth="3.8"
                stroke="currentColor"
                fill="none"
                d={circlePath}
              />
            )}
            {/* Purple segment (Holiday) */}
            {holidayPct > 0 && (
              <path
                className="text-purple-500 transition-all duration-500"
                strokeDasharray={`${holidayPct}, 100`}
                strokeDashoffset={holidayOffset}
                strokeWidth="3.8"
                stroke="currentColor"
                fill="none"
                d={circlePath}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl sm:text-2xl font-bold text-foreground">
              {metrics.recordedDays}
            </span>
            <span className="text-xs font-medium text-muted-foreground mt-0.5">
              Days Logged
            </span>
          </div>
        </div>

        {/* Breakdown Rows */}
        <div className="w-full sm:flex-1 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Present</span>
            </div>
            <span className="font-semibold text-foreground">
              {metrics.present} ({metrics.presentRate}%)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-rose-500" />
              <span className="text-muted-foreground">Absent</span>
            </div>
            <span className="font-semibold text-foreground">
              {metrics.absent} ({metrics.absentRate}%)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-500" />
              <span className="text-muted-foreground">Leave</span>
            </div>
            <span className="font-semibold text-foreground">
              {metrics.leave} ({metrics.leaveRate}%)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-purple-500" />
              <span className="text-muted-foreground">Holiday</span>
            </div>
            <span className="font-semibold text-foreground">
              {metrics.holiday} ({metrics.holidayRate}%)
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
