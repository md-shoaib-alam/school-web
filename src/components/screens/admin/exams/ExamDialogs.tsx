'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Layers, Zap, Loader2, Plus, Save } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { ExamFormData, ClassOption, SubjectOption } from './types';

interface ExamDialogsProps {
  // Add Dialog
  addOpen: boolean;
  setAddOpen: (o: boolean) => void;
  addForm: ExamFormData;
  setAddForm: (f: ExamFormData) => void;
  adding: boolean;
  onAdd: () => void;
  
  // Edit Dialog
  editOpen: boolean;
  setEditOpen: (o: boolean) => void;
  editForm: ExamFormData & { id: string };
  setEditForm: (f: ExamFormData & { id: string }) => void;
  saving: boolean;
  onSave: () => void;
  
  // Metadata
  classes: ClassOption[];
  subjects: SubjectOption[];
  subjectsForClass: SubjectOption[];
  editSubjectsForClass: SubjectOption[];
  
  // Bulk helpers
  bulkRows: any[];
  selectedBulkCount: number;
  toggleAllBulk: (checked: boolean) => void;
  toggleBulkSubject: (id: string) => void;
  updateBulkField: (id: string, field: string, value: string) => void;
}

export function ExamDialogs({
  addOpen, setAddOpen, addForm, setAddForm, adding, onAdd,
  editOpen, setEditOpen, editForm, setEditForm, saving, onSave,
  classes, subjects, subjectsForClass, editSubjectsForClass,
  bulkRows, selectedBulkCount, toggleAllBulk, toggleBulkSubject, updateBulkField
}: ExamDialogsProps) {
  return (
    <>
      {/* NEW EXAM DIALOG */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Exam</DialogTitle>
            <DialogDescription>Schedule a new exam for your students.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Class *</Label>
                <Select value={addForm.classId} onValueChange={(v) => setAddForm({ ...addForm, classId: v, subjectId: '' })}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name} - {c.section}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Exam Type *</Label>
                <Select value={addForm.examType} onValueChange={(v) => setAddForm({ ...addForm, examType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unit_test">Unit Test</SelectItem>
                    <SelectItem value="midterm">Midterm</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="practical">Practical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Base Exam Name * <span className="text-xs text-muted-foreground font-normal">(e.g. "Final 2025")</span></Label>
              <Input placeholder="e.g. Final 2025" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
            </div>

            <div className="border rounded-lg overflow-hidden mt-2">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-12"><Checkbox checked={selectedBulkCount === bulkRows.length && bulkRows.length > 0} onCheckedChange={(c) => toggleAllBulk(!!c)} /></TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date *</TableHead>
                    <TableHead className="text-center">Start</TableHead>
                    <TableHead className="text-center">End</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Pass</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bulkRows.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Select a class first</TableCell></TableRow>
                  ) : (
                    bulkRows.map((row) => (
                      <TableRow key={row.subjectId} className={row.selected ? 'bg-blue-50/30' : ''}>
                        <TableCell><Checkbox checked={row.selected} onCheckedChange={() => toggleBulkSubject(row.subjectId)} /></TableCell>
                        <TableCell className="font-medium">{row.subjectName}</TableCell>
                        <TableCell><DatePicker date={row.date ? new Date(row.date) : undefined} onChange={(d) => updateBulkField(row.subjectId, 'date', d?.toISOString().split('T')[0] || '')} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} /></TableCell>
                        <TableCell><TimePicker value={row.startTime} onChange={(v) => updateBulkField(row.subjectId, 'startTime', v)} /></TableCell>
                        <TableCell><TimePicker value={row.endTime} onChange={(v) => updateBulkField(row.subjectId, 'endTime', v)} /></TableCell>
                        <TableCell><Input type="number" className="w-16 h-8 text-center" value={row.totalMarks} onChange={(e) => updateBulkField(row.subjectId, 'totalMarks', e.target.value)} /></TableCell>
                        <TableCell><Input type="number" className="w-16 h-8 text-center" value={row.passingMarks} onChange={(e) => updateBulkField(row.subjectId, 'passingMarks', e.target.value)} /></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button disabled={adding || selectedBulkCount === 0 || !addForm.name} onClick={onAdd} className="bg-blue-600 hover:bg-blue-700">
              {adding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Create {selectedBulkCount} Exam{selectedBulkCount !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT EXAM DIALOG */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Exam Details</DialogTitle>
            <DialogDescription>Update schedule or marks for this exam.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Exam Name</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Date</Label>
                <DatePicker date={editForm.date ? new Date(editForm.date) : undefined} onChange={(d) => setEditForm({ ...editForm, date: d?.toISOString().split('T')[0] || '' })} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} />
              </div>
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={editForm.examType} onValueChange={(v) => setEditForm({ ...editForm, examType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unit_test">Unit Test</SelectItem>
                    <SelectItem value="midterm">Midterm</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="practical">Practical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Time</Label>
                <TimePicker value={editForm.startTime} onChange={(v) => setEditForm({ ...editForm, startTime: v })} />
              </div>
              <div className="grid gap-2">
                <Label>End Time</Label>
                <TimePicker value={editForm.endTime} onChange={(v) => setEditForm({ ...editForm, endTime: v })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Total Marks</Label>
                <Input type="number" value={editForm.totalMarks} onChange={(e) => setEditForm({ ...editForm, totalMarks: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Passing Marks</Label>
                <Input type="number" value={editForm.passingMarks} onChange={(e) => setEditForm({ ...editForm, passingMarks: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button disabled={saving} onClick={onSave} className="bg-amber-600 hover:bg-amber-700">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


