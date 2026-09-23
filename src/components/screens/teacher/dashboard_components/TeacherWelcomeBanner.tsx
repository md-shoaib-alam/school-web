'use client';

import React from 'react';
import Image from 'next/image';

interface TeacherWelcomeBannerProps {
  userName: string;
}

export function TeacherWelcomeBanner({ userName }: TeacherWelcomeBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-3.5 sm:py-4 px-4 sm:px-6 shadow-xs">
      {/* Subtle ambient background glow */}
      <div className="absolute top-0 right-1/4 w-60 h-60 bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left Section: Greeting & Info */}
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <span className="text-[11px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Welcome back,
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight mt-0.5">
            {userName}
          </h1>
          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1 sm:line-clamp-none">
            Here&apos;s what&apos;s happening with your classes today.
          </p>
        </div>

        {/* Right Section: teachertop.avif Image */}
        <div className="relative w-28 sm:w-36 md:w-44 h-20 sm:h-24 md:h-28 shrink-0 flex items-center justify-end">
          <Image
            src="/assets/teacher/teachertop.avif"
            alt="Teacher illustration"
            fill
            className="object-contain select-none pointer-events-none"
            priority
          />
        </div>
      </div>
    </div>
  );
}
