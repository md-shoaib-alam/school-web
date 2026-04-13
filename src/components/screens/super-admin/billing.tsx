'use client';

import { useState, useMemo } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DollarSign, TrendingUp, CreditCard, Receipt,
  ArrowUpRight, ArrowDownRight, Wallet,
  Users, Building2, Activity, BarChart3, PieChart as PieChartIcon,
  CalendarDays, IndianRupee, ArrowUpDown,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip, Legend,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { useBillingData } from '@/lib/graphql/hooks';

// ── Types ──
interface Subscription {
  id: string;
  tenantId: string;
  parentId: string;
  planName: string;
  planId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  parent: { user: { name: string } };
  tenant: { name: string; slug: string };
}

interface TenantBilling {
  id: string;
  name: string;
  slug: string;
  plan: string;
  activeRevenue: number;
  totalRevenue: number;
  activeSubscriptions: number;
  totalSubscriptions: number;
  _count?: { users: number; classes: number };
}

interface MonthlyTrend {
  month: string;
  revenue: number;
  newSubscriptions: number;
  churned: number;
}

interface BillingData {
  subscriptions: Subscription[];
  tenantBilling: TenantBilling[];
  planRevenue: Record<string, { count: number; revenue: number }>;
  methodRevenue: Record<string, { count: number; revenue: number }>;
  monthlyTrend: MonthlyTrend[];
  statusDistribution: Record<string, number>;
  totalActiveRevenue: number;
}

type SortKey = 'activeRevenue' | 'totalRevenue' | 'name' | 'activeSubscriptions';
type SortDir = 'asc' | 'desc';

// ── Constants ──
const revenueTrendConfig = {
  revenue: { label: 'Revenue (₹)', color: '#10b981' },
  newSubscriptions: { label: 'New Subscriptions', color: '#3b82f6' },
  churned: { label: 'Churned', color: '#ef4444' },
} satisfies ChartConfig;

const planRevenueConfig = {
  revenue: { label: 'Revenue (₹)', color: '#10b981' },
} satisfies ChartConfig;

const DONUT_COLORS: Record<string, string> = {
  card: '#10b981',
  upi: '#6366f1',
  netbanking: '#0ea5e9',
  wallet: '#f59e0b',
  free: '#94a3b8',
};

const STATUS_COLORS: Record<string, string> = {
  active: '#10b981',
  expired: '#94a3b8',
  cancelled: '#ef4444',
  trial: '#f59e0b',
};

const statusConfig: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
  active: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-700', dot: 'bg-emerald-500', label: 'Active' },
  expired: { bg: 'bg-gray-50 dark:bg-gray-900', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-700', dot: 'bg-gray-400', label: 'Expired' },
  cancelled: { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-700', dot: 'bg-red-500', label: 'Cancelled' },
  trial: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-700', dot: 'bg-amber-500', label: 'Trial' },
};

const paymentMethodConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  card: { icon: <CreditCard className="h-3.5 w-3.5" />, color: 'text-emerald-600', label: 'Card' },
  upi: { icon: <Wallet className="h-3.5 w-3.5" />, color: 'text-indigo-600', label: 'UPI' },
  netbanking: { icon: <Building2 className="h-3.5 w-3.5" />, color: 'text-sky-600', label: 'Net Banking' },
  wallet: { icon: <Wallet className="h-3.5 w-3.5" />, color: 'text-amber-600', label: 'Wallet' },
  free: { icon: <Receipt className="h-3.5 w-3.5" />, color: 'text-gray-500 dark:text-gray-400', label: 'Free' },
};

const planBadgeConfig: Record<string, { bg: string; text: string; border: string }> = {
  Basic: { bg: 'bg-slate-50 dark:bg-slate-900/30', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700' },
  Standard: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-700' },
  Premium: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-700' },
};

// ── Component ──
export function SuperAdminBilling() {
  // ── GraphQL Hook ──
  const { data, isLoading: loading, refetch: fetchBilling } = useBillingData();

  const [sortKey, setSortKey] = useState<SortKey>('activeRevenue');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // ── Computed ──
  const totalSubscriptions = data?.subscriptions.length ?? 0;
  const totalStatusCount = data ? Object.values(data.statusDistribution).reduce((s, v) => s + v, 0) : 0;
  const activeCount = data?.statusDistribution?.active ?? 0;
  const expiredCount = data?.statusDistribution?.expired ?? 0;
  const cancelledCount = data?.statusDistribution?.cancelled ?? 0;

  const totalRevenue = useMemo(() => {
    if (!data) return 0;
    return Object.values(data.methodRevenue).reduce((s, m) => s + m.revenue, 0);
  }, [data]);

  const mrr = useMemo(() => {
    if (!data) return 0;
    // Approximate MRR from active revenue / 12 if yearly, or just use active revenue as monthly proxy
    return data.totalActiveRevenue;
  }, [data]);

  const avgRevenuePerTenant = useMemo(() => {
    if (!data?.tenantBilling.length) return 0;
    return Math.round(totalRevenue / data.tenantBilling.length);
  }, [data, totalRevenue]);

  const churnedSubscriptions = expiredCount + cancelledCount;

  const planChartData = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.planRevenue)
      .filter(([_, v]) => v.count > 0)
      .map(([plan, v]) => ({ plan, revenue: v.revenue, count: v.count }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [data]);

  const methodChartData = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.methodRevenue)
      .filter(([_, v]) => v.count > 0)
      .map(([method, v]) => ({
        method: paymentMethodConfig[method]?.label || method,
        count: v.count,
        revenue: v.revenue,
        fill: DONUT_COLORS[method] || '#94a3b8',
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [data]);

  const statusChartData = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.statusDistribution)
      .filter(([_, v]) => v > 0)
      .map(([status, count]) => ({
        status: statusConfig[status]?.label || status,
        count,
        fill: STATUS_COLORS[status] || '#94a3b8',
      }));
  }, [data]);

  const sortedTenants = useMemo(() => {
    if (!data) return [];
    const tenants = [...data.tenantBilling];
    tenants.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortKey) {
        case 'activeRevenue': return dir * (a.activeRevenue - b.activeRevenue);
        case 'totalRevenue': return dir * (a.totalRevenue - b.totalRevenue);
        case 'name': return dir * a.name.localeCompare(b.name);
        case 'activeSubscriptions': return dir * (a.activeSubscriptions - b.activeSubscriptions);
        default: return 0;
      }
    });
    return tenants;
  }, [data, sortKey, sortDir]);

  const recentTransactions = useMemo(() => {
    if (!data) return [];
    return data.subscriptions.slice(0, 20);
  }, [data]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const revenueGrowth = useMemo(() => {
    if (!data?.monthlyTrend.length || data.monthlyTrend.length < 2) return null;
    const last = data.monthlyTrend[data.monthlyTrend.length - 1].revenue;
    const prev = data.monthlyTrend[data.monthlyTrend.length - 2].revenue;
    if (prev === 0) return null;
    return Math.round(((last - prev) / prev) * 100);
  }, [data]);

  const churnRate = useMemo(() => {
    if (totalStatusCount === 0) return 0;
    return Math.round(((churnedSubscriptions) / totalStatusCount) * 100);
  }, [churnedSubscriptions, totalStatusCount]);

  return (
    <div className="space-y-6">
      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white dark:bg-gray-900/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-white dark:bg-gray-900/5 rounded-full translate-y-1/2" />
        <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white dark:bg-gray-900/5 rounded-full" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white dark:bg-gray-900/20 flex items-center justify-center backdrop-blur-sm">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Billing & Revenue</h2>
                <p className="text-emerald-100 text-sm">Platform-wide financial analytics and subscription insights</p>
              </div>
            </div>
            <Button className="bg-white dark:bg-gray-900/20 hover:bg-white dark:bg-gray-900/30 text-white border border-white/30 backdrop-blur-sm w-fit" onClick={() => fetchBilling()}>
              <Activity className="h-4 w-4 mr-2" /> Refresh Data
            </Button>
          </div>

          {/* Mini summary inside banner */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-900/10 backdrop-blur-sm rounded-xl px-4 py-3">
                  <Skeleton className="h-3 w-20 bg-white dark:bg-gray-900/20" />
                  <Skeleton className="h-6 w-16 bg-white dark:bg-gray-900/20 mt-1" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-gray-900/10 backdrop-blur-sm rounded-xl px-4 py-3">
                <p className="text-emerald-100 text-xs font-medium">Total Revenue</p>
                <p className="text-xl font-bold flex items-center gap-1 mt-0.5">
                  <IndianRupee className="h-4 w-4" />{totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900/10 backdrop-blur-sm rounded-xl px-4 py-3">
                <p className="text-emerald-100 text-xs font-medium">Active Revenue</p>
                <p className="text-xl font-bold flex items-center gap-1 mt-0.5">
                  <IndianRupee className="h-4 w-4" />{(data?.totalActiveRevenue ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900/10 backdrop-blur-sm rounded-xl px-4 py-3">
                <p className="text-emerald-100 text-xs font-medium">MRR</p>
                <p className="text-xl font-bold flex items-center gap-1 mt-0.5">
                  <IndianRupee className="h-4 w-4" />{mrr.toLocaleString()}
                  {revenueGrowth !== null && (
                    <span className="text-xs font-medium ml-1 flex items-center">
                      {revenueGrowth >= 0 ? (
                        <><ArrowUpRight className="h-3 w-3 text-emerald-200" /> <span className="text-emerald-200">+{revenueGrowth}%</span></>
                      ) : (
                        <><ArrowDownRight className="h-3 w-3 text-red-300" /> <span className="text-red-300">{revenueGrowth}%</span></>
                      )}
                    </span>
                  )}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900/10 backdrop-blur-sm rounded-xl px-4 py-3">
                <p className="text-emerald-100 text-xs font-medium">Churn Rate</p>
                <p className="text-xl font-bold mt-0.5">
                  {churnRate}%
                  <span className="text-xs font-normal text-emerald-200 ml-1">
                    ({churnedSubscriptions} subs)
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Revenue Overview Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-20 mt-3" />
                <Skeleton className="h-3 w-16 mt-2" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            {/* Total Active Revenue */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 text-[10px]">
                    <ArrowUpRight className="h-3 w-3 mr-0.5" /> Active
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-medium">Total Active Revenue</p>
                <p className="text-2xl font-bold text-foreground mt-1 flex items-center">
                  <IndianRupee className="h-4 w-4" />{(data?.totalActiveRevenue ?? 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">From {activeCount} active subscriptions</p>
              </CardContent>
            </Card>

            {/* Monthly Recurring Revenue */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  {revenueGrowth !== null && (
                    <Badge variant="outline" className={`text-[10px] ${revenueGrowth >= 0 ? 'text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30' : 'text-red-700 dark:text-red-400 border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/30'}`}>
                      {revenueGrowth >= 0 ? <><ArrowUpRight className="h-3 w-3 mr-0.5" /> +{revenueGrowth}%</> : <><ArrowDownRight className="h-3 w-3 mr-0.5" /> {revenueGrowth}%</>}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-medium">Monthly Recurring Revenue</p>
                <p className="text-2xl font-bold text-foreground mt-1 flex items-center">
                  <IndianRupee className="h-4 w-4" />{mrr.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">vs last month</p>
              </CardContent>
            </Card>

            {/* Total Subscriptions */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 text-[10px]">
                    <BarChart3 className="h-3 w-3 mr-0.5" /> All Time
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-medium">Total Subscriptions</p>
                <p className="text-2xl font-bold text-foreground mt-1">{totalSubscriptions}</p>
                <p className="text-xs text-muted-foreground mt-1">{activeCount} active, {churnedSubscriptions} churned</p>
              </CardContent>
            </Card>

            {/* Avg Revenue Per Tenant */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-violet-50 dark:bg-violet-900/30 text-violet-600 flex items-center justify-center">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/30 text-[10px]">
                    <Users className="h-3 w-3 mr-0.5" /> {(data?.tenantBilling.length ?? 0)} tenants
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-medium">Avg Revenue Per Tenant</p>
                <p className="text-2xl font-bold text-foreground mt-1 flex items-center">
                  <IndianRupee className="h-4 w-4" />{avgRevenuePerTenant.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Across all tenants</p>
              </CardContent>
            </Card>

            {/* Churned Subscriptions */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 flex items-center justify-center">
                    <ArrowDownRight className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-red-700 dark:text-red-400 border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/30 text-[10px]">
                    {churnRate}% rate
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-medium">Churned Subscriptions</p>
                <p className="text-2xl font-bold text-foreground mt-1">{churnedSubscriptions}</p>
                <p className="text-xs text-muted-foreground mt-1">{expiredCount} expired, {cancelledCount} cancelled</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* ── Revenue Trend Chart ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" /> Revenue Trend (12 Months)
              </CardTitle>
              <CardDescription className="mt-1">Monthly revenue, new subscriptions, and churned subscriptions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[320px] w-full" />
          ) : (
            <ChartContainer config={revenueTrendConfig} className="h-[320px] w-full">
              <AreaChart data={data?.monthlyTrend ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="newGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tick={{ fill: '#94a3b8' }}
                  tickFormatter={v => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : String(v)}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, item) => {
                        if (name === 'revenue') return [`₹${Number(value).toLocaleString()}`, 'Revenue'];
                        return [value, name === 'newSubscriptions' ? 'New Subscriptions' : 'Churned'];
                      }}
                    />
                  }
                />
                <Legend content={<ChartLegendContent />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="newSubscriptions"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#newGradient)"
                  yAxisId={0}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Middle Row: Revenue by Plan + Payment Method + Status Distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue by Plan */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-600" /> Revenue by Plan
            </CardTitle>
            <CardDescription>Active revenue and subscription count per plan</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[240px] w-full" />
            ) : (
              <>
                <ChartContainer config={planRevenueConfig} className="h-[200px] w-full">
                  <BarChart data={planChartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickLine={false} axisLine={false} fontSize={10} tick={{ fill: '#94a3b8' }} tickFormatter={v => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                    <YAxis type="category" dataKey="plan" tickLine={false} axisLine={false} fontSize={12} width={70} tick={{ fill: '#374151' }} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value, _name, item) => {
                            const d = item.payload as { plan: string; revenue: number; count: number };
                            return [`₹${d.revenue.toLocaleString()} (${d.count} subs)`, d.plan];
                          }}
                        />
                      }
                    />
                    <Bar dataKey="revenue" radius={[0, 6, 6, 0]} maxBarSize={24}>
                      {planChartData.map((entry, i) => {
                        const colors = ['#94a3b8', '#f59e0b', '#10b981'];
                        const planColors: Record<string, string> = { Basic: '#94a3b8', Standard: '#f59e0b', Premium: '#10b981' };
                        return <Cell key={i} fill={planColors[entry.plan] || colors[i % colors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ChartContainer>
                {/* Subscription count pills */}
                <div className="flex gap-2 mt-3 justify-center">
                  {planChartData.map(p => {
                    const planColors: Record<string, string> = { Basic: 'bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700', Standard: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700', Premium: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700' };
                    return (
                      <Badge key={p.plan} variant="outline" className={`text-xs font-medium ${planColors[p.plan] || ''}`}>
                        {p.plan}: {p.count} subs
                      </Badge>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Payment Method */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="h-4 w-4 text-indigo-600" /> Payment Methods
            </CardTitle>
            <CardDescription>Revenue distribution by payment method</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[240px] w-full" />
            ) : methodChartData.length > 0 ? (
              <>
                <ChartContainer config={{}} className="h-[180px] w-full">
                  <PieChart>
                    <Pie
                      data={methodChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="revenue"
                      nameKey="method"
                    >
                      {methodChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} stroke="none" />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value, _name, item) => {
                            const d = item.payload as { method: string; revenue: number; count: number };
                            return [`₹${d.revenue.toLocaleString()} (${d.count} txns)`, d.method];
                          }}
                        />
                      }
                    />
                  </PieChart>
                </ChartContainer>
                <div className="space-y-2 mt-2">
                  {methodChartData.map(m => (
                    <div key={m.method} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: m.fill }} />
                        <span className="text-xs font-medium">{m.method}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{m.count} txns</span>
                        <span className="text-xs font-semibold">₹{m.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                <Wallet className="h-10 w-10 opacity-20 mb-2" />
                <p className="text-sm">No payment data</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Status Distribution */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-600" /> Subscription Status
            </CardTitle>
            <CardDescription>Active, expired and cancelled breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[240px] w-full" />
            ) : statusChartData.length > 0 ? (
              <>
                <ChartContainer config={{}} className="h-[160px] w-full">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="status"
                    >
                      {statusChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} stroke="none" />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value, _name, item) => {
                            const d = item.payload as { status: string; count: number };
                            const pct = totalStatusCount > 0 ? Math.round((d.count / totalStatusCount) * 100) : 0;
                            return [`${d.count} (${pct}%)`, d.status];
                          }}
                        />
                      }
                    />
                  </PieChart>
                </ChartContainer>
                <div className="space-y-3 mt-3">
                  {statusChartData.map(s => {
                    const pct = totalStatusCount > 0 ? Math.round((s.count / totalStatusCount) * 100) : 0;
                    const statusKey = s.status.toLowerCase();
                    const cfg = statusConfig[statusKey];
                    return (
                      <div key={s.status} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.fill }} />
                            <span className="text-xs font-medium">{s.status}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">{s.count}</span>
                            <span className="text-[10px] text-muted-foreground">({pct}%)</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: s.fill }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                <Activity className="h-10 w-10 opacity-20 mb-2" />
                <p className="text-sm">No status data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Revenue by Tenant Table ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-600" /> Revenue by Tenant
              </CardTitle>
              <CardDescription className="mt-1">{sortedTenants.length} tenants on the platform</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : sortedTenants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Building2 className="h-12 w-12 opacity-20 mb-3" />
              <p className="font-medium">No tenant billing data</p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Tenant</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      <Button variant="ghost" size="sm" className="h-7 text-xs font-medium -ml-3" onClick={() => handleSort('activeSubscriptions')}>
                        Active Subs <ArrowUpDown className="h-3 w-3 ml-1" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" className="h-7 text-xs font-medium -ml-3" onClick={() => handleSort('activeRevenue')}>
                        Active Revenue <ArrowUpDown className="h-3 w-3 ml-1" />
                      </Button>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      <Button variant="ghost" size="sm" className="h-7 text-xs font-medium -ml-3" onClick={() => handleSort('totalRevenue')}>
                        Total Revenue <ArrowUpDown className="h-3 w-3 ml-1" />
                      </Button>
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">Total Subs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTenants.map(t => (
                    <TableRow key={t.id} className="hover:bg-emerald-50 dark:bg-emerald-900/30/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[11px] font-bold shrink-0">
                            {t.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{t.name}</p>
                            <p className="text-[11px] text-muted-foreground">{t.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium capitalize ${planBadgeConfig[t.plan] ? `${planBadgeConfig[t.plan].bg} ${planBadgeConfig[t.plan].text} ${planBadgeConfig[t.plan].border}` : ''}`}
                        >
                          {t.plan}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-emerald-600">{t.activeSubscriptions}</span>
                          <span className="text-xs text-muted-foreground">/ {t.totalSubscriptions}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center">
                          <IndianRupee className="h-3 w-3 mr-0.5" />{t.activeRevenue.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm font-medium text-muted-foreground flex items-center">
                          <IndianRupee className="h-3 w-3 mr-0.5" />{t.totalRevenue.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground">{t.totalSubscriptions}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Recent Transactions Table ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-4 w-4 text-emerald-600" /> Recent Transactions
              </CardTitle>
              <CardDescription className="mt-1">Latest {recentTransactions.length} subscription transactions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}</div>
          ) : recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Receipt className="h-12 w-12 opacity-20 mb-3" />
              <p className="font-medium">No transactions found</p>
            </div>
          ) : (
            <div className="max-h-[480px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Parent</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead className="hidden sm:table-cell">Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Payment</TableHead>
                    <TableHead className="hidden xl:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map(tx => {
                    const sc = statusConfig[tx.status] || statusConfig.expired;
                    const pc = paymentMethodConfig[tx.paymentMethod] || paymentMethodConfig.free;
                    const pl = planBadgeConfig[tx.planName] || planBadgeConfig.Basic;
                    return (
                      <TableRow key={tx.id} className="hover:bg-emerald-50 dark:bg-emerald-900/30/20 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 flex items-center justify-center text-[11px] font-semibold shrink-0">
                              {(tx.parent?.user?.name || '??').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium truncate max-w-[140px]">{tx.parent?.user?.name || 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground truncate max-w-[120px] block">{tx.tenant?.name || 'Unknown'}</span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className={`text-xs font-medium ${pl.bg} ${pl.text} ${pl.border}`}>
                            {tx.planName}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-bold flex items-center">
                            <IndianRupee className="h-3 w-3 mr-0.5" />{tx.amount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${sc.bg} ${sc.text} ${sc.border}`}>
                            <div className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                            {sc.label}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1.5">
                            <span className={pc.color}>{pc.icon}</span>
                            <span className="text-xs">{pc.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
