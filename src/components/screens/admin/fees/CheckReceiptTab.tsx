"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { Search, Receipt, Banknote, Eye, Trash2, Printer, CheckCircle2 } from 'lucide-react';
import { goeyToast as toast } from 'goey-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useFeeReceipts } from '@/hooks/use-fees';
import { receiptStatusConfig, paymentMethodIcons } from './config';
import type { FeeReceipt, StudentOption } from './types';

interface CheckReceiptTabProps {
  canEdit: boolean;
  canDelete: boolean;
}

export function CheckReceiptTab({ canEdit, canDelete }: CheckReceiptTabProps) {
  const queryClient = useQueryClient();
  
  // States
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [studentFilter, setStudentFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
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

  const { data: studentsData, isLoading: loadingStudents } = useQuery<{ items: StudentOption[] }>({
    queryKey: ['students-min'],
    queryFn: async () => {
      const res = await apiFetch('/api/students?mode=min&limit=5000');
      return res.json();
    }
  });
  const students = studentsData?.items || [];


  const loading = loadingReceipts;
  const [viewReceipt, setViewReceipt] = useState<FeeReceipt | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await apiFetch(`/api/fee-receipts?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Receipt deleted!');
        queryClient.invalidateQueries({ queryKey: ['fee-receipts'] });
        setViewReceipt(null);
      } else toast.error('Failed to delete');
    } catch { toast.error('Error deleting'); }
    setDeleting(false);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search receipt # or student..." 
            className="pl-9" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <Select value={studentFilter} onValueChange={(v) => { setStudentFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Student" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
          <Input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(1); }} placeholder="From" className="text-xs" />
          <Input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(1); }} placeholder="To" className="text-xs" />
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
            <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[120px]">Receipt #</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead className="hidden sm:table-cell">Amount</TableHead>
                      <TableHead className="hidden md:table-cell">Method</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receipts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                          <Receipt className="h-10 w-10 mx-auto mb-2 opacity-30" /><p>No receipts found</p>
                        </TableCell>
                      </TableRow>
                    ) : receipts.map(r => {
                      const statusCfg = receiptStatusConfig[r.status] || receiptStatusConfig.completed;
                      return (
                        <TableRow key={r.id} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors">
                          <TableCell><span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">{r.receiptNumber}</span></TableCell>
                          <TableCell className="font-medium text-sm">{r.studentName}</TableCell>
                          <TableCell className="hidden sm:table-cell font-semibold">₹{r.paidAmount.toLocaleString()}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              {paymentMethodIcons[r.paymentMethod] || <Banknote className="h-4 w-4" />}
                              <span className="text-xs capitalize">{r.paymentMethod}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{r.paidDate}</TableCell>
                          <TableCell><Badge variant="outline" className={`${statusCfg.bg} border-0 capitalize text-[10px] px-2 h-5`}>{r.status}</Badge></TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50" onClick={() => setViewReceipt(r)}><Eye className="h-3.5 w-3.5" /></Button>
                              {canDelete && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Delete Receipt</AlertDialogTitle><AlertDialogDescription>Delete receipt {r.receiptNumber}? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(r.id)} disabled={deleting} className="bg-red-600 hover:bg-red-700">{deleting ? 'Deleting...' : 'Delete'}</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
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
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/30">
                  <span className="text-xs text-muted-foreground">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalItems)} of {totalItems}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPage(p => Math.max(1, p - 1))} 
                      disabled={page === 1}
                      className="h-8 text-xs"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <Button
                          key={i}
                          variant={page === i + 1 ? "default" : "outline"}
                          size="sm"
                          className={`h-8 w-8 text-xs p-0 ${page === i + 1 ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                          onClick={() => setPage(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      )).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
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
      <Dialog open={!!viewReceipt} onOpenChange={() => setViewReceipt(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-emerald-600" />Receipt Details</DialogTitle>
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
                  {viewReceipt.feeItems.map((item, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 p-2.5 text-xs items-center">
                      <span className="truncate font-medium">{item.feeCategoryName}</span>
                      <span className="text-right text-muted-foreground">₹{item.amount.toLocaleString()}</span>
                      <span className="text-right text-amber-600">{item.concession > 0 ? `-₹${item.concession.toLocaleString()}` : '—'}</span>
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
                  <p className="text-[10px] text-muted-foreground leading-tight italic">Remarks: {viewReceipt.remarks}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="flex-1 sm:flex-none" onClick={handlePrint}><Printer className="h-4 w-4 mr-2" />Print</Button>
            <Button variant="default" className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700" onClick={() => setViewReceipt(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
