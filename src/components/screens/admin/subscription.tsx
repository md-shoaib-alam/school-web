"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { Check } from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import { useTenantMetadata } from "@/lib/graphql/hooks/platform.hooks";
import { SCHOOL_PLANS } from "@/lib/billing-constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SubscriptionHeader, { SubscriptionStatus } from "./subscription/SubscriptionHeader";

const FEATURES = [
  "Unlimited staff management",
  "Advanced fee collection",
  "Custom exam report cards",
  "Teacher and student attendance",
  "Support ticket system",
  "Academic year history",
  "Mobile app sync",
  "Cloud storage",
];

const fmt = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const validDate = (v?: string | null): Date | null => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

export function SchoolSubscriptionScreen() {
  const { currentTenantId } = useAppStore();
  const { data, isLoading } = useTenantMetadata(currentTenantId || "");
  const { push } = useRouter();
  const { slug } = useParams();

  const tenant = data?.tenant;

  if (isLoading) {
    return <SubscriptionSkeleton />;
  }

  if (!tenant) {
    return <div className="p-8 text-center text-muted-foreground">Could not load subscription information.</div>;
  }

  const catalog = SCHOOL_PLANS.find((p) => p.id === (tenant.plan || "").toLowerCase());
  const planName =
    catalog?.name ||
    (tenant.plan ? `${tenant.plan.charAt(0).toUpperCase()}${tenant.plan.slice(1)} Plan` : "Starter Plan");

  const start = validDate(tenant.startDate);
  const renewal = validDate(tenant.endDate);
  const dateExpired = renewal ? renewal.getTime() < Date.now() : false;
  const status: SubscriptionStatus =
    tenant.status === "suspended"
      ? "paused"
      : tenant.status === "cancelled"
        ? dateExpired
          ? "expired"
          : "cancelled"
        : dateExpired || (tenant.status !== "active" && tenant.status !== "trial")
          ? "expired"
          : "active";

  const usage = [
    { label: "Students", used: tenant.studentCount || 0, limit: tenant.maxStudents },
    { label: "Teachers", used: tenant.teacherCount || 0, limit: tenant.maxTeachers },
    { label: "Parents", used: tenant.parentCount || 0, limit: tenant.maxParents },
    { label: "Classes", used: tenant._count?.classes || 0, limit: tenant.maxClasses },
  ];

  const daysLeft = renewal
    ? Math.max(0, Math.ceil((renewal.getTime() - Date.now()) / 86_400_000))
    : null;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <SubscriptionHeader
        schoolName={tenant.name}
        logoUrl={tenant.logo}
        planName={planName}
        status={status}
        renewal={renewal}
        onManagePlan={() => push(`/${slug}/manage-plan`)}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Usage</CardTitle>
              <CardDescription>What you have used against your plan limits.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28">Resource</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead className="w-32 text-right">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usage.map((u) => {
                    const pct = u.limit > 0 ? Math.min(100, (u.used / u.limit) * 100) : 0;
                    return (
                      <TableRow key={u.label}>
                        <TableCell className="font-medium">{u.label}</TableCell>
                        <TableCell>
                          <Progress
                            value={pct}
                            aria-label={`${u.label} usage`}
                            indicatorClassName={pct >= 85 ? "bg-destructive" : "bg-violet-600"}
                            className="h-1.5"
                          />
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          <span className="text-foreground">{u.used.toLocaleString()}</span>
                          {" / "}
                          {u.limit.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
        </Card>

        <aside className="flex">
          <Card className="shadow-none flex-1">
            <CardHeader>
              <CardTitle className="text-base">Billing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-sm">
              <dl className="space-y-3">
                <Row label="Started" value={start ? fmt(start) : "—"} />
                <Row label="Renews" value={renewal ? fmt(renewal) : "—"} />
                <Row
                  label="Time left"
                  value={status === "expired" ? "Expired" : daysLeft !== null ? `${daysLeft} days` : "—"}
                />
              </dl>

              <Separator />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <label htmlFor="auto-renew" className="font-medium">
                    Auto-renew
                  </label>
                  <p className="mt-0.5 text-muted-foreground" suppressHydrationWarning>
                    {status === "cancelled"
                      ? renewal
                        ? `Subscription ends on ${fmt(renewal)}. No further renewals.`
                        : "Subscription cancelled."
                      : renewal
                        ? `Renews automatically on ${fmt(renewal)}.`
                        : "No renewal scheduled."}
                  </p>
                </div>
                <Switch id="auto-renew" checked={status !== "cancelled"} disabled />
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Included features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5">
                <Check className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}

function SubscriptionSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-60" />
          </div>
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <Card className="shadow-none">
          <CardHeader>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-64" />
          </CardHeader>
          <CardContent className="space-y-5 pt-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-1.5 flex-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>

        <aside className="flex">
          <Card className="shadow-none flex-1">
            <CardHeader>
              <Skeleton className="h-4 w-16" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
              <Skeleton className="h-px w-full" />
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-5 w-9 rounded-full" />
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
