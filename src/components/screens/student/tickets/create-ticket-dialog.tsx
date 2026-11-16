import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateFormData, TICKET_CATEGORIES, emptyCreateForm } from "./types";

interface CreateTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: CreateFormData) => Promise<void>;
}

export function CreateTicketDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateTicketDialogProps) {
  const [form, setForm] = useState<CreateFormData>({ ...emptyCreateForm });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(form);
      setForm({ ...emptyCreateForm });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border bg-card shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">Submit New Ticket</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Describe your issue and our team will assist you
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="create-title" className="text-xs font-medium text-foreground">Title</Label>
            <Input
              id="create-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Brief summary of your issue"
              className="rounded-xl focus-visible:ring-blue-500/30 focus-visible:border-blue-500"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="create-desc" className="text-xs font-medium text-foreground">Description</Label>
            <Textarea
              id="create-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Please describe your issue or question in detail..."
              rows={4}
              className="rounded-xl resize-none focus-visible:ring-blue-500/30 focus-visible:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-xs font-medium text-foreground">Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm({ ...form, priority: v })}
              >
                <SelectTrigger className="rounded-xl focus-visible:ring-blue-500/30 focus-visible:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-medium text-foreground">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger className="rounded-xl focus-visible:ring-blue-500/30 focus-visible:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {TICKET_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2.5 sm:gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl h-9.5 px-4 font-medium border-border hover:bg-muted cursor-pointer">
            Cancel
          </Button>
          <Button
            className="rounded-xl h-9.5 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer font-medium disabled:opacity-50 disabled:pointer-events-none"
            onClick={handleSubmit}
            disabled={submitting || !form.title.trim() || !form.description.trim()}
          >
            {submitting ? "Submitting..." : "Submit Ticket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
