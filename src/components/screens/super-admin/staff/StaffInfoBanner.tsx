import { Shield } from "lucide-react";

export function StaffInfoBanner() {
  return (
    <div className="rounded-2xl border-2 border-teal-100 bg-teal-50/50 dark:bg-teal-950/20 dark:border-teal-800/30 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center shrink-0 shadow-inner">
          <Shield className="h-5 w-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div className="text-sm">
          <p className="font-black text-teal-900 dark:text-teal-100 uppercase tracking-widest text-[10px] mb-1">
            Security Context: Platform Staff Accounts
          </p>
          <p className="text-teal-700/80 dark:text-teal-400/80 font-medium leading-relaxed">
            Staff members have restricted access based on their assigned platform role. They can log in via the 
            <span className="font-bold mx-1 opacity-100 text-teal-900 dark:text-teal-100 underline decoration-teal-500/30 underline-offset-4">&quot;Email Login&quot;</span> 
            tab. The root platform owner account is protected and not displayed in this directory for security.
          </p>
        </div>
      </div>
    </div>
  );
}
