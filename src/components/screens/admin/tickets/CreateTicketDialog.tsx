"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Ticket } from "lucide-react";
import { TICKET_CATEGORIES } from "./constants";
import type { CreateFormData } from "./types";

interface CreateTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: CreateFormData;
  setForm: (v: CreateFormData) => void;
  loading: boolean;
  onSubmit: () => void;
}

export function CreateTicketDialog({
  open,
  onOpenChange,
  form,
  setForm,
  loading,
  onSubmit,
}: CreateTicketDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border border-border bg-card shadow-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Ticket className="size-5 text-blue-600 dark:text-blue-400" />
            Create New Support Ticket
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fill in the details below to open a new support ticket.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-medium text-foreground">Subject / Title</Label>
            <Input
              id="title"
              placeholder="e.g., Unable to access gradebook"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              className="rounded-xl focus-visible:ring-blue-500/30 focus-visible:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-foreground">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm({ ...form, category: v })
                }
              >
                <SelectTrigger className="rounded-xl focus-visible:ring-blue-500/30 focus-visible:border-blue-500">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border bg-popover">
                  {TICKET_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-foreground">Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) =>
                  setForm({ ...form, priority: v })
                }
              >
                <SelectTrigger className="rounded-xl focus-visible:ring-blue-500/30 focus-visible:border-blue-500">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border bg-popover">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-medium text-foreground">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the issue in detail..."
              rows={5}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="rounded-xl resize-none focus-visible:ring-blue-500/30 focus-visible:border-blue-500"
            />
          </div>
        </div>

        <DialogFooter className="gap-2.5 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="rounded-xl h-9.5 px-4 font-medium border-border hover:bg-muted cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={loading || !form.title.trim() || !form.description.trim()}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl shadow-xs shadow-blue-500/20 cursor-pointer font-medium h-9.5 px-4"
          >
            {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
            Create Ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
