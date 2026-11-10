"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { SubscriptionAlert } from "../dashboard_components/SubscriptionAlert";

interface MinimalDashboardProps {
  filteredQuickActions: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  navigateTo: (screen: string) => void;
  isExpired: boolean;
  isExpiringSoon: boolean;
  daysRemaining: number | null;
  tenantId: string | null;
  currentTenantSlug: string | null;
}

export function MinimalDashboard({
  filteredQuickActions,
  searchQuery,
  setSearchQuery,
  navigateTo,
  isExpired,
  isExpiringSoon,
  daysRemaining,
  tenantId,
  currentTenantSlug,
}: MinimalDashboardProps) {
  // Group actions by category
  const groupedActions = filteredQuickActions.reduce((acc: Record<string, any[]>, action) => {
    const category = action.category || "General";
    if (!acc[category]) acc[category] = [];
    acc[category].push(action);
    return acc;
  }, {});

  const categories = Object.keys(groupedActions);

  return (
    <div className="space-y-10 w-full pb-20">
      <SubscriptionAlert 
        isExpired={isExpired}
        isExpiringSoon={isExpiringSoon}
        daysRemaining={daysRemaining}
        onRenew={() => window.location.href = `/${currentTenantSlug || tenantId}/school-subscription`}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            Quick Actions
          </h3>
        </div>
        
        {/* Search bar */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search actions (e.g. 'fees', 'exam')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border  bg-card focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-foreground shadow-sm transition-all"
          />
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-muted rounded-3xl border border-dashed ">
          <Search className="size-10 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-sm font-medium">
            No matching quick actions found for "{searchQuery}"
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {categories.map((category) => (
            <div key={category} className="space-y-6">
              <div className="flex items-center gap-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  {category}
                </h4>
                <div className="h-px w-full bg-muted" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                {groupedActions[category].map((action) => (
                  <button
                    key={action.screen}
                    type="button"
                    onClick={() => navigateTo(action.screen)}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl border  hover:shadow-lg transition-all bg-card hover:border-transparent text-center group gap-3 cursor-pointer"
                  >
                    <div
                      className={`p-3.5 rounded-xl text-white ${action.color} transition-transform group-hover:scale-110 shadow-md`}
                    >
                      {action.icon}
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
