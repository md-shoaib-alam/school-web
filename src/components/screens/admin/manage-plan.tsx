"use client";

import { useState } from "react";
import Script from "next/script";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, BadgeCheck, Check, Star, TriangleAlert } from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import { useTenantMetadata } from "@/lib/graphql/hooks/platform.hooks";
import { SCHOOL_PLANS, SchoolPlan } from "@/lib/billing-constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function ManagePlanScreen() {
  const { push } = useRouter();
  const { slug } = useParams();
  const queryClient = useQueryClient();
  const { currentTenantId } = useAppStore();
  const { data: detailData, isLoading: isDetailLoading } = useTenantMetadata(currentTenantId || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [highlight] = useState<string | null>(
    () => new URLSearchParams(window.location.search).get("plan")
  );
  const [showAllInvoices, setShowAllInvoices] = useState(false);
  const { data: invoiceData } = useQuery({
    queryKey: ["tenant-invoices", currentTenantId],
    queryFn: () => api.get("/tenants/invoices"),
    enabled: !!currentTenantId,
    staleTime: 60_000,
  });

  const tenant = detailData?.tenant;

  const handleUpgrade = async (plan: SchoolPlan) => {
    setIsUpdating(true);
    try {
      const orderData = await api.post("/tenants/create-subscription-order", {
        planId: plan.id,
      });

      const { orderId, amount, currency, keyId } = orderData;

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "Eylisia School SaaS",
        description: `Upgrade to ${plan.name} Plan`,
        image: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
        order_id: orderId,
        handler: async (response: any) => {
          setIsUpdating(true);
          try {
            await api.post("/tenants/verify-subscription-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success("Subscription Active!", {
              description: `You are now on the ${plan.name} plan.`,
            });

            queryClient.invalidateQueries({ queryKey: ["tenant-detail", currentTenantId] });
            queryClient.invalidateQueries({ queryKey: ["tenant", "metadata", currentTenantId] });
            push(`/${slug}/school-subscription`);
          } catch (verifyErr: any) {
            toast.error("Verification Failed", {
              description: "Please contact support if your payment was debited.",
            });
          } finally {
            setIsUpdating(false);
          }
        },
        prefill: {
          name: tenant?.name || "",
          email: tenant?.email || "",
          contact: tenant?.phone || "",
        },
        notes: {
          tenantId: currentTenantId,
          planId: plan.id,
        },
        theme: {
          color: "#4f46e5",
        },
        modal: {
          ondismiss: () => setIsUpdating(false),
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error("Payment Initiation Failed", {
        description: err.message || "Could not connect to payment gateway.",
      });
      setIsUpdating(false);
    }
  };

  if (isDetailLoading || !tenant) {
    return <ManagePlanSkeleton />;
  }

  const currentId = (tenant.plan || "").toLowerCase();
  const renewalParsed = tenant.endDate ? new Date(tenant.endDate) : null;
  const renewal =
    renewalParsed && !Number.isNaN(renewalParsed.getTime()) ? renewalParsed : null;
  const isCancelled = tenant.status === "cancelled";
  const isExpired = renewal ? renewal.getTime() < Date.now() : false;
  const invoices = ((invoiceData as any)?.invoices ?? []) as InvoiceRow[];
  const visibleInvoices = showAllInvoices ? invoices : invoices.slice(0, 3);
  const fmtDate = (v: string) =>
    new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const handleCancel = async () => {
    try {
      await api.post("/tenants/cancel-subscription", {});
      toast.success("Subscription cancelled", {
        description: renewal
          ? `Your school keeps access until ${fmtDate(renewal.toISOString())}.`
          : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["tenant", "metadata", currentTenantId] });
      queryClient.invalidateQueries({ queryKey: ["tenant-detail", currentTenantId] });
    } catch (err: any) {
      toast.error("Could not cancel subscription", {
        description: err.message || "Please try again.",
      });
    }
  };
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <Script
        id="razorpay-checkout"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <button
        type="button"
        onClick={() => push(`/${slug}/school-subscription`)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Back to subscription
      </button>

      <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Manage plan</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Change your plan and billing for {tenant.name}.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {SCHOOL_PLANS.map((p) => {
          const isCurrent = p.id === currentId;
          const limits: [string, number][] = [
            ["students", p.limits.students],
            ["teachers", p.limits.teachers],
            ["parents", p.limits.parents],
            ["classes", p.limits.classes],
          ];
          return (
            <div
              key={p.id}
              className={cn(
                "relative bg-card border rounded-2xl p-5 pt-10 flex flex-col gap-4",
                p.popular ? "border-2 border-foreground" : "border-border",
                highlight?.toLowerCase() === p.id && "ring-1 ring-primary"
              )}
            >
              {p.popular && (
                <span className="absolute top-0 right-0 flex items-center gap-1 rounded-bl-lg rounded-tr-2xl bg-foreground text-background px-3 py-1.5 text-xs font-semibold">
                  <Star className="size-3 fill-current" aria-hidden />
                  Recommended
                </span>
              )}
              {isCurrent && (
                <span className="absolute top-0 left-0 flex items-center gap-1 rounded-br-lg rounded-tl-2xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white">
                  <BadgeCheck className="size-3.5" aria-hidden />
                  Current plan
                </span>
              )}
              <h3 className="text-base font-semibold">{p.name}</h3>
              <span className="text-2xl font-semibold tracking-tight tabular-nums">
                ₹{p.price.toLocaleString("en-IN")}{" "}
                <span className="text-sm font-normal text-muted-foreground">/ month</span>
              </span>
              <ul className="grid gap-2 text-sm text-muted-foreground">
                {limits.map(([label, value]) => (
                  <li key={label} className="flex items-center gap-2">
                    <Check className="size-3.5 shrink-0" aria-hidden />
                    <span>
                      <b className="text-foreground font-medium tabular-nums">
                        {value.toLocaleString("en-IN")}
                      </b>{" "}
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
              <ul className="grid gap-2 text-sm text-muted-foreground border-t border-border pt-4">
                {p.features.map((f) => {
                  const text = typeof f === "string" ? f : f.text;
                  return (
                    <li key={text} className="flex items-center gap-2">
                      <Check className="size-3.5 shrink-0" aria-hidden />
                      {text}
                    </li>
                  );
                })}
              </ul>
              <Button
                className="mt-auto"
                variant={isCurrent && !isExpired ? "outline" : "default"}
                disabled={(isCurrent && !isExpired) || isUpdating}
                onClick={() => handleUpgrade(p)}
              >
                {isCurrent ? (isExpired ? `Renew ${p.name}` : "Current plan") : `Choose ${p.name}`}
              </Button>
            </div>
          );
        })}
      </div>

      <section className="border border-border rounded-2xl p-6 bg-card">
        <h2 className="text-base font-semibold mb-4">Invoices</h2>
        {invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No invoices yet. They appear here after each payment.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Date</th>
                    <th className="py-2 pr-4 font-medium">Plan</th>
                    <th className="py-2 pr-4 font-medium">Amount</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 font-medium text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {visibleInvoices.map((inv) => (
                    <tr key={inv.id} className="border-t border-border">
                      <td className="py-3 pr-4 tabular-nums" suppressHydrationWarning>
                        {fmtDate(inv.createdAt)}
                      </td>
                      <td className="py-3 pr-4">{inv.planName}</td>
                      <td className="py-3 pr-4 tabular-nums">
                        ₹{Number(inv.amount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 pr-4 capitalize text-muted-foreground">{inv.status}</td>
                      <td className="py-3 text-right">
                        <Button asChild variant="outline" size="sm" className="h-7 px-2.5">
                          <a
                            href={`/invoice/${slug}/${inv.number ?? inv.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View invoice
                          </a>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {invoices.length > 3 && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setShowAllInvoices((v) => !v)}
              >
                {showAllInvoices ? "Show less" : "See more"}
              </Button>
            )}
          </>
        )}
      </section>

      <section className="border border-border rounded-2xl p-6 bg-card flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-medium">Cancel subscription</p>
          <p className="text-sm text-muted-foreground mt-0.5" suppressHydrationWarning>
            {renewal
              ? `Your school keeps access until ${fmtDate(renewal.toISOString())}.`
              : "Your school keeps access for the current period."}
          </p>
        </div>
        {isCancelled ? (
          <Badge variant="secondary" className="font-medium">
            Cancelling — access until {renewal ? fmtDate(renewal.toISOString()) : "period end"}
          </Badge>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                Cancel plan
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive dark:bg-destructive/20">
                  <TriangleAlert className="size-6" />
                </div>
                <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
                <Badge variant="destructive" className="font-normal">
                  {renewal
                    ? `Access until ${fmtDate(renewal.toISOString())}`
                    : "Ends this period"}
                </Badge>
                <AlertDialogDescription>
                  {renewal
                    ? `You keep full access until ${fmtDate(renewal.toISOString())}. After that, logins pause until you renew — nothing is deleted.`
                    : "Logins pause at the end of the current period. Nothing is deleted."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep my plan</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-white hover:bg-destructive/90"
                  onClick={handleCancel}
                >
                  Cancel my plan
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </section>
    </div>
  );
}

interface InvoiceRow {
  id: string;
  number?: number;
  planName: string;
  amount: number;
  status: string;
  transactionId: string | null;
  startDate: string;
  endDate: string | null;
  createdAt: string;
}


function ManagePlanSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <Skeleton className="h-4 w-32" />
      <div className="space-y-2 pb-6 border-b border-border">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="border border-border rounded-2xl p-5 pt-10 flex flex-col gap-4">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-7 w-24" />
            <div className="grid gap-2">
              {[0, 1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </div>
            <div className="border-t border-border pt-4 grid gap-2">
              {[0, 1, 2, 3, 4].map((j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </div>
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        ))}
      </div>
      <div className="border border-border rounded-2xl p-6 space-y-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="border border-border rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
    </div>
  );
}
