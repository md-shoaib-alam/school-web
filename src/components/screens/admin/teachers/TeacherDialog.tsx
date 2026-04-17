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
import { Loader2 } from "lucide-react";
import type { TeacherInfo } from "./types";

interface TeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTeacher: TeacherInfo | null;
  formData: any;
  setFormData: (data: any) => void;
  submitting: boolean;
  onSubmit: () => void;
  isFormValid: boolean;
}

export function TeacherDialog({
  open,
  onOpenChange,
  editingTeacher,
  formData,
  setFormData,
  submitting,
  onSubmit,
  isFormValid,
}: TeacherDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingTeacher ? "Edit Teacher" : "Add New Teacher"}</DialogTitle>
          <DialogDescription>
            {editingTeacher
              ? "Update the teacher details below"
              : "Fill in the teacher details below"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="teacher-name">Full Name</Label>
            <Input
              id="teacher-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Dr. Jane Smith"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="teacher-email">Email</Label>
            <Input
              id="teacher-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="jane.smith@school.com"
            />
          </div>
          {!editingTeacher && (
            <div className="grid gap-2">
              <Label htmlFor="teacher-password">Password</Label>
              <Input
                id="teacher-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Set login password (default: changeme123)"
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="teacher-phone">Phone</Label>
            <Input
              id="teacher-phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 234 567 890"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="teacher-qualification">Qualification</Label>
              <Input
                id="teacher-qualification"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="Ph.D., M.Ed."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="teacher-experience">Experience</Label>
              <Input
                id="teacher-experience"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="e.g., 5 years"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={onSubmit}
            disabled={submitting || !isFormValid}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {editingTeacher ? "Updating..." : "Adding..."}
              </>
            ) : editingTeacher ? (
              "Update Teacher"
            ) : (
              "Add Teacher"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
