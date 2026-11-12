"use client";

import { Briefcase } from "lucide-react";
import { ProfileSection } from "@/components/ui/profile-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
            {/* Role (Fixed to Teacher / Faculty Member on server) */}
            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">
                Role <span className="text-[10px] text-muted-foreground font-normal">(Teacher)</span>
              </Label>
              <Select
                value="Faculty Member"
                disabled
              >
                <SelectTrigger data-travel="role" className="h-9 text-xs rounded-xl bg-muted  text-muted-foreground cursor-not-allowed">
                  <SelectValue placeholder="Faculty Member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Faculty Member">Faculty Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Qualification */}
            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">Qualification</Label>
              <Input
                data-travel="qualification"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="e.g. B.Ed, M.Sc"
                className="h-9 text-xs rounded-xl bg-muted "
              />
            </div>

            {/* Experience */}
            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">Experience</Label>
              <Input
                data-travel="experience"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="e.g. 2 years"
                className="h-9 text-xs rounded-xl bg-muted "
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val) => setFormData({ ...formData, status: val })}
              >
                <SelectTrigger data-travel="status" className="h-9 text-xs rounded-xl bg-muted ">
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
      }
      view={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-y-4 gap-x-6 text-xs sm:text-sm">
          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Role</p>
            <p data-travel="role" className="font-semibold text-foreground mt-0.5">{displayRole}</p>
          </div>

          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Qualification</p>
            <p data-travel="qualification" className="font-semibold text-foreground mt-0.5">{currentTeacher.qualification || "B.Ed"}</p>
          </div>

          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Experience</p>
            <p data-travel="experience" className="font-semibold text-foreground mt-0.5">{currentTeacher.experience || "2 years"}</p>
          </div>

          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Date of Joining</p>
            <p className="font-semibold text-foreground mt-0.5">{displayJoiningDate}</p>
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
