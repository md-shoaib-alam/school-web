"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/use-app-store";
import { useQuery } from "@tanstack/react-query";
import { useTenantDetail } from "@/lib/graphql/hooks/platform.hooks";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { differenceInDays } from "date-fns";

// Sub-components
import { SubscriptionAlert } from "./dashboard_components/SubscriptionAlert";
import { WelcomeBanner } from "./dashboard_components/WelcomeBanner";
import { MetricStats } from "./dashboard_components/MetricStats";
import { AttendanceTrend } from "./dashboard_components/AttendanceTrend";
import { ClassDistribution } from "./dashboard_components/ClassDistribution";
import { FeeCollection } from "./dashboard_components/FeeCollection";
import { RecentNotices } from "./dashboard_components/RecentNotices";
import { FeePieDistribution } from "./dashboard_components/FeePieDistribution";

function getDaysRemaining(endDate?: string | null) {
  if (!endDate) return null;
  const expiry = new Date(endDate);
  const now = new Date();
  expiry.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return differenceInDays(expiry, now);
}

export function AdminDashboard() {
  const [recharts, setRecharts] = useState<typeof import("recharts") | null>(null);

  useEffect(() => {
    import("recharts").then(setRecharts);
  }, []);

  const { 
    currentUser, 
    currentTenantId, 
    currentTenantName, 
    currentTenantSlug, 
    currentTenantLogo 
  } = useAppStore();

  const tenantId = currentTenantId || currentUser?.tenantId;

  // Optimized: Single network request for everything!
  const { data: dashboardData, isPending, fetchStatus, error } = useQuery({
    queryKey: ['admin-dashboard', tenantId],
    queryFn: () => api.get('/dashboard'),
    staleTime: 60 * 1000, // Cache for 1 minute
    enabled: !!tenantId,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  });

  // In React Query v5, when enabled:false, isPending=true but fetchStatus='idle'
  const isLoading = isPending && fetchStatus === 'fetching';

  useEffect(() => {
    if (error) {
      toast.error("Dashboard data failed to load", { description: (error as any).message });
    }
  }, [error]);

  // Subscription Check
  const { data: tenantDetail } = useTenantDetail(tenantId || "");
  const tenant = tenantDetail?.tenant;
  const daysRemaining = getDaysRemaining(tenant?.endDate);
  const isExpiringSoon = daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 3;
  const isExpired = daysRemaining !== null && daysRemaining < 0;

  return (
    <div className="space-y-6">
      <SubscriptionAlert 
        isExpired={isExpired}
        isExpiringSoon={isExpiringSoon}
        daysRemaining={daysRemaining}
        onRenew={() => window.location.href = `/${currentTenantSlug || tenantId}/school-subscription`}
      />

      <WelcomeBanner
        userName={currentUser?.name || "Admin"}
        tenantName={currentTenantName || "the school"}
        tenantLogo={currentTenantLogo || currentUser?.tenantLogo || "/test.webp"}
        isLoading={isLoading}
        summaryData={dashboardData ? {
          totalStudents: dashboardData.totalStudents,
          totalTeachers: dashboardData.totalTeachers,
          attendanceRate: dashboardData.attendanceRate,
          upcomingEvents: dashboardData.upcomingEvents,
        } : undefined}
      />

      <MetricStats 
        isLoading={isLoading}
        data={dashboardData ? {
          totalParents: dashboardData.totalParents,
          totalClasses: dashboardData.totalClasses,
          totalRevenue: dashboardData.totalRevenue,
          attendanceRate: dashboardData.attendanceRate,
        } : undefined}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AttendanceTrend 
          isLoading={isLoading}
          data={dashboardData?.monthlyAttendance ?? []}
          recharts={recharts}
        />

        <ClassDistribution 
          isLoading={isLoading}
          data={dashboardData?.classDistribution ?? []}
          recharts={recharts}
          maleStudents={dashboardData?.maleStudents}
          femaleStudents={dashboardData?.femaleStudents}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FeePieDistribution 
          isLoading={isLoading}
          data={dashboardData?.feeByType ?? []}
          recharts={recharts}
        />

        <FeeCollection 
          isLoading={isLoading}
          data={dashboardData?.monthlyRevenue ?? []}
          recharts={recharts}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <RecentNotices 
          isLoading={isLoading}
          data={dashboardData?.recentNotices ?? []}
        />
      </div>
    </div>
  );
}
