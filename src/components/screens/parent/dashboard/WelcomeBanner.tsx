"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface WelcomeBannerProps {
  userName?: string;
}

export function WelcomeBanner({ userName }: WelcomeBannerProps) {
  const firstName = userName?.split(" ")[0];

  return (
    <Card className="border-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md rounded-xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-left">
            <h2 className="text-2xl font-bold">
              Welcome back, {firstName}! 👋
            </h2>
            <p className="text-amber-100 mt-1">
              Here&apos;s an overview of your children&apos;s progress at Sigel School.
            </p>
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
