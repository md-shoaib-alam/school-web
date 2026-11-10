"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export type SubscriptionStatus = "active" | "paused" | "expired" | "cancelled";

interface SubscriptionHeaderProps {
  schoolName: string;
  logoUrl?: string | null;
  planName: string;
  status: SubscriptionStatus;
  renewal: Date | null;
  onManagePlan: () => void;
}

const fmt = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const statusDot: Record<SubscriptionStatus, string> = {
  active: "bg-emerald-500",
  paused: "bg-rose-500",
  expired: "bg-amber-500",
  cancelled: "bg-amber-500",
};

const statusLabel: Record<SubscriptionStatus, string> = {
  active: "Active",
  paused: "Paused",
  expired: "Expired",
  cancelled: "Cancelling",
};

export default function SubscriptionHeader({
  schoolName,
  logoUrl,
  planName,
  status,
  renewal,
  onManagePlan,
}: SubscriptionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <img
          src={logoUrl || "/test.webp"}
          alt={schoolName}
          className="size-10 rounded-lg border  object-cover shrink-0"
        />
        <div>
          <h2 className="text-lg font-semibold tracking-tight leading-tight">{schoolName}</h2>
          <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span className={`size-1.5 rounded-full ${statusDot[status]}`} aria-hidden />
            {statusLabel[status]}
            <span aria-hidden>·</span>
            {planName}
            {renewal && (
              <>
                <span aria-hidden>·</span>
                <span suppressHydrationWarning>
                  {status === "cancelled" ? "Ends" : "Renews"} {fmt(renewal)}
                </span>
              </>
            )}
          </p>
        </div>
      </div>
      <Button onClick={onManagePlan} className="shrink-0">
        Manage Plan
      </Button>
    </div>
  );
}
