"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar, School } from "lucide-react";
import { useAppStore } from "@/store/use-app-store";

interface WelcomeBannerProps {
  userName?: string;
}

export function WelcomeBanner({ userName }: WelcomeBannerProps) {
  const { currentTenantName, currentTenantLogo } = useAppStore();
  
  // Check if userName is missing or generic to display a cleaner, more professional greeting
  const isGeneric = !userName || userName.toLowerCase() === "parent";
  const greeting = isGeneric ? "Welcome back! 👋" : `Welcome back, ${userName.split(" ")[0]}! 👋`;

  return (
    <Card className="border-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md rounded-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <CardContent className="p-6 lg:p-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden shrink-0 border border-white/10 shadow-inner">
              <img src={currentTenantLogo || "/test.webp"} alt={currentTenantName || ""} className="h-full w-full object-cover" />
            </div>
            <div className="text-left">
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
                {greeting}
              </h2>
              <p className="text-amber-50 mt-1 text-sm lg:text-base font-medium opacity-90">
                Here&apos;s an overview of your children&apos;s progress at {currentTenantName || "Demo Academy"}.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-white shrink-0 self-start sm:self-auto">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
