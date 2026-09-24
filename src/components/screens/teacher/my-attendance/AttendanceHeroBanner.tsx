'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Briefcase, School, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppUser } from '@/store/use-app-store';
import { AttendanceRecordItem } from './types';

interface AttendanceHeroBannerProps {
  currentUser: AppUser | null;
  todayRecord: AttendanceRecordItem | null;
}

export function AttendanceHeroBanner({ currentUser, todayRecord }: AttendanceHeroBannerProps) {
  const isTodayPresent = todayRecord?.status === 'present';
  const displayRole =
    currentUser?.customRole?.name ||
    (currentUser?.role
      ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)
      : 'Teacher');

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Mobile Title (Above card on mobile) */}
      <div className="lg:hidden space-y-0.5">
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
          My <span className="text-blue-600 dark:text-blue-400">Attendance</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 font-normal">
          Real-time attendance &amp; working logs
        </p>
      </div>

      {/* Hero Card */}
      <div className="relative rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 lg:p-6 overflow-hidden border border-blue-100/90 dark:border-blue-900/40 bg-gradient-to-r from-blue-50/90 via-sky-50/50 to-blue-50/80 dark:from-blue-950/20 dark:via-zinc-900/60 dark:to-blue-950/20 shadow-2xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-6">
          {/* Main Profile & Status Row */}
          <div className="flex items-start justify-between w-full lg:w-auto gap-3">
            {/* Left: Avatar + Name & Role */}
            <div className="flex items-start gap-3 sm:gap-3.5 min-w-0">
              <Avatar className="size-12 sm:size-14 lg:size-16 rounded-full border-2 border-white dark:border-zinc-800 shadow-sm ring-2 ring-blue-100/80 dark:ring-blue-900/50 shrink-0 mt-0.5">
                <AvatarImage src={currentUser?.avatar || '/assets/avatars/teacher-avatar.png'} />
                <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-sm sm:text-base lg:text-lg">
                  {currentUser?.name?.slice(0, 2).toUpperCase() || 'TC'}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 space-y-1">
                <h1 className="text-base sm:text-lg lg:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 truncate leading-tight">
                  {currentUser?.name || 'Staff Member'}
                </h1>

                {/* Role & School Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md sm:rounded-lg bg-white/90 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 text-[10px] sm:text-[11px] font-medium text-slate-700 dark:text-zinc-300">
                    <Briefcase className="size-2.5 sm:size-3 text-blue-500" />
                    <span>
                      Role: <strong className="font-semibold text-slate-900 dark:text-zinc-100">{displayRole}</strong>
                    </span>
                  </div>
                  {currentUser?.tenantName && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md sm:rounded-lg bg-white/90 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 text-[10px] sm:text-[11px] font-medium text-slate-700 dark:text-zinc-300">
                      <School className="size-2.5 sm:size-3 text-blue-500" />
                      <span>
                        School: <strong className="font-semibold text-slate-900 dark:text-zinc-100">{currentUser.tenantName}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Today's Status Badge (Aligned to top right corner) */}
            <div
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold border shrink-0 mt-0.5',
                isTodayPresent
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/60'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
              )}
            >
              <span
                className={cn(
                  'size-1.5 rounded-full',
                  isTodayPresent ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                )}
              />
              <span>{isTodayPresent ? 'Present Today' : 'Not Checked In'}</span>
            </div>
          </div>

          {/* Desktop Title Header (>= lg) */}
          <div className="hidden lg:flex items-center gap-4 z-10 w-auto justify-end">
            <div className="space-y-0.5 text-right">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                My <span className="text-blue-600 dark:text-blue-400">Attendance</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Real-time attendance &amp; working logs
              </p>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -top-12 -right-12 size-48 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
      </div>
    </div>
  );
}
