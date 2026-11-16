"use client";

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Script from "next/script";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { usePillSlider } from "@/lib/pill-slider";
import { Shield, Clock, TrendingUp, Users, TriangleAlert } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAppStore } from "@/store/use-app-store";

// Sub-components
import { PlanCard } from "./subscription/PlanCard";
import { HistoryTable } from "./subscription/HistoryTable";
import { PurchaseDialog } from "./subscription/PurchaseDialog";

// Types & Constants
import { Plan, SubscriptionRecord } from "./subscription/types";
import { PLANS } from "./subscription/constants";

const formatSubscriptionDate = (dateStr?: string | null) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export function ParentSubscription() {
  const { currentUser } = useAppStore();
  const params = useParams();
  const slug = (params?.slug as string) || currentUser?.tenantSlug || "demo-academy";

  const [loading, setLoading] = useState(true);
  const [parentId, setParentId] = useState<string | null>(null);
  const [activeSubscription, setActiveSubscription] = useState<SubscriptionRecord | null>(null);
  const [allSubscriptions, setAllSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly" | "yearly">("quarterly");

  // Pill slider animation (exact same spring mechanism as the sidebar)
  const cycleContainerRef = useRef<HTMLDivElement>(null);
  const activePill = useRef<HTMLDivElement>(null);
  const hoverPill = useRef<HTMLDivElement>(null);
  const isFirstMount = useRef(true);
  const place = usePillSlider(cycleContainerRef);

  useLayoutEffect(() => {
    if (loading || !cycleContainerRef.current) return;
    const target = cycleContainerRef.current.querySelector<HTMLElement>(`[data-cycle="${billingCycle}"]`);
    place(activePill.current, target, isFirstMount.current);
    if (isFirstMount.current) isFirstMount.current = false;
  }, [billingCycle, place, loading]);

  useEffect(() => {
    const onResize = () => {
      if (!cycleContainerRef.current) return;
      const target = cycleContainerRef.current.querySelector<HTMLElement>(`[data-cycle="${billingCycle}"]`);
      place(activePill.current, target, true);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [billingCycle, place]);

  // Dialog States
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [purchasingPlan, setPurchasingPlan] = useState<Plan | null>(null);
  const [processing, setProcessing] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [subToCancel, setSubToCancel] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    try {
      const res = await apiFetch("/api/subscriptions");
      if (!res.ok) throw new Error("Failed to fetch subscriptions");
      const data = await res.json();
      setParentId(data.parent?.id || null);
      setActiveSubscription(data.activeSubscription || null);
      setAllSubscriptions(data.subscriptions || []);
    } catch {
      toast.error("Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handlePurchase = (plan: Plan) => {
    if (plan.id === "basic") {
      if (activeSubscription) {
        handleCancelSubscription(activeSubscription.id);
      }
      return;
    }
    setPurchasingPlan(plan);
    setPurchaseDialogOpen(true);
  };

  const confirmPurchase = async () => {
    if (!purchasingPlan || !parentId) return;
    setProcessing(true);
    try {
      // 1. Upgrade/Downgrade if active Razorpay subscription exists
      if (activeSubscription && activeSubscription.transactionId?.startsWith("sub_")) {
        const currentPrice = activeSubscription.amount;
        const newPrice = purchasingPlan.pricing[billingCycle].price;
        const immediate = newPrice > currentPrice;

        const res = await apiFetch("/api/subscriptions/razorpay/update-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscriptionId: activeSubscription.transactionId,
            planId: purchasingPlan.id,
            period: billingCycle,
            immediate,
          }),
        });

        const updateData = await res.json();
        if (!res.ok) throw new Error(updateData.error || "Failed to update subscription");

        toast.success(immediate ? "Plan Upgraded!" : "Plan Downgrade Scheduled", {
          description: immediate
            ? `Your ${purchasingPlan.name} features are now active.`
            : `Your downgrade to ${purchasingPlan.name} will take effect after this cycle.`,
        });

        setPurchaseDialogOpen(false);
        fetchSubscriptions();
        setProcessing(false);
        return;
      }

      // 2. Create New Subscription Order on Backend
      const res = await apiFetch("/api/subscriptions/razorpay/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: purchasingPlan.id,
          period: billingCycle,
          parentId,
        }),
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error || "Failed to initiate subscription");

      // 3. Open Razorpay Checkout for Subscriptions
      const options = {
        key: orderData.keyId,
        subscription_id: orderData.subscriptionId,
        name: currentUser?.tenantName ? `${currentUser.tenantName} - Premium` : "Parent Premium",
        description: `Unlocking ${purchasingPlan.name} Access`,
        image: currentUser?.tenantLogo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
        handler: async (response: any) => {
          setProcessing(true);
          try {
            const verifyRes = await apiFetch("/api/subscriptions/razorpay/verify-subscription", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
                parentId,
                planId: purchasingPlan.id,
                planName: purchasingPlan.name,
                amount: purchasingPlan.pricing[billingCycle].price,
                period: billingCycle,
              }),
            });

            if (!verifyRes.ok) throw new Error("Verification failed");

            toast.success("Welcome to Premium!", {
              description: `Your ${purchasingPlan.name} features are now active.`,
            });

            setPurchaseDialogOpen(false);
            fetchSubscriptions();
          } catch {
            toast.error("Activation Failed", {
              description: "We could not verify your payment. Please contact support.",
            });
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: currentUser?.name || "",
          email: currentUser?.email || "",
          contact: (currentUser as any)?.phone || "",
        },
        theme: {
          color: "#4f46e5",
          backdrop_color: "#0f172a",
          hide_topbar: false,
        },
        modal: {
          ondismiss: () => setProcessing(false),
          backdrop_close: false,
          confirm_close: true,
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast.error("Purchase failed", {
        description: error.message || "Could not connect to payment gateway.",
      });
      setProcessing(false);
    }
  };

  const handleCancelSubscription = (subscriptionId: string) => {
    setSubToCancel(subscriptionId);
    setCancelDialogOpen(true);
  };

  const confirmCancellation = async () => {
    if (!subToCancel) return;

    setProcessing(true);
    try {
      const targetSub = allSubscriptions.find((s) => s.id === subToCancel);
      const rzpSubId = targetSub?.transactionId || subToCancel;

      const res = await apiFetch("/api/subscriptions/razorpay/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: rzpSubId }),
      });

      if (!res.ok) throw new Error("Cancel failed");
      toast.success("Subscription Cancelled", {
        description: "Auto-renew is turned off. Your premium access remains until period end.",
      });
      await fetchSubscriptions();
    } catch (error: any) {
      toast.error("Failed to cancel subscription", { description: error.message });
    } finally {
      setProcessing(false);
      setCancelDialogOpen(false);
      setSubToCancel(null);
    }
  };

  const currentPlanId = (
    activeSubscription?.planId ||
    activeSubscription?.planName?.toLowerCase().replace(" plan", "") ||
    "basic"
  ).toLowerCase();

  if (loading) {
    return <ParentSubscriptionSkeleton />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <Script
        id="razorpay-checkout"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Parent Subscription</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a plan to track attendance, grades, report cards, and parent tools.
          </p>
        </div>
      </div>

      {/* Billing Cycle Switcher with Sidebar Pill Slider Animation */}
      <div className="flex justify-center">
        <div
          ref={cycleContainerRef}
          className="relative flex items-center p-1 rounded-xl bg-muted/80 border border-border/70 w-full max-w-md select-none"
          onPointerOver={(event) => {
            const target = (event.target as HTMLElement).closest<HTMLElement>("[data-cycle]");
            place(hoverPill.current, target && target.dataset.cycle !== billingCycle ? target : null);
          }}
          onPointerLeave={() => {
            place(hoverPill.current, null);
          }}
        >
          {/* Hover Pill (subtle accent from sidebar) */}
          <div
            ref={hoverPill}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-0 rounded-lg bg-accent/60 opacity-0 will-change-transform"
          />

          {/* Active Pill (the exact sliding spring animation as the sidebar) */}
          <div
            ref={activePill}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-0 rounded-lg bg-card text-foreground shadow-sm opacity-0 will-change-transform border border-border/80"
          />

          {/* Monthly */}
          <button
            type="button"
            data-cycle="monthly"
            onClick={() => setBillingCycle("monthly")}
            className={cn(
              "relative z-10 flex-1 py-1.5 px-3 text-xs sm:text-sm font-medium transition-colors text-center rounded-lg cursor-pointer",
              billingCycle === "monthly"
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Monthly
          </button>

          {/* Quarterly */}
          <button
            type="button"
            data-cycle="quarterly"
            onClick={() => setBillingCycle("quarterly")}
            className={cn(
              "relative z-10 flex-1 py-1.5 px-3 text-xs sm:text-sm font-medium transition-colors text-center rounded-lg inline-flex items-center justify-center gap-1.5 cursor-pointer",
              billingCycle === "quarterly"
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>Quarterly</span>
            <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20">
              Save 23%
            </span>
          </button>

          {/* Yearly */}
          <button
            type="button"
            data-cycle="yearly"
            onClick={() => setBillingCycle("yearly")}
            className={cn(
              "relative z-10 flex-1 py-1.5 px-3 text-xs sm:text-sm font-medium transition-colors text-center rounded-lg inline-flex items-center justify-center gap-1.5 cursor-pointer",
              billingCycle === "yearly"
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>Yearly</span>
            <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20">
              Save 50%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards Grid (Content from test-app) */}
      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isActive={currentPlanId === plan.id}
            cycle={billingCycle}
            onPurchase={handlePurchase}
            processing={processing}
          />
        ))}
      </div>

      {/* Trust Badges Bar */}
      <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 py-4 text-xs sm:text-sm text-muted-foreground border-y border-border">
        <div className="flex items-center gap-2">
          <Shield className="size-4 shrink-0" aria-hidden />
          <span>Secure Payment</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-4 shrink-0" aria-hidden />
          <span>Cancel Anytime</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 shrink-0" aria-hidden />
          <span>Upgrade Anytime</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="size-4 shrink-0" aria-hidden />
          <span>5000+ Parents Trust Us</span>
        </div>
      </div>

      {/* Invoices Section (Exact match with school admin manage-plan.tsx) */}
      <section className="border border-border rounded-2xl p-6 bg-card">
        <h2 className="text-base font-semibold mb-4">Invoices</h2>
        <HistoryTable subscriptions={allSubscriptions} slug={slug} />
      </section>

      {/* Cancel Subscription Section (Exact match with school admin manage-plan.tsx) */}
      {activeSubscription && currentPlanId !== "basic" && (
        <section className="border border-border rounded-2xl p-6 bg-card flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-medium">Cancel subscription</p>
            <p className="text-sm text-muted-foreground mt-0.5" suppressHydrationWarning>
              {activeSubscription.endDate
                ? `Your portal keeps premium access until ${formatSubscriptionDate(activeSubscription.endDate)}.`
                : "Your portal keeps premium access for the current period."}
            </p>
          </div>
          {activeSubscription.status === "cancelled" ? (
            <Badge variant="secondary" className="font-medium">
              Cancelling — access until{" "}
              {activeSubscription.endDate
                ? formatSubscriptionDate(activeSubscription.endDate)
                : "period end"}
            </Badge>
          ) : (
            <Button
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => handleCancelSubscription(activeSubscription.id)}
            >
              Cancel plan
            </Button>
          )}
        </section>
      )}

      {/* Purchase Confirmation Dialog */}
      <PurchaseDialog
        open={purchaseDialogOpen}
        onOpenChange={setPurchaseDialogOpen}
        plan={purchasingPlan}
        cycle={billingCycle}
        processing={processing}
        onConfirm={confirmPurchase}
        userName={currentUser?.name}
      />

      {/* Cancellation Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive dark:bg-destructive/20 mb-1">
              <TriangleAlert className="size-6" />
            </div>
            <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              Your premium features will remain active until the end of the current billing cycle.
              After that, your account will revert to the free plan and automatic renewals will stop.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancellation}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ParentSubscriptionSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div className="space-y-2 pb-6 border-b border-border">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="flex justify-center">
        <Skeleton className="h-10 w-full max-w-md rounded-xl" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="border border-border rounded-2xl p-5 pt-10 flex flex-col gap-4">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-7 w-24" />
            <div className="border-t border-border pt-4 grid gap-2">
              {[0, 1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </div>
            <Skeleton className="h-9 w-full rounded-md mt-auto" />
          </div>
        ))}
      </div>
      <div className="border border-border rounded-2xl p-6 space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
