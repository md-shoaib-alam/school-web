"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function AttendanceSkeleton() {
  return (
    <div className="space-y-6 pb-10 animate-fade-in select-none">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b pb-5">
        <div className="space-y-3.5">
          <div className="flex items-center gap-2">
            <Skeleton className="size-5 rounded-md" />
            <Skeleton className="h-5 w-44 rounded-md" />
          </div>
          {/* Child selector chips/dropdown skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-32 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>

      {/* Main 2-Column Grid (Calendar on Left, Stats + Today Card on Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Calendar Card Skeleton */}
        <div className="order-2 md:order-1 md:col-span-7 xl:col-span-7">
          <div className="rounded-[28px] sm:rounded-[30px] p-3.5 sm:p-5 bg-gradient-to-b from-[#FBFBFB] to-[#ECECED] dark:from-[#2A2A2D] dark:to-[#1F1F22] border border-[#DCDCDF] dark:border-[#38383D] shadow-md space-y-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between px-1.5 pt-0.5">
              <Skeleton className="h-7 w-36 rounded-lg" />
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-full" />
              </div>
            </div>

            {/* Inner Calendar Card */}
            <div className="rounded-[24px] sm:rounded-[26px] bg-white dark:bg-[#1C1C1F] p-3.5 sm:p-5 border border-[#ECECED] dark:border-[#2A2A2E] shadow-sm space-y-3.5">
              {/* Day names row */}
              <div className="grid grid-cols-7 gap-1.5 pb-2.5 border-b border-dashed border-[#DCDCDF] dark:border-[#38383D]">
                {[...Array(7)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-7 sm:w-9 mx-auto rounded" />
                ))}
              </div>

              {/* Stats chip capsules */}
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-8 flex-1 rounded-full" />
                <Skeleton className="h-8 flex-1 rounded-full" />
              </div>

              {/* 5-row x 7-column Calendar Cells */}
              <div className="space-y-1.5">
                {[...Array(5)].map((_, rowIdx) => (
                  <div key={rowIdx} className="grid grid-cols-7 gap-1.5">
                    {[...Array(7)].map((_, colIdx) => (
                      <Skeleton
                        key={colIdx}
                        className="aspect-square sm:aspect-auto sm:h-12 w-full rounded-[14px]"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 3 Square Stats Cards + Today Attendance Card */}
        <div className="order-1 md:order-2 md:col-span-5 xl:col-span-5 space-y-4 sm:space-y-6">
          {/* 3 Square Stat Cards */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 select-none">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-[20px] sm:rounded-[22px] border border-border/60 bg-white dark:bg-[#1C1C1F] p-2.5 sm:p-3.5 flex flex-col items-center justify-center gap-2 shadow-xs"
              >
                <Skeleton className="size-7 sm:size-8 rounded-full" />
                <Skeleton className="h-6 w-10 sm:w-12 rounded-md" />
                <Skeleton className="h-3 w-12 sm:w-14 rounded" />
              </div>
            ))}
          </div>

          {/* Today Attendance Card Skeleton */}
          <div className="rounded-[22px] sm:rounded-[24px] border border-[#ECECED] dark:border-[#2A2A2E] bg-white dark:bg-[#1C1C1F] p-4 sm:p-5 shadow-sm space-y-3">
            <Skeleton className="h-5 w-36 rounded-md" />
            <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-[16px] bg-[#F4F4F5] dark:bg-[#26262A] border border-[#ECECED] dark:border-[#38383D]/60">
              <div className="flex items-center gap-2.5">
                <Skeleton className="size-2.5 rounded-full" />
                <Skeleton className="h-4 w-32 rounded-md" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Attendance Chart Skeleton */}
      <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-36 rounded-md" />
              <Skeleton className="h-3 w-48 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-52 sm:h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}
