"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { goeyToast as toast } from 'goey-toast';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useCreateFeeReceipt, useFeeConcessions } from '@/hooks/use-fees';
import type { StudentOption, ClassOption, FeeItem } from './types';

// Sub-components
import { StudentSelector } from './payment/StudentSelector';
import { PendingFeesChecklist } from './payment/PendingFeesChecklist';
import { PaymentSummary } from './payment/PaymentSummary';
import { SuccessDialog } from './payment/SuccessDialog';

interface MakePaymentTabProps {
  canCreate: boolean;
}

export function MakePaymentTab({ canCreate }: MakePaymentTabProps) {
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
      if (feesRes.ok) {
        const data = await feesRes.json();
        setPendingFees(data.items || []);
      }
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
        const data = await feesRes.json();
        setPendingFees(data.items || []);
      }
      setSelectedFeeIds(new Set());
    } catch { /* handled by mutation */ }
    setPaying(false);
  };

  if (!canCreate) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          <CreditCard className="size-10 mx-auto mb-2 opacity-30" /><p>You do not have permission to make payments.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <SuccessDialog 
        open={showSuccess}
        onOpenChange={setShowSuccess}
        receiptNumber={receiptNumber}
        amount={calculation.payable}
      />

      {!selectedStudent ? (
        <StudentSelector 
          classFilter={classFilter}
          setClassFilter={setClassFilter}
          studentSearch={studentSearch}
          setStudentSearch={setStudentSearch}
          classes={classes}
          filteredStudents={filteredStudents}
          onSelectStudent={handleSelectStudent}
        />
      ) : (
        <div className="space-y-4">
          <PendingFeesChecklist 
            selectedStudent={selectedStudent}
            onChangeStudent={() => { setSelectedStudent(null); setPendingFees([]); setSelectedFeeIds(new Set<string>()); }}
            concessions={concessions}
            pendingFees={pendingFees}
            loadingFees={loadingFees}
            selectedFeeIds={selectedFeeIds}
            onToggleFee={toggleFee}
            onToggleAll={toggleAll}
          />

          {selectedFeeIds.size > 0 && (
            <PaymentSummary 
              totalAmount={calculation.totalAmount}
              concessionTotal={calculation.concessionTotal}
              payable={calculation.payable}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              onPay={handlePay}
              paying={paying}
            />
          )}
        </div>
      )}
    </div>
  );
}
