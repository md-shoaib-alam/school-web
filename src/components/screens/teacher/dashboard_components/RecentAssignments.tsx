'use client';

import React from 'react';
import { FileText, Calendar, Users, ChevronRight } from 'lucide-react';

interface RecentAssignmentsProps {
  assignments: any[];
  onViewAll: () => void;
  formatDate: (date: string) => string;
}

export function RecentAssignments({
  assignments,
  onViewAll,
  formatDate,
}: RecentAssignmentsProps) {
  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b">
        <div className="flex items-center gap-2">
          <FileText className="size-4 sm:size-4.5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-base font-semibold text-foreground">
            Recent Homework
          </h2>
        </div>

        <button
          onClick={onViewAll}
          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
        >
          View All →
        </button>
      </div>

      {/* Homework Cards List */}
      <div className="space-y-2.5 mt-2.5">
        {assignments.slice(0, 3).map((assignment) => {
          const isOverdue = new Date(assignment.dueDate) < new Date();
          const total = assignment.totalStudents || 20;
          const submissions = assignment.submissions || 0;
          const progressPct = total > 0 ? Math.round((submissions / total) * 100) : 0;

          return (
            <div
              key={assignment.id}
              onClick={onViewAll}
              className="p-3 sm:p-3.5 rounded-xl border bg-muted hover:bg-muted transition-all group cursor-pointer shadow-2xs"
            >
              {/* Top Row: Icon + Title + Overdue Pill */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 sm:size-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <FileText className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {assignment.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {assignment.subjectName} {assignment.className ? `• ${assignment.className}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                      isOverdue
                        ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200/80 dark:border-rose-900/40'
                        : 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-200/80 dark:border-blue-900/40'
                    }`}
                  >
                    {isOverdue ? 'Overdue' : 'Active'}
                  </span>
                  <ChevronRight className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Description */}
              {assignment.description && (
                <p className="text-xs text-foreground mt-2 line-clamp-1">
                  {assignment.description}
                </p>
              )}

              {/* Progress Bar & Submissions count */}
              <div className="mt-2.5 flex items-center gap-2.5">
                <div className="flex-1 bg-muted dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground shrink-0">
                  {submissions}/{total} submitted
                </span>
              </div>

              {/* Bottom Meta */}
              <div className="flex items-center gap-3.5 mt-2.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3 text-muted-foreground" />
                  Due: {formatDate(assignment.dueDate)}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="size-3 text-muted-foreground" />
                  {total} students
                </span>
              </div>
            </div>
          );
        })}

        {assignments.length === 0 && (
          <div className="text-center py-6">
            <FileText className="size-8 text-muted-foreground mx-auto mb-1.5" />
            <p className="text-sm font-semibold text-foreground">
              No recent homework
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              All assigned exercises and homework are up to date
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
