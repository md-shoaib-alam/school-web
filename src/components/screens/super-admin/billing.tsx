"use client";

import { useState, useMemo } from "react";
import { useBillingData } from "@/lib/graphql/hooks";

// Sub-components
import { BillingHeader } from "./billing/BillingHeader";
import { MetricCards } from "./billing/MetricCards";
import { RevenueTrends } from "./billing/RevenueTrends";
import { DistributionCharts } from "./billing/DistributionCharts";
import { TenantBillingTable } from "./billing/TenantBillingTable";
import { TransactionTable } from "./billing/TransactionTable";

// Types & Config
import { 
  SortKey, 
  SortDir, 
  DONUT_COLORS, 
  STATUS_COLORS, 
  statusConfig, 
  paymentMethodConfig 
} from "./billing/types";

export function SuperAdminBilling() {
  const { data, isLoading: loading, refetch: fetchBilling } = useBillingData();

  const [sortKey, setSortKey] = useState<SortKey>("activeRevenue");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // ── Computed Calculations ──
  const totalSubscriptions = data?.subscriptions?.length ?? 0;
  const totalStatusCount = data?.statusDistribution
    ? Object.values(data.statusDistribution).reduce((s: number, v: any) => s + v, 0)
    : 0;
  const activeCount = data?.statusDistribution?.active ?? 0;
  const expiredCount = data?.statusDistribution?.expired ?? 0;
  const cancelledCount = data?.statusDistribution?.cancelled ?? 0;
  const churnedSubscriptions = expiredCount + cancelledCount;

  const totalRevenue = useMemo(() => {
    const revenueData = data?.methodRevenue;
    if (!revenueData || typeof revenueData !== 'object') return 0;
    return Object.values(revenueData).reduce((s, m: any) => s + (m?.revenue || 0), 0);
  }, [data]);

  const mrr = data?.totalActiveRevenue ?? 0;

  const avgRevenuePerTenant = useMemo(() => {
    if (!data?.tenantBilling?.length) return 0;
    return Math.round(totalRevenue / data.tenantBilling.length);
  }, [data, totalRevenue]);

  const revenueGrowth = useMemo(() => {
    if (!data?.monthlyTrend?.length || data.monthlyTrend.length < 2) return null;
    const last = data.monthlyTrend[data.monthlyTrend.length - 1].revenue;
    const prev = data.monthlyTrend[data.monthlyTrend.length - 2].revenue;
    if (prev === 0) return null;
    return Math.round(((last - prev) / prev) * 100);
  }, [data]);

  const churnRate = useMemo(() => {
    if (totalStatusCount === 0) return 0;
    return Math.round((churnedSubscriptions / totalStatusCount) * 100);
  }, [churnedSubscriptions, totalStatusCount]);

  // ── Chart Data Preparation ──
  const planChartData = useMemo(() => {
    const plans = data?.planRevenue;
    if (!plans || typeof plans !== 'object') return [];
    return Object.entries(plans)
      .filter(([_, v]: [string, any]) => v?.count > 0)
      .map(([plan, v]: [string, any]) => ({ plan, revenue: v.revenue, count: v.count }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [data]);

  const methodChartData = useMemo(() => {
    const methods = data?.methodRevenue;
    if (!methods || typeof methods !== 'object') return [];
    return Object.entries(methods)
      .filter(([_, v]: [string, any]) => v?.count > 0)
      .map(([method, v]: [string, any]) => ({
        method: paymentMethodConfig[method]?.label || method,
        count: v.count,
        revenue: v.revenue,
        fill: DONUT_COLORS[method] || "#94a3b8",
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [data]);

  const statusChartData = useMemo(() => {
    const statusDist = data?.statusDistribution;
    if (!statusDist || typeof statusDist !== 'object') return [];
    return Object.entries(statusDist)
      .filter(([_, v]: [string, any]) => v > 0)
      .map(([status, count]: [string, any]) => ({
        status: statusConfig[status]?.label || status,
        count,
        fill: STATUS_COLORS[status] || "#94a3b8",
      }));
  }, [data]);

  // ── Table Data Preparation ──
  const sortedTenants = useMemo(() => {
    const list = data?.tenantBilling;
    if (!Array.isArray(list)) return [];
    
    const tenants = [...list];
    tenants.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortKey) {
        case "activeRevenue": return dir * ((a.activeRevenue || 0) - (b.activeRevenue || 0));
        case "totalRevenue": return dir * ((a.totalRevenue || 0) - (b.totalRevenue || 0));
        case "name": return dir * (a.name || "").localeCompare(b.name || "");
        case "activeSubscriptions": return dir * ((a.activeSubscriptions || 0) - (b.activeSubscriptions || 0));
        default: return 0;
      }
    });
    return tenants;
  }, [data, sortKey, sortDir]);

  const recentTransactions = useMemo(() => {
    const list = data?.subscriptions;
    if (!Array.isArray(list)) return [];
    return list.slice(0, 20);
  }, [data]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div className="space-y-6">
      <BillingHeader 
        loading={loading}
        totalRevenue={totalRevenue}
        totalActiveRevenue={data?.totalActiveRevenue ?? 0}
        mrr={mrr}
        revenueGrowth={revenueGrowth}
        churnRate={churnRate}
        churnedSubscriptions={churnedSubscriptions}
        onRefresh={fetchBilling}
      />

      <MetricCards 
        loading={loading}
        totalActiveRevenue={data?.totalActiveRevenue ?? 0}
        activeCount={activeCount}
        mrr={mrr}
        revenueGrowth={revenueGrowth}
        totalSubscriptions={totalSubscriptions}
        churnedSubscriptions={churnedSubscriptions}
        expiredCount={expiredCount}
        cancelledCount={cancelledCount}
        avgRevenuePerTenant={avgRevenuePerTenant}
        tenantCount={data?.tenantBilling?.length ?? 0}
        churnRate={churnRate}
      />

      <RevenueTrends 
        loading={loading}
        monthlyTrend={data?.monthlyTrend ?? []}
      />

      <DistributionCharts 
        loading={loading}
        planChartData={planChartData}
        methodChartData={methodChartData}
        statusChartData={statusChartData}
      />

      <TenantBillingTable 
        loading={loading}
        tenants={sortedTenants}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
      />

      <TransactionTable 
        loading={loading}
        transactions={recentTransactions}
      />
    </div>
  );
}
