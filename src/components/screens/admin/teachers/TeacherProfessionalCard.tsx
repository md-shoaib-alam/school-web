"use client";

import { Briefcase } from "lucide-react";
import { ProfileSection } from "@/components/ui/profile-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TeacherInfo } from "./types";

interface ProfessionalCardProps {
  currentTeacher: TeacherInfo;
  formData: any;
  setFormData: (data: any) => void;
  displayRole: string;
  displayJoiningDate: string;
  canEdit?: boolean;
  isEditing: boolean;
  isSaving: boolean;
  isCollapsed: boolean;
  dimmed?: boolean;
  onToggleCollapse: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
}

const EMPLOYMENT_LABELS: Record<string, string> = {
  "full-time": "Full-Time",
  "part-time": "Part-Time",
  contract: "Contract",
  intern: "Intern",
};

export function TeacherProfessionalCard({
  currentTeacher,
  formData,
  setFormData,
  displayRole,
  displayJoiningDate,
  canEdit,
  isEditing,
  isSaving,
  isCollapsed,
  dimmed,
  onToggleCollapse,
  onStartEdit,
  onCancelEdit,
  onSave,
}: ProfessionalCardProps) {
  return (
    <ProfileSection
      icon={Briefcase}
      title="Professional Information"
      editing={isEditing}
      collapsed={isCollapsed}
      saving={isSaving}
      canEdit={canEdit}
      dimmed={dimmed}
      onEdit={onStartEdit}
      onCancel={onCancelEdit}
      onSave={onSave}
      onToggleCollapse={onToggleCollapse}
      form={
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">Employee ID</Label>
              <Input
                data-travel="employeeId"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                placeholder="Auto-generate if empty"
                className="h-9 text-xs rounded-xl bg-muted font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">Department</Label>
              <Input
                data-travel="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Science"
                className="h-9 text-xs rounded-xl bg-muted"
              />
            </div>

            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">Designation</Label>
              <Input
                data-travel="designation"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Senior Faculty"
                className="h-9 text-xs rounded-xl bg-muted"
              />
            </div>

            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">Employment Type</Label>
              <div data-travel="employmentType">
                <Select
                  value={formData.employmentType || "full-time"}
                  onValueChange={(val) => setFormData({ ...formData, employmentType: val })}
                >
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-muted">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-Time</SelectItem>
                    <SelectItem value="part-time">Part-Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">Qualification</Label>
              <Input
                data-travel="qualification"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="e.g. B.Ed, M.Sc"
                className="h-9 text-xs rounded-xl bg-muted"
              />
            </div>

            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">Experience</Label>
              <Input
                data-travel="experience"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="e.g. 2 years"
                className="h-9 text-xs rounded-xl bg-muted"
              />
            </div>

            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">Date of Joining</Label>
              <div data-travel="joiningDate">
                <DatePicker
                  date={formData.joiningDate && !isNaN(new Date(formData.joiningDate).getTime()) ? new Date(formData.joiningDate) : undefined}
                  onChange={(d) => setFormData({ ...formData, joiningDate: d ? d.toISOString().split("T")[0] : "" })}
                  placeholder="Pick date of joining"
                  className="w-full h-9 text-xs rounded-xl bg-muted"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">Status</Label>
              <div data-travel="status">
                <Select
                  value={formData.status}
                  onValueChange={(val) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-muted">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      }
      view={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-6 text-xs sm:text-sm">
          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Employee ID</p>
            <p data-travel="employeeId" className="font-semibold text-foreground mt-0.5 font-mono">{currentTeacher.employeeId || "—"}</p>
          </div>

          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Department</p>
            <p data-travel="department" className="font-semibold text-foreground mt-0.5">{currentTeacher.department || "—"}</p>
          </div>

          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Designation</p>
            <p data-travel="designation" className="font-semibold text-foreground mt-0.5">{displayRole}</p>
          </div>

          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Employment Type</p>
            <p data-travel="employmentType" className="font-semibold text-foreground mt-0.5">
              {EMPLOYMENT_LABELS[currentTeacher.employmentType || ""] || currentTeacher.employmentType || "—"}
            </p>
          </div>

          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Qualification</p>
            <p data-travel="qualification" className="font-semibold text-foreground mt-0.5">{currentTeacher.qualification || "—"}</p>
          </div>

          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Experience</p>
            <p data-travel="experience" className="font-semibold text-foreground mt-0.5">{currentTeacher.experience || "—"}</p>
          </div>

          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Date of Joining</p>
            <p data-travel="joiningDate" className="font-semibold text-foreground mt-0.5">{displayJoiningDate}</p>
          </div>

          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Status</p>
            <div data-travel="status" className="mt-0.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                {currentTeacher.status ? currentTeacher.status.charAt(0).toUpperCase() + currentTeacher.status.slice(1) : "Active"}
              </span>
            </div>
          </div>
        </div>
      }
    />
  );
}