"use client";

import { Briefcase, Pencil, ChevronUp, ChevronDown, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  onToggleCollapse,
  onStartEdit,
  onCancelEdit,
  onSave,
}: ProfessionalCardProps) {
  return (
    <div className="rounded-2xl border  bg-card p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
      <div className="flex items-center justify-between pb-3.5 border-b ">
        <div className="flex items-center gap-2 text-foreground font-semibold text-sm sm:text-base">
          <Briefcase className="size-4 text-emerald-600" />
          Professional Information
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onCancelEdit}
                disabled={isSaving}
                className="h-8 px-3 text-xs rounded-lg font-medium text-foreground  hover:bg-accent"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={onSave}
                disabled={isSaving}
                className="h-8 px-3 text-xs rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
              >
                {isSaving ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3.5" />}
                Save
              </Button>
            </div>
          ) : (
            canEdit && (
              <button
                onClick={onStartEdit}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border  text-xs font-medium text-foreground hover:bg-accent transition-colors"
              >
                <Pencil className="size-3" />
                Edit
              </button>
            )
          )}

          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground dark:hover:text-muted-foreground transition-colors"
            aria-label="Toggle section"
          >
            {isCollapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        isEditing ? (
          /* EDIT FORM */
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Role (Fixed to Teacher / Faculty Member on server) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Role <span className="text-[10px] text-muted-foreground font-normal">(Teacher)</span>
                </Label>
                <Select
                  value="Faculty Member"
                  disabled
                >
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-muted  text-muted-foreground cursor-not-allowed">
                    <SelectValue placeholder="Faculty Member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Faculty Member">Faculty Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Qualification */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Qualification</Label>
                <Input
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="e.g. B.Ed, M.Sc"
                  className="h-9 text-xs rounded-xl bg-muted "
                />
              </div>

              {/* Experience */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Experience</Label>
                <Input
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="e.g. 2 years"
                  className="h-9 text-xs rounded-xl bg-muted "
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-muted ">
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
        ) : (
          /* VIEW MODE */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-y-4 gap-x-6 text-xs sm:text-sm">
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Role</p>
              <p className="font-semibold text-foreground mt-0.5">{displayRole}</p>
            </div>

            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Qualification</p>
              <p className="font-semibold text-foreground mt-0.5">{currentTeacher.qualification || "B.Ed"}</p>
            </div>

            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Experience</p>
              <p className="font-semibold text-foreground mt-0.5">{currentTeacher.experience || "2 years"}</p>
            </div>

            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Date of Joining</p>
              <p className="font-semibold text-foreground mt-0.5">{displayJoiningDate}</p>
            </div>

            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Status</p>
              <div className="mt-0.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  {currentTeacher.status ? currentTeacher.status.charAt(0).toUpperCase() + currentTeacher.status.slice(1) : "Active"}
                </span>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
