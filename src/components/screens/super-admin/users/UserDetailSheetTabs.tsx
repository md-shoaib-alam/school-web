import { Clock3, Settings, UserRound, Users2 } from "lucide-react";
import type { UserDetailTab } from "./user-detail-sheet-model";

interface UserDetailSheetTabsProps {
  activeTab: UserDetailTab;
  setActiveTab: (tab: UserDetailTab) => void;
  relationsLabel: string;
}

export function UserDetailSheetTabs({
  activeTab,
  setActiveTab,
  relationsLabel,
}: UserDetailSheetTabsProps) {
  return (
    <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-100 dark:border-zinc-800/80 text-xs sm:text-sm font-medium shrink-0">
      <button
        type="button"
        onClick={() => setActiveTab("overview")}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
          activeTab === "overview"
            ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
        }`}
      >
        <UserRound className="size-4" />
        <span>Overview</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab("activity")}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
          activeTab === "activity"
            ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
        }`}
      >
        <Clock3 className="size-4" />
        <span>Activity</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab("relations")}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
          activeTab === "relations"
            ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
        }`}
      >
        <Users2 className="size-4" />
        <span>{relationsLabel}</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab("settings")}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
          activeTab === "settings"
            ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
        }`}
      >
        <Settings className="size-4" />
        <span>Settings</span>
      </button>
    </div>
  );
}
