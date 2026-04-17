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
import { Loader2, Users } from "lucide-react";
import type { TeacherInfo, TeacherFormData } from "./types";

interface TeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTeacher: TeacherInfo | null;
  formData: TeacherFormData;
  setFormData: (data: TeacherFormData) => void;
  submitting: boolean;
  onSubmit: () => void;
}

export function TeacherDialog({
  open,
  onOpenChange,
  editingTeacher,
  formData,
  setFormData,
  submitting,
  onSubmit,
}: TeacherDialogProps) {
  const title = editingTeacher ? "Edit Teacher" : "Add New Teacher";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {editingTeacher
              ? "Update teacher profile and information."
              : "Register a new teacher to the platform."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Full Name *</Label>
              <Input
                placeholder="e.g. Dr. Sarah Wilson"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Email Address *</Label>
              <Input
                type="email"
                placeholder="sarah.w@school.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                placeholder="+1 234 567 890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Qualification</Label>
              <Input
                placeholder="e.g. M.Sc, B.Ed"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Experience</Label>
              <Input
                placeholder="e.g. 5 Years"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              />
            </div>
            {!editingTeacher && (
              <div className="space-y-2">
                <Label>Password *</Label>
                <Input
                  type="password"
                  placeholder="Set initial password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {editingTeacher ? "Save Changes" : "Create Teacher"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
