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
    <div className="relative rounded-3xl p-6 sm:p-7 overflow-hidden border border-blue-100/90 dark:border-blue-900/40 bg-gradient-to-r from-blue-50/90 via-sky-50/50 to-blue-50/80 dark:from-blue-950/20 dark:via-zinc-900/60 dark:to-blue-950/20 shadow-2xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
      {/* Left: Real Profile Info */}
      <div className="flex items-center gap-4 sm:gap-5 z-10">
        <div className="relative shrink-0">
          <Avatar className="size-16 sm:size-20 rounded-full border-2 border-white dark:border-zinc-800 shadow-md ring-4 ring-blue-100/60 dark:ring-blue-900/40">
            <AvatarImage src={currentUser?.avatar || '/assets/avatars/teacher-avatar.png'} />
            <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-lg sm:text-xl">
              {currentUser?.name?.slice(0, 2).toUpperCase() || 'TC'}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="space-y-1">
          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border',
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
            <span>{isTodayPresent ? 'Present Today' : 'Not Checked In Today'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            {currentUser?.name || 'Staff Member'}
          </h1>

          {/* Real Meta Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-300">
              <Briefcase className="size-3 text-blue-500" />
              <span>
                Role: <strong className="font-semibold text-slate-900 dark:text-zinc-100">{displayRole}</strong>
              </span>
            </div>
            {currentUser?.tenantName && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-300">
                <School className="size-3 text-blue-500" />
                <span>
                  School: <strong className="font-semibold text-slate-900 dark:text-zinc-100">{currentUser.tenantName}</strong>
                </span>
              </div>
            )}
            {currentUser?.email && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-300">
                <Mail className="size-3 text-blue-500" />
                <span className="text-slate-600 dark:text-zinc-400">{currentUser.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Header Title */}
      <div className="flex items-center gap-4 z-10 w-full lg:w-auto justify-between lg:justify-end">
        <div className="space-y-1 text-left lg:text-right">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
            My <span className="text-blue-600 dark:text-blue-400">Attendance</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
            Real-time attendance & working logs
          </p>
        </div>
      </div>

      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 size-48 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
    </div>
  );
}
