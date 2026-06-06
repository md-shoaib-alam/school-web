"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { cn } from "@/lib/utils";
import { 
  Search, 
  Baby, 
  GraduationCap, 
  UserCheck, 
  Coins, 
  Bell, 
  Clock, 
  Calendar, 
  LifeBuoy, 
  Sparkles 
} from "lucide-react";

interface QuickAction {
  label: string;
  screen: string;
  category: string;
  color: string;
  icon: React.ReactNode;
}

const parentQuickActions: QuickAction[] = [
  {
    label: "Children Profile",
    screen: "children",
    category: "Operations",
    color: "bg-blue-600 dark:bg-blue-500",
    icon: <Baby className="size-5" />
  },
  {
    label: "Fee Management",
    screen: "fees",
    category: "Operations",
    color: "bg-emerald-600 dark:bg-emerald-500",
    icon: <Coins className="size-5" />
  },
  {
    label: "Plan Subscription",
    screen: "subscription",
    category: "Operations",
    color: "bg-indigo-600 dark:bg-indigo-500",
    icon: <Sparkles className="size-5" />
  },
  {
    label: "View Grades",
    screen: "grades",
    category: "Academics",
    color: "bg-violet-600 dark:bg-violet-500",
    icon: <GraduationCap className="size-5" />
  },
  {
    label: "View Attendance",
    screen: "attendance",
    category: "Academics",
    color: "bg-teal-600 dark:bg-teal-500",
    icon: <UserCheck className="size-5" />
  },
  {
    label: "Timetable",
    screen: "timetable",
    category: "Academics",
    color: "bg-sky-600 dark:bg-sky-500",
    icon: <Clock className="size-5" />
  },
  {
    label: "School Notices",
    screen: "notices",
    category: "Support & Info",
    color: "bg-rose-600 dark:bg-rose-500",
    icon: <Bell className="size-5" />
  },
  {
    label: "School Calendar",
    screen: "calendar",
    category: "Support & Info",
    color: "bg-amber-600 dark:bg-amber-500",
    icon: <Calendar className="size-5" />
  },
  {
    label: "Support Tickets",
    screen: "tickets",
    category: "Support & Info",
    color: "bg-zinc-600 dark:bg-zinc-500",
    icon: <LifeBuoy className="size-5" />
  }
];

export function MinimalDashboard() {
  const { push } = useRouter();
  const { currentUser, currentTenantSlug, currentTenantId, setCurrentScreen } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("schoolsaas_parent_action_clicks");
        if (stored) {
          setClickCounts(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to load action clicks", e);
      }
    }
  }, []);

  const navigateTo = (screen: string) => {
    try {
      const updated = {
        ...clickCounts,
        [screen]: (clickCounts[screen] || 0) + 1
      };
      setClickCounts(updated);
      localStorage.setItem("schoolsaas_parent_action_clicks", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save action click", e);
    }

    setCurrentScreen(screen);
    const tid = currentTenantSlug || currentTenantId || currentUser?.tenantSlug || currentUser?.tenantId;
    if (tid) {
      push(`/${tid}/${screen}`);
    } else {
      push(`/${screen}`);
    }
  };

  const filteredQuickActions = parentQuickActions.filter((action) => {
    const query = searchQuery.toLowerCase();
    return action.label.toLowerCase().includes(query) || action.category.toLowerCase().includes(query);
  });

  // Get top 4 most used actions (clicked at least once)
  const recommendedActions = parentQuickActions
    .filter(action => (clickCounts[action.screen] || 0) > 0)
    .sort((a, b) => (clickCounts[b.screen] || 0) - (clickCounts[a.screen] || 0))
    .slice(0, 4);

  // Group actions by category
  const categoriesOrder = ["Academics", "Operations", "Support & Info"];

  const groupedActions = filteredQuickActions.reduce((acc, action) => {
    const cat = action.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(action);
    return acc;
  }, {} as Record<string, typeof filteredQuickActions>);

  return (
    <div className="space-y-6 w-full mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Quick Actions
        </h3>
        
        {/* Search bar */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-zinc-800 dark:text-zinc-200 shadow-sm transition-all"
          />
        </div>
      </div>

      {filteredQuickActions.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          No matching quick actions found.
        </p>
      ) : (
        <div className="space-y-8">
          {/* Recommended / Most Used section */}
          {recommendedActions.length > 0 && !searchQuery && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Recommended / Most Used
                </h4>
                <div className="h-px flex-1 bg-amber-100 dark:bg-amber-950/50" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {recommendedActions.map((action) => (
                  <button
                    key={`rec-${action.screen}`}
                    type="button"
                    onClick={() => navigateTo(action.screen)}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl border border-amber-100 dark:border-amber-950/30 hover:shadow-lg transition-all bg-amber-50/25 dark:bg-amber-950/10 hover:border-amber-200 dark:hover:border-amber-900/50 text-center group gap-3 cursor-pointer"
                  >
                    <div
                      className={`p-3.5 rounded-xl text-white ${action.color} transition-transform group-hover:scale-110 shadow-md`}
                    >
                      {action.icon}
                    </div>
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {categoriesOrder.map((category) => {
            const actions = groupedActions[category];
            if (!actions || actions.length === 0) return null;

            return (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    {category}
                  </h4>
                  <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {actions.map((action) => (
                    <button
                      key={action.screen}
                      type="button"
                      onClick={() => navigateTo(action.screen)}
                      className="flex flex-col items-center justify-center p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-all bg-white dark:bg-zinc-950 hover:border-transparent text-center group gap-3 cursor-pointer"
                    >
                      <div
                        className={`p-3.5 rounded-xl text-white ${action.color} transition-transform group-hover:scale-110 shadow-md`}
                      >
                        {action.icon}
                      </div>
                      <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
