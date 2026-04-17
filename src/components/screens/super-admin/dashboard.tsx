"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Sub-components
import { DashboardHero } from "./dashboard/DashboardHero";
import { StatusCards } from "./dashboard/StatusCards";
import { GrowthCharts } from "./dashboard/GrowthCharts";
import { TopPerformance } from "./dashboard/TopPerformance";
import { ActivityLogs } from "./dashboard/ActivityLogs";

export function SuperAdminDashboard() {
  const { data, isLoading: loading, error, isError } = useQuery({
    queryKey: ["platform", "dashboard"],
    queryFn: async () => {
      const res = await apiFetch("/api/platform");
      if (!res.ok) throw new Error("Failed to fetch platform dashboard");
      return res.json();
    },
  });

  const handleNavigate = (screen: string) => {
    window.dispatchEvent(
      new CustomEvent("super-admin-navigate", {
        detail: screen,
      }),
    );
  };

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/30 max-w-md w-full rounded-3xl overflow-hidden shadow-2xl">
          <CardContent className="p-8 text-center text-red-600">
            <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <p className="text-xl font-black mb-2">System Sync Failed</p>
            <p className="text-sm font-medium opacity-80 mb-6">
              {error?.message || "We encountered a network error while syncing platform data."}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-black text-sm hover:bg-red-700 transition-colors"
            >
              Retry Connection
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <DashboardHero loading={loading} data={data} />

      <StatusCards 
        loading={loading} 
        data={data} 
        onNavigate={handleNavigate} 
      />

      <GrowthCharts loading={loading} data={data} />

      <TopPerformance loading={loading} data={data} />

      <ActivityLogs loading={loading} data={data} />
    </div>
  );
}
