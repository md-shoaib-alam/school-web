'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { AttendanceMetrics } from './types';

interface AttendanceBreakdownCardProps {
  metrics: AttendanceMetrics;
}

export function AttendanceBreakdownCard({ metrics }: AttendanceBreakdownCardProps) {
  return (
    <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-2xs space-y-3">
      <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
        Current Month Breakdown
      </h3>

      <div className="flex items-center gap-6">
        {/* Circular Radial Donut Ring */}
        <div className="relative size-28 shrink-0 flex items-center justify-center">
          <svg className="size-full -rotate-90" viewBox="0 0 36 36">
            {/* Background circle */}
            <path
              className="text-slate-100 dark:text-zinc-800"
              strokeWidth="3.8"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* Green segment (Present) */}
            {Number(metrics.presentRate) > 0 && (
              <path
                className="text-emerald-500"
                strokeDasharray={`${Number(metrics.presentRate)}, 100`}
                strokeWidth="3.8"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-lg font-extrabold text-slate-900 dark:text-zinc-100">
              {metrics.recordedDays}
            </span>
            <span className="text-[9px] font-medium text-slate-400 dark:text-zinc-500">
              Days Logged
            </span>
          </div>
        </div>

        {/* Breakdown Rows */}
        <div className="flex-1 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="text-slate-600 dark:text-zinc-400">Present</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-zinc-100">
              {metrics.present} ({metrics.presentRate}%)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-rose-500" />
              <span className="text-slate-600 dark:text-zinc-400">Absent</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-zinc-100">
              {metrics.absent} ({metrics.absentRate}%)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-500" />
              <span className="text-slate-600 dark:text-zinc-400">Leave</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-zinc-100">
              {metrics.leave} ({metrics.leaveRate}%)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-purple-500" />
              <span className="text-slate-600 dark:text-zinc-400">Holiday</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-zinc-100">
              {metrics.holiday} ({metrics.holidayRate}%)
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
