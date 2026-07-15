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
} from "@/components/ui/dialog";

interface EditParentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editForm: any;
  setEditForm: (form: any) => void;
  onSave: () => void;
  editing: boolean;
}

export function EditParentDialog({
  open,
  onOpenChange,
  editForm,
  setEditForm,
  onSave,
  editing,
}: EditParentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Parent</DialogTitle>
          <DialogDescription>Update parent information</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label>Full Name <span className="text-red-500">*</span></Label>
            <Input
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              placeholder="e.g. Robert Anderson"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Email <span className="text-xs text-muted-foreground">(Optional)</span></Label>
            <Input
              type="email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
              placeholder="parent@sigel.edu"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Phone <span className="text-red-500">*</span></Label>
            <Input
              value={editForm.phone}
              onChange={(e) =>
                setEditForm({ ...editForm, phone: e.target.value })
              }
              placeholder="555-0201"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Occupation</Label>
            <Input
              value={editForm.occupation}
              onChange={(e) =>
                setEditForm({ ...editForm, occupation: e.target.value })
              }
              placeholder="e.g. Engineer"
              className="mt-1.5"
            />
          </div>
          <Button
            onClick={onSave}
            disabled={editing}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {editing ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
