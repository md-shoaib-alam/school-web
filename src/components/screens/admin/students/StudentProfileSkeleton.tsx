"use client";

import { Skeleton } from "@/components/ui/skeleton";

function FieldPair() {
  return (
    <div className="space-y-1.5">
      <Skeleton className="h-2.5 w-16" />
      <Skeleton className="h-4 w-28" />
    </div>
  );
}

function SectionCard({ rows = 6 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-xs">
      <div className="flex items-center gap-2.5 pb-3 border-b">
        <Skeleton className="size-8 rounded-lg" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="ml-auto h-6 w-16 rounded-lg" />
      </div>
      <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
        {Array.from({ length: rows }).map((_, i) => <FieldPair key={i} />)}
      </div>
    </div>
  );
}

export function StudentProfileSkeleton() {
  return (
    <div className="space-y-5 pb-6" role="status" aria-busy="true" aria-label="Loading student profile">
      <span className="sr-only">Loading student profile…</span>

      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-36 rounded-full" />
          <Skeleton className="hidden sm:block h-3 w-40" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="hidden sm:block h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-20 rounded-xl" />
          <Skeleton className="size-9 rounded-xl" />
        </div>
      </div>

      {/* Header card */}
      <div className="rounded-2xl border bg-card p-5 sm:p-7 shadow-xs">
        <div className="flex items-center gap-4 sm:gap-5">
          <Skeleton className="size-20 sm:size-24 rounded-full shrink-0" />
          <div className="flex-1 min-w-0 space-y-2.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-6 w-28 rounded-full" />
            <div className="flex gap-4">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3.5 w-24" />
            </div>
          </div>
          <div className="hidden lg:flex items-end gap-5 shrink-0">
            <Skeleton className="h-10 w-44" />
            <Skeleton className="h-24 w-32 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-card rounded-xl border px-2 py-2 flex items-center gap-1.5 overflow-hidden">
        {[72, 84, 92, 60, 92, 60].map((w, i) => (
          <Skeleton key={i} className="h-9 rounded-xl" style={{ width: w }} />
        ))}
      </div>

      {/* Overview section cards */}
      <SectionCard rows={6} />
      <SectionCard rows={6} />
      <SectionCard rows={4} />
    </div>
  );
}
