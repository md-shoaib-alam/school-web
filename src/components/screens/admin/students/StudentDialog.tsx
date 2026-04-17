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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, GraduationCap } from "lucide-react";
import type { StudentInfo, ClassInfo, StudentFormData } from "./types";

interface StudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | "view";
  student: StudentInfo | null;
  classes: ClassInfo[];
  formData: StudentFormData;
  setFormData: (data: StudentFormData) => void;
  submitting: boolean;
  onSubmit: () => void;
}

export function StudentDialog({
  open,
  onOpenChange,
  mode,
  student,
  classes,
  formData,
  setFormData,
  submitting,
  onSubmit,
}: StudentDialogProps) {
  const isView = mode === "view";
  const title = mode === "create" ? "Add New Student" : mode === "edit" ? "Edit Student" : "Student Details";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-emerald-600" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {isView ? "Detailed information about the student." : "Fill in the details below to manage the student record."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 pt-2">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Info */}
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  disabled={isView}
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Address *</Label>
                <Input
                  disabled={isView}
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  disabled={isView}
                  placeholder="+1 234 567 890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Class *</Label>
                <Select
                  disabled={isView}
                  value={formData.classId}
                  onValueChange={(v) => setFormData({ ...formData, classId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}-{c.section} (Grade {c.grade})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Roll Number</Label>
                <Input
                  disabled={isView}
                  placeholder="e.g. 101"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Admission Number</Label>
                <Input
                  disabled={isView}
                  placeholder="e.g. ADM-001"
                  value={formData.admissionNumber}
                  onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  disabled={isView}
                  value={formData.gender}
                  onValueChange={(v) => setFormData({ ...formData, gender: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input
                  disabled={isView}
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>
            </div>

            {/* Guardian Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                Guardian Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Guardian Name</Label>
                  <Input
                    disabled={isView}
                    placeholder="e.g. Robert Doe"
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Guardian Phone</Label>
                  <Input
                    disabled={isView}
                    placeholder="+1 234 567 891"
                    value={formData.guardianPhone}
                    onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Relation</Label>
                  <Select
                    disabled={isView}
                    value={formData.guardianRelation}
                    onValueChange={(v) => setFormData({ ...formData, guardianRelation: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Relation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="father">Father</SelectItem>
                      <SelectItem value="mother">Mother</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                disabled={isView}
                placeholder="Residential Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            {mode === "create" && (
              <div className="space-y-2">
                <Label>Password *</Label>
                <Input
                  type="password"
                  placeholder="Set student login password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 border-t bg-gray-50/50 dark:bg-gray-900/50">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isView ? "Close" : "Cancel"}
          </Button>
          {!isView && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={onSubmit}
              disabled={submitting}
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {mode === "create" ? "Create Student" : "Save Changes"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
