"use client";

import { BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SubscriptionRecord } from "./types";

interface CurrentPlanBannerProps {
  subscription: SubscriptionRecord;
  onCancel: (id: string) => void;
}

const formatSubscriptionDate = (dateStr?: string | null) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export function CurrentPlanBanner({ subscription, onCancel }: CurrentPlanBannerProps) {
  const isCancelled = subscription.status === "cancelled";
  const renewal = subscription.endDate ? new Date(subscription.endDate) : null;
  const daysLeft = renewal
    ? Math.max(0, Math.ceil((renewal.getTime() - Date.now()) / 86_400_000))
    : null;

  const planDisplayName = subscription.planName.toLowerCase().includes("plan")
    ? subscription.planName
    : `${subscription.planName} Plan`;

  return (
    <div className="border border-border rounded-2xl p-5 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold shrink-0">
          <BadgeCheck className="size-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-semibold leading-tight">{planDisplayName}</h2>
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-medium",
                isCancelled
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full mr-1.5",
                  isCancelled ? "bg-amber-500" : "bg-emerald-500"
                )}
                aria-hidden
              />
              {isCancelled ? "Cancelling" : "Active"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5 flex-wrap">
            <span>
              {subscription.period
                ? `${subscription.period.charAt(0).toUpperCase() + subscription.period.slice(1)} billing`
                : "Subscription"}
            </span>
            {renewal && (
              <>
                <span aria-hidden>·</span>
                <span suppressHydrationWarning>
                  {isCancelled ? "Ends" : "Renews"} {formatSubscriptionDate(subscription.endDate)}
                </span>
                {daysLeft !== null && daysLeft >= 0 && (
                  <>
                    <span aria-hidden>·</span>
                    <span>{daysLeft === 0 ? "Last day" : `${daysLeft} days remaining`}</span>
                  </>
                )}
              </>
            )}
          </p>
        </div>
      </div>
      {!isCancelled && (
        <Button
          variant="outline"
          size="sm"
          className="text-muted-foreground hover:text-foreground shrink-0"
          onClick={() => onCancel(subscription.id)}
        >
          Cancel plan
        </Button>
      )}
    </div>
  );
}
