"use client";

import { useEffect, useSyncExternalStore, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import {
  MaintenanceScreen,
  LoginScreen,
} from "@/components/screens";

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isLoggedIn && !isSuperAdmin && maintenanceActive) {
    return <MaintenanceScreen />;
  }

  // If we are still here and logged in, we are likely at the root "/" and redirecting.
  // We show a simple loader while the router.replace kicks in.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin h-10 w-10 border-4 border-rose-500 border-t-transparent rounded-full" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">
          Entering Dashboard...
        </p>
      </div>
    </div>
  );
}
