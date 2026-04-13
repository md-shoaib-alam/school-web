'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { DollarSign, CreditCard, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import type { StudentInfo, FeeRecord } from '@/lib/types';

const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  paid: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    text: 'Paid',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  pending: {
    bg: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800',
    text: 'Pending',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  overdue: {
    bg: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    text: 'Overdue',
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
};

const typeIcons: Record<string, string> = {
  tuition: '📚',
  exam: '📝',
  library: '📖',
  transport: '🚌',
};

export function StudentFees() {
  const { currentUser } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const studentsRes = await fetch('/api/students');
        const studentsData = await studentsRes.json();
        setStudents(studentsData);

        const matchedStudent =
          studentsData.find((s: StudentInfo) => s.email === currentUser?.email) ||
          studentsData[0];

        if (matchedStudent) {
          const feesRes = await fetch(`/api/fees?studentId=${matchedStudent.id}`);
          if (feesRes.ok) setFees(await feesRes.json());
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currentUser?.email]);

  const summary = useMemo(() => {
    const total = fees.reduce((sum, f) => sum + f.amount, 0);
    const paid = fees.filter((f) => f.status === 'paid').reduce((sum, f) => sum + f.paidAmount, 0);
    const pending = fees.filter((f) => f.status === 'pending').reduce((sum, f) => sum + (f.amount - f.paidAmount), 0);
    const overdue = fees.filter((f) => f.status === 'overdue').reduce((sum, f) => sum + (f.amount - f.paidAmount), 0);
    return { total, paid, pending, overdue };
  }, [fees]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-7 w-44" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-violet-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">My Fees</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Fees</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">₹{summary.total.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-emerald-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">₹{summary.paid.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-violet-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold text-violet-600 dark:text-violet-400">₹{summary.pending.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-red-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Overdue</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">₹{summary.overdue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Table */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-violet-500" />
            Fee Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fee Type</TableHead>
                  <TableHead className="hidden sm:table-cell">Amount</TableHead>
                  <TableHead className="hidden md:table-cell">Due Date</TableHead>
                  <TableHead className="hidden md:table-cell">Paid</TableHead>
                  <TableHead className="w-28 text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p>No fee records found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  fees.map((fee) => {
                    const config = statusConfig[fee.status] || statusConfig.pending;
                    return (
                      <TableRow key={fee.id} className="hover:bg-violet-50/30 dark:hover:bg-violet-900/20 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{typeIcons[fee.type] || '💰'}</span>
                            <span className="font-medium text-sm capitalize">{fee.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm font-medium">
                          ₹{fee.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {new Date(fee.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">
                          <span className={fee.paidAmount > 0 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'}>
                            ₹{fee.paidAmount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={`${config.bg} font-medium capitalize`}>
                            {config.icon}
                            <span className="ml-1">{fee.status}</span>
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
