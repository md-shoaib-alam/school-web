"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { PlanCard } from "./subscription/PlanCard";
import { HistoryTable } from "./subscription/HistoryTable";
import { PurchaseDialog } from "./subscription/PurchaseDialog";
import { CurrentPlanBanner } from "./subscription/CurrentPlanBanner";

// Types & Constants
import { Plan, SubscriptionRecord } from "./subscription/types";
import { PLANS } from "./subscription/constants";

export function ParentSubscription() {
  const { currentUser } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [parentId, setParentId] = useState<string | null>(null);
  const [activeSubscription, setActiveSubscription] = useState<SubscriptionRecord | null>(null);
  const [allSubscriptions, setAllSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly" | "yearly">("quarterly");
  
  // Dialog States
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [purchasingPlan, setPurchasingPlan] = useState<Plan | null>(null);
  const [processing, setProcessing] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && carouselRef.current && typeof window !== "undefined" && window.innerWidth < 768) {
      const container = carouselRef.current;
      // Use a small timeout to ensure layout is calculated
      const timer = setTimeout(() => {
        const secondCard = container.children[1] as HTMLElement;
        if (secondCard) {
          const scrollAmount = secondCard.offsetLeft - (container.offsetWidth / 2) + (secondCard.offsetWidth / 2);
          container.scrollLeft = scrollAmount;
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [loading]);


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
      // 1. Create Subscription Order on Backend
      const res = await apiFetch("/api/subscriptions/razorpay/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: purchasingPlan.id,
          period: billingCycle,
          parentId
        }),
      });
      
      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error || "Failed to initiate subscription");

      // 2. Open Razorpay Checkout for Subscriptions
      const options = {
        key: orderData.keyId,
        subscription_id: orderData.subscriptionId,
        name: currentUser?.tenantName ? `${currentUser.tenantName} - Premium` : "Eylisia Premium",
        description: `Unlocking ${purchasingPlan.name} Access`,
        image: currentUser?.tenantLogo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
        handler: async (response: any) => {
          setProcessing(true);
          try {
            // 3. Verify Payment and Activate
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
                period: billingCycle
              }),
            });

            if (!verifyRes.ok) throw new Error("Verification failed");

            toast.success("Welcome to Premium!", {
              description: `Your ${purchasingPlan.name} features are now active.`
            });
            
            setPurchaseDialogOpen(false);
            fetchSubscriptions();
          } catch (err: any) {
            toast.error("Activation Failed", {
              description: "We could not verify your payment. Please contact support."
            });
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: currentUser?.name || "",
          email: currentUser?.email || "",
          contact: (currentUser as any)?.phone || ""
        },
        theme: {
          color: "#f59e0b",
          backdrop_color: "#0f172a",
          hide_topbar: false
        },
        modal: {
          ondismiss: () => setProcessing(false),
          backdrop_close: false,
          confirm_close: true
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast.error("Purchase failed", {
        description: error.message || "Could not connect to payment gateway."
      });
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
      await fetchSubscriptions();
    } catch {
      toast.error("Failed to cancel subscription.");
    }
  };


  const currentPlanId = activeSubscription?.planId || "basic";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <span className="ml-3 text-gray-500 dark:text-gray-400">Loading subscriptions...</span>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 pb-12">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-amber-200/20 dark:bg-amber-900/10 blur-[100px] rounded-full -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-200/10 dark:bg-orange-900/5 blur-[120px] rounded-full -z-10" />

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto px-4 relative">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white mb-4 shadow-lg shadow-amber-200 dark:shadow-amber-900/30 amber-glow">
          <Crown className="h-6 w-6 sm:h-8 sm:w-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Premium Subscriptions</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto leading-relaxed">
          Unlock advanced analytics, AI-powered insights, and real-time parent-teacher engagement tools.
        </p>
      </div>

      {/* Current Plan Banner */}
      {activeSubscription && currentPlanId !== "basic" && (
        <div className="px-4">
          <CurrentPlanBanner 
            subscription={activeSubscription} 
            onCancel={handleCancelSubscription} 
          />
        </div>
      )}

      {/* Cycle Switcher */}
      <div className="flex justify-center px-4">
        <Tabs 
          value={billingCycle} 
          onValueChange={(v) => setBillingCycle(v as any)} 
          className="glass-card p-1.5 rounded-2xl shadow-xl w-full max-w-md border border-white/20 dark:border-white/5"
        >
          <TabsList className="bg-transparent h-10 sm:h-12 flex w-full gap-1 p-0">
            <TabsTrigger 
              value="monthly" 
              className="flex-1 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm data-[state=active]:text-amber-600 transition-all font-semibold text-xs sm:text-sm"
            >
              Monthly
            </TabsTrigger>
            <TabsTrigger 
              value="quarterly" 
              className="flex-1 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm data-[state=active]:text-amber-600 transition-all font-semibold text-xs sm:text-sm"
            >
              Quarterly <span className="hidden sm:inline ml-1.5 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Save 23%</span>
            </TabsTrigger>
            <TabsTrigger 
              value="yearly" 
              className="flex-1 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm data-[state=active]:text-amber-600 transition-all font-semibold text-xs sm:text-sm"
            >
              Yearly <span className="hidden sm:inline ml-1.5 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Save 50%</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Plan Cards */}
      <div 
        ref={carouselRef}
        className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 px-4 pt-4 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory"
      >
        {PLANS.map((plan) => (
          <div 
            key={plan.id} 
            id={`plan-${plan.id}`}
            className="min-w-[85%] sm:min-w-0 snap-center"
          >
            <PlanCard
              plan={plan}
              isActive={currentPlanId === plan.id}
              cycle={billingCycle}
              onPurchase={handlePurchase}
            />
          </div>
        ))}
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
        cycle={billingCycle}
        processing={processing}
        onConfirm={confirmPurchase}
        userName={currentUser?.name}
      />
    </div>
  );
}
