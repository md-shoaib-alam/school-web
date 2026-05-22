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
import { Loader2, Zap, GraduationCap } from "lucide-react";
import { ClassOption, StudentOption } from "./types";
import { isLastClass } from "./utils";

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
            <Zap className="size-5 text-amber-500" />
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
              <GraduationCap className="size-4 shrink-0" />
              <span>
                This is the highest class. Consider using{" "}
                <strong>Graduate</strong> instead.
              </span>
            </div>
          )}
          {bulkPreview.length > 0 && (
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Students to be promoted ({bulkPreview.length})
              </label>
              <div className="max-h-[160px] overflow-y-auto rounded-lg border bg-muted/30 p-2 text-sm space-y-1">
                {bulkPreview.map((s) => (
                  <div key={s.id} className="flex justify-between items-center px-2 py-1 rounded hover:bg-muted/50 transition-colors">
                    <span className="font-medium text-foreground">{s.name}</span>
                    <span className="text-xs text-muted-foreground">#{s.rollNumber}</span>
                  </div>
                ))}
              </div>
            </div>
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
                <Loader2 className="size-4 mr-2 animate-spin" />
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
