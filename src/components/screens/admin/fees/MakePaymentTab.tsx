"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { UserCheck, Search, ChevronRight, CreditCard, Percent, Banknote, FileText, Building2, Smartphone, CheckCircle2, Sparkles } from 'lucide-react';
import { goeyToast as toast } from 'goey-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useCreateFeeReceipt, useFeeConcessions } from '@/hooks/use-fees';
import type { StudentOption, ClassOption, FeeItem, FeeConcession } from './types';

interface MakePaymentTabProps {
  canCreate: boolean;
}

export function MakePaymentTab({ canCreate }: MakePaymentTabProps) {
  const queryClient = useQueryClient();
  const createReceipt = useCreateFeeReceipt();

  const { data: students = [] } = useQuery<StudentOption[]>({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await apiFetch('/api/students');
      const data = await res.json();
      return data.map((s: any) => ({ id: s.id, name: s.name, className: s.className, classId: s.classId, rollNumber: s.rollNumber, phone: s.phone || '' }));
    }
  });

  const { data: classes = [] } = useQuery<ClassOption[]>({
    queryKey: ['classes'],
    queryFn: async () => {
      const res = await apiFetch('/api/classes');
      return res.json();
    }
  });

  const [classFilter, setClassFilter] = useState('all');
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(null);
  const [pendingFees, setPendingFees] = useState<FeeItem[]>([]);
  const { data: concessions = [] } = useFeeConcessions(selectedStudent?.id);
  const [selectedFeeIds, setSelectedFeeIds] = useState<Set<string>>(new Set());
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loadingFees, setLoadingFees] = useState(false);
  const [paying, setPaying] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredStudents = useMemo(() => {
    let result = students;
    if (classFilter !== 'all') {
      result = result.filter(s => s.classId === classFilter);
    }
    if (!studentSearch) return result.slice(0, 20);
    const q = studentSearch.toLowerCase();
    return result.filter(s => s.name.toLowerCase().includes(q) || (s.phone && s.phone.toLowerCase().includes(q)));
  }, [students, studentSearch, classFilter]);

  const handleSelectStudent = async (student: StudentOption) => {
    setSelectedStudent(student);
    setSelectedFeeIds(new Set());
    setReceiptNumber('');
    setShowSuccess(false);
    setLoadingFees(true);
    try {
      const feesRes = await apiFetch(`/api/fees?studentId=${student.id}&status=pending`);
      if (feesRes.ok) setPendingFees(await feesRes.json());
    } catch { console.error('Error fetching fees'); }
    setLoadingFees(false);
  };

  const toggleFee = (id: string) => {
    setSelectedFeeIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedFeeIds.size === pendingFees.length) {
      setSelectedFeeIds(new Set());
    } else {
      setSelectedFeeIds(new Set(pendingFees.map(f => f.id)));
    }
  };

  const selectedFees = useMemo(() => pendingFees.filter(f => selectedFeeIds.has(f.id)), [pendingFees, selectedFeeIds]);

  const calculation = useMemo(() => {
    const totalAmount = selectedFees.reduce((s, f) => s + f.amount, 0);
    const concessionTotal = selectedFees.reduce((s, f) => s + f.concession, 0);
    const payable = totalAmount - concessionTotal;
    return { totalAmount, concessionTotal, payable };
  }, [selectedFees]);

  const handlePay = async () => {
    if (selectedFeeIds.size === 0) { toast.error('Select at least one fee to pay'); return; }
    if (!selectedStudent) return;
    setPaying(true);
    try {
      const feeAmounts: Record<string, number> = {};
      for (const f of selectedFees) {
        feeAmounts[f.id] = f.amount - f.concession;
      }
      const data = await createReceipt.mutateAsync({
        studentId: selectedStudent.id,
        feeIds: Array.from(selectedFeeIds),
        feeAmounts,
        totalAmount: calculation.totalAmount,
        paidAmount: calculation.payable,
        concessionTotal: calculation.concessionTotal,
        paymentMethod,
      });
      
      setReceiptNumber(data.receiptNumber);
      setShowSuccess(true);
      
      // Refresh fees manually for this student since it's local state for now
      const feesRes = await apiFetch(`/api/fees?studentId=${selectedStudent.id}&status=pending`);
      if (feesRes.ok) {
        setPendingFees(await feesRes.json());
      }
      setSelectedFeeIds(new Set());
    } catch { /* handled by mutation */ }
    setPaying(false);
  };

  if (!canCreate) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-30" /><p>You do not have permission to make payments.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="h-6 w-6" />Payment Successful!</DialogTitle>
            <DialogDescription>Payment has been recorded successfully.</DialogDescription>
          </DialogHeader>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Receipt Number</p>
            <p className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">{receiptNumber}</p>
            <p className="text-2xl font-bold">₹{calculation.payable.toLocaleString()}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSuccess(false)} className="bg-emerald-600 hover:bg-emerald-700 text-white">Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!selectedStudent ? (
        /* Step 1: Select Student */
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><UserCheck className="h-5 w-5 text-emerald-600" />Select Student</CardTitle>
            <CardDescription>Search and select a student to make a payment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={classFilter} onValueChange={v => { setClassFilter(v); setStudentSearch(''); }}>
                <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Class" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}-{c.section} (Grade {c.grade})</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name or phone number..." className="pl-9" value={studentSearch} onChange={e => setStudentSearch(e.target.value)} />
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto rounded-lg border divide-y">
              {filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground"><Search className="h-8 w-8 mx-auto mb-2 opacity-30" /><p>No students found</p></div>
              ) : filteredStudents.map(s => (
                <button key={s.id} className="w-full flex items-center gap-3 p-3 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors text-left" onClick={() => handleSelectStudent(s)}>
                  <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-sm font-semibold shrink-0">
                    {s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.className} • {s.phone || 'No phone'}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Step 2: Select Fees & Pay */
        <div className="space-y-4">
          {/* Student Header */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-lg font-bold shrink-0">
                {selectedStudent.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{selectedStudent.name}</p>
                <p className="text-sm text-muted-foreground">{selectedStudent.className} • Roll: {selectedStudent.rollNumber}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setSelectedStudent(null); setPendingFees([]); setSelectedFeeIds(new Set<string>()); }}>
                Change
              </Button>
            </CardContent>
          </Card>

          {/* Concessions Info */}
          {concessions.length > 0 && (
            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400"><Percent className="h-4 w-4" />Active Concessions</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-1">
                  {concessions.map(c => (
                    <div key={c.id} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="text-xs">{c.concessionType.replace('_', ' ')}</Badge>
                      <span>{c.concessionType === 'percentage' ? `${c.amount}%` : `₹${c.amount}`}</span>
                      {c.reason && <span className="text-muted-foreground">— {c.reason}</span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending Fees */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Pending Fees</CardTitle>
                  <CardDescription>{pendingFees.length} pending fee(s)</CardDescription>
                </div>
                {pendingFees.length > 0 && (
                  <Button variant="outline" size="sm" onClick={toggleAll}>
                    {selectedFeeIds.size === pendingFees.length ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loadingFees ? (
                <div className="p-6 space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
              ) : pendingFees.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-emerald-500 opacity-50" /><p>All fees paid! No pending fees.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {pendingFees.map(fee => (
                    <div key={fee.id} className="flex items-center gap-3 p-3 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer" onClick={() => toggleFee(fee.id)}>
                      <Checkbox checked={selectedFeeIds.has(fee.id)} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{fee.feeCategoryName || fee.type}</p>
                        <p className="text-xs text-muted-foreground">Due: {fee.dueDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">₹{fee.amount.toLocaleString()}</p>
                        {fee.concession > 0 && <p className="text-xs text-amber-600">-₹{fee.concession.toLocaleString()} concession</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Summary & Method */}
          {selectedFeeIds.size > 0 && (
            <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-5 w-5 text-emerald-600" />Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Fees</span><span>₹{calculation.totalAmount.toLocaleString()}</span></div>
                  {calculation.concessionTotal > 0 && <div className="flex justify-between text-amber-600"><span>Concession</span><span>-₹{calculation.concessionTotal.toLocaleString()}</span></div>}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t"><span>Payable</span><span className="text-emerald-600 dark:text-emerald-400">₹{calculation.payable.toLocaleString()}</span></div>
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { id: 'cash', icon: <Banknote className="h-5 w-5" />, label: 'Cash' },
                      { id: 'cheque', icon: <FileText className="h-5 w-5" />, label: 'Cheque' },
                      { id: 'online', icon: <Building2 className="h-5 w-5" />, label: 'Online' },
                      { id: 'upi', icon: <Smartphone className="h-5 w-5" />, label: 'UPI' },
                      { id: 'card', icon: <CreditCard className="h-5 w-5" />, label: 'Card' },
                    ].map(m => (
                      <button
                        key={m.id}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all text-xs ${paymentMethod === m.id ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'border-transparent bg-muted/50 hover:bg-muted text-muted-foreground'}`}
                        onClick={() => setPaymentMethod(m.id)}
                      >
                        {m.icon}
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-base" onClick={handlePay} disabled={paying}>
                  {paying ? (
                    <><span className="animate-spin mr-2">⏳</span>Processing...</>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Pay ₹{calculation.payable.toLocaleString()} via {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
