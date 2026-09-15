import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { StatusBadge as UiStatusBadge } from "@/components/ui/status-badge";
import { Crown } from "lucide-react";
import { planColors } from "./types";
import { SCHOOL_PLANS } from "@/lib/billing-constants";

export const TenantPlanBadge = memo(({ plan }: { plan: string }) => {
  const planMeta = SCHOOL_PLANS.find((p) => p.id === plan);
  const displayName = planMeta?.name || plan;

  return (
    <Badge variant="outline" className="text-xs font-medium">
      <Crown className="size-3 mr-1" />
      {displayName}
    </Badge>
  );
});

const statusToneMap: Record<string, "positive" | "negative" | "warning" | "info" | "neutral"> = {
  active: "positive",
  verified: "positive",
  enabled: "positive",
  suspended: "negative",
  inactive: "negative",
  expired: "negative",
  blocked: "negative",
  deleted: "negative",
  trial: "warning",
  pending: "warning",
};

export const TenantStatusBadge = memo(({ status }: { status: string }) => {
  const tone = statusToneMap[status] || "neutral";
  return <UiStatusBadge tone={tone}>{status}</UiStatusBadge>;
});
