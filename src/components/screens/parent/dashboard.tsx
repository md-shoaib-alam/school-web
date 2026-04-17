"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/use-app-store";
import { useParentDashboard } from "@/lib/graphql/hooks";
import { goeyToast as toast } from "goey-toast";

// Sub-components
import { WelcomeBanner } from "./dashboard/WelcomeBanner";
import { QuickStats } from "./dashboard/QuickStats";
import { ChildrenOverview } from "./dashboard/ChildrenOverview";
import { NoticeSidebar } from "./dashboard/NoticeSidebar";
import { DashboardSkeleton } from "./dashboard/DashboardSkeleton";

export function ParentDashboard() {
  const { currentUser } = useAppStore();
  const { data, isLoading, isError, error } = useParentDashboard(
    currentUser?.name || "",
  );

  useEffect(() => {
    if (isError) {
      toast.error("Failed to load dashboard", { description: error?.message });
    }
  }, [isError, error]);

  if (isLoading) return <DashboardSkeleton />;

  // Data from GraphQL hook
  const childrenData = data?.children ?? [];
  const feesData = data?.fees ?? [];
  const performanceSummary = data?.performanceSummary ?? [];
  const allNotices = data?.notices ?? [];

  // Data Mappings
  const childrenWithStats = childrenData.map(child => {
    const perf = performanceSummary.find(p => p.name === child.name);
    return {
      ...child,
      attendancePct: perf?.attendanceRate ?? 0,
      avgPct: perf?.avgGrade ?? 0,
      grade: perf?.grade ?? "N/A"
    };
  });

  const pendingFees = feesData.filter(f => f.status === "pending" || f.status === "overdue");
  const overdueFees = feesData.filter(f => f.status === "overdue");
  const parentNotices = allNotices.filter(n => n.targetRole === "parent" || n.targetRole === "all");
  
  const performanceList = childrenData.map(child => {
    const perf = performanceSummary.find(p => p.name === child.name);
    return {
      name: child.name,
      avg: perf?.avgGrade ?? 0,
      grade: perf?.grade ?? "N/A"
    };
  });

  return (
    <div className="space-y-6 pb-10">
      <WelcomeBanner userName={currentUser?.name} />

      <QuickStats 
        childrenCount={childrenData.length}
        noticeCount={parentNotices.length}
        pendingFees={pendingFees.reduce((s, f) => s + f.amount - f.paidAmount, 0)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChildrenOverview children={childrenWithStats} />
        </div>

        <div className="lg:col-span-1">
          <NoticeSidebar 
            notices={parentNotices}
            overdueFees={overdueFees}
            performance={performanceList}
          />
        </div>
      </div>
    </div>
  );
}
