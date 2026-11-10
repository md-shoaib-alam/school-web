'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateString, type LeaveRequest } from './leave-request';

interface LeaveActionDialogProps {
  open: boolean;
  leave: LeaveRequest | null;
  action: 'approve' | 'reject';
  remarks: string;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onRemarksChange: (remarks: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function LeaveActionDialog({
  open,
  leave,
  action,
  remarks,
  loading,
  onOpenChange,
  onRemarksChange,
  onCancel,
  onConfirm,
}: LeaveActionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            {action === 'approve' ? (
              <CheckCircle2 className="size-5 text-emerald-600" />
            ) : (
              <XCircle className="size-5 text-rose-600" />
            )}
            {action === 'approve' ? 'Approve' : 'Reject'} Leave Request
          </DialogTitle>
          <DialogDescription className="text-xs">
            Confirm your decision and optionally add remarks for the applicant.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 text-xs space-y-1">
            <p>
              <strong>Applicant:</strong> {leave?.userName} ({leave?.role})
            </p>
            <p>
              <strong>Duration:</strong> {formatDateString(leave?.startDate)} - {formatDateString(leave?.endDate)}
            </p>
            {leave?.reason && (
              <p>
                <strong>Reason:</strong> {leave?.reason}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Approver Remarks</label>
            <Textarea
              placeholder="Optional notes or instructions..."
              value={remarks}
              onChange={e => onRemarksChange(e.target.value)}
              className="rounded-xl min-h-[75px] text-sm"
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
            disabled={loading}
            onClick={onConfirm}
            className={cn(
              "rounded-xl text-xs text-white",
              action === 'approve' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
            )}
          >
            {loading ? <Loader2 className="size-3.5 animate-spin mr-1" /> : null}
            Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
