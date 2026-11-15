'use client';

import React from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';

interface TeacherSubjectsProps {
  subjects: any[];
  onNavigate?: (screen: string) => void;
}

const colorCycles = [
  {
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-100/80 dark:border-blue-900/40',
  },
  {
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-100/80 dark:border-emerald-900/40',
  },
  {
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-100/80 dark:border-amber-900/40',
  },
  {
    bg: 'bg-purple-50 dark:bg-purple-950/50',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-100/80 dark:border-purple-900/40',
  },
];

export function TeacherSubjects({ subjects, onNavigate }: TeacherSubjectsProps) {
  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 sm:size-4.5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-base font-semibold text-foreground">
            My Subjects
          </h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100/80 dark:border-blue-900/40">
            {subjects.length} subjects
          </span>
        </div>

        <button
          onClick={() => onNavigate?.('my-subjects')}
          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
        >
          View All →
        </button>
      </div>

      {/* Subjects List */}
      <div className="divide-y divide-border mt-1.5">
        {subjects.slice(0, 5).map((subject, idx) => {
          const color = colorCycles[idx % colorCycles.length];
          return (
            <div
              key={subject.id || idx}
              onClick={() => onNavigate?.('my-subjects')}
              className="flex items-center justify-between py-2 sm:py-2.5 px-1 sm:px-1.5 rounded-xl hover:bg-accent/60 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`size-8 sm:size-9 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${color.bg} ${color.text} ${color.border}`}
                >
                  <BookOpen className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {subject.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {subject.className} {subject.code ? `• ${subject.code}` : ''}
                  </p>
                </div>
              </div>

              <ChevronRight className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
          );
        })}

        {subjects.length === 0 && (
          <div className="text-center py-6">
            <BookOpen className="size-8 text-muted-foreground mx-auto mb-1.5" />
            <p className="text-sm font-semibold text-foreground">
              No subjects assigned
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Contact your administrator to assign subjects
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
