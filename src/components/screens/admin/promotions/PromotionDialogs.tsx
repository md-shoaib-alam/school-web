"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Zap, AlertTriangle, GraduationCap } from "lucide-react";
import { ClassOption, StudentOption, PromotionFormData, PromotionRecord } from "./types";
import { isLastClass } from "./utils";

interface NewPromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: PromotionFormData;
  setForm: (form: PromotionFormData) => void;
  students: StudentOption[];
  classes: ClassOption[];
  submitting: boolean;
  handleCreatePromotion: () => void;
  handleStudentChange: (studentId: string) => void;
}

export function NewPromotionDialog({
  open,
  onOpenChange,
  form,
  setForm,
  students,
  classes,
  submitting,
  handleCreatePromotion,
  handleStudentChange,
}: NewPromotionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Promotion</DialogTitle>
          <DialogDescription>
            Create a promotion request for a single student. The student will be
            moved to the target class once approved.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Student *</label>
            <Select value={form.studentId} onValueChange={handleStudentChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} — Roll #{s.rollNumber} ({s.className})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">From Class *</label>
              <Select
                value={form.fromClassId}
                onValueChange={(v) => setForm({ ...form, fromClassId: v })}
                disabled
              >
                <SelectTrigger>
                  <SelectValue placeholder="Auto-filled" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}-{c.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">To Class *</label>
              <Select
                value={form.toClassId}
                onValueChange={(v) => setForm({ ...form, toClassId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes
                    .filter((c) => c.id !== form.fromClassId)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}-{c.section} (Grade {c.grade})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Academic Year *</label>
            <Input
              placeholder="e.g. 2025-2026"
              value={form.academicYear}
              onChange={(e) =>
                setForm({ ...form, academicYear: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Remarks</label>
            <Textarea
              placeholder="Optional remarks..."
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              rows={3}
            />
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleCreatePromotion}
            disabled={
              submitting ||
              !form.studentId ||
              !form.fromClassId ||
              !form.toClassId ||
              !form.academicYear
            }
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Promotion"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface BulkPromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: ClassOption[];
  bulkFromClass: string;
  handleBulkFromClassChange: (classId: string) => void;
  bulkToClass: string;
  setBulkToClass: (classId: string) => void;
  bulkAcademicYear: string;
  setBulkAcademicYear: (year: string) => void;
  bulkRemarks: string;
  setBulkRemarks: (remarks: string) => void;
  bulkPreview: StudentOption[];
  handleBulkPromote: () => void;
  bulkSubmitting: boolean;
}

export function BulkPromotionDialog({
  open,
  onOpenChange,
  classes,
  bulkFromClass,
  handleBulkFromClassChange,
  bulkToClass,
  setBulkToClass,
  bulkAcademicYear,
  setBulkAcademicYear,
  bulkRemarks,
  setBulkRemarks,
  bulkPreview,
  handleBulkPromote,
  bulkSubmitting,
}: BulkPromotionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Bulk Promotion
          </DialogTitle>
          <DialogDescription>
            All students in the selected class will be promoted to the next
            class in one go.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">From Class *</label>
              <Select
                value={bulkFromClass}
                onValueChange={handleBulkFromClassChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Current class" />
                </SelectTrigger>
                <SelectContent>
                  {classes
                    .sort(
                      (a, b) =>
                        (parseInt(a.grade) || 0) - (parseInt(b.grade) || 0),
                    )
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}-{c.section} (Grade {c.grade})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">To Class *</label>
              <Select value={bulkToClass} onValueChange={setBulkToClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Auto-detected" />
                </SelectTrigger>
                <SelectContent>
                  {classes
                    .filter((c) => c.id !== bulkFromClass)
                    .sort(
                      (a, b) =>
                        (parseInt(a.grade) || 0) - (parseInt(b.grade) || 0),
                    )
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}-{c.section} (Grade {c.grade})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Academic Year *</label>
            <Input
              value={bulkAcademicYear}
              onChange={(e) => setBulkAcademicYear(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Remarks</label>
            <Textarea
              value={bulkRemarks}
              onChange={(e) => setBulkRemarks(e.target.value)}
              placeholder="Optional..."
              rows={2}
            />
          </div>
          {bulkFromClass && isLastClass(bulkFromClass, classes) && (
            <div className="flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 rounded-lg px-3 py-2 border border-violet-200 dark:border-violet-800">
              <GraduationCap className="h-4 w-4 shrink-0" />
              <span>
                This is the highest class. Consider using{" "}
                <strong>Graduate</strong> instead.
              </span>
            </div>
          )}
          {bulkPreview.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {bulkPreview.length} student(s) will be promoted
            </p>
          )}
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-amber-600 hover:bg-amber-700 text-white"
            onClick={handleBulkPromote}
            disabled={
              bulkSubmitting ||
              !bulkFromClass ||
              !bulkToClass ||
              !bulkAcademicYear ||
              bulkPreview.length === 0
            }
          >
            {bulkSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              `Promote ${bulkPreview.length} Students`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface RejectPromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rejectingPromotion: PromotionRecord | null;
  rejectRemarks: string;
  setRejectRemarks: (remarks: string) => void;
  handleReject: () => void;
  rejecting: boolean;
}

export function RejectPromotionDialog({
  open,
  onOpenChange,
  rejectingPromotion,
  rejectRemarks,
  setRejectRemarks,
  handleReject,
  rejecting,
}: RejectPromotionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Reject Promotion
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to reject the promotion for{" "}
            <span className="font-semibold text-foreground">
              {rejectingPromotion?.studentName}
            </span>{" "}
            from {rejectingPromotion?.fromClassName} to{" "}
            {rejectingPromotion?.toClassName}?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <label className="text-sm font-medium">
            Reason for rejection (optional)
          </label>
          <Textarea
            placeholder="Provide reason..."
            value={rejectRemarks}
            onChange={(e) => setRejectRemarks(e.target.value)}
            rows={3}
          />
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleReject}
            disabled={rejecting}
          >
            {rejecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Rejecting...
              </>
            ) : (
              "Confirm Reject"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
