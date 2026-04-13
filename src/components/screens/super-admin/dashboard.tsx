'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Building2, Users, DollarSign, GraduationCap, TrendingUp, Activity,
  Crown, CreditCard, FileDown, Plus, ShieldCheck, ArrowUpRight,
  ArrowDownRight, School, UserCog, ClipboardList, Sparkles,
  AlertTriangle, CheckCircle2, Clock, Zap,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { usePlatformStats } from '@/lib/graphql/hooks';

// ── Chart Configs ──────────────────────────────────────────────────────────────

const userChartConfig: ChartConfig = {
  students: { label: 'Students', color: '#e11d48' },
  teachers: { label: 'Teachers', color: '#f43f5e' },
  parents: { label: 'Parents', color: '#fb7185' },
  admins: { label: 'Admins', color: '#fda4af' },
};

const growthChartConfig: ChartConfig = {
  newTenants: { label: 'New Schools', color: '#e11d48' },
  newUsers: { label: 'New Users', color: '#f43f5e' },
  revenue: { label: 'Revenue ($)', color: '#be123c' },
};

const planChartConfig: ChartConfig = {
  count: { label: 'Schools', color: '#e11d48' },
};

// ── Constants ──────────────────────────────────────────────────────────────────

const USER_CHART_COLORS = ['#e11d48', '#f43f5e', '#fb7185', '#fda4af'];

const PLAN_COLORS: Record<string, string> = {
  basic: '#94a3b8',
  standard: '#e11d48',
  premium: '#f59e0b',
  enterprise: '#7c3aed',
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  CREATE_TENANT: <Plus className="h-3.5 w-3.5" />,
  UPDATE_TENANT: <Building2 className="h-3.5 w-3.5" />,
  DELETE_TENANT: <AlertTriangle className="h-3.5 w-3.5" />,
  CREATE_USER: <UserCog className="h-3.5 w-3.5" />,
  LOGIN: <ShieldCheck className="h-3.5 w-3.5" />,
  UPDATE_SUBSCRIPTION: <CreditCard className="h-3.5 w-3.5" />,
};

const ACTION_COLORS: Record<string, string> = {
  CREATE_TENANT: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  UPDATE_TENANT: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  DELETE_TENANT: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  CREATE_USER: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
  LOGIN: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  UPDATE_SUBSCRIPTION: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
};

function formatAction(action: string): string {
  return action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Skeleton Components ────────────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
        <Skeleton className="h-4 w-28 mt-3" />
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return <Skeleton className="h-[300px] w-full rounded-xl" />;
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function SuperAdminDashboard() {
  const { data, isLoading: loading, error, isError } = usePlatformStats();

  if (isError) {
    return (
      <Card className="border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/30">
        <CardContent className="p-6 text-center text-red-600">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p className="font-medium">Failed to load platform dashboard</p>
          <p className="text-sm mt-1">{error?.message || 'Network error'}</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const userDistributionData = data ? [
    { name: 'Students', value: data.users.students, fill: USER_CHART_COLORS[0] },
    { name: 'Teachers', value: data.users.teachers, fill: USER_CHART_COLORS[1] },
    { name: 'Parents', value: data.users.parents, fill: USER_CHART_COLORS[2] },
    { name: 'Admins', value: data.users.admins, fill: USER_CHART_COLORS[3] },
  ] : [];

  return (
    <div className="space-y-6">
      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950 via-rose-900 to-rose-800 p-6 lg:p-8 text-white shadow-lg">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-700/20 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/4 w-56 h-56 bg-rose-600/10 rounded-full translate-y-1/2" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white dark:bg-gray-900/5 rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-14 w-14 rounded-2xl bg-white dark:bg-gray-900/15 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <ShieldCheck className="h-7 w-7 text-rose-200" />
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Platform Command Center</h2>
              <p className="text-rose-200 text-sm mt-0.5">Multi-tenant SaaS overview and analytics</p>
            </div>
          </div>

          {/* Quick summary inside hero - RESTORED based on user preference */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-900/10 backdrop-blur-sm rounded-xl px-4 py-3">
                  <Skeleton className="h-3 w-20 bg-white dark:bg-gray-900/20" />
                  <Skeleton className="h-7 w-12 bg-white dark:bg-gray-900/20 mt-1" />
                </div>
              ))
            ) : (
              <>
                <div className="bg-white dark:bg-gray-900/10 backdrop-blur-sm rounded-xl px-4 py-3">
                  <p className="text-rose-200 text-xs font-medium">Schools</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    <Building2 className="h-5 w-5 text-rose-300" />
                    {data?.tenants.total ?? 0}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-900/10 backdrop-blur-sm rounded-xl px-4 py-3">
                  <p className="text-rose-200 text-xs font-medium">Total Users</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    <Users className="h-5 w-5 text-rose-300" />
                    {data?.users.total ?? 0}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-900/10 backdrop-blur-sm rounded-xl px-4 py-3">
                  <p className="text-rose-200 text-xs font-medium">Revenue</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    <DollarSign className="h-5 w-5 text-rose-300" />
                    ${(data?.revenue.total ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-900/10 backdrop-blur-sm rounded-xl px-4 py-3">
                  <p className="text-rose-200 text-xs font-medium">Subscriptions</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    <CreditCard className="h-5 w-5 text-rose-300" />
                    {data?.subscriptions.active ?? 0}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-900/10 backdrop-blur-sm rounded-xl px-4 py-3 hidden sm:block">
                  <p className="text-rose-200 text-xs font-medium">Classes</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    <GraduationCap className="h-5 w-5 text-rose-300" />
                    {data?.classes ?? 0}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Tenant Status + User Distribution ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tenant Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-rose-600" />
              Tenant Status
            </CardTitle>
            <CardDescription>Active, trial, and suspended schools</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Active */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Active</p>
                      <p className="text-xs text-emerald-600">Operational schools</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{data?.tenants.active ?? 0}</span>
                </div>

                {/* Trial */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Trial</p>
                      <p className="text-xs text-amber-600">Free trial period</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">{data?.tenants.trial ?? 0}</span>
                </div>

                {/* Suspended */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">Suspended</p>
                      <p className="text-xs text-red-600">Requires attention</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-red-700 dark:text-red-400">{data?.tenants.suspended ?? 0}</span>
                </div>

                {/* Pie summary */}
                <div className="pt-2 border-t mt-1">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {data && (
                      <ChartContainer config={userChartConfig} className="h-[100px] w-full">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Active', value: data.tenants.active },
                              { name: 'Trial', value: data.tenants.trial },
                              { name: 'Suspended', value: data.tenants.suspended },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={28}
                            outerRadius={42}
                            paddingAngle={3}
                            dataKey="value"
                            nameKey="name"
                            fontSize={10}
                          >
                            <Cell fill="#10b981" />
                            <Cell fill="#f59e0b" />
                            <Cell fill="#ef4444" />
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend
                            verticalAlign="bottom"
                            content={({ payload }) => (
                              <div className="flex items-center justify-center gap-4 pt-1">
                                {payload?.map((entry, idx) => (
                                  <div key={idx} className="flex items-center gap-1.5 text-xs">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span className="text-muted-foreground">{entry.value}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          />
                        </PieChart>
                      </ChartContainer>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Distribution Donut Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-rose-600" />
              User Distribution
            </CardTitle>
            <CardDescription>Breakdown by role across all schools</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ChartSkeleton />
            ) : (
              <>
                <ChartContainer config={userChartConfig} className="h-[220px] w-full">
                  <PieChart>
                    <Pie
                      data={userDistributionData}
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }) => `${value}`}
                      labelLine={false}
                      fontSize={11}
                      fontWeight={600}
                    >
                      {userDistributionData.map((_, index) => (
                        <Cell key={`user-cell-${index}`} fill={USER_CHART_COLORS[index]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                {/* Legend below */}
                <div className="flex items-center justify-center gap-4 mt-2">
                  {userDistributionData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-xs text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
                {/* Summary counts */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {userDistributionData.map((item) => (
                    <div key={item.name} className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{item.value}</p>
                      <p className="text-xs text-muted-foreground">{item.name}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-rose-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common admin operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                className="w-full justify-start gap-3 h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
                onClick={() => window.dispatchEvent(new CustomEvent('super-admin-navigate', { detail: 'tenants' }))}
              >
                <div className="h-9 w-9 rounded-lg bg-rose-500/30 flex items-center justify-center">
                  <Plus className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Add New School</p>
                  <p className="text-[11px] text-rose-200">Register a new tenant</p>
                </div>
                <ArrowUpRight className="h-4 w-4 ml-auto" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12 rounded-xl"
                onClick={() => window.dispatchEvent(new CustomEvent('super-admin-navigate', { detail: 'billing' }))}
              >
                <div className="h-9 w-9 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-violet-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">View Billing</p>
                  <p className="text-[11px] text-muted-foreground">Revenue & invoices</p>
                </div>
                <ArrowUpRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12 rounded-xl"
                onClick={() => window.dispatchEvent(new CustomEvent('super-admin-navigate', { detail: 'platform-analytics' }))}
              >
                <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <FileDown className="h-4 w-4 text-amber-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Export Report</p>
                  <p className="text-[11px] text-muted-foreground">Download analytics data</p>
                </div>
                <ArrowUpRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12 rounded-xl"
                onClick={() => window.dispatchEvent(new CustomEvent('super-admin-navigate', { detail: 'users' }))}
              >
                <div className="h-9 w-9 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  <UserCog className="h-4 w-4 text-teal-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Manage Users</p>
                  <p className="text-[11px] text-muted-foreground">All platform users</p>
                </div>
                <ArrowUpRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12 rounded-xl"
                onClick={() => window.dispatchEvent(new CustomEvent('super-admin-navigate', { detail: 'audit-logs' }))}
              >
                <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <ClipboardList className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Audit Logs</p>
                  <p className="text-[11px] text-muted-foreground">Activity & compliance</p>
                </div>
                <ArrowUpRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Monthly Growth Chart ─────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-rose-600" />
            Monthly Growth Trends
          </CardTitle>
          <CardDescription>New schools, users, and revenue over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ChartContainer config={growthChartConfig} className="h-[320px] w-full">
              <LineChart data={data?.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  label={{ value: 'Revenue ($)', angle: 90, position: 'insideRight', style: { fontSize: 11 } }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="newTenants"
                  stroke="var(--color-newTenants)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: 'var(--color-newTenants)' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="newUsers"
                  stroke="var(--color-newUsers)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: 'var(--color-newUsers)' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: 'var(--color-revenue)' }}
                  activeDot={{ r: 6 }}
                  strokeDasharray="6 3"
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Top Schools + Plan Distribution ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Top Performing Schools */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-500" />
              Top Performing Schools
            </CardTitle>
            <CardDescription>Ranked by active subscription revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead className="hidden sm:table-cell">Plan</TableHead>
                    <TableHead className="text-right hidden md:table-cell">Students</TableHead>
                    <TableHead className="text-right hidden md:table-cell">Users</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.topTenants.map((tenant, index) => (
                    <TableRow key={tenant.id}>
                      <TableCell>
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                          index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-700' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}>
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-rose-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{tenant.name}</p>
                            <p className="text-[11px] text-muted-foreground">{tenant._count.classes} classes</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          className={`text-[10px] ${
                            tenant.plan === 'premium'
                              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                              : tenant.plan === 'enterprise'
                                ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400'
                                : tenant.plan === 'standard'
                                  ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <Crown className="h-3 w-3 mr-0.5" />
                          {tenant.plan}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right hidden md:table-cell">
                        <span className="font-medium">{tenant.studentCount}</span>
                      </TableCell>
                      <TableCell className="text-right hidden md:table-cell">
                        <span className="text-muted-foreground">{tenant._count.users}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-emerald-600">${tenant.revenue.toLocaleString()}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!data?.topTenants || data.topTenants.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No tenant data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-rose-600" />
              Plan Distribution
            </CardTitle>
            <CardDescription>Tenants by subscription plan</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ChartSkeleton />
            ) : (
              <div className="space-y-4">
                <ChartContainer config={planChartConfig} className="h-[200px] w-full">
                  <BarChart data={data?.planDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis
                      type="category"
                      dataKey="plan"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      width={80}
                      tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={32}>
                      {data?.planDistribution.map((entry) => (
                        <Cell
                          key={`plan-${entry.plan}`}
                          fill={PLAN_COLORS[entry.plan] || '#94a3b8'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>

                {/* Plan summary badges */}
                <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
                  {data?.planDistribution.map((entry) => (
                    <Badge
                      key={entry.plan}
                      variant="outline"
                      className="text-xs gap-1.5 py-1 px-3"
                    >
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: PLAN_COLORS[entry.plan] || '#94a3b8' }} />
                      {entry.plan.charAt(0).toUpperCase() + entry.plan.slice(1)}: {entry.count}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Activity ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-rose-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest platform audit logs</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => window.dispatchEvent(new CustomEvent('super-admin-navigate', { detail: 'audit-logs' }))}
            >
              View All
              <ArrowUpRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {(!data?.recentLogs || data.recentLogs.length === 0) ? (
                <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
              ) : (
                data.recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 transition-colors group"
                  >
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                      ACTION_COLORS[log.action] || 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    }`}>
                      {ACTION_ICONS[log.action] || <ClipboardList className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{formatAction(log.action)}</p>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                          {log.resource}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {log.details || 'No additional details'}
                      </p>
                    </div>
                    <div className="text-right shrink-0 hidden sm:block">
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(log.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <ArrowDownRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
