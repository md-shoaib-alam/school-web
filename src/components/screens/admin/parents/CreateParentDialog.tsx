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

interface CreateParentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createForm: any;
  setCreateForm: (form: any) => void;
  onCreate: () => void;
  creating: boolean;
}

export function CreateParentDialog({
  open,
  onOpenChange,
  createForm,
  setCreateForm,
  onCreate,
  creating,
}: CreateParentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Parent</DialogTitle>
          <DialogDescription>
            Create a new parent account in the system. A unique Parent ID (e.g. PRN2026xxxx) will be automatically generated for login.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label>Full Name <span className="text-red-500">*</span></Label>
            <Input
              value={createForm.name}
              onChange={(e) =>
                setCreateForm({ ...createForm, name: e.target.value })
              }
              placeholder="e.g. Robert Anderson"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Parent Login ID <span className="text-xs text-muted-foreground">(Optional - Auto generated if left blank)</span></Label>
            <Input
              value={createForm.username || ""}
              onChange={(e) =>
                setCreateForm({ ...createForm, username: e.target.value })
              }
              placeholder="e.g. p_greenwood_03"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Email <span className="text-xs text-muted-foreground">(Optional)</span></Label>
            <Input
              type="email"
              value={createForm.email}
              onChange={(e) =>
                setCreateForm({ ...createForm, email: e.target.value })
              }
              placeholder="parent@sigel.edu"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Login Password</Label>
            <Input
              type="password"
              value={createForm.password}
              onChange={(e) =>
                setCreateForm({ ...createForm, password: e.target.value })
              }
              placeholder="Set login password (default: changeme123)"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Phone <span className="text-red-500">*</span></Label>
            <Input
              value={createForm.phone}
              onChange={(e) =>
                setCreateForm({ ...createForm, phone: e.target.value })
              }
              placeholder="555-0201"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Occupation</Label>
            <Input
              value={createForm.occupation}
              onChange={(e) =>
                setCreateForm({ ...createForm, occupation: e.target.value })
              }
              placeholder="e.g. Engineer"
              className="mt-1.5"
            />
          </div>
          <Button
            onClick={onCreate}
            disabled={creating}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {creating ? "Creating..." : "Create Parent"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
