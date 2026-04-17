"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, DollarSign } from "lucide-react";
import type { FeeRecord, FeeFormData, StudentOption } from "./types";

interface FeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | "view";
  record: FeeRecord | null;
  students: StudentOption[];
  formData: FeeFormData;
  setFormData: (data: FeeFormData) => void;
  submitting: boolean;
  onSubmit: () => void;
}

const feeTypes = [
  { value: "tuition", label: "Tuition Fee" },
  { value: "admission", label: "Admission Fee" },
  { value: "exam", label: "Examination Fee" },
  { value: "transport", label: "Transport Fee" },
  { value: "library", label: "Library Fee" },
  { value: "other", label: "Other" },
];

export function FeeDialog({
  open,
  onOpenChange,
  mode,
  record,
  students,
  formData,
  setFormData,
  submitting,
  onSubmit,
}: FeeDialogProps) {
  const isView = mode === "view";
  const title = mode === "create" ? "Create Fee Record" : mode === "edit" ? "Edit Fee Record" : "Fee Details";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-600">
            <DollarSign className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {isView ? "Detailed information about this transaction." : "Manage student fee details and payment status."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Student *</Label>
              <Select
                disabled={isView || mode === "edit"}
                value={formData.studentId}
                onValueChange={(v) => setFormData({ ...formData, studentId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fee Type *</Label>
              <Select
                disabled={isView}
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  {feeTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Total Amount *</Label>
              <Input
                disabled={isView}
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Status *</Label>
              <Select
                disabled={isView}
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Input
                disabled={isView}
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Paid Amount</Label>
              <Input
                disabled={isView}
                type="number"
                placeholder="0.00"
                value={formData.paidAmount}
                onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Paid Date</Label>
              <Input
                disabled={isView}
                type="date"
                value={formData.paidDate}
                onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Remark / Notes</Label>
              <Input
                disabled={isView}
                placeholder="Optional notes..."
                value={formData.remark}
                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isView ? "Close" : "Cancel"}
          </Button>
          {!isView && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={onSubmit}
              disabled={submitting}
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {mode === "create" ? "Create Record" : "Save Changes"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
