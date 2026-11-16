"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Check, ShieldCheck, Lock } from "lucide-react";
import { Plan } from "./types";

interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan | null;
  cycle: "monthly" | "quarterly" | "yearly";
  processing: boolean;
  onConfirm: () => void;
  userName?: string;
}

export function PurchaseDialog({
  open,
  onOpenChange,
  plan,
  cycle,
  processing,
  onConfirm,
}: PurchaseDialogProps) {
  const currentPricing = plan?.pricing[cycle];
  const price = currentPricing?.price ?? 0;
  const originalPrice = currentPricing?.originalPrice;

  const cycleLabels = {
    monthly: "Monthly billing",
    quarterly: "Quarterly billing",
    yearly: "Yearly billing",
  };

  const includedFeatures = (plan?.features ?? [])
    .filter((f) => (typeof f === "string" ? true : f.included))
    .map((f) => (typeof f === "string" ? f : f.text))
    .slice(0, 4);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] rounded-2xl p-6">
        <DialogHeader className="space-y-1.5 text-left">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Confirm subscription
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            You are subscribing to the <span className="font-medium text-foreground">{plan?.name} Plan</span> for your parent portal.
          </DialogDescription>
        </DialogHeader>

        {plan && (
          <div className="space-y-4 py-2">
            {/* Plan Summary Card */}
            <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-3.5">
              {/* Header & Pricing */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-base leading-tight">
                      {plan.name} Plan
                    </span>
                    {plan.popular && (
                      <span className="text-[10px] font-semibold bg-foreground text-background px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {cycleLabels[cycle]}
                  </p>
                </div>

                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-2xl font-bold tracking-tight tabular-nums text-foreground">
                      {price === 0 ? "Free" : `₹${price.toLocaleString("en-IN")}`}
                    </span>
                    <span className="text-xs text-muted-foreground font-normal">
                      /{cycle === "monthly" ? "mo" : cycle === "quarterly" ? "quarter" : "yr"}
                    </span>
                  </div>
                  {originalPrice && originalPrice > price && (
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      <span className="text-xs text-muted-foreground/60 line-through tabular-nums">
                        ₹{originalPrice.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                        Save {Math.round(((originalPrice - price) / originalPrice) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* What's included preview */}
              {includedFeatures.length > 0 && (
                <div className="border-t border-border/60 pt-3 space-y-2">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    What&apos;s included
                  </p>
                  <ul className="grid gap-1.5 text-xs text-foreground/90">
                    {includedFeatures.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="size-3.5 text-emerald-500 shrink-0" aria-hidden />
                        <span className="leading-tight">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground px-0.5">
              <ShieldCheck className="size-4 shrink-0 text-emerald-500" aria-hidden />
              <span>Encrypted payment via Razorpay. Cancel anytime.</span>
            </div>

            {/* Action Buttons with Proper Spacing */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={processing}
                className="h-10 px-4 rounded-xl text-sm font-medium hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={onConfirm}
                disabled={processing}
                className="h-10 px-5 rounded-xl text-sm font-semibold gap-2 shadow-xs cursor-pointer"
              >
                {processing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Lock className="size-3.5" aria-hidden />
                    <span>Pay ₹{price.toLocaleString("en-IN")}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
