"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Search, CircleDollarSign, TrendingUp, Percent, DollarSign, Eye } from 'lucide-react';
import { useFeeReceipts } from '@/hooks/use-fees';
import { paymentMethodConfig, receiptStatusConfig } from './config';
import type { FeeReceipt } from './types';

export function CheckPaymentsTab() {
  const { data, isLoading: loading } = useFeeReceipts();
  const payments = data?.items || [];
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<FeeReceipt | null>(null);

  const filtered = useMemo(() => {
    if (!Array.isArray(payments)) return [];
    return payments.filter(p => {
      const matchSearch = search === '' || p.studentName.toLowerCase().includes(search.toLowerCase()) || p.receiptNumber.toLowerCase().includes(search.toLowerCase());
      const matchMethod = methodFilter === 'all' || p.paymentMethod === methodFilter;
      const matchDateRange = (fromDate === '' || p.paidDate >= fromDate) && (toDate === '' || p.paidDate <= toDate);
      let matchDatePreset = true;
      const today = new Date();
      if (dateFilter === 'today') {
        matchDatePreset = p.paidDate === today.toISOString().split('T')[0];
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchDatePreset = p.paidDate >= weekAgo.toISOString().split('T')[0];
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        matchDatePreset = p.paidDate >= monthAgo.toISOString().split('T')[0];
      }
      return matchSearch && matchMethod && matchDateRange && matchDatePreset;
    });
  }, [payments, search, methodFilter, dateFilter, fromDate, toDate]);

  const totalPaid = filtered.reduce((s, p) => s + p.paidAmount, 0);
  const totalConcessions = filtered.reduce((s, p) => s + p.concessionTotal, 0);
  const totalOriginal = filtered.reduce((s, p) => s + p.totalAmount, 0);
  const avgPayment = filtered.length > 0 ? totalPaid / filtered.length : 0;

  const methodDistribution = useMemo(() => {
    const dist: Record<string, { count: number; total: number }> = {};
    filtered.forEach(p => {
      if (!dist[p.paymentMethod]) dist[p.paymentMethod] = { count: 0, total: 0 };
      dist[p.paymentMethod].count++;
      dist[p.paymentMethod].total += p.paidAmount;
    });
    return dist;
  }, [filtered]);

  const dailyTotals = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    filtered.forEach(p => {
      const existing = map.get(p.paidDate) || { count: 0, total: 0 };
      existing.count++;
      existing.total += p.paidAmount;
      map.set(p.paidDate, existing);
    });
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a)).slice(0, 10);
  }, [filtered]);

  const summaryCards = [
    { label: 'Total Payments', amount: totalPaid, icon: <CircleDollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />, color: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Total Original', amount: totalOriginal, icon: <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />, color: 'bg-amber-100 dark:bg-amber-900/30' },
    { label: 'Concessions Given', amount: totalConcessions, icon: <Percent className="h-5 w-5 text-violet-600 dark:text-violet-400" />, color: 'bg-violet-100 dark:bg-violet-900/30' },
    { label: 'Avg. Payment', amount: avgPayment, icon: <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />, color: 'bg-blue-100 dark:bg-blue-900/30' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(card => (
          <Card key={card.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${card.color}`}>{card.icon}</div>
              </div>
              <p className="text-2xl font-bold">₹{Math.round(card.amount).toLocaleString()}</p>
              {card.label === 'Total Payments' && (
                <p className="text-xs text-muted-foreground mt-1">{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Method Distribution */}
      {Object.keys(methodDistribution).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Payment Method Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(methodDistribution).map(([method, data]) => {
                const cfg = paymentMethodConfig[method] || paymentMethodConfig.cash;
                return (
                  <div key={method} className="flex items-center gap-3 p-3 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${cfg.color}`}>{cfg.icon}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium capitalize">{method}</p>
                      <p className="text-xs text-muted-foreground">{data.count} × ₹{data.total.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
        <div className="relative flex-1 max-w-sm min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, phone, or receipt #..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Method" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="cheque">Cheque</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="upi">UPI</SelectItem>
            <SelectItem value="card">Card</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={v => { setDateFilter(v); if (v !== 'custom') { setFromDate(''); setToDate(''); } }}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Period" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
        {dateFilter === 'custom' && (
          <>
            <Input type="date" className="w-full sm:w-36" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            <Input type="date" className="w-full sm:w-36" value={toDate} onChange={e => setToDate(e.target.value)} />
          </>
        )}
      </div>

      {/* Daily Totals */}
      {dailyTotals.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Daily Collection Summary</CardTitle>
            <CardDescription>Top 10 collection days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dailyTotals.map(([date, data]) => {
                const maxTotal = Math.max(...dailyTotals.map(([, d]) => d.total), 1);
                const pct = Math.round((data.total / maxTotal) * 100);
                return (
                  <div key={date} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-24 shrink-0 font-mono">{date}</span>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500 flex items-center justify-end pr-2" style={{ width: `${Math.max(pct, 15)}%` }}>
                        <span className="text-[10px] font-semibold text-white">{data.count} txn</span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold w-24 text-right">₹{data.total.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Transactions</CardTitle>
          <CardDescription>{filtered.length} payment{filtered.length !== 1 ? 's' : ''} found</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CircleDollarSign className="h-10 w-10 mb-2 opacity-30" />
              <p className="text-sm">No payments found</p>
              <p className="text-xs mt-1">Payments will appear here once fees are collected</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt #</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="hidden sm:table-cell">Original</TableHead>
                    <TableHead className="hidden sm:table-cell">Concession</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="w-24 text-center">Status</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(p => {
                    const cfg = paymentMethodConfig[p.paymentMethod] || paymentMethodConfig.cash;
                    const stCfg = receiptStatusConfig[p.status] || receiptStatusConfig.completed;
                    return (
                      <TableRow key={p.id} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors">
                        <TableCell>
                          <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">{p.receiptNumber}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[10px] font-semibold">
                              {p.studentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium text-sm">{p.studentName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium capitalize ${cfg.color}`}>{cfg.icon}{p.paymentMethod}</div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">₹{p.totalAmount.toLocaleString()}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-amber-600 dark:text-amber-400">{p.concessionTotal > 0 ? `-₹${p.concessionTotal.toLocaleString()}` : '—'}</TableCell>
                        <TableCell><span className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">₹{p.paidAmount.toLocaleString()}</span></TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{p.paidDate}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={`${stCfg.bg} border-0 font-medium capitalize text-xs`}>{p.status}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30" onClick={() => { setSelectedPayment(p); setViewDialogOpen(true); }}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Payment Detail Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CircleDollarSign className="h-5 w-5 text-emerald-600" />
              Payment Details
            </DialogTitle>
            <DialogDescription>{selectedPayment?.receiptNumber}</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">
                  {selectedPayment.studentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{selectedPayment.studentName}</p>
                  <p className="text-xs text-muted-foreground">Student ID: {selectedPayment.studentId.slice(0, 8)}...</p>
                </div>
              </div>

              <div className="space-y-2 p-4 rounded-xl border bg-muted/30">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Original Amount</span>
                  <span className="font-medium">₹{selectedPayment.totalAmount.toLocaleString()}</span>
                </div>
                {selectedPayment.concessionTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Concession</span>
                    <span className="font-medium text-amber-600 dark:text-amber-400">-₹{selectedPayment.concessionTotal.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between text-base font-bold">
                  <span>Amount Paid</span>
                  <span className="text-emerald-600 dark:text-emerald-400">₹{selectedPayment.paidAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border bg-muted/20">
                  <p className="text-xs text-muted-foreground mb-1">Payment Method</p>
                  <div className="flex items-center gap-1.5 capitalize text-sm font-medium">
                    {(paymentMethodConfig[selectedPayment.paymentMethod] || paymentMethodConfig.cash).icon}
                    {selectedPayment.paymentMethod}
                  </div>
                </div>
                <div className="p-3 rounded-lg border bg-muted/20">
                  <p className="text-xs text-muted-foreground mb-1">Payment Date</p>
                  <p className="text-sm font-medium">{selectedPayment.paidDate}</p>
                </div>
                <div className="p-3 rounded-lg border bg-muted/20">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Badge variant="outline" className={`${(receiptStatusConfig[selectedPayment.status] || receiptStatusConfig.completed).bg} border-0 capitalize`}>{selectedPayment.status}</Badge>
                </div>
                <div className="p-3 rounded-lg border bg-muted/20">
                  <p className="text-xs text-muted-foreground mb-1">Fee Items</p>
                  <p className="text-sm font-medium">{selectedPayment.feeItems?.length || 0} item(s)</p>
                </div>
              </div>

              {selectedPayment.feeItems && selectedPayment.feeItems.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Fee Items</p>
                  <div className="divide-y rounded-lg border overflow-hidden">
                    {selectedPayment.feeItems.map((item, idx) => (
                      <div key={item.id} className="flex items-center justify-between px-3 py-2 hover:bg-muted/50 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="h-5 w-5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                          <span className="font-medium">{item.feeCategoryName || item.type}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">₹{item.paidAmount.toLocaleString()}</span>
                          {item.concession > 0 && <span className="text-xs text-amber-500 ml-1">(-₹{item.concession.toLocaleString()})</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedPayment.remarks && (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-1">Remarks</p>
                  <p className="text-sm text-amber-800 dark:text-amber-300">{selectedPayment.remarks}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
