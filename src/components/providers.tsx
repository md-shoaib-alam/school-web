"use client";

import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { Toaster } from "sonner";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { isLowPerformanceDevice } from "@/lib/perf";
import { useTheme } from "next-themes";
import { DocumentGlyph, SuccessGlyph, ErrorGlyph, WarningGlyph, LoadingGlyph, CloseIcon } from "@/components/ui/toast-glyphs";

function ToasterProvider() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster 
      closeButton
      expand={true}
      visibleToasts={4}
      gap={10}
      position="top-center" 
      duration={3500} 
      swipeDirections={["left", "right"]}
      theme={(resolvedTheme as "light" | "dark" | "system") || "system"}
      icons={{
        success: <SuccessGlyph />,
        error: <ErrorGlyph />,
        warning: <WarningGlyph />,
        info: <DocumentGlyph />,
        loading: <LoadingGlyph />,
        close: <CloseIcon />,
      }}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isLowPerformanceDevice()) {
      document.documentElement.classList.add("perf-low");
      // Programmatic smooth scrolls bypass the CSS kill switch; force them instant.
      const origEl = Element.prototype.scrollTo;
      Element.prototype.scrollTo = function (this: Element, ...args: any[]) {
        if (args[0] && typeof args[0] === "object" && args[0].behavior === "smooth") {
          args[0] = { ...args[0], behavior: "auto" };
        }
        return (origEl as any).apply(this, args as any);
      } as typeof Element.prototype.scrollTo;
      const origWin = window.scrollTo;
      window.scrollTo = ((...args: any[]) => {
        if (args[0] && typeof args[0] === "object" && args[0].behavior === "smooth") {
          args[0] = { ...args[0], behavior: "auto" };
        }
        return (origWin as any).apply(window, args as any);
      }) as typeof window.scrollTo;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const persister = createSyncStoragePersister({
      storage: window.localStorage,
      key: "SCHOOL_SAAS_OFFLINE_CACHE",
    });

    const [unsubscribe] = persistQueryClient({
      queryClient,
      persister,
      maxAge: 30 * 60 * 1000, // 30 minutes
      dehydrateOptions: {
        // Subscription/tenant status must never be restored from a stale offline
        // copy; it is refetched fresh on every mount so renewals show immediately.
        shouldDehydrateQuery: (query) => !query.queryKey.includes("tenant-resolution"),
      },
    });

    return unsubscribe;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SmoothScrollProvider>
        {children}
        <ToasterProvider />
      </SmoothScrollProvider>
    </QueryClientProvider>
  );
}
