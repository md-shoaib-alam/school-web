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

  const todayString = useMemo(() => {
    try {
      return new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return "";
    }
  }, []);

  // Check if userName is missing or generic to display a cleaner, more professional greeting
  const isGeneric = !userName || userName.toLowerCase() === "parent";

  return (
    <Card className="rounded-xl border border-border shadow-sm overflow-hidden bg-card">
      <CardContent className="p-4 lg:p-4 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border">
              <img src={currentTenantLogo || "/test.webp"} alt={currentTenantName || ""} className="size-full object-cover" />
            </div>
            <div className="text-left">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight leading-tight text-foreground">
                {userName || "Parent"}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-muted border border-border rounded-lg px-4 py-2 text-muted-foreground shrink-0 self-start sm:self-auto">
            <Calendar className="size-4" />
            <span className="text-sm font-medium" suppressHydrationWarning>
              {todayString}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
