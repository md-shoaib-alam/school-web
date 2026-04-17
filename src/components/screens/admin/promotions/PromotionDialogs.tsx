"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, GraduationCap, Zap, Users, AlertTriangle, ArrowRight } from "lucide-react";
import { PromotionFormData, ClassOption, StudentOption, getCurrentAcademicYear, PromotionRecord } from "./types";

/* ── Individual Promotion Dialog ── */

interface NewPromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: PromotionFormData;
  setForm: (form: PromotionFormData) => void;
  classes: ClassOption[];
  students: StudentOption[];
  submitting: boolean;
  onSubmit: () => void;
}

export function NewPromotionDialog({
  open,
  onOpenChange,
  form,
  setForm,
  classes,
  students,
  submitting,
  onSubmit,
}: NewPromotionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-600" />
            Individual Student Promotion
          </DialogTitle>
          <DialogDescription>
            Request a promotion for a specific student to a higher class.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Target Student *</Label>
            <Select value={form.studentId} onValueChange={(v) => {
              const s = students.find(x => x.id === v);
              setForm({ ...form, studentId: v, fromClassId: s?.classId || '' });
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name} ({s.className})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Promote To *</Label>
              <Select value={form.toClassId} onValueChange={(v) => setForm({ ...form, toClassId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Target class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}-{c.section}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Academic Year *</Label>
              <Input
                placeholder="e.g. 2024-2025"
                value={form.academicYear}
                onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Remarks (Optional)</Label>
            <Textarea
              placeholder="Reason for promotion..."
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 'Request Promotion'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Bulk Promotion Dialog ── */

interface BulkPromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: ClassOption[];
  onBulkPromote: (fromClassId: string, toClassId: string, academicYear: string, remarks: string) => void;
  submitting: boolean;
}

export function BulkPromotionDialog({
  open,
  onOpenChange,
  classes,
  onBulkPromote,
  submitting,
}: BulkPromotionDialogProps) {
  const [fromClass, setFromClass] = useState('');
  const [toClass, setToClass] = useState('');
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [remarks, setRemarks] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            Bulk Class Promotion
          </DialogTitle>
          <DialogDescription>
            Promote all eligible students from one class to another.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Source Class *</Label>
              <Select value={fromClass} onValueChange={setFromClass}>
                <SelectTrigger><SelectValue placeholder="From" /></SelectTrigger>
                <SelectContent>
                  {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}-{c.section}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target Class *</Label>
              <Select value={toClass} onValueChange={setToClass}>
                <SelectTrigger><SelectValue placeholder="To" /></SelectTrigger>
                <SelectContent>
                  {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}-{c.section}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Academic Year *</Label>
            <Input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Promotion Notes</Label>
            <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="e.g. End of term promotion" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => onBulkPromote(fromClass, toClass, academicYear, remarks)}
            disabled={submitting || !fromClass || !toClass}
          >
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 'Promote Whole Class'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Graduation Dialog ── */

interface GraduationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: ClassOption[];
  students: StudentOption[];
  onGraduate: (classId: string, studentIds: string[], academicYear: string, remarks: string) => void;
  submitting: boolean;
}

export function GraduationDialog({
  open,
  onOpenChange,
  classes,
  students,
  onGraduate,
  submitting,
}: GraduationDialogProps) {
  const [classId, setClassId] = useState('');
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [remarks, setRemarks] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredStudents = useMemo(() => students.filter(s => s.classId === classId), [students, classId]);

  const toggleAll = () => {
    if (selectedIds.size === filteredStudents.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredStudents.map(s => s.id)));
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-violet-600" />
            Mass Graduation
          </DialogTitle>
          <DialogDescription>
            Graduate students from the final grade and remove them from active rolls.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 pt-2">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Select Graduation Class *</Label>
                <Select value={classId} onValueChange={(v) => { setClassId(v); setSelectedIds(new Set()); }}>
                  <SelectTrigger><SelectValue placeholder="Final Class" /></SelectTrigger>
                  <SelectContent>
                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}-{c.section}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Academic Year *</Label>
                <Input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} />
              </div>
            </div>

            {classId && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Students to Graduate ({selectedIds.size})
                  </Label>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={toggleAll}>
                    {selectedIds.size === filteredStudents.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                <div className="border rounded-lg divide-y bg-gray-50/50 dark:bg-gray-900/50">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map(s => (
                      <div key={s.id} className="p-3 flex items-center gap-3">
                        <Checkbox checked={selectedIds.has(s.id)} onCheckedChange={() => toggleOne(s.id)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{s.name}</p>
                          <p className="text-[10px] text-gray-500">Roll: {s.rollNumber}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-gray-500">No students found in this class</div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Graduation Remarks</Label>
              <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="e.g. Completed Grade 12" />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 border-t bg-gray-50/50 dark:bg-gray-900/50">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            className="bg-violet-600 hover:bg-violet-700 text-white"
            onClick={() => onGraduate(classId, Array.from(selectedIds), academicYear, remarks)}
            disabled={submitting || selectedIds.size === 0}
          >
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : `Graduate ${selectedIds.size} Students`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Reject Confirmation Dialog ── */

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotion: PromotionRecord | null;
  remarks: string;
  setRemarks: (r: string) => void;
  onReject: () => void;
  submitting: boolean;
}

export function RejectDialog({
  open,
  onOpenChange,
  promotion,
  remarks,
  setRemarks,
  onReject,
  submitting,
}: RejectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Reject Promotion Request
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to reject the promotion for <strong>{promotion?.studentName}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <Label>Reason for Rejection *</Label>
          <Textarea
            placeholder="Please provide a reason..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={onReject} disabled={submitting || !remarks}>
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 'Confirm Reject'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
