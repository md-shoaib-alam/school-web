"use client";

import { useState } from "react";
import { useAppStore } from "@/store/use-app-store";
import { useTenantDetail } from "@/lib/graphql/hooks/platform.hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Crown, 
  Calendar, 
  Users, 
  UserPlus, 
  School, 
  Heart,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpCircle,
  ArrowDownCircle,
  CreditCard,
  Settings
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { goeyToast as toast } from "goey-toast";

export function SchoolSubscriptionScreen() {
  const { currentTenantId } = useAppStore();
  const { data: detailData, isLoading } = useTenantDetail(currentTenantId || "");

  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isAutoPay, setIsAutoPay] = useState(true);

  if (isLoading) {
    return <div className="p-8 text-center">Loading subscription details...</div>;
  }

  const tenant = detailData?.tenant;
  if (!tenant) {
    return <div className="p-8 text-center text-muted-foreground">Could not load subscription information.</div>;
  }

  const now = new Date();
  const expiry = tenant.endDate ? new Date(tenant.endDate) : null;
  const daysRemaining = expiry ? differenceInDays(expiry, now) : null;
  const isExpired = daysRemaining !== null && daysRemaining < 0;

  const usageStats = [
    { 
      label: "Students", 
      icon: <Users className="h-4 w-4" />, 
      current: tenant.studentCount || 0, 
      max: tenant.maxStudents,
      color: "bg-blue-500"
    },
    { 
      label: "Teachers", 
      icon: <UserPlus className="h-4 w-4" />, 
      current: tenant.teacherCount || 0, 
      max: tenant.maxTeachers,
      color: "bg-emerald-500"
    },
    { 
      label: "Parents", 
      icon: <Heart className="h-4 w-4" />, 
      current: tenant.parentCount || 0, 
      max: tenant.maxParents,
      color: "bg-rose-500"
    },
    { 
      label: "Classes", 
      icon: <School className="h-4 w-4" />, 
      current: tenant.maxClasses > 0 ? (detailData?.classes?.length || 0) : 0, 
      max: tenant.maxClasses,
      color: "bg-amber-500"
    },
  ];


  const handleToggleAutoPay = (checked: boolean) => {
    setIsAutoPay(checked);
    toast.success(checked ? "Auto-renewal enabled" : "Auto-renewal disabled", {
      description: checked 
        ? "Your plan will now automatically renew on the 1st of each month." 
        : "You will need to manually renew your plan before it expires."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Crown className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Subscription</h2>
            <p className="text-muted-foreground mt-1">Monitor your school's plan, limits, and usage.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2 border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/20"
            onClick={() => setIsUpgradeOpen(true)}
          >
            <ArrowDownCircle className="h-4 w-4" />
            Downgrade
          </Button>
          <Button 
            size="sm"
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => setIsUpgradeOpen(true)}
          >
            <ArrowUpCircle className="h-4 w-4" />
            Upgrade Plan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-none shadow-sm bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
          <CardContent className="p-8">
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <Badge className="bg-white/20 text-white hover:bg-white/30 border-none px-3 py-1 capitalize text-xs font-semibold tracking-wide">
                  {tenant.plan} Plan
                </Badge>
                <div>
                  <h3 className="text-4xl font-bold">{tenant.name}</h3>
                  <p className="opacity-80 mt-1">Platform License for Educational Institutions</p>
                </div>
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 opacity-70" />
                    <div>
                      <p className="text-xs opacity-70 uppercase tracking-wider font-semibold">Started</p>
                      <p className="font-medium">{format(new Date(tenant.startDate), "PPP")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 opacity-70" />
                    <div>
                      <p className="text-xs opacity-70 uppercase tracking-wider font-semibold">Renewal Date</p>
                      <p className="font-medium">{tenant.endDate ? format(new Date(tenant.endDate), "PPP") : "Permanent"}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="h-24 w-24 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                  <Crown className="h-12 w-12 text-white drop-shadow-lg" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Subscription Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge className={tenant.status === 'active' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'}>
                {tenant.status.toUpperCase()}
              </Badge>
            </div>
            <div className="pt-4 border-t space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Time Remaining</p>
                <p className={`text-4xl font-bold mt-2 ${isExpired ? 'text-rose-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                  {daysRemaining !== null ? (isExpired ? "Expired" : `${daysRemaining} Days`) : "Lifetime"}
                </p>
              </div>
              {!isExpired && daysRemaining !== null && daysRemaining < 30 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-start gap-2 border border-amber-100 dark:border-amber-900/50">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                    Your license is expiring soon. Please contact the platform administrator to renew.
                  </p>
                </div>
              )}
              {tenant.status === 'active' && !isExpired && (
                <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  Account is healthy
                </div>
              )}

              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-indigo-600" />
                      Auto-Renewal
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                      {isAutoPay ? "Active via Platform" : "Manual Renewal Only"}
                    </p>
                  </div>
                  <Switch checked={isAutoPay} onCheckedChange={handleToggleAutoPay} />
                </div>
                <p className="text-xs text-muted-foreground italic text-center">
                  Payments are processed on the 1st of every month.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Building2 className="h-5 w-5 text-indigo-600" />
              Resource Allocation & Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {usageStats.map((stat) => {
              const percentage = Math.min(100, (stat.current / stat.max) * 100);
              return (
                <div key={stat.label} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      {stat.icon}
                      <span className="font-medium">{stat.label}</span>
                    </div>
                    <span className="text-muted-foreground text-xs font-mono">
                      {stat.current.toLocaleString()} / {stat.max.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" indicatorClassName={stat.color} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 border-b pb-4">
            <CardTitle className="text-base font-semibold">Plan Features</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {[
                "Unlimited Staff Management",
                "Advanced Fee Collection",
                "Custom Exam Report Cards",
                "Teacher & Student Attendance",
                "Support Ticket System",
                "Academic Year History"
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <div className="h-5 w-5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
              <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200 text-center">Plan Management</p>
              <p className="text-xs text-indigo-700 dark:text-indigo-300 text-center mt-1 leading-relaxed">
                Need to change your student or teacher limits? Use the Upgrade or Downgrade buttons at the top to submit a request.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isUpgradeOpen} onOpenChange={setIsUpgradeOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Settings className="h-6 w-6 text-indigo-600" />
              Manage Subscription
            </DialogTitle>
            <DialogDescription>
              Submit a request to change your school's plan tier or resource limits.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-6 text-center">
            <div className="h-20 w-20 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto">
              <Crown className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold px-4">Modifying your institution plan</h4>
              <p className="text-muted-foreground text-sm leading-relaxed px-4">
                You are currently on the <span className="font-bold text-indigo-600 dark:text-indigo-400 capitalize">{tenant.plan}</span> plan. To upgrade to a higher tier or downgrade to a smaller plan, please contact our support team.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border text-sm">
              <div className="flex items-center justify-between px-4">
                <span className="text-muted-foreground font-medium">Current Students</span>
                <span className="font-bold">{tenant.maxStudents.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-800 pt-3 flex items-center justify-between px-4">
                <span className="text-muted-foreground font-medium">Enterprise Tier</span>
                <span className="text-emerald-600 font-bold">Unlimited Students</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <Button 
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2"
                onClick={() => {
                  window.location.href = `mailto:support@schoolsaas.com?subject=Subscription Change Request: ${tenant.name}`;
                  setIsUpgradeOpen(false);
                }}
              >
                <ArrowUpCircle className="h-5 w-5" />
                Contact for Upgrade
              </Button>
              <Button 
                variant="outline"
                className="w-full h-12 border-rose-200 text-rose-600 hover:bg-rose-50 gap-2 font-semibold"
                onClick={() => {
                  window.location.href = `mailto:support@schoolsaas.com?subject=Downgrade Request: ${tenant.name}`;
                  setIsUpgradeOpen(false);
                }}
              >
                <ArrowDownCircle className="h-5 w-5" />
                Contact for Downgrade
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Building2({ className }: { className?: string }) {
  return <School className={className} />;
}
