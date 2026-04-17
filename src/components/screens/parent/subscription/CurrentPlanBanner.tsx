"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { SubscriptionRecord } from "./types";

interface CurrentPlanBannerProps {
  subscription: SubscriptionRecord;
  onCancel: (id: string) => void;
}

export function CurrentPlanBanner({ subscription, onCancel }: CurrentPlanBannerProps) {
  const activeAddons: string[] = JSON.parse(subscription.addons || "[]");

  return (
    <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 shadow-none">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-emerald-800 dark:text-emerald-300">
              Active: {subscription.planName} Plan
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              {subscription.endDate
                ? `Renews on ${new Date(subscription.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                : `Started ${new Date(subscription.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
              {subscription.autoRenew && " • Auto-renew ON"}
            </p>
            {activeAddons.length > 0 && (
              <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-0.5">
                Add-ons: {activeAddons.join(", ")}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
          onClick={() => onCancel(subscription.id)}
        >
          Cancel Plan
        </Button>
      </CardContent>
    </Card>
  );
}
