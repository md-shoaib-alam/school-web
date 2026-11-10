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
    <Card className="rounded-2xl border  bg-card overflow-hidden shadow-2xs">
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
            <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
              No leave requests found
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto mt-1.5 leading-relaxed">
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
              <TableHeader className="bg-muted border-b ">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12 px-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === leaves.length && leaves.length > 0}
                      onChange={onToggleSelectAll}
                      className="rounded  text-blue-600 focus:ring-blue-500 size-4 cursor-pointer"
                    />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none text-xs font-semibold" onClick={() => onSort('userName')}>
                    <div className="flex items-center gap-1.5">
                      <span>Applicant</span>
                      <ArrowUpDown className="size-3 text-muted-foreground" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none text-xs font-semibold" onClick={() => onSort('leaveType')}>
                    <div className="flex items-center gap-1.5">
                      <span>Type</span>
                      <ArrowUpDown className="size-3 text-muted-foreground" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none text-xs font-semibold" onClick={() => onSort('startDate')}>
                    <div className="flex items-center gap-1.5">
                      <span>Dates</span>
                      <ArrowUpDown className="size-3 text-muted-foreground" />
                    </div>
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Reason
                  </TableHead>
                  <TableHead className="cursor-pointer select-none text-xs font-semibold text-center" onClick={() => onSort('status')}>
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Status</span>
                      <ArrowUpDown className="size-3 text-muted-foreground" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none text-xs font-semibold" onClick={() => onSort('createdAt')}>
                    <div className="flex items-center gap-1.5">
                      <span>Applied On</span>
                      <ArrowUpDown className="size-3 text-muted-foreground" />
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
                        "transition-colors hover:bg-muted border-b ",
                        isSelected && "bg-blue-50/40 dark:bg-blue-950/20"
                      )}
                    >
                      <TableCell className="px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelectRow(l.id)}
                          className="rounded  text-blue-600 focus:ring-blue-500 size-4 cursor-pointer"
                        />
                      </TableCell>

                      {/* Applicant Name & Avatar */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8.5 rounded-full border ">
                            <AvatarFallback className="bg-muted text-foreground text-xs font-bold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
                              {l.userName}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
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
                            leaveTypeConfig[l.leaveType]?.bg || "bg-muted text-foreground"
                          )}
                        >
                          {leaveTypeConfig[l.leaveType]?.label || l.leaveType}
                        </Badge>
                      </TableCell>

                      {/* Dates with Day Duration */}
                      <TableCell className="text-xs text-foreground whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {formatDateString(l.startDate)} - {formatDateString(l.endDate)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {duration} {duration === 1 ? 'day' : 'days'}
                          </span>
                        </div>
                      </TableCell>

                      {/* Reason */}
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={l.reason || '–'}>
                        {l.reason || '–'}
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell className="text-center">
                        <Badge
                          className={cn(
                            "text-xs font-semibold rounded-lg px-2.5 py-0.5 border shadow-2xs inline-flex items-center",
                            statusConfig[l.status]?.bg || "bg-muted text-foreground"
                          )}
                        >
                          {statusConfig[l.status]?.icon}
                          <span>{statusConfig[l.status]?.label || l.status}</span>
                        </Badge>
                      </TableCell>

                      {/* Applied On */}
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
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
                            className="size-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
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
          <div className="border-t  bg-muted px-4">
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
