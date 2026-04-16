"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { CalendarEvent, EventFormData, ALL_EVENT_TYPES, EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, TARGET_ROLE_LABELS } from "./types";

interface CalendarDialogsProps {
  dialogOpen: boolean;
  closeDialog: () => void;
  editingEvent: CalendarEvent | null;
  form: EventFormData;
  updateForm: (k: keyof EventFormData, v: any) => void;
  handleTypeChange: (v: string) => void;
  submitting: boolean;
  handleSubmit: () => void;
  deleteConfirmOpen: boolean;
  setDeleteConfirmOpen: (b: boolean) => void;
  deleting: boolean;
  handleConfirmDelete: () => void;
}

export function CalendarDialogs({
  dialogOpen,
  closeDialog,
  editingEvent,
  form,
  updateForm,
  handleTypeChange,
  submitting,
  handleSubmit,
  deleteConfirmOpen,
  setDeleteConfirmOpen,
  deleting,
  handleConfirmDelete,
}: CalendarDialogsProps) {
  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-[550px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              {editingEvent ? "Update Event" : "Create New Event"}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              {editingEvent ? "Modify the existing schedule details below." : "Add a new holiday, exam, or school event to the calendar."}
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto no-scrollbar">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Event Title</Label>
              <Input
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                placeholder="e.g. Annual Sports Meet 2024"
                className="rounded-lg border-slate-200 dark:border-slate-800 bg-transparent h-10 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Start Date</Label>
                <Input type="date" value={form.date} onChange={(e) => updateForm("date", e.target.value)} className="h-10 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">End Date</Label>
                <Input type="date" value={form.endDate} onChange={(e) => updateForm("endDate", e.target.value)} className="h-10 text-sm" min={form.date} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Category</Label>
                <Select value={form.type} onValueChange={handleTypeChange}>
                  <SelectTrigger className="h-10 text-sm uppercase font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_EVENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="text-xs uppercase font-bold">
                        {EVENT_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Visible To</Label>
                <Select value={form.targetRole} onValueChange={(v) => updateForm("targetRole", v)}>
                  <SelectTrigger className="h-10 text-sm uppercase font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TARGET_ROLE_LABELS).map(([val, lbl]) => (
                      <SelectItem key={val} value={val} className="text-xs uppercase font-bold">{lbl}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Location</Label>
              <Input value={form.location} onChange={(e) => updateForm("location", e.target.value)} placeholder="e.g. Main Auditorium" className="h-10 text-sm" />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Description</Label>
              <Textarea value={form.description} onChange={(e) => updateForm("description", e.target.value)} placeholder="Add more details about this event..." className="min-h-[80px] text-sm" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
              <div className="flex flex-col gap-0.5">
                <Label className="text-xs font-bold text-slate-900 dark:text-white">Full Day Event</Label>
                <span className="text-[10px] text-slate-400">Mark if this event lasts the entire day</span>
              </div>
              <Switch checked={form.allDay} onCheckedChange={(v) => updateForm("allDay", v)} />
            </div>
          </div>

          <DialogFooter className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={closeDialog} className="rounded-lg font-bold text-xs uppercase" disabled={submitting}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-6 h-10 font-bold text-xs uppercase" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingEvent ? "Update Schedule" : "Add to Calendar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="max-w-[400px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-slate-900 dark:text-white">Delete Event?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500 mt-2">
              This action is permanent and cannot be undone. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex gap-3">
            <AlertDialogCancel className="rounded-lg border-slate-200 dark:border-slate-700 font-bold h-10 px-4">Discard</AlertDialogCancel>
            <AlertDialogAction className="rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold h-10 px-4" onClick={handleConfirmDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
