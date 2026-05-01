"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar, School } from "lucide-react";
import { useAppStore } from "@/store/use-app-store";

interface WelcomeBannerProps {
  userName?: string;
}

export function WelcomeBanner({ userName }: WelcomeBannerProps) {
  const { currentTenantName, currentTenantLogo } = useAppStore();
  const firstName = userName?.split(" ")[0];

  return (
    <Card className="border-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md rounded-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {currentTenantLogo ? (
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden shrink-0">
                <img src={currentTenantLogo} alt={currentTenantName || ""} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                <School className="h-6 w-6 text-white/80" />
              </div>
            )}
            <div className="text-left">
              <h2 className="text-2xl font-bold">
                Welcome back, {firstName}! 👋
              </h2>
              <p className="text-amber-100 mt-1">
                Here&apos;s an overview of your children&apos;s progress at {currentTenantName || "the school"}.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
