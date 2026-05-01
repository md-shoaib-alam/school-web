"use client";

import { useState } from "react";
import { useAppStore } from "@/store/use-app-store";
import { useTenantDetail, useUpgradeSchool } from "@/lib/graphql/hooks/platform.hooks";
import { PricingPlans, SchoolPlan } from "./subscription/pricing-plans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Crown, ShieldCheck } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { goeyToast as toast } from "goey-toast";
import { useQueryClient } from "@tanstack/react-query";

export function ManagePlanScreen() {
  const router = useRouter();
  const { slug } = useParams();
  const queryClient = useQueryClient();
  const { currentTenantId } = useAppStore();
  const { data: detailData, isLoading: isDetailLoading } = useTenantDetail(currentTenantId || "");
  const upgradeSchool = useUpgradeSchool();
  const [isUpdating, setIsUpdating] = useState(false);

  const tenant = detailData?.tenant;

  const handleUpgrade = async (plan: SchoolPlan) => {
    const queryKey = ["tenant-detail", currentTenantId];
    const previousDetail = queryClient.getQueryData(queryKey);

    // OPTIMISTIC UPDATE
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old || !old.tenant) return old;
      return {
        ...old,
        tenant: {
          ...old.tenant,
          plan: plan.id,
          maxStudents: plan.limits.students,
          maxTeachers: plan.limits.teachers,
          maxParents: plan.limits.parents,
          maxClasses: plan.limits.classes,
        }
      };
    });

    setIsUpdating(true);
    try {
      await upgradeSchool.mutateAsync({
        plan: plan.id,
        maxStudents: plan.limits.students,
        maxTeachers: plan.limits.teachers,
        maxParents: plan.limits.parents,
        maxClasses: plan.limits.classes,
      });
      router.push(`/${slug}/school-subscription`);
    } catch (err: any) {
      // ROLLBACK
      queryClient.setQueryData(queryKey, previousDetail);
      toast.error("Upgrade Failed", {
        description: err.message || "Something went wrong while processing your request."
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isDetailLoading || !tenant) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              Upgrade Institution
              <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500 fill-amber-500/20" />
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Scale your school's digital operations.</p>
          </div>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-violet-900 dark:from-indigo-950 dark:via-indigo-900 dark:to-violet-950 border-none overflow-hidden text-white relative shadow-2xl shadow-indigo-200 dark:shadow-none">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldCheck className="h-40 w-40" />
        </div>
        <CardHeader className="relative z-10">
          <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] opacity-70">Current Active Plan</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 py-4 sm:py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-4xl sm:text-6xl font-black capitalize tracking-tighter mb-1 sm:mb-2 drop-shadow-md">{tenant.plan}</h3>
            <p className="text-indigo-100 flex items-center gap-2 font-medium text-xs sm:text-base">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              Institutions using this tier have unlocked full {tenant.plan} capabilities.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="px-5 py-4 bg-white/10 dark:bg-black/20 rounded-2xl backdrop-blur-xl border border-white/20 dark:border-white/10 min-w-[140px] shadow-lg">
              <p className="text-[10px] uppercase font-black text-indigo-200 mb-1 tracking-widest">Students</p>
              <p className="text-2xl font-black">{tenant.maxStudents.toLocaleString()}</p>
            </div>
            <div className="px-5 py-4 bg-white/10 dark:bg-black/20 rounded-2xl backdrop-blur-xl border border-white/20 dark:border-white/10 min-w-[140px] shadow-lg">
              <p className="text-[10px] uppercase font-black text-indigo-200 mb-1 tracking-widest">Staff</p>
              <p className="text-2xl font-black">{tenant.maxTeachers}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6 sm:space-y-8 pt-4">
        <div className="flex items-center justify-center">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent" />
          <span className="px-4 sm:px-8 text-[10px] sm:text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.4em]">Available Upgrades</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent" />
        </div>
        
        <PricingPlans 
          currentPlan={tenant.plan} 
          onSelectPlan={handleUpgrade}
          isLoading={isUpdating}
        />
      </div>

      <div className="mt-8 sm:mt-16 p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] bg-indigo-50/50 dark:bg-indigo-950/20 border border-dashed border-indigo-200 dark:border-indigo-800/50 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center shadow-xl shadow-indigo-100 dark:shadow-none border border-indigo-50 dark:border-indigo-900/50 shrink-0">
            <ShieldCheck className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h4 className="font-black text-gray-900 dark:text-gray-100 text-base sm:text-lg">Enterprise-Grade Security</h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md">Every plan features 256-bit encryption and automated daily backups.</p>
          </div>
        </div>
        <div className="flex flex-col items-center md:items-end gap-2">
          <Button variant="link" className="text-indigo-600 dark:text-indigo-400 font-black tracking-tight hover:no-underline hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors p-0 h-auto text-sm sm:text-lg">
            Need a custom configuration?
          </Button>
          <p className="text-xs text-muted-foreground font-medium">Contact our school-chain specialists</p>
        </div>
      </div>
    </div>
  );
}
