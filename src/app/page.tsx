"use client";

import { useEffect, useSyncExternalStore, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import {
  MaintenanceScreen,
  LoginScreen,
} from "@/components/screens";
import { FullPageSkeleton } from "@/components/ui/full-page-skeleton";

// Prevents hydration mismatch: returns false on server, true on client
const emptySubscribe = () => () => {};
function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export default function Home() {
  const { isLoggedIn, currentUser, currentScreen, currentTenantId } =
    useAppStore();
  const mounted = useHydrated();
  const router = useRouter();
  const [maintenanceActive, setMaintenanceActive] = useState(false);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);

  // Check maintenance mode for non-super_admin users
  useEffect(() => {
    if (!isLoggedIn || !currentUser || currentUser.role === "super_admin")
      return;
    setMaintenanceLoading(true);
    let cancelled = false;
    fetch("/api/platform-settings?key=maintenance_mode")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) {
          setMaintenanceActive(data.value === "true");
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setMaintenanceLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, currentUser]);

  // Unified Redirection Logic: Redirect to tenant-specific URL if logged in
  useEffect(() => {
    if (mounted && isLoggedIn && currentUser) {
      const parts = window.location.pathname.split("/").filter(Boolean);
      const isSuperAdmin = currentUser.role === "super_admin";
      const expectedPrefix =
        currentUser.tenantSlug || currentUser.tenantId || currentTenantId;

      // Only redirect if we are literally at the root "/"
      if (parts.length === 0) {
        if (!expectedPrefix && !isSuperAdmin) return;

        const url = !expectedPrefix
          ? `/${currentScreen}`
          : currentScreen === "dashboard"
            ? `/${expectedPrefix}`
            : `/${expectedPrefix}/${currentScreen}`;

        router.replace(url);
      }
    }
  }, [
    mounted,
    isLoggedIn,
    currentUser,
    currentTenantId,
    currentScreen,
    router,
  ]);

  // Not mounted yet → render nothing (avoids hydration mismatch)
  if (!mounted) return null;

  // Not logged in → show login
  if (!isLoggedIn) return <LoginScreen />;

  // Maintenance mode check
  const isSuperAdmin = currentUser?.role === "super_admin";
  if (isLoggedIn && !isSuperAdmin && maintenanceLoading) {
    return <FullPageSkeleton />;
  }

  if (isLoggedIn && !isSuperAdmin && maintenanceActive) {
    return <MaintenanceScreen />;
  }

  // If we are still here and logged in, we are likely at the root "/" and redirecting.
  // We show a skeleton while the router.replace kicks in.
  return <FullPageSkeleton />;
}
