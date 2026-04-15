"use client";


import { apiFetch } from "@/lib/api";
import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Crown,
  Check,
  Star,
  Zap,
  Shield,
  CreditCard,
  Calendar,
  ArrowRight,
  Gift,
  Clock,
  Users,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  CircleDollarSign,
  Receipt,
  Loader2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/store/use-app-store";

interface Plan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  period: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  popular?: boolean;
  icon: React.ReactNode;
  features: { text: string; included: boolean }[];
}

const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 0,
    period: "Forever Free",
    description: "Essential access to track your child's progress",
    icon: <BookOpen className="h-6 w-6" />,
    features: [
      { text: "View child's grades & reports", included: true },
      { text: "Basic attendance overview", included: true },
      { text: "View school notices", included: true },
      { text: "Fee payment status", included: true },
      { text: "Detailed performance analytics", included: false },
      { text: "Real-time notifications", included: false },
      { text: "Parent-teacher chat", included: false },
      { text: "Monthly progress reports", included: false },
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: 299,
    originalPrice: 499,
    period: "per year",
    description: "Complete visibility into your child's academics",
    badge: "Most Popular",
    badgeColor: "bg-amber-500",
    popular: true,
    icon: <Star className="h-6 w-6" />,
    features: [
      { text: "View child's grades & reports", included: true },
      { text: "Detailed attendance with trends", included: true },
      { text: "View school notices", included: true },
      { text: "Online fee payment", included: true },
      { text: "Detailed performance analytics", included: true },
      { text: "Real-time notifications", included: true },
      { text: "Parent-teacher chat", included: false },
      { text: "Monthly progress reports (PDF)", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 599,
    originalPrice: 999,
    period: "per year",
    description: "The ultimate parental engagement experience",
    badge: "Best Value",
    badgeColor: "bg-emerald-500",
    icon: <Crown className="h-6 w-6" />,
    features: [
      { text: "View child's grades & reports", included: true },
      { text: "Detailed attendance with AI insights", included: true },
      { text: "Priority notices & alerts", included: true },
      { text: "Online fee payment with discounts", included: true },
      { text: "AI-powered performance analytics", included: true },
      { text: "Instant push notifications", included: true },
      { text: "Direct parent-teacher chat", included: true },
      { text: "Monthly progress reports (PDF + email)", included: true },
    ],
  },
];

interface Addon {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

const ADDONS: Addon[] = [
  {
    id: "transport",
    name: "Live Bus Tracking",
    price: 99,
    period: "per year",
    description: "Track school bus in real-time",
    icon: <Zap className="h-5 w-5" />,
    features: [
      "Real-time GPS tracking",
      "ETA notifications",
      "Geofence alerts",
    ],
  },
  {
    id: "meals",
    name: "Meal Plan",
    price: 149,
    period: "per month",
    description: "Healthy meals for your child",
    icon: <Gift className="h-5 w-5" />,
    features: [
      "Daily lunch included",
      "Nutritional reports",
      "Special diet options",
    ],
  },
];

interface SubscriptionRecord {
  id: string;
  planName: string;
  planId: string;
  amount: number;
  period: string;
  status: string;
  transactionId: string | null;
  startDate: string;
  endDate: string | null;
  autoRenew: boolean;
  addons: string;
  createdAt: string;
}

export function ParentSubscription() {
  const { currentUser } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [parentId, setParentId] = useState<string | null>(null);
  const [activeSubscription, setActiveSubscription] =
    useState<SubscriptionRecord | null>(null);
  const [allSubscriptions, setAllSubscriptions] = useState<
    SubscriptionRecord[]
  >([]);
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
      const data = await res.json();
      toast.success(
        `Successfully subscribed to ${purchasingPlan.name} plan! 🎉`,
      );
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
        <span className="ml-3 text-gray-500 dark:text-gray-400">
          Loading subscriptions...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white mb-4 shadow-lg shadow-amber-200 dark:shadow-amber-900/30">
          <Crown className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Subscription Plans
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Choose the plan that works best for you. Upgrade or downgrade anytime.
        </p>
      </div>

      {/* Current Plan Banner */}
      {activeSubscription && currentPlanId !== "basic" && (
        <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-emerald-800 dark:text-emerald-300">
                  Active: {activeSubscription.planName} Plan
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  {activeSubscription.endDate
                    ? `Renews on ${new Date(activeSubscription.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                    : `Started ${new Date(activeSubscription.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                  {activeSubscription.autoRenew && " • Auto-renew ON"}
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
              onClick={() => handleCancelSubscription(activeSubscription.id)}
            >
              Cancel Plan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isActive = currentPlanId === plan.id;
          const isPopular = plan.popular;

          return (
            <Card
              key={plan.id}
              className={`relative rounded-2xl transition-all duration-300 hover:shadow-lg ${
                isPopular
                  ? "border-amber-300 dark:border-amber-800 shadow-md ring-2 ring-amber-100 dark:ring-amber-900/30"
                  : isActive
                    ? "border-emerald-300 dark:border-emerald-800 shadow-md ring-2 ring-emerald-100 dark:ring-emerald-900/30"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${plan.badgeColor}`}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              <CardHeader className={`pt-8 ${isPopular ? "pb-2" : ""}`}>
                <div className="flex items-center justify-between">
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                      isPopular
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                        : isActive
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {plan.icon}
                  </div>
                  {isActive && (
                    <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                    </Badge>
                  )}
                </div>
                <div className="mt-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {plan.description}
                  </CardDescription>
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  {plan.price === 0 ? (
                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      Free
                    </span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        ₹{plan.price}
                      </span>
                      {plan.originalPrice && (
                        <span className="text-sm text-gray-400 dark:text-gray-500 line-through ml-2">
                          ₹{plan.originalPrice}
                        </span>
                      )}
                    </>
                  )}
                  {plan.period !== "Forever Free" && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                      / {plan.period}
                    </span>
                  )}
                </div>
                {plan.originalPrice && (
                  <Badge className="mt-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 text-xs">
                    Save{" "}
                    {Math.round(
                      ((plan.originalPrice - plan.price) / plan.originalPrice) *
                        100,
                    )}
                    %
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="pt-0">
                <Button
                  className={`w-full h-11 text-sm font-semibold rounded-xl mt-2 ${
                    isActive
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
                      : isPopular
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md"
                        : "bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900"
                  }`}
                  onClick={() => (isActive ? null : handlePurchase(plan))}
                  disabled={isActive}
                >
                  {isActive ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Current Plan
                    </>
                  ) : plan.price === 0 ? (
                    "Switch to Free"
                  ) : (
                    <>
                      Get {plan.name} <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>

                <Separator className="my-5" />

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    What&apos;s included
                  </p>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      {feature.included ? (
                        <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="h-3 w-3" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs">✕</span>
                        </div>
                      )}
                      <span
                        className={`text-sm ${feature.included ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"}`}
                      >
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add-ons */}
      <div>
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Boost Your Plan
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Add extra features to any subscription
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {ADDONS.map((addon) => {
            const isAdded = activeAddons.includes(addon.name);
            const isLoading = addonLoading === addon.id;

            return (
              <Card
                key={addon.id}
                className="rounded-xl border-gray-200 dark:border-gray-700 hover:border-amber-200 dark:hover:border-amber-800 hover:shadow-md transition-all"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      {addon.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {addon.name}
                        </h4>
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          ₹{addon.price}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {addon.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {addon.features.map((f) => (
                          <span
                            key={f}
                            className="inline-flex items-center text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-full px-2 py-0.5"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`w-full mt-4 rounded-lg text-xs ${
                          isAdded
                            ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                            : "border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30"
                        }`}
                        onClick={() => handleAddonChange(addon)}
                        disabled={isAdded || isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : isAdded ? (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        ) : null}
                        {isAdded ? "Added" : "Add to Plan"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400 dark:text-gray-500">
        <div className="flex items-center gap-1.5">
          <Shield className="h-4 w-4" />
          <span>Secure Payment</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>Cancel Anytime</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4" />
          <span>Upgrade Anytime</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          <span>5000+ Parents Trust Us</span>
        </div>
      </div>

      {/* Payment History */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Payment History
          </h3>
        </div>
        <Card className="rounded-xl">
          <CardContent className="p-0">
            {allSubscriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
                <Receipt className="h-10 w-10 mb-3 opacity-40" />
                <p className="text-sm font-medium">No payment history</p>
                <p className="text-xs mt-1">
                  Your past subscriptions will appear here
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 dark:bg-gray-800/50">
                      <TableHead className="font-semibold text-gray-600 dark:text-gray-400">
                        Plan
                      </TableHead>
                      <TableHead className="font-semibold text-gray-600 dark:text-gray-400">
                        Amount
                      </TableHead>
                      <TableHead className="font-semibold text-gray-600 dark:text-gray-400">
                        Date
                      </TableHead>
                      <TableHead className="font-semibold text-gray-600 dark:text-gray-400">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-gray-600 dark:text-gray-400">
                        Transaction ID
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allSubscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                          {sub.planName}
                          {sub.period && (
                            <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">
                              ({sub.period})
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">
                          {sub.amount === 0 ? (
                            <span className="text-gray-400 dark:text-gray-500">
                              Free
                            </span>
                          ) : (
                            <span>₹{sub.amount.toLocaleString()}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-500 dark:text-gray-400">
                          {new Date(sub.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          {sub.status === "active" ? (
                            <Badge className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                            </Badge>
                          ) : (
                            <Badge className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 text-xs">
                              <XCircle className="h-3 w-3 mr-1" /> Cancelled
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-gray-400 dark:text-gray-500 font-mono max-w-[140px] truncate">
                          {sub.transactionId || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-amber-500" />
              Confirm Purchase
            </DialogTitle>
            <DialogDescription>
              You are about to subscribe to the {purchasingPlan?.name} plan.
            </DialogDescription>
          </DialogHeader>

          {purchasingPlan && (
            <div className="space-y-4 py-2">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {purchasingPlan.name} Plan
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {purchasingPlan.period}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {purchasingPlan.price === 0
                          ? "Free"
                          : `₹${purchasingPlan.price}`}
                      </p>
                      {purchasingPlan.originalPrice && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 line-through">
                          ₹{purchasingPlan.originalPrice}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">
                    Card Number
                  </label>
                  <div className="h-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 flex items-center text-sm text-gray-400 dark:text-gray-500">
                    4242 •••• •••• 8888
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">
                      Expiry
                    </label>
                    <div className="h-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 flex items-center text-sm text-gray-400 dark:text-gray-500">
                      12/27
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">
                      CVV
                    </label>
                    <div className="h-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 flex items-center text-sm text-gray-400 dark:text-gray-500">
                      •••
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">
                    Cardholder Name
                  </label>
                  <div className="h-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 flex items-center text-sm text-gray-400 dark:text-gray-500">
                    {currentUser?.name || "Parent Name"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <CircleDollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  This is a demo. No real payment will be processed.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setPurchaseDialogOpen(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              onClick={confirmPurchase}
              disabled={processing}
            >
              {processing ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>Pay ₹{purchasingPlan?.price || 0}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
