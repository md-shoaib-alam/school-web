'use client';

import { Button } from '@/components/ui/button';
import { Calendar, Plus } from 'lucide-react';

interface LeaveManagementHeroProps {
  roleLabel: string;
  onNewLeaveRequest: () => void;
}

export function LeaveManagementHero({ roleLabel, onNewLeaveRequest }: LeaveManagementHeroProps) {
  return (
    <div className="relative rounded-3xl p-6 sm:p-7 overflow-hidden border border-blue-100/90 dark:border-blue-900/40 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-blue-50/80 dark:from-blue-950/20 dark:via-zinc-900/60 dark:to-blue-950/20 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5 sm:gap-4 z-10">
        <div className="size-12 rounded-2xl bg-blue-100/90 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60 shadow-xs shrink-0">
          <Calendar className="size-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="space-y-0.5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Leave Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Review and manage leave requests from {roleLabel}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 z-10 w-full md:w-auto justify-between md:justify-end">
        <img
          src="/assets/admin/timetable.avif"
          alt="Leave Illustration"
          className="h-24 sm:h-28 object-contain pointer-events-none select-none drop-shadow-xs hidden md:block"
        />
        <Button
          onClick={onNewLeaveRequest}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-4 font-semibold shadow-md shadow-blue-600/25 transition-all gap-2 shrink-0 cursor-pointer active:scale-95"
        >
          <Plus className="size-4" strokeWidth={2.5} />
          <span>New Leave Request</span>
        </Button>
      </div>

      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 size-48 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
    </div>
  );
}
