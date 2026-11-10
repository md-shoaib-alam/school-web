'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FileText, Plus, ArrowUpDown, Check, X, Eye } from 'lucide-react';
import { Pagination } from '@/components/shared/pagination';
import { cn } from '@/lib/utils';
import {
  leaveTypeConfig,
  statusConfig,
  getDurationDays,
  formatDateString,
  type LeaveRequest,
  type LeaveSortField,
} from './leave-request';

interface LeaveRequestsTableProps {
  loading: boolean;
  leaves: LeaveRequest[];
  selectedIds: Set<string>;
  onToggleSelectAll: () => void;
  onToggleSelectRow: (id: string) => void;
  onSort: (field: LeaveSortField) => void;
  onApprove: (leave: LeaveRequest) => void;
  onReject: (leave: LeaveRequest) => void;
  onViewDetail: (leave: LeaveRequest) => void;
  onNewLeaveRequest: () => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
}

export function LeaveRequestsTable({
  loading,
  leaves,
  selectedIds,
  onToggleSelectAll,
  onToggleSelectRow,
  onSort,
  onApprove,
  onReject,
  onViewDetail,
  onNewLeaveRequest,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: LeaveRequestsTableProps) {
  return (
    <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-2xs">
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : leaves.length === 0 ? (
          /* Empty State Matching Screenshot */
          <div className="py-16 sm:py-20 px-4 text-center flex flex-col items-center justify-center animate-in fade-in-50 duration-300">
            <div className="size-20 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-xs">
              <FileText className="size-10 stroke-[1.5]" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
              No leave requests found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-sm mx-auto mt-1.5 leading-relaxed">
              There are no leave requests matching your filters.
            </p>
            <Button
              variant="outline"
              onClick={onNewLeaveRequest}
              className="mt-5 rounded-xl h-10 px-4 text-xs font-semibold border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 gap-2 shadow-2xs"
            >
              <Plus className="size-4" />
              <span>New Leave Request</span>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/70 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-zinc-800/80">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12 px-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === leaves.length && leaves.length > 0}
                      onChange={onToggleSelectAll}
                      className="rounded border-slate-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 size-4 cursor-pointer"
                    />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none text-xs font-semibold" onClick={() => onSort('userName')}>
                    <div className="flex items-center gap-1.5">
                      <span>Applicant</span>
                      <ArrowUpDown className="size-3 text-slate-400" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none text-xs font-semibold" onClick={() => onSort('leaveType')}>
                    <div className="flex items-center gap-1.5">
                      <span>Type</span>
                      <ArrowUpDown className="size-3 text-slate-400" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none text-xs font-semibold" onClick={() => onSort('startDate')}>
                    <div className="flex items-center gap-1.5">
                      <span>Dates</span>
                      <ArrowUpDown className="size-3 text-slate-400" />
                    </div>
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Reason
                  </TableHead>
                  <TableHead className="cursor-pointer select-none text-xs font-semibold text-center" onClick={() => onSort('status')}>
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Status</span>
                      <ArrowUpDown className="size-3 text-slate-400" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none text-xs font-semibold" onClick={() => onSort('createdAt')}>
                    <div className="flex items-center gap-1.5">
                      <span>Applied On</span>
                      <ArrowUpDown className="size-3 text-slate-400" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.map(l => {
                  const duration = getDurationDays(l.startDate, l.endDate);
                  const isSelected = selectedIds.has(l.id);
                  const initials = l.userName
                    ?.split(' ')
                    .map(n => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() || 'U';

                  return (
                    <TableRow
                      key={l.id}
                      className={cn(
                        "transition-colors hover:bg-slate-50/70 dark:hover:bg-zinc-900/50 border-b border-slate-100 dark:border-zinc-800/60",
                        isSelected && "bg-blue-50/40 dark:bg-blue-950/20"
                      )}
                    >
                      <TableCell className="px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelectRow(l.id)}
                          className="rounded border-slate-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 size-4 cursor-pointer"
                        />
                      </TableCell>

                      {/* Applicant Name & Avatar */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8.5 rounded-full border border-slate-200 dark:border-zinc-800">
                            <AvatarFallback className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                              {l.userName}
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate">
                              {l.userEmail || `${l.role}`}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Type Badge */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-medium rounded-lg px-2.5 py-0.5 border capitalize",
                            leaveTypeConfig[l.leaveType]?.bg || "bg-slate-100 text-slate-700"
                          )}
                        >
                          {leaveTypeConfig[l.leaveType]?.label || l.leaveType}
                        </Badge>
                      </TableCell>

                      {/* Dates with Day Duration */}
                      <TableCell className="text-xs text-slate-600 dark:text-zinc-300 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800 dark:text-zinc-200">
                            {formatDateString(l.startDate)} - {formatDateString(l.endDate)}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                            {duration} {duration === 1 ? 'day' : 'days'}
                          </span>
                        </div>
                      </TableCell>

                      {/* Reason */}
                      <TableCell className="text-xs text-slate-500 dark:text-zinc-400 max-w-[200px] truncate" title={l.reason || '–'}>
                        {l.reason || '–'}
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell className="text-center">
                        <Badge
                          className={cn(
                            "text-xs font-semibold rounded-lg px-2.5 py-0.5 border shadow-2xs inline-flex items-center",
                            statusConfig[l.status]?.bg || "bg-zinc-100 text-zinc-700"
                          )}
                        >
                          {statusConfig[l.status]?.icon}
                          <span>{statusConfig[l.status]?.label || l.status}</span>
                        </Badge>
                      </TableCell>

                      {/* Applied On */}
                      <TableCell className="text-xs text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                        {formatDateString(l.createdAt)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {l.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onApprove(l)}
                                className="size-8 p-0 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                title="Approve"
                              >
                                <Check className="size-4" strokeWidth={2.5} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onReject(l)}
                                className="size-8 p-0 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                title="Reject"
                              >
                                <X className="size-4" strokeWidth={2.5} />
                              </Button>
                            </>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onViewDetail(l)}
                            className="size-8 p-0 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-zinc-800"
                            title="View Details"
                          >
                            <Eye className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* ── 5. Pagination Footer ── */}
        {!loading && leaves.length > 0 && (
          <div className="border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/40 dark:bg-zinc-900/30 px-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={onPageChange}
              onLimitChange={onItemsPerPageChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
