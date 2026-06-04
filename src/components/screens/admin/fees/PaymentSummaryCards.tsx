"use client";

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Receipt, Wallet, CreditCard, Coins } from 'lucide-react';
import { useFeeReceipts } from '@/hooks/use-fees';

export function PaymentSummaryCards() {
  const thisMonthFromDate = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  }, []);

  const currentMonthName = useMemo(() => {
    return new Date().toLocaleString('default', { month: 'long' });
  }, []);

  const { data: thisMonthData, isLoading } = useFeeReceipts({
    fromDate: thisMonthFromDate,
    limit: 1000
  });

  const thisMonthTotal = useMemo(() => {
    return thisMonthData?.items?.reduce((sum, item) => sum + item.paidAmount, 0) || 0;
  }, [thisMonthData]);

  const thisMonthCount = thisMonthData?.total || 0;

  const methodBreakdown = useMemo(() => {
    const counts: Record<string, { count: number; amount: number }> = {
      cash: { count: 0, amount: 0 },
      online: { count: 0, amount: 0 },
      cheque: { count: 0, amount: 0 }
    };
    thisMonthData?.items?.forEach(item => {
      const m = item.paymentMethod.toLowerCase();
      if (!counts[m]) {
        counts[m] = { count: 0, amount: 0 };
      }
      counts[m].count += 1;
      counts[m].amount += item.paidAmount;
    });
    return counts;
  }, [thisMonthData]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="col-span-2 sm:col-span-1 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-xs space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-32" />
        </Card>
        <Card className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-xs space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-32" />
        </Card>
        <Card className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-xs space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-32" />
        </Card>
        <Card className="hidden sm:block rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-xs space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-32" />
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Collected */}
      <Card className="col-span-2 sm:col-span-1 relative overflow-hidden rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-linear-to-br from-white to-emerald-50/10 dark:from-zinc-950 dark:to-emerald-950/5 p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-emerald-500/30 dark:hover:border-emerald-500/20 transition-all duration-300 group">
        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-wider block">Total Collected ({currentMonthName})</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Receipt className="size-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 block tracking-tight">
            ₹{thisMonthTotal.toLocaleString()}
          </span>
        </div>
        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-4 flex items-center gap-1.5 font-medium border-t pt-2 border-zinc-100 dark:border-zinc-900">
          <span className="inline-block size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {thisMonthCount} receipts issued
        </div>
      </Card>

      {/* Cash */}
      <Card className="relative overflow-hidden rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-linear-to-br from-white to-amber-50/10 dark:from-zinc-950 dark:to-amber-950/5 p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-amber-500/30 dark:hover:border-amber-500/20 transition-all duration-300 group">
        <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 dark:bg-amber-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-wider block">Cash Payments</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Wallet className="size-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 block tracking-tight">
            ₹{(methodBreakdown.cash?.amount || 0).toLocaleString()}
          </span>
        </div>
        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-4 flex items-center gap-1.5 font-medium border-t pt-2 border-zinc-100 dark:border-zinc-900">
          <span className="inline-block size-1.5 rounded-full bg-amber-500" />
          {methodBreakdown.cash?.count || 0} transactions
        </div>
      </Card>

      {/* Online */}
      <Card className="relative overflow-hidden rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-linear-to-br from-white to-indigo-50/10 dark:from-zinc-950 dark:to-indigo-950/5 p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-indigo-500/30 dark:hover:border-indigo-500/20 transition-all duration-300 group">
        <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-wider block">Online Payments</span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <CreditCard className="size-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 block tracking-tight">
            ₹{(methodBreakdown.online?.amount || 0).toLocaleString()}
          </span>
        </div>
        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-4 flex items-center gap-1.5 font-medium border-t pt-2 border-zinc-100 dark:border-zinc-900">
          <span className="inline-block size-1.5 rounded-full bg-indigo-500" />
          {methodBreakdown.online?.count || 0} transactions
        </div>
      </Card>

      {/* Cheque */}
      <Card className="hidden sm:flex relative overflow-hidden rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-linear-to-br from-white to-rose-50/10 dark:from-zinc-950 dark:to-rose-950/5 p-5 flex-col justify-between shadow-xs hover:shadow-md hover:border-rose-500/30 dark:hover:border-rose-500/20 transition-all duration-300 group">
        <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 dark:bg-rose-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-wider block">Cheque Payments</span>
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <Coins className="size-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 block tracking-tight">
            ₹{(methodBreakdown.cheque?.amount || 0).toLocaleString()}
          </span>
        </div>
        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-4 flex items-center gap-1.5 font-medium border-t pt-2 border-zinc-100 dark:border-zinc-900">
          <span className="inline-block size-1.5 rounded-full bg-rose-500" />
          {methodBreakdown.cheque?.count || 0} transactions
        </div>
      </Card>
    </div>
  );
}
