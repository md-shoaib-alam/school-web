"use client";

import { BadgeCheck, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plan } from "./types";

interface PlanCardProps {
  plan: Plan;
  isActive: boolean;
  cycle: "monthly" | "quarterly" | "yearly";
  onPurchase: (plan: Plan) => void;
  processing?: boolean;
}

export function PlanCard({ plan, isActive, cycle, onPurchase, processing }: PlanCardProps) {
  const currentPricing = plan.pricing[cycle];
  const price = currentPricing?.price ?? 0;
  const originalPrice = currentPricing?.originalPrice;

  const cycleLabels = {
    monthly: "month",
    quarterly: "quarter",
    yearly: "year",
  };

  return (
    <div
      className={cn(
        "relative bg-card border rounded-3xl p-6 sm:p-7 pt-12 sm:pt-14 flex flex-col justify-between transition-all duration-200",
        plan.popular
          ? "border-2 border-foreground shadow-lg shadow-black/5 dark:shadow-white/5"
          : "border-border shadow-xs hover:border-border/80",
        isActive && "ring-2 ring-emerald-500/40 border-emerald-500"
      )}
    >
      {/* Badges */}
      {plan.popular && (
        <span className="absolute top-0 right-0 flex items-center gap-1.5 rounded-bl-xl rounded-tr-3xl bg-foreground text-background px-3.5 py-1.5 text-xs font-semibold tracking-tight">
          <Star className="size-3 fill-current" aria-hidden />
          Recommended
        </span>
      )}
      {isActive && (
        <span className="absolute top-0 left-0 flex items-center gap-1.5 rounded-br-xl rounded-tl-3xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white tracking-tight">
          <BadgeCheck className="size-3.5" aria-hidden />
          Current plan
        </span>
      )}

      {/* Top Section: Title & Price */}
      <div className="space-y-5">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">{plan.name}</h3>
          <p className="text-sm text-muted-foreground mt-1.5 min-h-[42px] leading-relaxed">
            {plan.description}
          </p>
        </div>

        {/* Pricing */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-1.5">
            {price === 0 ? (
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums text-foreground">
                Free
              </span>
            ) : (
              <>
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums text-foreground">
                  ₹{price.toLocaleString("en-IN")}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  / {cycleLabels[cycle]}
                </span>
              </>
            )}
          </div>
          {originalPrice && originalPrice > price && (
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-xs text-muted-foreground/60 line-through tabular-nums font-medium">
                ₹{originalPrice.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Save {Math.round(((originalPrice - price) / originalPrice) * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Features Checklist */}
        <div className="border-t border-border/70 pt-6 space-y-3.5">
          <p className="text-[11px] font-semibold text-foreground/80 uppercase tracking-wider">
            What&apos;s included
          </p>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {plan.features.map((feature) => {
              const text = typeof feature === "string" ? feature : feature.text;
              const included = typeof feature === "string" ? true : feature.included;
              return (
                <li key={text} className="flex items-start gap-3">
                  {included ? (
                    <div className="size-4 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="size-2.5 stroke-[3]" aria-hidden />
                    </div>
                  ) : (
                    <div className="size-4 rounded-full bg-muted/70 text-muted-foreground/40 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] leading-none">✕</span>
                    </div>
                  )}
                  <span
                    className={cn(
                      "leading-snug text-xs sm:text-sm",
                      included ? "text-foreground font-medium" : "text-muted-foreground/40"
                    )}
                  >
                    {text}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-8">
        <Button
          className="w-full h-11 rounded-xl text-sm font-semibold shadow-xs transition-transform active:scale-[0.99]"
          variant={isActive ? "outline" : "default"}
          disabled={isActive || processing}
          onClick={() => (isActive ? null : onPurchase({ ...plan, price } as any))}
        >
          {isActive ? "Current plan" : price === 0 ? "Switch to Free" : `Choose ${plan.name}`}
        </Button>
      </div>
    </div>
  );
}
