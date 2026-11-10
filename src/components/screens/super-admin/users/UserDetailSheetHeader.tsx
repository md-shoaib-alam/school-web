import { Clock, UserRound, X } from "lucide-react";
import type { RoleConfigEntry } from "./user-detail-sheet-model";

interface UserDetailSheetHeaderProps {
  initials: string;
  name: string;
  isActive: boolean;
  roleConf: RoleConfigEntry;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailSheetHeader({
  initials,
  name,
  isActive,
  roleConf,
  onOpenChange,
}: UserDetailSheetHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 pb-2 shrink-0">
      {/* Large Avatar & Name Header */}
      <div className="flex items-start gap-4">
        <div className="size-20 rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 text-white font-bold text-2xl flex items-center justify-center shadow-md shrink-0">
          {initials}
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
            {name}
          </h2>
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <UserRound className="size-3.5 text-slate-400" />
            <span>{roleConf.label} Account</span>
          </div>

          {/* Status and Role Badges */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            {isActive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Active Account
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60">
                <Clock className="size-3 text-amber-500" />
                Inactive
              </span>
            )}

            <span
              className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold border ${roleConf.bg} ${roleConf.color}`}
            >
              {roleConf.icon}
              {roleConf.label}
            </span>
          </div>
        </div>
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={() => onOpenChange(false)}
        className="size-9 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-500 transition-colors shrink-0 self-start cursor-pointer"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
