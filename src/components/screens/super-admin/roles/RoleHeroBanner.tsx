"use client";

import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export function RoleHeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50/90 via-sky-50/50 to-indigo-50/40 dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900 border border-blue-100/90 dark:border-slate-800 p-5 sm:p-6 shadow-2xs">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-400/15 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 right-10 w-60 h-60 bg-sky-300/15 dark:bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Content: Clean Left Headline & Large Right 3D Graphic */}
      <div className="relative z-10 flex items-center justify-between gap-4">
        {/* Left Copy: Concise & High Impact */}
        <div className="max-w-md min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[11px] font-bold uppercase tracking-wider border border-blue-200/60 dark:border-blue-800/40 shadow-2xs">
            <ShieldCheck className="size-3.5 text-blue-600 dark:text-blue-400" />
            <span>Secure Access</span>
          </div>

          <h3 className="text-xl sm:text-2xl lg:text-2.5xl font-extrabold text-foreground tracking-tight leading-tight mt-2 sm:mt-2.5">
            Right People. Right Access.
          </h3>

          <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-1.5 leading-relaxed font-normal">
            Granular access control and permission management.
          </p>
        </div>

        {/* Right Large Illustration */}
        <div className="relative flex items-center justify-end shrink-0 pr-1 sm:pr-4">
          <div className="relative h-24 sm:h-32 md:h-36 lg:h-40 aspect-[4/3] sm:aspect-[16/10] overflow-hidden select-none">
            <Image
              src="/assets/roletop.png"
              alt="Roles & Permissions"
              fill
              priority
              className="object-contain scale-110 drop-shadow-md transition-transform hover:scale-115 duration-300"
              sizes="(max-width: 640px) 150px, (max-width: 768px) 240px, 280px"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
