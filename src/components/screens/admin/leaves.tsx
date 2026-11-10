'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  CalendarDays, Briefcase,
  FileText, AlertTriangle, Plus,
  ChevronDown, Crown, Sparkles
} from 'lucide-react';
import { toast } from "sonner";
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAppStore } from '@/store/use-app-store';
import { cn } from '@/lib/utils';

import {
  statusConfig, leaveTypeConfig, CANDIDATE_LIMITS, getDurationDays, formatDateString,
  type LeaveRequest,
} from './leaves/leave-request';
import { LeaveManagementHero } from './leaves/leave-management-hero';
import { LeaveMetricCards } from './leaves/leave-metric-cards';
import { LeaveFilterBar } from './leaves/leave-filter-bar';
import { LeaveRequestsTable } from './leaves/leave-requests-table';
import { NewLeaveRequestDialog } from './leaves/new-leave-request-dialog';
import { LeaveActionDialog } from './leaves/leave-action-dialog';

// ── Main Component ──

export function AdminLeaves({ initialTab = 'teacher' }: { initialTab?: string }) {
  const { currentUser } = useAppStore();
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

  if (isAdmin) return <AdminManagerView initialTab={initialTab} />;
  return <StaffSelfServiceView />;
}

// ── Admin Manager View ──

function AdminManagerView({ initialTab }: { initialTab: string }) {
  const router = useRouter();
  const { slug } = useParams();
  const activeTab = initialTab;
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState<Record<string, number>>({});
  // null = full history (paid plans); a number = rolling month window (basic)
  const [historyMonths, setHistoryMonths] = useState<number | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('all');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Filtering is server-side now, so overlapping requests can land out of order.
  // Track the newest one and drop anything stale.
  const fetchSeqRef = useRef(0);

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortField, setSortField] = useState<'userName' | 'leaveType' | 'startDate' | 'status' | 'createdAt'>('createdAt');
  const [sortAsc, setSortAsc] = useState(false);

  // Row selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Action Dialogs
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    leave: LeaveRequest | null;
    action: 'approve' | 'reject';
    remarks: string;
    loading: boolean;
  }>({
    open: false,
    leave: null,
    action: 'approve',
    remarks: '',
    loading: false,
  });

  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    leave: LeaveRequest | null;
  }>({
    open: false,
    leave: null,
  });

  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({
    userId: '',
    leaveType: 'casual',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
    isSubmitting: false,
  });

  const [availableCandidates, setAvailableCandidates] = useState<{ id: string; name: string; email?: string }[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState('');
  const [debouncedCandidateSearch, setDebouncedCandidateSearch] = useState('');
  const [candidatesTruncated, setCandidatesTruncated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedCandidateSearch(candidateSearch.trim()), 300);
    return () => clearTimeout(t);
  }, [candidateSearch]);

  // 1. Fetch Candidate List for New Leave Request.
  // Searched server-side: the min lists are capped (100 students / 200 teachers
  // and staff), so a "load everything" approach would silently hide people.
  useEffect(() => {
    if (!applyModalOpen) return;
    let cancelled = false;
    const cap = CANDIDATE_LIMITS[activeTab] ?? 100;

    setCandidatesLoading(true);
    const qs = new URLSearchParams({ mode: 'min', limit: String(cap) });
    if (debouncedCandidateSearch) qs.set('search', debouncedCandidateSearch);

    const endpoint =
      activeTab === 'student'
        ? `/api/students?${qs.toString()}`
        : activeTab === 'teacher'
        ? `/api/teachers?${qs.toString()}`
        : `/api/staff?${qs.toString()}`;

    apiFetch(endpoint)
      .then(res => (res.ok ? res.json() : []))
      .then(data => {
        if (cancelled) return;
        const list: any[] = Array.isArray(data) ? data : data?.items || data?.data || [];
        setAvailableCandidates(list.map((c: any) => ({
          id: c.userId || c.id,
          name: c.name || c.userName || 'Unnamed',
          email: c.email || c.userEmail || ''
        })));
        setCandidatesTruncated(list.length >= cap);
      })
      .catch(() => {
        if (!cancelled) setAvailableCandidates([]);
      })
      .finally(() => {
        if (!cancelled) setCandidatesLoading(false);
      });

    return () => { cancelled = true; };
  }, [applyModalOpen, activeTab, debouncedCandidateSearch]);

  // 2. Fetch one page of leaves (search, filters, sort and paging all server-side)
  const fetchLeaves = useCallback(async () => {
    const seq = ++fetchSeqRef.current;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        role: activeTab,
        paginate: 'true',
        page: String(currentPage),
        limit: String(pageSize),
        sortBy: sortField,
        order: sortAsc ? 'asc' : 'desc',
      });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (leaveTypeFilter !== 'all') params.set('leaveType', leaveTypeFilter);
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (startDateFilter) params.set('from', startDateFilter);
      if (endDateFilter) params.set('to', endDateFilter);

      const res = await apiFetch(`/api/leaves?${params.toString()}`);
      if (seq !== fetchSeqRef.current) return;
      if (res.ok) {
        const data = await res.json();
        const list: LeaveRequest[] = Array.isArray(data?.items) ? data.items : [];
        const serverTotal = Number(data?.total ?? 0);
        const serverTotalPages = Math.max(1, Number(data?.totalPages ?? 1));

        // The last page can empty out after an approve/reject — step back one
        if (list.length === 0 && serverTotal > 0 && currentPage > serverTotalPages) {
          setCurrentPage(serverTotalPages);
          return;
        }

        setLeaves(list);
        setTotal(serverTotal);
        setTotalPages(serverTotalPages);
        setCounts(data?.counts ?? {});
        setHistoryMonths(typeof data?.historyMonths === 'number' ? data.historyMonths : null);
      }
    } catch {
      /* silent */
    } finally {
      if (seq === fetchSeqRef.current) setLoading(false);
    }
  }, [
    activeTab, statusFilter, leaveTypeFilter, startDateFilter, endDateFilter,
    debouncedSearch, sortField, sortAsc, currentPage, pageSize,
  ]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  // 3. Metric cards — totals come from the server (window + filters applied)
  const metrics = useMemo(() => {
    return {
      total: counts.all ?? 0,
      approved: counts.approved ?? 0,
      pending: counts.pending ?? 0,
      rejected: counts.rejected ?? 0,
    };
  }, [counts]);

  const minFromDate = useMemo(() => {
    if (historyMonths === null) return undefined;
    const d = new Date();
    d.setMonth(d.getMonth() - historyMonths);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }, [historyMonths]);

  // Handle Sort Toggle
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
    setCurrentPage(1);
  };

  // Handle Checkbox Selection
  const toggleSelectAll = () => {
    if (selectedIds.size === leaves.length && leaves.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leaves.map(l => l.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Handle Approve / Reject
  const handleProcessAction = async () => {
    if (!actionDialog.leave) return;
    setActionDialog(p => ({ ...p, loading: true }));
    try {
      const res = await apiFetch('/api/leaves', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: actionDialog.leave.id,
          status: actionDialog.action === 'approve' ? 'approved' : 'rejected',
          approverRemarks: actionDialog.remarks.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error('Action failed');

      toast.success(
        actionDialog.action === 'approve'
          ? 'Leave request approved successfully!'
          : 'Leave request rejected.'
      );
      setActionDialog({ open: false, leave: null, action: 'approve', remarks: '', loading: false });
      await fetchLeaves();
    } catch {
      toast.error('Failed to update leave status');
      setActionDialog(p => ({ ...p, loading: false }));
    }
  };

  // Handle Create Leave Request
  const handleCreateLeave = async () => {
    if (!applyForm.userId) {
      toast.error('Please select an applicant');
      return;
    }
    if (new Date(applyForm.endDate) < new Date(applyForm.startDate)) {
      toast.error('End date cannot be before start date');
      return;
    }

    setApplyForm(p => ({ ...p, isSubmitting: true }));
    try {
      const res = await apiFetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: applyForm.userId,
          leaveType: applyForm.leaveType,
          startDate: applyForm.startDate,
          endDate: applyForm.endDate,
          reason: applyForm.reason.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error('Submission failed');

      toast.success('Leave request created successfully!');
      setApplyModalOpen(false);
      setApplyForm({
        userId: '',
        leaveType: 'casual',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: '',
        isSubmitting: false,
      });
      await fetchLeaves();
    } catch {
      toast.error('Failed to create leave request');
      setApplyForm(p => ({ ...p, isSubmitting: false }));
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setLeaveTypeFilter('all');
    setStartDateFilter('');
    setEndDateFilter('');
    setCurrentPage(1);
  };

  const roleLabel =
    activeTab === 'student' ? 'students' : activeTab === 'teacher' ? 'teachers' : 'staff members';

  return (
    <div className="space-y-5">
      {/* ── 1. Hero Banner ── */}
      <LeaveManagementHero
        roleLabel={roleLabel}
        onNewLeaveRequest={() => setApplyModalOpen(true)}
      />

      {/* ── 2. Metric Summary Cards ── */}
      <LeaveMetricCards
        total={metrics.total}
        approved={metrics.approved}
        pending={metrics.pending}
        rejected={metrics.rejected}
      />

      {/* Basic plan: history is windowed server-side, so say so and offer the upgrade */}
      {historyMonths !== null && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-gradient-to-r from-amber-50 to-orange-50/60 dark:from-amber-950/20 dark:to-orange-950/10 p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-center size-9 rounded-xl bg-amber-100 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 shrink-0">
            <Crown className="size-4.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <p className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-200">
              Showing the last {historyMonths} months of leave history
            </p>
            <p className="text-[11px] sm:text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">
              Your current plan only keeps a rolling {historyMonths}-month window. Upgrade to see every request ever filed.
            </p>
          </div>
          <Button
            onClick={() => router.push(`/${slug}/manage-plan`)}
            className="rounded-xl h-9 px-3.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white gap-1.5 shadow-xs shadow-amber-600/20 shrink-0"
          >
            <Sparkles className="size-3.5" />
            <span>Upgrade for full history</span>
          </Button>
        </div>
      )}

      {/* ── 3. Search & Filter Bar ── */}
      <LeaveFilterBar
        activeTab={activeTab}
        searchQuery={searchQuery}
        onSearchQueryChange={v => { setSearchQuery(v); setCurrentPage(1); }}
        statusFilter={statusFilter}
        onStatusFilterChange={v => { setStatusFilter(v); setCurrentPage(1); }}
        leaveTypeFilter={leaveTypeFilter}
        onLeaveTypeFilterChange={v => { setLeaveTypeFilter(v); setCurrentPage(1); }}
        startDateFilter={startDateFilter}
        onStartDateFilterChange={v => { setStartDateFilter(v); setCurrentPage(1); }}
        endDateFilter={endDateFilter}
        onEndDateFilterChange={v => { setEndDateFilter(v); setCurrentPage(1); }}
        minFromDate={minFromDate}
        onResetFilters={handleResetFilters}
        onApplyFilters={() => { if (currentPage === 1) fetchLeaves(); else setCurrentPage(1); }}
      />

      {/* ── 4. Main Table Card ── */}
      <LeaveRequestsTable
        loading={loading}
        leaves={leaves}
        selectedIds={selectedIds}
        onToggleSelectAll={toggleSelectAll}
        onToggleSelectRow={toggleSelectRow}
        onSort={handleSort}
        onApprove={leave => setActionDialog({ open: true, leave, action: 'approve', remarks: '', loading: false })}
        onReject={leave => setActionDialog({ open: true, leave, action: 'reject', remarks: '', loading: false })}
        onViewDetail={leave => setDetailModal({ open: true, leave })}
        onNewLeaveRequest={() => setApplyModalOpen(true)}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={total}
        itemsPerPage={pageSize}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={l => { setPageSize(l); setCurrentPage(1); }}
      />

      {/* ── 6. New Leave Request Dialog ── */}
      <NewLeaveRequestDialog
        open={applyModalOpen}
        onOpenChange={o => {
          setApplyModalOpen(o);
          if (!o) {
            setCandidateSearch('');
            setDebouncedCandidateSearch('');
          }
        }}
        activeTab={activeTab}
        roleLabel={roleLabel}
        candidateSearch={candidateSearch}
        onCandidateSearchChange={setCandidateSearch}
        candidatesLoading={candidatesLoading}
        availableCandidates={availableCandidates}
        candidatesTruncated={candidatesTruncated}
        applicantId={applyForm.userId}
        leaveType={applyForm.leaveType}
        startDate={applyForm.startDate}
        endDate={applyForm.endDate}
        reason={applyForm.reason}
        isSubmitting={applyForm.isSubmitting}
        onApplicantChange={v => setApplyForm(p => ({ ...p, userId: v }))}
        onLeaveTypeChange={v => setApplyForm(p => ({ ...p, leaveType: v }))}
        onStartDateChange={v => {
          const newEnd = applyForm.endDate && applyForm.endDate < v ? v : applyForm.endDate;
          setApplyForm(p => ({ ...p, startDate: v, endDate: newEnd }));
        }}
        onEndDateChange={v => setApplyForm(p => ({ ...p, endDate: v }))}
        onReasonChange={v => setApplyForm(p => ({ ...p, reason: v }))}
        onCancel={() => setApplyModalOpen(false)}
        onSubmit={handleCreateLeave}
      />

      {/* ── 7. Approve / Reject Action Modal ── */}
      <LeaveActionDialog
        open={actionDialog.open}
        onOpenChange={v => setActionDialog(p => ({ ...p, open: v }))}
        leave={actionDialog.leave}
        action={actionDialog.action}
        remarks={actionDialog.remarks}
        loading={actionDialog.loading}
        onRemarksChange={v => setActionDialog(p => ({ ...p, remarks: v }))}
        onCancel={() => setActionDialog(p => ({ ...p, open: false }))}
        onConfirm={handleProcessAction}
      />

      {/* ── 8. View Detail Modal ── */}
      <Dialog open={detailModal.open} onOpenChange={v => setDetailModal(p => ({ ...p, open: v }))}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <FileText className="size-5 text-blue-600" />
              Leave Details
            </DialogTitle>
          </DialogHeader>

          {detailModal.leave && (
            <div className="py-2 space-y-3.5 text-xs text-foreground">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted border ">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Applicant</span>
                  <p className="font-bold text-sm text-foreground mt-0.5">{detailModal.leave.userName}</p>
                  <p className="text-[11px] text-muted-foreground">{detailModal.leave.userEmail}</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Status</span>
                  <div className="mt-1">
                    <Badge className={cn("text-xs font-semibold rounded-lg px-2.5 py-0.5", statusConfig[detailModal.leave.status]?.bg)}>
                      {statusConfig[detailModal.leave.status]?.label || detailModal.leave.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted border ">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Leave Type</span>
                  <p className="font-semibold text-foreground capitalize mt-0.5">{detailModal.leave.leaveType}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted border ">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Duration</span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {getDurationDays(detailModal.leave.startDate, detailModal.leave.endDate)} days
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted border  space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Dates</span>
                <p className="font-semibold text-foreground">
                  {formatDateString(detailModal.leave.startDate)} to {formatDateString(detailModal.leave.endDate)}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-muted border  space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Reason</span>
                <p className="text-foreground leading-relaxed">{detailModal.leave.reason || 'No reason provided.'}</p>
              </div>

              {detailModal.leave.approverRemarks && (
                <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-1">
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-wider font-semibold">Approver Remarks</span>
                  <p className="text-foreground leading-relaxed">{detailModal.leave.approverRemarks}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailModal({ open: false, leave: null })}
              className="rounded-xl text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Staff Self Service View ──

function StaffSelfServiceView() {
  const { currentUser } = useAppStore();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [form, setForm] = useState({
    leaveType: 'casual',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  const currentUserId = currentUser?.id;

  const fetchMyLeaves = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/leaves?userId=${currentUserId}`);
      if (res.ok) {
        const data = await res.json();
        setLeaves(Array.isArray(data) ? data : []);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchMyLeaves();
  }, [fetchMyLeaves]);

  const handleApply = async () => {
    if (new Date(form.endDate) < new Date(form.startDate)) {
      toast.error('End date cannot be before start date');
      return;
    }
    const promise = (async () => {
      const res = await apiFetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setApplyOpen(false);
      setForm({
        leaveType: 'casual',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: '',
      });
      await fetchMyLeaves();
    })();
    toast.promise(promise, { loading: 'Submitting...', success: 'Submitted successfully', error: 'Failed' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">My Leaves</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">View and apply for your personal leaves</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs gap-2"
          onClick={() => setApplyOpen(true)}
        >
          <Plus className="size-4" /> Apply Leave
        </Button>
      </div>

      <Card className="rounded-2xl border  bg-card overflow-hidden shadow-2xs">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted border-b ">
                <TableRow>
                  <TableHead className="text-xs font-semibold">Type</TableHead>
                  <TableHead className="text-xs font-semibold">Dates</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                  <TableHead className="text-right text-xs font-semibold pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground text-xs italic">
                      No leave history found
                    </TableCell>
                  </TableRow>
                ) : (
                  leaves.map(l => (
                    <TableRow key={l.id} className="border-b ">
                      <TableCell className="capitalize font-medium text-xs">
                        <Badge variant="outline" className={cn("text-xs font-medium rounded-lg px-2.5 py-0.5", leaveTypeConfig[l.leaveType]?.bg)}>
                          {leaveTypeConfig[l.leaveType]?.label || l.leaveType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-foreground">
                        {formatDateString(l.startDate)} - {formatDateString(l.endDate)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn("text-xs font-semibold rounded-lg px-2.5 py-0.5 border shadow-2xs inline-flex items-center", statusConfig[l.status]?.bg)}>
                          {statusConfig[l.status]?.icon}
                          <span>{statusConfig[l.status]?.label || l.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        {l.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-medium"
                            onClick={async () => {
                              await apiFetch('/api/leaves', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: l.id, status: 'cancelled' }),
                              });
                              fetchMyLeaves();
                            }}
                          >
                            Cancel Request
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Apply Modal */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <CalendarDays className="size-5 text-blue-600" />
              New Application
            </DialogTitle>
            <DialogDescription className="text-xs">
              Apply for a leave by selecting type, dates, and reason.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Start Date</label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={e => {
                    const newStart = e.target.value;
                    const newEnd = form.endDate && form.endDate < newStart ? newStart : form.endDate;
                    setForm({ ...form, startDate: newStart, endDate: newEnd });
                  }}
                  className="h-10 rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">End Date</label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm({ ...form, endDate: e.target.value })}
                  min={form.startDate}
                  className="h-10 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Leave Type</label>
              <Select value={form.leaveType} onValueChange={v => setForm({ ...form, leaveType: v })}>
                <SelectTrigger className="h-10 rounded-xl text-sm capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {Object.keys(leaveTypeConfig).map(k => (
                    <SelectItem key={k} value={k} className="capitalize">
                      {leaveTypeConfig[k]?.label || k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Reason</label>
              <Textarea
                placeholder="Reason for leave..."
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
                className="rounded-xl min-h-[80px] text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setApplyOpen(false)} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button onClick={handleApply} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs">
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
