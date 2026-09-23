'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  CheckCircle2,
  UserCheck,
  Check,
  Loader2,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AttendanceRecordItem, AttendanceMetrics } from './types';

interface TodayAttendanceCardProps {
  todayRecord: AttendanceRecordItem | null;
  isCheckingIn: boolean;
  onCheckInToggle: () => void;
  metrics: AttendanceMetrics;
}

export function TodayAttendanceCard({
  todayRecord,
  isCheckingIn,
  onCheckInToggle,
  metrics,
}: TodayAttendanceCardProps) {
  const isTodayPresent = todayRecord?.status === 'present';

  return (
    <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
          Today&apos;s Attendance
        </h3>
        <Badge
          className={cn(
            'font-semibold px-2 py-0.5 text-xs border',
            isTodayPresent
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200/80'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200'
          )}
        >
          {isTodayPresent ? '● On Time' : '● Not Marked'}
        </Badge>
      </div>

      {/* Status Highlight */}
      <div
        className={cn(
          'flex items-center justify-between gap-3 p-3.5 rounded-2xl border',
          isTodayPresent
            ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30'
            : 'bg-slate-50 dark:bg-zinc-900/60 border-slate-200/80 dark:border-zinc-800'
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'size-11 rounded-full text-white flex items-center justify-center shrink-0 shadow-xs',
              isTodayPresent ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-zinc-700'
            )}
          >
            {isTodayPresent ? <Check className="size-6 stroke-[3]" /> : <Clock className="size-6" />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 capitalize">
              {todayRecord?.status || 'Not Marked'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {todayRecord?.checkIn ? `Checked in at ${todayRecord.checkIn}` : 'No punch recorded yet'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
            {todayRecord?.checkOut ? `Check-out: ${todayRecord.checkOut}` : 'Check-out: --'}
          </span>
        </div>
      </div>

      {/* Check In / Out Toggle Button */}
      <Button
        onClick={onCheckInToggle}
        disabled={isCheckingIn}
        className="w-full h-9 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all gap-1.5 cursor-pointer active:scale-95"
      >
        {isCheckingIn ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            <span>Recording...</span>
          </>
        ) : todayRecord?.checkOut ? (
          <>
            <CheckCircle2 className="size-3.5" />
            <span>Attendance Completed</span>
          </>
        ) : todayRecord?.checkIn ? (
          <>
            <UserCheck className="size-3.5" />
            <span>Check Out for Today</span>
          </>
        ) : (
          <>
            <UserCheck className="size-3.5" />
            <span>Check In for Today</span>
          </>
        )}
      </Button>

      {/* Mini Stats (2 side-by-side) */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
          <div className="size-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1.5">
            <Clock className="size-4" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">Today Working Hours</p>
          <p className="text-base font-bold text-slate-900 dark:text-zinc-100">
            {todayRecord?.workingHours || (todayRecord?.checkIn ? 'In Progress' : '--')}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500">Live Status</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
          <div className="size-7 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-1.5">
            <BarChart3 className="size-4" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">Monthly Present Rate</p>
          <p className="text-base font-bold text-slate-900 dark:text-zinc-100">
            {metrics.presentRate}%
          </p>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500">
            {metrics.present} of {metrics.total} days
          </p>
        </div>
      </div>
    </Card>
  );
}
