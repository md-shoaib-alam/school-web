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
    <div className="flex items-center gap-2 px-6 pt-4 border-b  text-xs sm:text-sm font-medium shrink-0">
      <button
        type="button"
        onClick={() => setActiveTab("overview")}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] ${
          activeTab === "overview"
            ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold"
            : "text-foreground hover:text-foreground"
        }`}
      >
        <UserRound className="size-4" />
        <span>Overview</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab("activity")}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] ${
          activeTab === "activity"
            ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold"
            : "text-foreground hover:text-foreground"
        }`}
      >
        <Clock3 className="size-4" />
        <span>Activity</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab("relations")}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] ${
          activeTab === "relations"
            ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold"
            : "text-foreground hover:text-foreground"
        }`}
      >
        <Users2 className="size-4" />
        <span>{relationsLabel}</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab("settings")}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] ${
          activeTab === "settings"
            ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold"
            : "text-foreground hover:text-foreground"
        }`}
      >
        <Settings className="size-4" />
        <span>Settings</span>
      </button>
    </div>
  );
}
