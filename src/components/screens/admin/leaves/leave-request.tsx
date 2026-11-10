'use client';

import { Clock, CheckCircle2, XCircle, Ban } from 'lucide-react';

// ── Shared Config ──

export const statusConfig: Record<string, { bg: string; icon: React.ReactNode; label: string }> = {
  pending: {
    bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200/80 dark:border-amber-800',
    icon: <Clock className="size-3 mr-1" />,
    label: 'Pending'
  },
  approved: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800',
    icon: <CheckCircle2 className="size-3 mr-1" />,
    label: 'Approved'
  },
  rejected: {
    bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-800',
    icon: <XCircle className="size-3 mr-1" />,
    label: 'Rejected'
  },
  cancelled: {
    bg: 'bg-muted text-foreground ',
    icon: <Ban className="size-3 mr-1" />,
    label: 'Cancelled'
  },
};

export const leaveTypeConfig: Record<string, { bg: string; label: string }> = {
  casual: { bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200/70', label: 'Casual' },
  sick: { bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200/70', label: 'Sick' },
  earned: { bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/70', label: 'Earned' },
  maternity: { bg: 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-400 border-pink-200/70', label: 'Maternity' },
  paternity: { bg: 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border-violet-200/70', label: 'Paternity' },
  duty: { bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200/70', label: 'Duty Leave' },
};

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: string;
  approverRemarks?: string;
  createdAt: string;
}

export type LeaveSortField = 'userName' | 'leaveType' | 'startDate' | 'status' | 'createdAt';

// Server-side caps for the min/dropdown endpoints used by the applicant picker.
export const CANDIDATE_LIMITS: Record<string, number> = { student: 100, teacher: 200, staff: 200 };

export function getDurationDays(start: string, end: string): number {
  try {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  } catch {
    return 1;
  }
}

export function formatDateString(d: string | undefined): string {
  if (!d) return '–';
  try {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return d;
  }
}
