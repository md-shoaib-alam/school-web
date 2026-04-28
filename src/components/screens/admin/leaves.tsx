'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CalendarDays, Briefcase, Users, Clock, CheckCircle2, XCircle,
  Loader2, FileText, AlertTriangle, Filter, Ban, CalendarOff, Plus, History, Send,
  GraduationCap,
} from 'lucide-react';
import { goeyToast as toast } from 'goey-toast';
import { apiFetch } from '@/lib/api';
import { useAppStore } from '@/store/use-app-store';

// ── Shared Config ──

const statusConfig: Record<string, { bg: string; icon: React.ReactNode; label: string }> = {
  pending: { bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800', icon: <Clock className="h-3.5 w-3.5" />, label: 'Pending' },
  approved: { bg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: 'Approved' },
  rejected: { bg: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800', icon: <XCircle className="h-3.5 w-3.5" />, label: 'Rejected' },
  cancelled: { bg: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700', icon: <Ban className="h-3.5 w-3.5" />, label: 'Cancelled' },
};

const leaveTypeConfig: Record<string, { bg: string; icon: React.ReactNode; label: string }> = {
  casual: { bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800', icon: <CalendarDays className="h-3.5 w-3.5" />, label: 'Casual' },
  sick: { bg: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800', icon: <AlertTriangle className="h-3.5 w-3.5" />, label: 'Sick' },
  earned: { bg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: 'Earned' },
  maternity: { bg: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800', icon: <CalendarDays className="h-3.5 w-3.5" />, label: 'Maternity' },
  paternity: { bg: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800', icon: <CalendarDays className="h-3.5 w-3.5" />, label: 'Paternity' },
  duty: { bg: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800', icon: <Briefcase className="h-3.5 w-3.5" />, label: 'Duty Leave' },
};

interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: string;
  approverRemarks?: string;
  createdAt: string;
}

// ── Main Component ──

export function AdminLeaves({ initialTab = 'teacher' }: { initialTab?: string }) {
  const { currentUser } = useAppStore();
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

  if (isAdmin) return <AdminManagerView initialTab={initialTab} />;
  return <StaffSelfServiceView />;
}

// ── Admin View ──

function AdminManagerView({ initialTab }: { initialTab: string }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('all');
  const [dialog, setDialog] = useState<{ open: boolean; leave: LeaveRequest | null; action: 'approve' | 'reject'; remarks: string; loading: boolean }>({
    open: false, leave: null, action: 'approve', remarks: '', loading: false
  });

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ role: activeTab });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (leaveTypeFilter !== 'all') params.set('leaveType', leaveTypeFilter);
      const res = await apiFetch(`/api/leaves?${params.toString()}`);
      if (res.ok) setLeaves(await res.json());
    } catch { /* silent */ } finally { setLoading(false); }
  }, [activeTab, statusFilter, leaveTypeFilter]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const handleAction = async () => {
    if (!dialog.leave) return;
    setDialog(p => ({ ...p, loading: true }));
    const promise = (async () => {
      const res = await apiFetch('/api/leaves', {
        method: 'PUT',
        body: JSON.stringify({ id: dialog.leave?.id, status: dialog.action === 'approve' ? 'approved' : 'rejected', approverRemarks: dialog.remarks || undefined }),
      });
      if (!res.ok) throw new Error();
      setDialog({ open: false, leave: null, action: 'approve', remarks: '', loading: false });
      await fetchLeaves();
    })();
    toast.promise(promise, { loading: 'Updating status...', success: 'Updated successfully', error: 'Action failed' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2"><CalendarDays className="h-6 w-6 text-primary" /> Leave Management</h2>
          <p className="text-muted-foreground text-sm mt-1">Review and manage leave requests from the team</p>
        </div>
      </div>
      <div className="space-y-4">

        <Card>
          <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
             <Select value={statusFilter} onValueChange={setStatusFilter}>
               <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All Status</SelectItem>
                 <SelectItem value="pending">Pending</SelectItem>
                 <SelectItem value="approved">Approved</SelectItem>
                 <SelectItem value="rejected">Rejected</SelectItem>
               </SelectContent>
             </Select>
             <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
               <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Type" /></SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.keys(leaveTypeConfig).map(k => <SelectItem key={k} value={k} className="capitalize">{k}</SelectItem>)}
               </SelectContent>
             </Select>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {loading ? <Skeleton className="h-64 w-full" /> : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaves.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-10 opacity-50 italic">No requests found</TableCell></TableRow> : (
                      leaves.map(l => (
                        <TableRow key={l.id}>
                          <TableCell className="font-medium">{l.userName}</TableCell>
                          <TableCell><Badge variant="outline" className={leaveTypeConfig[l.leaveType]?.bg}>{l.leaveType}</Badge></TableCell>
                          <TableCell className="text-xs">{l.startDate} to {l.endDate}</TableCell>
                          <TableCell className="text-xs truncate max-w-[150px]">{l.reason || '—'}</TableCell>
                          <TableCell className="text-center"><Badge className={statusConfig[l.status]?.bg}>{l.status}</Badge></TableCell>
                          <TableCell className="text-right">
                            {l.status === 'pending' && (
                              <div className="flex justify-end gap-1">
                                <Button size="sm" className="h-7 bg-emerald-600 hover:bg-emerald-700" onClick={() => setDialog({ open: true, leave: l, action: 'approve', remarks: '', loading: false })}>Approve</Button>
                                <Button size="sm" variant="outline" className="h-7 text-red-600" onClick={() => setDialog({ open: true, leave: l, action: 'reject', remarks: '', loading: false })}>Reject</Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialog.open} onOpenChange={(v: boolean) => setDialog(p => ({...p, open: v}))}>
        <DialogContent>
           <DialogHeader>
             <DialogTitle>{dialog.action === 'approve' ? 'Approve' : 'Reject'} Request</DialogTitle>
             <DialogDescription>Process this leave application and add optional remarks.</DialogDescription>
           </DialogHeader>
           <div className="py-4 space-y-4">
              <p className="text-sm">You are about to {dialog.action} the leave for <strong>{dialog.leave?.userName}</strong>.</p>
              <Textarea placeholder="Add remarks..." value={dialog.remarks} onChange={e => setDialog(p => ({...p, remarks: e.target.value}))} />
           </div>
           <DialogFooter>
              <Button variant="outline" onClick={() => setDialog(p => ({...p, open: false}))}>Cancel</Button>
              <Button className={dialog.action === 'approve' ? 'bg-emerald-600' : 'bg-red-600'} onClick={handleAction}>Confirm</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Staff View ──

function StaffSelfServiceView() {
  const { currentUser } = useAppStore();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [form, setForm] = useState({ leaveType: 'casual', startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], reason: '' });

  const fetchMyLeaves = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/leaves?userId=${currentUser.id}`);
      if (res.ok) setLeaves(await res.json());
    } catch { /* silent */ } finally { setLoading(false); }
  }, [currentUser]);

  useEffect(() => { fetchMyLeaves(); }, [fetchMyLeaves]);

  const handleApply = async () => {
    const promise = (async () => {
      const res = await apiFetch('/api/leaves', { method: 'POST', body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      setApplyOpen(false);
      setForm({ leaveType: 'casual', startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], reason: '' });
      await fetchMyLeaves();
    })();
    toast.promise(promise, { loading: 'Submitting...', success: 'Submitted', error: 'Failed' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Leaves</h2>
        <Button className="bg-emerald-600" onClick={() => setApplyOpen(true)}><Plus className="h-4 w-4 mr-2" /> Apply</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? <Skeleton className="h-48 w-full" /> : (
            <Table>
              <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Dates</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {leaves.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-10 opacity-50">No history</TableCell></TableRow> : (
                  leaves.map(l => (
                    <TableRow key={l.id}>
                      <TableCell className="capitalize">{l.leaveType}</TableCell>
                      <TableCell className="text-xs">{l.startDate} to {l.endDate}</TableCell>
                      <TableCell><Badge className={statusConfig[l.status]?.bg}>{l.status}</Badge></TableCell>
                      <TableCell className="text-right">
                         {l.status === 'pending' && <Button variant="ghost" className="h-7 text-red-600 text-xs" onClick={async () => {
                            await apiFetch('/api/leaves', { method: 'PUT', body: JSON.stringify({ id: l.id, status: 'cancelled' }) });
                            fetchMyLeaves();
                         }}>Cancel</Button>}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Application</DialogTitle>
            <DialogDescription>Apply for a new leave by selecting type and dates.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Start Date</label>
                  <Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">End Date</label>
                  <Input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
                </div>
             </div>
             <Select value={form.leaveType} onValueChange={v => setForm({...form, leaveType: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.keys(leaveTypeConfig).map(k => <SelectItem key={k} value={k} className="capitalize">{k}</SelectItem>)}</SelectContent>
             </Select>
             <Textarea placeholder="Reason..." value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} />
          </div>
          <DialogFooter><Button onClick={handleApply}>Submit</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
