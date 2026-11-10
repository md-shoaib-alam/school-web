import { Button } from "@/components/ui/button";
import { Calendar, Clock, Loader2, Power, Shield } from "lucide-react";
import { formatDateShort } from "./user-detail-sheet-model";

interface UserAccountStatusSectionProps {
  isActive: boolean;
  createdAt: string;
  toggling: boolean;
  formatDateTime: (val: string) => string;
  setConfirmStatusDialogOpen: (open: boolean) => void;
}

export function UserAccountStatusSection({
  isActive,
  createdAt,
  toggling,
  formatDateTime,
  setConfirmStatusDialogOpen,
}: UserAccountStatusSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Shield className="size-4 text-emerald-600" />
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
          Account Status
        </h3>
      </div>

      {/* Status Toggle Card */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
        <div className="min-w-0">
          {isActive ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 shrink-0">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Active Account
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/80 shrink-0">
              <Clock className="size-3 text-amber-500" />
              Inactive Account
            </span>
          )}
          <p className="hidden sm:block text-xs text-slate-400 dark:text-slate-500 mt-1.5">
            {isActive
              ? "This account is active and can access the platform."
              : "This account is currently suspended and cannot log in."}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={toggling}
          onClick={() => setConfirmStatusDialogOpen(true)}
          className={`h-8 sm:h-9 px-3 sm:px-4 rounded-xl text-xs font-semibold gap-1.5 shadow-2xs transition-colors shrink-0 ${
            isActive
              ? "border-red-200 dark:border-red-900/50 bg-red-50/60 hover:bg-red-100/80 text-red-600 dark:text-red-400 dark:bg-red-950/30"
              : "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-950/30"
          }`}
        >
          {toggling ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Power className="size-3.5" />
          )}
          <span>{isActive ? "Deactivate" : "Activate"}</span>
        </Button>
      </div>

      {/* 2-Col Dates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Joined Date Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80 flex items-center gap-3">
          <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Calendar className="size-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Joined Date</p>
            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {formatDateShort(createdAt)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Account creation date</p>
          </div>
        </div>

        {/* Last Login Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80 flex items-center gap-3">
          <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Clock className="size-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Last Login</p>
            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {formatDateTime(createdAt)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Last active on platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}
