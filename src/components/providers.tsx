"use client";

import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { Toaster } from "sonner";
import { useTheme } from "next-themes";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { isLowPerformanceDevice } from "@/lib/perf";

function ToasterProvider() {
  const { theme } = useTheme();
  const [expand, setExpand] = useState(false);
  return (
    <div 
      onMouseEnter={() => setExpand(true)}
      onMouseLeave={() => setExpand(false)}
      className="relative z-[999999]"
      style={{ pointerEvents: "auto" }}
    >
      <Toaster 
        richColors 
        expand={expand}
        position="top-center" 
        duration={3000} 
        swipeDirections={["left", "right"]}
        theme={theme as "light" | "dark" | "system"}
      />
    </div>
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
