"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Crown,
  Shield,
  Clock,
  TrendingUp,
  Receipt,
  Loader2,
  Users as UsersIcon,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { useAppStore } from "@/store/use-app-store";

// Sub-components
import { PlanCard } from "./subscription/PlanCard";
import { AddonCard } from "./subscription/AddonCard";
import { HistoryTable } from "./subscription/HistoryTable";
import { PurchaseDialog } from "./subscription/PurchaseDialog";
import { CurrentPlanBanner } from "./subscription/CurrentPlanBanner";

// Types & Constants
import { Plan, Addon, SubscriptionRecord } from "./subscription/types";
import { PLANS, ADDONS } from "./subscription/constants";

export function ParentSubscription() {
  const { currentUser } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [parentId, setParentId] = useState<string | null>(null);
  const [activeSubscription, setActiveSubscription] = useState<SubscriptionRecord | null>(null);
  const [allSubscriptions, setAllSubscriptions] = useState<SubscriptionRecord[]>([]);
  
  // Dialog States
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [purchasingPlan, setPurchasingPlan] = useState<Plan | null>(null);
  const [processing, setProcessing] = useState(false);
  const [addonLoading, setAddonLoading] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async (pid: string) => {
    try {
      const res = await apiFetch(`/api/subscriptions?parentId=${pid}`);
      if (!res.ok) throw new Error("Failed to fetch subscriptions");
      const data = await res.json();
      setActiveSubscription(data.activeSubscription || null);
      setAllSubscriptions(data.subscriptions || []);
    } catch {
      toast.error("Failed to load subscription data");
    }
  }, []);

  useEffect(() => {
    async function init() {
      if (!currentUser?.email) {
        setLoading(false);
        return;
      }
      try {
        const parentsRes = await apiFetch("/api/parents");
        if (!parentsRes.ok) throw new Error("Failed to fetch parents");
        const parents = await parentsRes.json();
        const matched = parents.find(
          (p: { email: string }) => p.email === currentUser.email,
        );
        if (!matched) {
          setLoading(false);
          return;
        }
        setParentId(matched.id);
        await fetchSubscriptions(matched.id);
      } catch {
        toast.error("Failed to load parent data");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [currentUser?.email, fetchSubscriptions]);

  const handlePurchase = (plan: Plan) => {
    if (plan.price === 0) {
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
      const res = await apiFetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "purchase",
          parentId,
          planId: purchasingPlan.id,
          planName: purchasingPlan.name,
          amount: purchasingPlan.price,
          period: purchasingPlan.period === "per year" ? "yearly" : "monthly",
          addons: [],
        }),
      });
      if (!res.ok) throw new Error("Purchase failed");
      toast.success(`Successfully subscribed to ${purchasingPlan.name} plan! 🎉`);
      setPurchaseDialogOpen(false);
      setPurchasingPlan(null);
      await fetchSubscriptions(parentId);
    } catch {
      toast.error("Purchase failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      const res = await apiFetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", subscriptionId }),
      });
      if (!res.ok) throw new Error("Cancel failed");
      toast.info("Subscription cancelled. You are now on the Basic plan.");
      await fetchSubscriptions(parentId!);
    } catch {
      toast.error("Failed to cancel subscription.");
    }
  };

  const handleAddonChange = async (addon: Addon) => {
    if (!parentId) return;
    setAddonLoading(addon.id);
    try {
      const res = await apiFetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add-addon",
          parentId,
          addonName: addon.name,
          addonPrice: addon.price,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        if (err.error === "No active subscription") {
          toast.error("Please subscribe to a paid plan first to add add-ons.");
          return;
        }
        throw new Error("Failed to add addon");
      }
      toast.success(`${addon.name} added to your subscription!`);
      await fetchSubscriptions(parentId);
    } catch {
      toast.error("Failed to add addon. Please try again.");
    } finally {
      setAddonLoading(null);
    }
  };

  const currentPlanId = activeSubscription?.planId || "basic";
  const activeAddons: string[] = activeSubscription
    ? JSON.parse(activeSubscription.addons || "[]")
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <span className="ml-3 text-gray-500 dark:text-gray-400">Loading subscriptions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white mb-4 shadow-lg shadow-amber-200 dark:shadow-amber-900/30">
          <Crown className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Subscription Plans</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Choose the plan that works best for you. Upgrade or downgrade anytime.
        </p>
      </div>

      {/* Current Plan Banner */}
      {activeSubscription && currentPlanId !== "basic" && (
        <CurrentPlanBanner 
          subscription={activeSubscription} 
          onCancel={handleCancelSubscription} 
        />
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isActive={currentPlanId === plan.id}
            onPurchase={handlePurchase}
          />
        ))}
      </div>

      {/* Add-ons */}
      <div className="pt-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Boost Your Plan</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Add extra features to any subscription
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {ADDONS.map((addon) => (
            <AddonCard
              key={addon.id}
              addon={addon}
              isAdded={activeAddons.includes(addon.name)}
              isLoading={addonLoading === addon.id}
              onAdd={handleAddonChange}
            />
          ))}
        </div>
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap justify-center gap-6 py-4 text-sm text-gray-400 dark:text-gray-500 border-y border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1.5"><Shield className="h-4 w-4" /><span>Secure Payment</span></div>
        <div className="flex items-center gap-1.5"><Clock className="h-4 w-4" /><span>Cancel Anytime</span></div>
        <div className="flex items-center gap-1.5"><TrendingUp className="h-4 w-4" /><span>Upgrade Anytime</span></div>
        <div className="flex items-center gap-1.5"><UsersIcon className="h-4 w-4" /><span>5000+ Parents Trust Us</span></div>
      </div>

      {/* Payment History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Payment History</h3>
        </div>
        <Card className="rounded-xl border-gray-200 dark:border-gray-700 shadow-none overflow-hidden">
          <CardContent className="p-0">
            <HistoryTable subscriptions={allSubscriptions} />
          </CardContent>
        </Card>
      </div>

      {/* Purchase Confirmation Dialog */}
      <PurchaseDialog
        open={purchaseDialogOpen}
        onOpenChange={setPurchaseDialogOpen}
        plan={purchasingPlan}
        processing={processing}
        onConfirm={confirmPurchase}
        userName={currentUser?.name}
      />
    </div>
  );
}
