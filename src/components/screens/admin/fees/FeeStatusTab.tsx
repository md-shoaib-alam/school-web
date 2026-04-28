"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { UserCheck, Search, ChevronRight, DollarSign, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useFeeConcessions, useFeeReceipts } from '@/hooks/use-fees';
import { feeStatusConfig, receiptStatusConfig, paymentMethodIcons } from './config';
import type { StudentOption, ClassOption, FeeItem, FeeReceipt, FeeConcession } from './types';

export function FeeStatusTab() {
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

  const { data: feeData, isLoading: loadingFees } = useQuery<{ items: FeeItem[] }>({
    queryKey: ['fees', selectedStudent?.id],
    enabled: !!selectedStudent,
    queryFn: async () => {
      const res = await apiFetch(`/api/fees?studentId=${selectedStudent?.id}`);
      return res.json();
    }
  });
  const fees = feeData?.items || [];

  const { data: receiptsData, isLoading: loadingReceipts } = useQuery<{ items: FeeReceipt[] }>({
    queryKey: ['fee-receipts', selectedStudent?.id],
    enabled: !!selectedStudent,
    queryFn: async () => {
      const res = await apiFetch(`/api/fee-receipts?studentId=${selectedStudent?.id}`);
      return res.json();
    }
  });
  const receipts = receiptsData?.items || [];

  const { data: concessions = [], isLoading: loadingConcessions } = useFeeConcessions(selectedStudent?.id);

  const loading = loadingFees || loadingReceipts || loadingConcessions;

  const filteredStudents = useMemo(() => {
    let result = students;
    if (classFilter !== 'all') {
      result = result.filter(s => s.classId === classFilter);
    }
    if (!studentSearch) return result.slice(0, 20);
    const q = studentSearch.toLowerCase();
    return result.filter(s => s.name.toLowerCase().includes(q) || (s.phone && s.phone.toLowerCase().includes(q)));
  }, [students, studentSearch, classFilter]);

  const handleSelectStudent = (student: StudentOption) => {
    setSelectedStudent(student);
  };

  const totalFees = fees.reduce((s, f) => s + f.amount, 0);
  const totalPaid = fees.filter(f => f.status === 'paid').reduce((s, f) => s + f.paidAmount, 0);
  const totalConcessions = fees.reduce((s, f) => s + f.concession, 0);
  const totalPending = fees.filter(f => f.status === 'pending' || f.status === 'overdue').reduce((s, f) => s + (f.amount - f.concession - f.paidAmount), 0);
  const totalOverdue = fees.filter(f => f.status === 'overdue').reduce((s, f) => s + (f.amount - f.concession - f.paidAmount), 0);
  const payPercentage = totalFees > 0 ? Math.round((totalPaid / totalFees) * 100) : 0;

  return (
    <div className="space-y-4">
      {!selectedStudent ? (
        /* Student Search */
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><UserCheck className="h-5 w-5 text-emerald-600" />Check Fee Status</CardTitle>
            <CardDescription>Search for a student to view their complete fee status</CardDescription>
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
        <div className="space-y-4">
          {/* Student Header */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xl font-bold shrink-0">
                {selectedStudent.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold">{selectedStudent.name}</p>
                <p className="text-sm text-muted-foreground">{selectedStudent.className} • {selectedStudent.phone || 'No phone'}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setSelectedStudent(null); }}>Change Student</Button>
            </CardContent>
          </Card>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-muted-foreground">Total Fees</p>
                    <p className="text-xl font-bold">₹{totalFees.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-muted-foreground">Paid</p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">₹{totalPaid.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-muted-foreground">Pending</p>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400">₹{totalPending.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-muted-foreground">Overdue</p>
                    <p className="text-xl font-bold text-red-600 dark:text-red-400">₹{totalOverdue.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-muted-foreground">Concessions</p>
                    <p className="text-xl font-bold text-violet-600 dark:text-violet-400">₹{totalConcessions.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Progress */}
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Progress</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{payPercentage}%</span>
                  </div>
                  <Progress value={payPercentage} className="h-3" />
                </CardContent>
              </Card>

              {/* Fee Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Fee Breakdown</CardTitle>
                  <CardDescription>{fees.length} fee item(s)</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {fees.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                      <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-30" /><p>No fee records found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead className="hidden sm:table-cell">Total</TableHead>
                            <TableHead className="hidden md:table-cell">Concession</TableHead>
                            <TableHead className="hidden md:table-cell">Payable</TableHead>
                            <TableHead className="hidden sm:table-cell">Paid</TableHead>
                            <TableHead className="hidden lg:table-cell">Due Date</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fees.map(fee => {
                            const cfg = feeStatusConfig[fee.status] || feeStatusConfig.pending;
                            const payable = fee.amount - fee.concession;
                            return (
                              <TableRow key={fee.id} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors">
                                <TableCell className="font-medium text-sm">{fee.feeCategoryName || fee.type}</TableCell>
                                <TableCell className="hidden sm:table-cell text-sm">₹{fee.amount.toLocaleString()}</TableCell>
                                <TableCell className="hidden md:table-cell text-sm text-amber-600">{fee.concession > 0 ? `-₹${fee.concession.toLocaleString()}` : '—'}</TableCell>
                                <TableCell className="hidden md:table-cell text-sm font-medium">₹{payable.toLocaleString()}</TableCell>
                                <TableCell className="hidden sm:table-cell text-sm text-emerald-600 font-medium">₹{fee.paidAmount.toLocaleString()}</TableCell>
                                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{fee.dueDate}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={`${cfg.bg} font-medium capitalize`}>
                                    {cfg.icon}
                                    <span className="ml-1">{fee.status}</span>
                                  </Badge>
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

              {/* Recent Payments */}
              {receipts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Payments</CardTitle>
                    <CardDescription>{receipts.length} receipt(s)</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {receipts.slice(0, 5).map(r => (
                        <div key={r.id} className="flex items-center gap-3 p-3 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors">
                          <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            {paymentMethodIcons[r.paymentMethod] || <DollarSign className="h-5 w-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-xs font-semibold">{r.receiptNumber}</p>
                            <p className="text-xs text-muted-foreground">{r.paidDate} • {r.paymentMethod}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">₹{r.paidAmount.toLocaleString()}</p>
                            <Badge variant="outline" className={`${(receiptStatusConfig[r.status] || receiptStatusConfig.completed).bg} border-0 text-xs capitalize`}>{r.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
