'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, Loader2 } from 'lucide-react';
import { CANDIDATE_LIMITS, leaveTypeConfig } from './leave-request';

interface NewLeaveRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: string;
  roleLabel: string;
  candidateSearch: string;
  onCandidateSearchChange: (value: string) => void;
  candidatesLoading: boolean;
  availableCandidates: { id: string; name: string; email?: string }[];
  candidatesTruncated: boolean;
  applicantId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  isSubmitting: boolean;
  onApplicantChange: (userId: string) => void;
  onLeaveTypeChange: (leaveType: string) => void;
  onStartDateChange: (startDate: string) => void;
  onEndDateChange: (endDate: string) => void;
  onReasonChange: (reason: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export function NewLeaveRequestDialog({
  open,
  onOpenChange,
  activeTab,
  roleLabel,
  candidateSearch,
  onCandidateSearchChange,
  candidatesLoading,
  availableCandidates,
  candidatesTruncated,
  applicantId,
  leaveType,
  startDate,
  endDate,
  reason,
  isSubmitting,
  onApplicantChange,
  onLeaveTypeChange,
  onStartDateChange,
  onEndDateChange,
  onReasonChange,
  onCancel,
  onSubmit,
}: NewLeaveRequestDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <CalendarDays className="size-5 text-blue-600" />
            New Leave Request
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Submit a leave application on behalf of a {activeTab}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Applicant Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground capitalize">
              Select {activeTab}
            </label>
            <Input
              value={candidateSearch}
              onChange={e => onCandidateSearchChange(e.target.value)}
              placeholder={`Search ${roleLabel} by name...`}
              className="h-10 rounded-xl text-sm"
            />
            {candidatesLoading ? (
              <Skeleton className="h-10 w-full rounded-xl" />
            ) : (
              <Select value={applicantId} onValueChange={onApplicantChange}>
                <SelectTrigger className="h-10 rounded-xl text-sm">
                  <SelectValue placeholder={`Choose ${activeTab}...`} />
                </SelectTrigger>
                <SelectContent className="rounded-xl max-h-56">
                  {availableCandidates.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.email ? `(${c.email})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {!candidatesLoading && availableCandidates.length === 0 && (
              <p className="text-[11px] text-muted-foreground">
                No {roleLabel} found{candidateSearch ? ` for "${candidateSearch}"` : ''}.
              </p>
            )}
            {!candidatesLoading && candidatesTruncated && !candidateSearch && (
              <p className="text-[11px] text-muted-foreground">
                Showing the first {CANDIDATE_LIMITS[activeTab] ?? 100} — type a name to narrow down.
              </p>
            )}
          </div>

          {/* Leave Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Leave Type</label>
            <Select value={leaveType} onValueChange={onLeaveTypeChange}>
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

          {/* Start and End Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={e => onStartDateChange(e.target.value)}
                className="h-10 rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={e => onEndDateChange(e.target.value)}
                min={startDate}
                className="h-10 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Reason</label>
            <Textarea
              placeholder="Provide details or reason for leave..."
              value={reason}
              onChange={e => onReasonChange(e.target.value)}
              className="rounded-xl min-h-[80px] text-sm"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onCancel}
            className="rounded-xl text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <span>Submit Request</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
