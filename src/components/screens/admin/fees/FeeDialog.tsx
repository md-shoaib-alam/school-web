"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Loader2, DollarSign, School } from "lucide-react";
import type { FeeRecord, FeeFormData, StudentOption, ClassOption } from "./types";

interface FeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | "view";
  record: FeeRecord | null;
  students: StudentOption[];
  classes: ClassOption[];
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
  classes,
  formData,
  setFormData,
  submitting,
  onSubmit,
}: FeeDialogProps) {
  const isView = mode === "view";
  const title = mode === "create" ? "Create Fee Record" : mode === "edit" ? "Edit Fee Record" : "Fee Details";

  const [selectedClassId, setSelectedClassId] = useState<string>("all");

  // Filter students based on selected class
  const filteredStudents = useMemo(() => {
    if (!students || students.length === 0) return [];
    if (!selectedClassId || selectedClassId === "all") return students;
    
    return students.filter(s => {
      if (!s.classId) return false;
      // Use clean string comparison
      const sId = String(s.classId).toLowerCase().trim();
      const targetId = String(selectedClassId).toLowerCase().trim();
      return sId === targetId;
    });
  }, [students, selectedClassId]);

  // Reset class filter when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedClassId("all");
    }
  }, [open]);

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
            {mode === "create" && (
              <div className="space-y-2 col-span-2">
                <Label className="flex items-center gap-2">
                  <School className="h-4 w-4 text-muted-foreground" />
                  Select Class (to filter students)
                </Label>
                <Select
                  value={selectedClassId}
                  onValueChange={setSelectedClassId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2 col-span-2">
              <Label>Student *</Label>
              <Select
                disabled={isView || mode === "edit"}
                value={formData.studentId}
                onValueChange={(v) => setFormData({ ...formData, studentId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={filteredStudents.length === 0 ? "No students in this class" : "Select Student"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredStudents.map((s) => (
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
                  {/* Fallback for custom types not in the list */}
                  {formData.type && !feeTypes.find(t => t.value === formData.type) && (
                    <SelectItem value={formData.type}>
                      {formData.type.charAt(0).toUpperCase() + formData.type.slice(1).replace(/_/g, " ")}
                    </SelectItem>
                  )}
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
