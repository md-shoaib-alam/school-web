import { CheckCircle2, Clock, XCircle, GraduationCap } from 'lucide-react';
import React from 'react';

export interface PromotionRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  rollNumber: string;
  fromClassId: string;
  fromClassName: string;
  fromClassGrade: string;
  toClassId: string;
  toClassName: string;
  toClassGrade: string;
  academicYear: string;
  status: string;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClassOption {
  id: string;
  name: string;
  section: string;
  grade: string;
  capacity: number;
  studentCount: number;
  classTeacher: string;
}

export interface StudentOption {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  classId: string;
}

export interface PromotionFormData {
  studentId: string;
  fromClassId: string;
  toClassId: string;
  academicYear: string;
  remarks: string;
}

export const statusConfig: Record<string, { bg: string; icon: React.ReactNode; label: string }> = {
  approved: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    icon: React.createElement(CheckCircle2, { className: "h-3.5 w-3.5" }),
    label: 'Approved',
  },
  pending: {
    bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    icon: React.createElement(Clock, { className: "h-3.5 w-3.5" }),
    label: 'Pending',
  },
  rejected: {
    bg: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    icon: React.createElement(XCircle, { className: "h-3.5 w-3.5" }),
    label: 'Rejected',
  },
  graduated: {
    bg: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800',
    icon: React.createElement(GraduationCap, { className: "h-3.5 w-3.5" }),
    label: 'Graduated',
  },
};

export function getCurrentAcademicYear(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  return m >= 3 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}
