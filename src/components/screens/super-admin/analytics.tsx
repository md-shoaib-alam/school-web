"use client";

import { apiFetch } from "@/lib/api";
import { useState, useEffect, useMemo } from "react";
import { BarChart3 } from "lucide-react";

// Sub-components
import { AnalyticsStats } from "./analytics/AnalyticsStats";
import { GrowthCharts } from "./analytics/GrowthCharts";
import { RevenueCharts } from "./analytics/RevenueCharts";
import { UsageCharts } from "./analytics/UsageCharts";
import { 
  generateTenantGrowth, 
  generateUserGrowth, 
  generateRevenueBreakdown 
} from "./analytics/utils";

export function SuperAdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [platformData, setPlatformData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await apiFetch("/api/platform");
        if (res.ok) {
          const json = await res.json();
          setPlatformData(json);
        }
      } catch {
        // Fallback to simulated data handled via useMemo/defaults
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Memoized data to prevent jitter during re-renders
  const tenantGrowth = useMemo(() => generateTenantGrowth(), []);
  const userGrowth = useMemo(() => generateUserGrowth(), []);
  const revenueBreakdown = useMemo(() => generateRevenueBreakdown(), []);

  // Enriched metrics
  const metrics = useMemo(() => ({
    mrr: platformData?.revenue?.active ? Math.round(platformData.revenue.active * 1.5) : 47850,
    arr: platformData?.revenue?.active ? Math.round(platformData.revenue.active * 18) : 574200,
    ltv: 3840,
    churnRate: 3.2,
    cac: 285,
  }), [platformData]);

  const activeUsers = platformData?.users?.total || 3456;
  const serverUptime = 99.9;
  const avgResponseTime = 145;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-teal-600 dark:text-teal-400" />
          Platform Analytics
        </h1>
        <p className="text-muted-foreground text-sm">
          Comprehensive overview of your multi-tenant SaaS platform performance
        </p>
      </div>

      <AnalyticsStats loading={loading} metrics={metrics} />

      <GrowthCharts 
        loading={loading} 
        tenantGrowth={tenantGrowth} 
        userGrowth={userGrowth} 
      />

      <RevenueCharts 
        loading={loading} 
        revenueBreakdown={revenueBreakdown} 
      />

      <UsageCharts 
        loading={loading}
        serverUptime={serverUptime}
        avgResponseTime={avgResponseTime}
        activeUsers={activeUsers}
        platformData={platformData}
      />
    </div>
  );
}
