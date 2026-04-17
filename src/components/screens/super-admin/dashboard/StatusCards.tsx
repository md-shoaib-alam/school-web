import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building2, 
  Users, 
  Zap, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  DollarSign, 
  FileDown, 
  UserCog, 
  ClipboardList, 
  ArrowUpRight 
} from "lucide-react";
import { PieChart, Pie, Cell, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DashboardData, userChartConfig, USER_CHART_COLORS } from "./types";

interface StatusCardsProps {
  loading: boolean;
  data: DashboardData | undefined;
  onNavigate: (screen: string) => void;
}

export function StatusCards({ loading, data, onNavigate }: StatusCardsProps) {
  const userDistributionData = data
    ? [
        { name: "Students", value: data.users.students, fill: USER_CHART_COLORS[0] },
        { name: "Teachers", value: data.users.teachers, fill: USER_CHART_COLORS[1] },
        { name: "Parents", value: data.users.parents, fill: USER_CHART_COLORS[2] },
        { name: "Admins", value: data.users.admins, fill: USER_CHART_COLORS[3] },
      ]
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Tenant Status Breakdown */}
      <Card className="border-none shadow-sm bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-emerald-600" /> Tenant Status
          </CardTitle>
          <CardDescription className="text-xs">Active, trial, and suspended schools</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 group hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-emerald-900 dark:text-emerald-100">Active</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Operational</p>
                  </div>
                </div>
                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{data?.tenants.active ?? 0}</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 group hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-amber-900 dark:text-amber-100">Trial</p>
                    <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Evaluation</p>
                  </div>
                </div>
                <span className="text-2xl font-black text-amber-700 dark:text-amber-400">{data?.tenants.trial ?? 0}</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-red-50/50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 group hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-red-900 dark:text-red-100">Suspended</p>
                    <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider">Attention Required</p>
                  </div>
                </div>
                <span className="text-2xl font-black text-red-700 dark:text-red-400">{data?.tenants.suspended ?? 0}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* User Distribution Chart */}
      <Card className="border-none shadow-sm bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-600" /> User Distribution
          </CardTitle>
          <CardDescription className="text-xs">Breakdown by role across all schools</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[280px] w-full rounded-2xl" />
          ) : (
            <div className="space-y-6">
              <ChartContainer config={userChartConfig} className="h-[220px] w-full">
                <PieChart>
                  <Pie
                    data={userDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {userDistributionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={USER_CHART_COLORS[index % USER_CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
              <div className="grid grid-cols-2 gap-3">
                {userDistributionData.map((item) => (
                  <div key={item.name} className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/50 text-center group">
                    <p className="text-lg font-black text-gray-900 dark:text-gray-100 leading-none mb-1 group-hover:scale-110 transition-transform">{item.value.toLocaleString()}</p>
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-none shadow-sm bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-600" /> Quick Actions
          </CardTitle>
          <CardDescription className="text-xs">Frequent administrative operations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ActionButton 
            icon={<Plus className="h-4 w-4" />} 
            label="Add New School" 
            sub="Register a new tenant" 
            color="bg-emerald-600"
            onClick={() => onNavigate("tenants")}
          />
          <ActionButton 
            icon={<DollarSign className="h-4 w-4" />} 
            label="View Billing" 
            sub="Revenue & invoices" 
            color="bg-violet-600"
            onClick={() => onNavigate("billing")}
          />
          <ActionButton 
            icon={<FileDown className="h-4 w-4" />} 
            label="Export Report" 
            sub="Download analytics" 
            color="bg-amber-600"
            onClick={() => onNavigate("platform-analytics")}
          />
          <ActionButton 
            icon={<UserCog className="h-4 w-4" />} 
            label="Manage Users" 
            sub="Platform staff" 
            color="bg-teal-600"
            onClick={() => onNavigate("users")}
          />
          <ActionButton 
            icon={<ClipboardList className="h-4 w-4" />} 
            label="Audit Logs" 
            sub="Security & activity" 
            color="bg-gray-700"
            onClick={() => onNavigate("audit-logs")}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ActionButton({ icon, label, sub, color, onClick }: any) {
  return (
    <Button
      variant="outline"
      className="w-full justify-start gap-4 h-[60px] rounded-2xl border-2 border-gray-100 dark:border-gray-800 hover:border-emerald-500/30 hover:bg-emerald-50/10 transition-all group"
      onClick={onClick}
    >
      <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center text-white shadow-lg shadow-${color.split('-')[1]}-200 dark:shadow-none group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="text-left flex-1 min-w-0">
        <p className="font-black text-sm text-gray-900 dark:text-gray-100">{label}</p>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{sub}</p>
      </div>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
    </Button>
  );
}
