"use client";

import { useState, useEffect, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { IndianRupee, AlertTriangle, Eye } from "lucide-react";
import { FeeRecord } from "@/lib/types";
import { FeeSummary, FeeTypeBreakdown, feeBreakdownConfig } from "./types";
import { SummaryCardSkeleton, ChartSkeleton, TableSkeleton } from "./SummaryComponents";

export function FeeReport() {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFees() {
      try {
        const res = await apiFetch("/api/fees");
        if (!res.ok) throw new Error("Failed to fetch fees");
        setFees(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchFees();
  }, []);

  const summary: FeeSummary = useMemo(() => {
    let total = 0;
    let collected = 0;
    for (const f of fees) {
      total += f.amount;
      collected += f.paidAmount;
    }
    return { totalFees: total, collected, pending: total - collected };
  }, [fees]);

  const typeBreakdown: FeeTypeBreakdown[] = useMemo(() => {
    const typeMap = new Map<string, { collected: number; pending: number }>();
    for (const f of fees) {
      const entry = typeMap.get(f.type) || { collected: 0, pending: 0 };
      entry.collected += f.paidAmount;
      entry.pending += f.amount - f.paidAmount;
      typeMap.set(f.type, entry);
    }
    return Array.from(typeMap.entries())
      .map(([type, data]) => ({ type, ...data }))
      .sort((a, b) => b.collected + b.pending - (a.collected + a.pending));
  }, [fees]);

  const overdueStudents = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return fees
      .filter((f) => f.status !== "paid" && f.dueDate < today)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [fees]);

  const collectionPct =
    summary.totalFees > 0
      ? ((summary.collected / summary.totalFees) * 100).toFixed(1)
      : "0";

  const summaryCards = [
    {
      label: "Total Fees",
      value: `₹${summary.totalFees.toLocaleString()}`,
      icon: <IndianRupee className="h-5 w-5 text-violet-600" />,
      color:
        "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
      border: "border-violet-200 dark:border-violet-800",
      sub: `${fees.length} records`,
    },
    {
      label: "Collected",
      value: `₹${summary.collected.toLocaleString()}`,
      icon: <IndianRupee className="h-5 w-5 text-emerald-600" />,
      color:
        "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-800",
      sub: `${collectionPct}% collection rate`,
    },
    {
      label: "Pending",
      value: `₹${summary.pending.toLocaleString()}`,
      icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
      color:
        "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800",
      sub: `${overdueStudents.length} overdue`,
    },
  ];

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30">
        <CardContent className="p-6 text-center text-red-600 dark:text-red-400">
          <IndianRupee className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="font-medium">Failed to load fee report</p>
          <p className="text-sm mt-1">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? (
          <>
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
          </>
        ) : (
          summaryCards.map((card) => (
            <Card key={card.label} className={`border ${card.border}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {card.label}
                    </p>
                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {card.sub}
                    </p>
                  </div>
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center ${card.color}`}
                  >
                    {card.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fee Breakdown by Type</CardTitle>
          <CardDescription>
            Collected vs pending amounts grouped by fee type
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ChartSkeleton />
          ) : typeBreakdown.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <IndianRupee className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No fee data available</p>
            </div>
          ) : (
            <ChartContainer
              config={feeBreakdownConfig}
              className="h-[300px] w-full"
            >
              <BarChart data={typeBreakdown}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="type"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(v: string) =>
                    v.charAt(0).toUpperCase() + v.slice(1)
                  }
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="collected"
                  fill="var(--color-collected)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="pending"
                  fill="var(--color-pending)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card className="border-amber-200 dark:border-amber-800">
        <CardHeader className="bg-amber-50/50 dark:bg-amber-900/10 border-b border-amber-200 dark:border-amber-800">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Urgent: Overdue Student Fees
          </CardTitle>
          <CardDescription className="text-amber-700/70 dark:text-amber-400/70">
            Records where due date has passed but payment is incomplete
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={4} />
          ) : overdueStudents.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p className="text-sm">No overdue records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-amber-50/30 dark:bg-amber-900/5 hover:bg-amber-50/30 dark:hover:bg-amber-900/5">
                    <TableHead>Student</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueStudents.map((f) => (
                    <TableRow key={f.id} className="border-amber-100 dark:border-amber-900/20">
                      <TableCell className="font-medium">
                        {f.studentName}
                      </TableCell>
                      <TableCell className="capitalize">{f.type}</TableCell>
                      <TableCell className="text-red-600 dark:text-red-400 font-medium">
                        {f.dueDate}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        ₹{(f.amount - f.paidAmount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4 opacity-50" />
                        </Button>
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
  );
}
