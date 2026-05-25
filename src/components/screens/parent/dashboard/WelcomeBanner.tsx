"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, School } from "lucide-react";
import { useAppStore } from "@/store/use-app-store";

interface WelcomeBannerProps {
  userName?: string;
}

export function WelcomeBanner({ userName }: WelcomeBannerProps) {
  const { currentTenantName, currentTenantLogo } = useAppStore();

  const dates = useMemo(() => {
    try {
      const now = new Date();
      const day = now.getDate();
      const month = now.toLocaleDateString("en-US", { month: "long" });
      const year = now.getFullYear();
      const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
      
      const datePart = `${day} ${month}, ${year}`;
      return {
        full: `${weekday}, ${datePart}`,
        short: datePart
      };
    } catch (e) {
      return { full: "", short: "" };
    }
  }, []);

  // Check if userName is missing or generic to display a cleaner, more professional greeting
  const isGeneric = !userName || userName.toLowerCase() === "parent";

  return (
    <Card className="rounded-xl border border-border shadow-sm overflow-hidden bg-card">
      <CardContent className="p-4 lg:p-4 relative z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="size-10 sm:size-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border">
              <img src={currentTenantLogo || "/test.webp"} alt={currentTenantName || ""} className="size-full object-cover" />
            </div>
            <div className="text-left">
              <h2 className="text-lg sm:text-2xl lg:text-3xl font-semibold tracking-tight leading-tight text-foreground">
                {userName || "Parent"}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-muted border border-border rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-zinc-600 dark:text-zinc-300 shrink-0 w-fit">
            <Calendar className="size-3.5 sm:size-4 text-zinc-500 dark:text-zinc-400" />
            <span className="text-[10px] sm:text-sm font-medium" suppressHydrationWarning>
              <span className="hidden sm:inline">{dates.full}</span>
              <span className="sm:hidden">{dates.short}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
