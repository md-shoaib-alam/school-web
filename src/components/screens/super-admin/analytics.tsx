'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import {
  TrendingUp, DollarSign, Users, Activity, Server, Clock, Zap, Globe,
  ArrowUpRight, ArrowDownRight, BarChart3, PieChart as PieChartIcon,
  UserCheck, Wifi,
} from 'lucide-react';

// ── Simulated data ──────────────────────────────────────────────

function generateTenantGrowth() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let cumulative = 12;
  return months.map((month) => {
    cumulative += Math.floor(Math.random() * 4) + 2;
    return { month, tenants: cumulative };
  });
}

function generateUserGrowth() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let students = 1200, teachers = 180, parents = 900, admins = 45;
  return months.map((month) => {
    students += Math.floor(Math.random() * 200) + 80;
    teachers += Math.floor(Math.random() * 30) + 10;
    parents += Math.floor(Math.random() * 150) + 60;
    admins += Math.floor(Math.random() * 5) + 1;
    return { month, students, teachers, parents, admins };
  });
}

function generateRevenueBreakdown() {
  const schools = [
    'Greenfield Academy', 'Sunrise International', 'Heritage School',
    'Modern Public School', 'St. Mary\'s Convent', 'Oakridge Academy',
    'Riverdale School', 'Evergreen High', 'Bluebell School', 'Maple Grove',
  ];
  return schools.map((name) => ({
    name,
    revenue: Math.floor(Math.random() * 15000) + 5000,
  })).sort((a, b) => b.revenue - a.revenue);
}

const geographicData = [
  { country: 'India', percentage: 85, color: 'bg-rose-500' },
  { country: 'USA', percentage: 10, color: 'bg-blue-500' },
  { country: 'UK', percentage: 5, color: 'bg-amber-500' },
];

const featureUsageData = [
  { feature: 'Attendance', usage: 94 },
  { feature: 'Grades', usage: 87 },
  { feature: 'Fees', usage: 82 },
  { feature: 'Subscriptions', usage: 76 },
  { feature: 'Timetable', usage: 71 },
  { feature: 'Assignments', usage: 65 },
  { feature: 'Notices', usage: 58 },
  { feature: 'Reports', usage: 52 },
  { feature: 'Parent Portal', usage: 45 },
  { feature: 'Bus Tracking', usage: 32 },
];

// ── Chart configs ──────────────────────────────────────────────

const tenantGrowthConfig = {
  tenants: { label: 'Total Tenants', color: '#f43f5e' },
} satisfies ChartConfig;

const userGrowthConfig = {
  students: { label: 'Students', color: '#10b981' },
  teachers: { label: 'Teachers', color: '#3b82f6' },
  parents: { label: 'Parents', color: '#f59e0b' },
  admins: { label: 'Admins', color: '#8b5cf6' },
} satisfies ChartConfig;

const revenueConfig = {
  revenue: { label: 'Revenue ($)', color: '#f43f5e' },
} satisfies ChartConfig;

const pieConfig = {
  revenue: { label: 'Revenue' },
} satisfies ChartConfig;

const PIE_COLORS = ['#f43f5e', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

const featureUsageConfig = {
  usage: { label: 'Usage (%)', color: '#10b981' },
} satisfies ChartConfig;

// ── Skeleton components ────────────────────────────────────────

function MetricCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-11 w-11 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return <Skeleton className="h-[300px] w-full" />;
}

// ── Main component ─────────────────────────────────────────────

export function SuperAdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [platformData, setPlatformData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/platform');
        if (res.ok) {
          const json = await res.json();
          setPlatformData(json);
        }
      } catch {
        // Use simulated data even if API fails
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Simulated metrics (enriched with real API data when available)
  const metrics = {
    mrr: platformData?.revenue?.active
      ? Math.round(platformData.revenue.active * 1.5)
      : 47850,
    arr: platformData?.revenue?.active
      ? Math.round(platformData.revenue.active * 18)
      : 574200,
    ltv: 3840,
    churnRate: 3.2,
    cac: 285,
  };

  const tenantGrowth = generateTenantGrowth();
  const userGrowth = generateUserGrowth();
  const revenueBreakdown = generateRevenueBreakdown();

  const activeUsers = platformData?.users?.total || 3456;
  const serverUptime = 99.9;
  const avgResponseTime = 145;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-rose-500" />
          Platform Analytics
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Comprehensive overview of your multi-tenant SaaS platform performance
        </p>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <MetricCardSkeleton key={i} />)
        ) : (
          <>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">MRR</p>
                    <p className="text-2xl font-bold mt-1">${metrics.mrr.toLocaleString()}</p>
                  </div>
                  <div className="h-11 w-11 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" /> +12.5% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">ARR</p>
                    <p className="text-2xl font-bold mt-1">${metrics.arr.toLocaleString()}</p>
                  </div>
                  <div className="h-11 w-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" /> +8.3% YoY
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">LTV</p>
                    <p className="text-2xl font-bold mt-1">${metrics.ltv.toLocaleString()}</p>
                  </div>
                  <div className="h-11 w-11 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" /> +5.2% from last quarter
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Churn Rate</p>
                    <p className="text-2xl font-bold mt-1">{metrics.churnRate}%</p>
                  </div>
                  <div className="h-11 w-11 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
                    <Activity className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                  <ArrowDownRight className="h-3 w-3" /> -0.8% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">CAC</p>
                    <p className="text-2xl font-bold mt-1">${metrics.cac.toLocaleString()}</p>
                  </div>
                  <div className="h-11 w-11 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 flex items-center justify-center">
                    <Zap className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" /> +2.1% from last month
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts Row 1: Tenant Growth & User Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenant Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-rose-500" />
              Tenant Growth
            </CardTitle>
            <CardDescription>Cumulative tenant count over 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ChartSkeleton />
            ) : (
              <ChartContainer config={tenantGrowthConfig} className="h-[300px] w-full">
                <LineChart data={tenantGrowth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="tenants"
                    stroke="var(--color-tenants)"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: 'var(--color-tenants)' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* User Growth Chart - Stacked Area */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-500" />
              User Growth by Role
            </CardTitle>
            <CardDescription>Users breakdown over 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ChartSkeleton />
            ) : (
              <ChartContainer config={userGrowthConfig} className="h-[300px] w-full">
                <AreaChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area
                    type="monotone"
                    dataKey="students"
                    stackId="1"
                    stroke="var(--color-students)"
                    fill="var(--color-students)"
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="parents"
                    stackId="1"
                    stroke="var(--color-parents)"
                    fill="var(--color-parents)"
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="teachers"
                    stackId="1"
                    stroke="var(--color-teachers)"
                    fill="var(--color-teachers)"
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="admins"
                    stackId="1"
                    stroke="var(--color-admins)"
                    fill="var(--color-admins)"
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Revenue Breakdown & Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown by Tenant */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-rose-500" />
              Revenue by Tenant (Top 10)
            </CardTitle>
            <CardDescription>Monthly recurring revenue distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ChartSkeleton />
            ) : (
              <ChartContainer config={revenueConfig} className="h-[300px] w-full">
                <BarChart data={revenueBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    width={120}
                    tickFormatter={(v: string) => v.length > 18 ? v.slice(0, 18) + '...' : v}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]} maxBarSize={24}>
                    {revenueBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" />
              Geographic Distribution
            </CardTitle>
            <CardDescription>Tenant distribution by region</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 pt-2">
              {geographicData.map((geo) => (
                <div key={geo.country} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${geo.color}`} />
                      <span className="text-sm font-medium">{geo.country}</span>
                    </div>
                    <span className="text-sm font-bold">{geo.percentage}%</span>
                  </div>
                  <div className="relative">
                    <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${geo.color}`}
                        style={{ width: `${geo.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Pie chart mini view */}
              <div className="mt-4 pt-4 border-t">
                <ChartContainer config={pieConfig} className="h-[160px] w-full">
                  <PieChart>
                    <Pie
                      data={geographicData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="percentage"
                      nameKey="country"
                    >
                      {geographicData.map((_, index) => (
                        <Cell key={`geo-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [`${value}%`, name]}
                    />
                  </PieChart>
                </ChartContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3: Feature Usage & Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Feature Usage
            </CardTitle>
            <CardDescription>Most used platform features across all tenants</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ChartSkeleton />
            ) : (
              <ChartContainer config={featureUsageConfig} className="h-[340px] w-full">
                <BarChart data={featureUsageData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} unit="%" />
                  <YAxis type="category" dataKey="feature" tickLine={false} axisLine={false} fontSize={12} width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="usage" radius={[0, 4, 4, 0]} maxBarSize={20}>
                    {featureUsageData.map((_, index) => (
                      <Cell
                        key={`feature-${index}`}
                        fill={index < 3 ? '#10b981' : index < 6 ? '#3b82f6' : '#f59e0b'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-4 w-4 text-emerald-500" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Real-time platform health indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Server Uptime */}
            <div className="space-y-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                    <Wifi className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-900">Server Uptime</p>
                    <p className="text-xs text-emerald-600">Last 30 days</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{serverUptime}%</p>
                  <p className="text-xs text-emerald-500 flex items-center gap-1 justify-end">
                    <ArrowUpRight className="h-3 w-3" /> 99.7% last month
                  </p>
                </div>
              </div>
              <Progress value={serverUptime} className="h-2 bg-emerald-100 dark:bg-emerald-900/30 [&>div]:bg-emerald-500" />
            </div>

            {/* Avg Response Time */}
            <div className="space-y-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Avg Response Time</p>
                    <p className="text-xs text-blue-600">API requests</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{avgResponseTime}ms</p>
                  <p className="text-xs text-emerald-600 flex items-center gap-1 justify-end">
                    <ArrowDownRight className="h-3 w-3" /> -12ms from last week
                  </p>
                </div>
              </div>
              <Progress value={82} className="h-2 bg-blue-100 dark:bg-blue-900/30 [&>div]:bg-blue-500" />
            </div>

            {/* Active Users Today */}
            <div className="space-y-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-rose-900">Active Users Today</p>
                    <p className="text-xs text-rose-600">Across all tenants</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">{activeUsers.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600 flex items-center gap-1 justify-end">
                    <ArrowUpRight className="h-3 w-3" /> +18% from yesterday
                  </p>
                </div>
              </div>
              <Progress value={68} className="h-2 bg-rose-100 dark:bg-rose-900/30 [&>div]:bg-rose-500" />
            </div>

            {/* Platform Stats Summary */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-foreground">
                  {platformData?.tenants?.total || 42}
                </p>
                <p className="text-[11px] text-muted-foreground">Total Tenants</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-foreground">
                  {platformData?.users?.total?.toLocaleString() || '3.4k'}
                </p>
                <p className="text-[11px] text-muted-foreground">Total Users</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-foreground">
                  {platformData?.classes || 186}
                </p>
                <p className="text-[11px] text-muted-foreground">Active Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
