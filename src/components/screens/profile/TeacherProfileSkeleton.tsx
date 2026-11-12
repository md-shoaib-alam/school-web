"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function TeacherProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 animate-in fade-in duration-200">
      {/* ─── Header Section Skeleton ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Skeleton className="size-11 rounded-2xl shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-36 rounded-lg" />
            <Skeleton className="h-4 w-52 rounded-md" />
          </div>
        </div>

        <Skeleton className="h-9 w-28 rounded-xl shrink-0" />
      </div>

      {/* ─── Navigation Tabs Bar Skeleton ─── */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-28 rounded-xl" />
        <Skeleton className="h-9 w-32 rounded-xl" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      {/* ─── Main Identity Card Skeleton ─── */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <Skeleton className="size-20 sm:size-24 rounded-2xl shrink-0" />

        <div className="min-w-0 flex-1 space-y-2.5 w-full">
          <Skeleton className="h-7 w-52 rounded-lg" />

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          <Skeleton className="h-3.5 w-28 rounded pt-0.5" />
        </div>
      </div>

      {/* ─── Section: Basic Information Skeleton ─── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Skeleton className="size-6 rounded-md" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 gap-y-7">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="size-8 rounded-lg shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-4 w-28 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Section: Contact Information Skeleton ─── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Skeleton className="size-6 rounded-md" />
          <Skeleton className="h-4 w-36 rounded" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="size-8 rounded-lg shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3 w-16 rounded" />
                  <Skeleton className="h-4 w-44 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Section: Statutory Information Skeleton ─── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Skeleton className="size-6 rounded-md" />
          <Skeleton className="h-4 w-40 rounded" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>

          <div className="border-t border-border/60" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="size-8 rounded-lg shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-4 w-28 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

