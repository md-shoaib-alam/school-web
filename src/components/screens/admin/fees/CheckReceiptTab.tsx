"use client";

import { useState, useEffect, useMemo, useCallback, useReducer, useRef } from 'react';
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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Search, Receipt, Banknote, Eye, Trash2, Printer, CheckCircle2, Calendar as CalendarIcon, CreditCard, Wallet, Coins } from 'lucide-react';
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useFeeReceipts } from '@/hooks/use-fees';
import { receiptStatusConfig, paymentMethodIcons } from './config';
import type { FeeReceipt, StudentOption } from './types';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useReactToPrint } from 'react-to-print';
import { AdminReceiptTemplate } from './AdminReceiptTemplate';

interface CheckReceiptTabProps {
  canEdit: boolean;
  canDelete: boolean;
}

type State = {
  search: string;
  debouncedSearch: string;
  classFilter: string;
  studentFilter: string;
  fromDate: string;
  toDate: string;
  page: number;
  viewReceipt: FeeReceipt | null;
  deleting: boolean;
};

type Action =
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_DEBOUNCED_SEARCH'; payload: string }
  | { type: 'SET_CLASS_FILTER'; payload: string }
  | { type: 'SET_STUDENT_FILTER'; payload: string }
  | { type: 'SET_FROM_DATE'; payload: string }
  | { type: 'SET_TO_DATE'; payload: string }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_VIEW_RECEIPT'; payload: FeeReceipt | null }
  | { type: 'SET_DELETING'; payload: boolean };

const initialState: State = {
  search: '',
  debouncedSearch: '',
  classFilter: '',
  studentFilter: '',
  fromDate: '',
  toDate: '',
  page: 1,
  viewReceipt: null,
  deleting: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_SEARCH':
      return { ...state, search: action.payload };
    case 'SET_DEBOUNCED_SEARCH':
      return { ...state, debouncedSearch: action.payload, page: 1 };
    case 'SET_CLASS_FILTER':
      return { ...state, classFilter: action.payload, studentFilter: '', page: 1 };
    case 'SET_STUDENT_FILTER':
      return { ...state, studentFilter: action.payload, page: 1 };
    case 'SET_FROM_DATE':
      return { ...state, fromDate: action.payload, page: 1 };
    case 'SET_TO_DATE':
      return { ...state, toDate: action.payload, page: 1 };
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    case 'SET_VIEW_RECEIPT':
      return { ...state, viewReceipt: action.payload };
    case 'SET_DELETING':
      return { ...state, deleting: action.payload };
    default:
      return state;
  }
}

export function CheckReceiptTab({ canEdit, canDelete }: CheckReceiptTabProps) {
  const queryClient = useQueryClient();
  
  // State
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isFromCalendarOpen, setIsFromCalendarOpen] = useState(false);
  const [isToCalendarOpen, setIsToCalendarOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const {
    search,
    debouncedSearch,
    classFilter,
    studentFilter,
    fromDate,
    toDate,
    page,
    viewReceipt,
    deleting,
  } = state;

  const limit = 30;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: 'SET_DEBOUNCED_SEARCH', payload: search });
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading: loadingReceipts } = useFeeReceipts({
    studentId: studentFilter,
    search: debouncedSearch,
    fromDate,
    toDate,
    page,
    limit
  });

  const receipts = data?.items || [];
  const totalItems = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  // Fetch classes
  const { data: classes = [] } = useQuery<any[]>({
    queryKey: ['classes-min'],
    queryFn: async () => {
      const res = await apiFetch('/api/classes?mode=min');
      return res.json();
    }
  });

  const { data: studentsData, isLoading: loadingStudents } = useQuery<{ items: StudentOption[] }>({
    queryKey: ['students-min'],
    queryFn: async () => {
      const res = await apiFetch('/api/students?mode=min&limit=5000');
      return res.json();
    }
  });
  const allStudents = studentsData?.items || [];

  const filteredStudents = useMemo(() => {
    if (!classFilter) return [];
    return allStudents.filter(s => s.classId === classFilter);
  }, [allStudents, classFilter]);

  const loading = loadingReceipts;

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Receipt_${viewReceipt?.receiptNumber || 'print'}`,
  });

  const { data: studentFullDetails } = useQuery<any>({
    queryKey: ['student-full-receipt', viewReceipt?.studentId],
    enabled: !!viewReceipt?.studentId,
    queryFn: async () => {
      const res = await apiFetch(`/api/students/${viewReceipt?.studentId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    }
  });

  const { data: pendingFees = [] } = useQuery<any[]>({
    queryKey: ['student-pending-fees-receipt', viewReceipt?.studentId],
    enabled: !!viewReceipt?.studentId,
    queryFn: async () => {
      const res = await apiFetch(`/api/fees?studentId=${viewReceipt?.studentId}&status=pending,overdue,partially_paid`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      return data.items || [];
    }
  });

  const remainingAmount = pendingFees?.reduce((sum: number, fee: any) => sum + (fee.amount - fee.paidAmount - fee.concession), 0) || 0;

  const thisMonthFromDate = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  }, []);

  const currentMonthName = useMemo(() => {
    return new Date().toLocaleString('default', { month: 'long' });
  }, []);

  const { data: thisMonthData } = useFeeReceipts({
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

  const handleDelete = async (id: string) => {
    dispatch({ type: 'SET_DELETING', payload: true });
    try {
      const res = await apiFetch(`/api/fee-receipts?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Receipt deleted!');
        queryClient.invalidateQueries({ queryKey: ['fee-receipts'] });
        dispatch({ type: 'SET_VIEW_RECEIPT', payload: null });
      } else toast.error('Failed to delete');
    } catch { toast.error('Error deleting'); }
    dispatch({ type: 'SET_DELETING', payload: false });
  };

  return (
    <div className="space-y-6">
      {/* 4 Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected */}
        <Card className="relative overflow-hidden rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-gradient-to-br from-white to-emerald-50/10 dark:from-zinc-950 dark:to-emerald-950/5 p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-emerald-500/30 dark:hover:border-emerald-500/20 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider block">Total Collected ({currentMonthName})</span>
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
        <Card className="relative overflow-hidden rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-gradient-to-br from-white to-amber-50/10 dark:from-zinc-950 dark:to-amber-950/5 p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-amber-500/30 dark:hover:border-amber-500/20 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 dark:bg-amber-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider block">Cash Payments</span>
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
        <Card className="relative overflow-hidden rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-gradient-to-br from-white to-indigo-50/10 dark:from-zinc-950 dark:to-indigo-950/5 p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-indigo-500/30 dark:hover:border-indigo-500/20 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider block">Online Payments</span>
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
        <Card className="relative overflow-hidden rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-gradient-to-br from-white to-rose-50/10 dark:from-zinc-950 dark:to-rose-950/5 p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-rose-500/30 dark:hover:border-rose-500/20 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 dark:bg-rose-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider block">Cheque Payments</span>
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

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Search receipt # or student..." 
            className="pl-9 h-9" 
            value={search} 
            onChange={e => dispatch({ type: 'SET_SEARCH', payload: e.target.value })} 
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <Select value={classFilter} onValueChange={(v) => dispatch({ type: 'SET_CLASS_FILTER', payload: v })}>
            <SelectTrigger className="w-full sm:w-44 h-9"><SelectValue placeholder="Select Class" /></SelectTrigger>
            <SelectContent>
              {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}-{c.section}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select 
            value={studentFilter} 
            onValueChange={(v) => dispatch({ type: 'SET_STUDENT_FILTER', payload: v })}
            disabled={!classFilter}
          >
            <SelectTrigger className="w-full sm:w-44 h-9"><SelectValue placeholder="Select Student" /></SelectTrigger>
            <SelectContent>
              {filteredStudents.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <Popover open={isFromCalendarOpen} onOpenChange={setIsFromCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-36 justify-start text-left font-normal bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-9 px-3">
                <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs truncate">{fromDate ? format(new Date(fromDate), "PP") : "From date"}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={fromDate ? new Date(fromDate) : undefined}
                onSelect={(date) => {
                  dispatch({ type: 'SET_FROM_DATE', payload: date ? format(date, "yyyy-MM-dd") : '' });
                  setIsFromCalendarOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Popover open={isToCalendarOpen} onOpenChange={setIsToCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-36 justify-start text-left font-normal bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-9 px-3">
                <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs truncate">{toDate ? format(new Date(toDate), "PP") : "To date"}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={toDate ? new Date(toDate) : undefined}
                onSelect={(date) => {
                  dispatch({ type: 'SET_TO_DATE', payload: date ? format(date, "yyyy-MM-dd") : '' });
                  setIsToCalendarOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Table */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="px-6 py-4">
          <CardTitle className="text-base font-semibold">Transaction History</CardTitle>
          <CardDescription>Found {totalItems} receipts</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={`skeleton-${i}`} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 scrollbar-track-transparent scroll-smooth">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[120px] pl-6 h-12">Receipt #</TableHead>
                      <TableHead className="h-12">Student</TableHead>
                      <TableHead className="hidden sm:table-cell h-12">Amount</TableHead>
                      <TableHead className="hidden md:table-cell h-12">Method</TableHead>
                      <TableHead className="hidden md:table-cell h-12">Date</TableHead>
                      <TableHead className="h-12">Status</TableHead>
                      <TableHead className="w-24 text-center h-12">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receipts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                          <Receipt className="size-10 mx-auto mb-2 opacity-30" /><p>No receipts found</p>
                        </TableCell>
                      </TableRow>
                    ) : receipts.map(r => {
                      const statusCfg = receiptStatusConfig[r.status] || receiptStatusConfig.completed;
                      return (
                        <TableRow key={r.id} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors">
                          <TableCell className="pl-6 py-4"><span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">{r.receiptNumber}</span></TableCell>
                          <TableCell className="font-medium text-sm py-4">{r.studentName}</TableCell>
                          <TableCell className="hidden sm:table-cell font-semibold py-4">₹{r.paidAmount.toLocaleString()}</TableCell>
                          <TableCell className="hidden md:table-cell py-4">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              {paymentMethodIcons[r.paymentMethod] || <Banknote className="size-4" />}
                              <span className="text-xs capitalize">{r.paymentMethod}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs text-muted-foreground py-4">{r.paidDate}</TableCell>
                          <TableCell className="py-4"><Badge variant="outline" className={`${statusCfg.bg} border-0 capitalize text-[10px] px-2 h-5`}>{r.status}</Badge></TableCell>
                          <TableCell className="text-center py-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="icon" className="size-7 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50" onClick={() => dispatch({ type: 'SET_VIEW_RECEIPT', payload: r })}><Eye className="size-3.5" /></Button>
                              {canDelete && (
                                <Button 
                                  disabled
                                  variant="ghost" 
                                  size="icon" 
                                  className="size-7 text-zinc-300 dark:text-zinc-700 cursor-not-allowed opacity-40 hover:bg-transparent"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination UI */}
              {totalItems > 0 && (
                <div className="flex items-center justify-between px-6 py-4 border-t bg-transparent">
                  <span className="text-xs text-muted-foreground">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalItems)} of {totalItems}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => dispatch({ type: 'SET_PAGE', payload: Math.max(1, page - 1) })} 
                      disabled={page === 1}
                      className="h-8 text-xs"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {totalPages > 0 && [...Array(totalPages)].map((_, i) => (
                        <Button
                          key={i + 1}
                          variant={page === i + 1 ? "default" : "outline"}
                          size="sm"
                          className={`size-8 text-xs p-0 ${page === i + 1 ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                          onClick={() => dispatch({ type: 'SET_PAGE', payload: i + 1 })}
                          disabled={page === i + 1}
                        >
                          {i + 1}
                        </Button>
                      )).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => dispatch({ type: 'SET_PAGE', payload: Math.min(totalPages, page + 1) })} 
                      disabled={page === totalPages}
                      className="h-8 text-xs"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      {/* View Receipt Dialog */}
      <Dialog open={!!viewReceipt} onOpenChange={() => dispatch({ type: 'SET_VIEW_RECEIPT', payload: null })}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Receipt className="size-5 text-emerald-600" />Receipt Details</DialogTitle>
            <DialogDescription>Receipt #{viewReceipt?.receiptNumber}</DialogDescription>
          </DialogHeader>
          {viewReceipt && (
            <div className="space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-lg p-4 space-y-2 border border-emerald-100 dark:border-emerald-800">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground block text-xs">Student</span> <span className="font-medium">{viewReceipt.studentName}</span></div>
                  <div><span className="text-muted-foreground block text-xs">Date</span> <span className="font-medium">{viewReceipt.paidDate}</span></div>
                  <div><span className="text-muted-foreground block text-xs">Method</span> <span className="capitalize font-medium">{viewReceipt.paymentMethod}</span></div>
                  <div><span className="text-muted-foreground block text-xs">Status</span> <Badge variant="outline" className={`${(receiptStatusConfig[viewReceipt.status] || receiptStatusConfig.completed).bg} border-0 capitalize h-5`}>{viewReceipt.status}</Badge></div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fee Breakdown</p>
                <div className="divide-y rounded-lg border bg-card">
                  <div className="grid grid-cols-4 gap-2 p-2.5 bg-muted/50 text-[10px] font-bold uppercase text-muted-foreground">
                    <span>Category</span><span className="text-right">Amount</span><span className="text-right">Disc.</span><span className="text-right">Paid</span>
                  </div>
                  {viewReceipt.feeItems.map((item) => (
                    <div key={item.feeCategoryName} className="grid grid-cols-4 gap-2 p-2.5 text-xs items-center">
                      <span className="truncate font-medium">{item.feeCategoryName}</span>
                      <span className="text-right text-muted-foreground">₹{item.amount.toLocaleString()}</span>
                      <span className="text-right text-amber-600">{item.concession > 0 ? `-₹${item.concession.toLocaleString()}` : '–'}</span>
                      <span className="text-right font-semibold">₹{item.paidAmount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 text-sm border-t pt-4">
                <div className="flex justify-between text-muted-foreground"><span className="text-xs">Subtotal</span><span className="text-xs">₹{viewReceipt.totalAmount.toLocaleString()}</span></div>
                {viewReceipt.concessionTotal > 0 && <div className="flex justify-between text-amber-600"><span className="text-xs">Total Concession</span><span className="text-xs">-₹{viewReceipt.concessionTotal.toLocaleString()}</span></div>}
                <div className="flex justify-between items-baseline mt-2">
                  <span className="font-bold">Total Paid</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">₹{viewReceipt.paidAmount.toLocaleString()}</span>
                </div>
              </div>
              {viewReceipt.remarks && (
                <div className="rounded-md bg-muted p-2 mt-2">
                  <p className="text-[10px] text-muted-foreground leading-tight italic: {viewReceipt.remarks}">Remarks: {viewReceipt.remarks}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex gap-3 sm:gap-3 mt-4">
            <Button variant="outline" className="flex-1 sm:flex-none" onClick={handlePrint}><Printer className="size-4 mr-2" />Print</Button>
            <Button variant="default" className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700" onClick={() => dispatch({ type: 'SET_VIEW_RECEIPT', payload: null })}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden Receipt for Printing */}
      <div className="hidden">
        {viewReceipt && (
          <AdminReceiptTemplate 
            ref={printRef}
            receipt={viewReceipt}
            parentName={studentFullDetails?.parentName}
            className={studentFullDetails?.className}
            remainingAmount={remainingAmount}
          />
        )}
      </div>
    </div>
  );
}
