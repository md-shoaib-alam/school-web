"use client";

import { Users, ChevronRight } from "lucide-react";

interface StudentSiblingsCardProps {
  siblings: any[];
  onSelectStudent?: (studentId: string) => void;
}

export function StudentSiblingsCard({ siblings, onSelectStudent }: StudentSiblingsCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* ────────────────────────────────────────────────────────── */}
      {/* CARD 4: Siblings (View Only - No Edit Button)             */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100 dark:border-zinc-800/60">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm sm:text-base">
          <Users className="size-4 text-emerald-600" />
          Siblings
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
          {siblings.length} {siblings.length === 1 ? "Sibling" : "Siblings"}
        </span>
      </div>

      <div className="space-y-2.5">
        {siblings.map((sib: any) => {
          const sibInitials = sib.name
            ? sib.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            : "ST";
          return (
            <div
              key={sib.id}
              onClick={() => onSelectStudent && onSelectStudent(sib.id)}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-800 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20 hover:border-emerald-200/80 dark:hover:border-emerald-800/60 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="size-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                  {sibInitials}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    {sib.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {sib.gender === "female" ? "Sister" : "Brother"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                    {sib.className || "Unassigned"}
                  </p>
                  {sib.rollNumber && (
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Roll No: {sib.rollNumber}
                    </p>
                  )}
                </div>
                <ChevronRight className="size-4 text-slate-400 dark:text-zinc-500 shrink-0" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
