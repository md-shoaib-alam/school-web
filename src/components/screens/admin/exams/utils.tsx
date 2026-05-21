'use client';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { parseLocalDate } from '@/lib/utils';
import { ExamRecord, ExamFormData } from './types';

export const statusConfig: Record<string, { bg: string; label: string }> = {
  scheduled: { bg: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800', label: 'Scheduled' },
  ongoing: { bg: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800', label: 'Ongoing' },
  completed: { bg: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800', label: 'Published' },
  cancelled: { bg: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800', label: 'Cancelled' },
};

export const examTypeConfig: Record<string, { bg: string; label: string }> = {
  unit_test: { bg: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800', label: 'Unit Test' },
  midterm: { bg: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800', label: 'Midterm' },
  final: { bg: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800', label: 'Final' },
  quiz: { bg: 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800', label: 'Quiz' },
  practical: { bg: 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800', label: 'Practical' },
};

export const emptyExamForm: ExamFormData = {
  classId: '', subjectId: '', examType: 'midterm', name: '',
  date: '', startTime: '', endTime: '', totalMarks: '100', passingMarks: '40',
  academicYear: ''
};

export function TabLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <Skeleton className="h-[500px] w-full rounded-xl" />
    </div>
  );
}

export const formatDate = (d: string) => {
  if (!d) return '--';
  const parsed = parseLocalDate(d);
  return parsed ? parsed.toLocaleDateString() : d || '--';
};

export const formatTime = (t: any) => t || '--:--';

export const getStatusBadge = (s: string) => (
  <Badge className={statusConfig[s]?.bg}>{statusConfig[s]?.label || s}</Badge>
);

export const getExamTypeBadge = (t: string) => (
  <Badge className={examTypeConfig[t]?.bg}>{examTypeConfig[t]?.label || t}</Badge>
);

export const getGroupedExams = (examsList: ExamRecord[]) => {
  const groups: Record<string, { cycleName: string; academicYear: string; exams: ExamRecord[] }> = {};
  
  examsList.forEach(exam => {
    const cycleName = exam.name.includes(' - ') ? exam.name.split(' - ')[0] : exam.name;
    const academicYear = exam.academicYear || '2024-2025';
    const key = `${cycleName}::${academicYear}`;
    
    if (!groups[key]) {
      groups[key] = {
        cycleName,
        academicYear,
        exams: []
      };
    }
    groups[key].exams.push(exam);
  });
  
  return Object.values(groups).sort((a, b) => {
    if (a.academicYear !== b.academicYear) {
      return b.academicYear.localeCompare(a.academicYear);
    }
    return a.cycleName.localeCompare(b.cycleName);
  });
};
