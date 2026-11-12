"use client";

import { GraduationCap } from "lucide-react";
import { ProfileSection } from "@/components/ui/profile-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { ClassSelect } from "@/components/ui/class-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StudentInfo } from "./types";

interface StudentAcademicInfoCardProps {
  editing: boolean;
  collapsed: boolean;
  saving: boolean;
  canEdit?: boolean;
  dimmed?: boolean;
  currentStudent: StudentInfo;
  classId: string;
  rollNumber: string;
  username: string;
  admissionDate: string;
  academicStatus: string;
  house: string;
  onClassIdChange: (value: string) => void;
  onRollNumberChange: (value: string) => void;
  onAdmissionDateChange: (value: string) => void;
  onAcademicStatusChange: (value: string) => void;
  onEditSection: (section: string) => void;
  onToggleCollapse: (section: string) => void;
  onCancel: () => void;
  onSave: (sectionName?: string) => void;
  formatDate: (dateStr: string | null | undefined) => string;
}

export function StudentAcademicInfoCard({
  editing,
  collapsed,
  saving,
  canEdit,
  dimmed,
  currentStudent,
  classId,
  rollNumber,
  username,
  admissionDate,
  academicStatus,
  house,
  onClassIdChange,
  onRollNumberChange,
  onAdmissionDateChange,
  onAcademicStatusChange,
  onEditSection,
  onToggleCollapse,
  onCancel,
  onSave,
  formatDate,
}: StudentAcademicInfoCardProps) {
  return (
    <ProfileSection
      icon={GraduationCap}
      title="Academic Information"
      editing={editing}
      collapsed={collapsed}
      saving={saving}
      canEdit={canEdit}
      dimmed={dimmed}
      onEdit={() => onEditSection("academic")}
      onCancel={onCancel}
      onSave={() => onSave("Academic Information")}
      onToggleCollapse={() => onToggleCollapse("academic")}
      view={
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-4 text-xs sm:text-sm">
          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Class & Section</p>
            <p data-travel="class" className="font-semibold text-foreground mt-0.5">
              {currentStudent.className || "Unassigned"}
            </p>
          </div>

          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Roll No</p>
            <p data-travel="roll" className="font-semibold text-foreground mt-0.5">
              {rollNumber || currentStudent.rollNumber || "–"}
            </p>
          </div>

          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Student ID</p>
            <p data-travel="studentId" className="font-semibold text-foreground mt-0.5">
              {username || currentStudent.username || currentStudent.rollNumber || "–"}
            </p>
          </div>

          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Admission Date</p>
            <p data-travel="admission" className="font-semibold text-foreground mt-0.5">
              {formatDate(admissionDate || currentStudent.admissionDate || currentStudent.createdAt)}
            </p>
          </div>

          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Status</p>
            <div className="mt-0.5">
              <span
                data-travel="status"
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800"
              >
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Enrolled
              </span>
            </div>
          </div>

          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">House</p>
            <p data-travel="house" className="font-semibold text-foreground mt-0.5">{house || "Not Assigned"}</p>
          </div>
        </div>
      }
      form={
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Class & Section */}
            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">
                Class & Section <span className="text-red-500">*</span>
              </Label>
              <div data-travel="class">
                <ClassSelect
                  value={classId}
                  onValueChange={(val) => onClassIdChange(val)}
                  placeholder="Select class"
                  className="w-full h-9 text-xs rounded-xl bg-muted "
                />
              </div>
            </div>

            {/* Roll Number */}
            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">
                Roll Number <span className="text-red-500">*</span>
              </Label>
              <Input
                data-travel="roll"
                value={rollNumber}
                onChange={(e) => onRollNumberChange(e.target.value)}
                placeholder="e.g. 9B138"
                className="h-9 text-xs rounded-xl bg-muted "
              />
            </div>

            {/* Student ID (Login ID) */}
            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">
                Student ID (Login ID) <span className="text-red-500">*</span>
              </Label>
              <Input
                data-travel="studentId"
                value={username || currentStudent.username || currentStudent.rollNumber}
                disabled
                readOnly
                className="h-9 text-xs rounded-xl bg-muted text-muted-foreground  cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Admission Date */}
            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">
                Admission Date <span className="text-red-500">*</span>
              </Label>
              <div data-travel="admission">
                <DatePicker
                  date={admissionDate && !isNaN(new Date(admissionDate).getTime()) ? new Date(admissionDate) : undefined}
                  onChange={(d) => {
                    const formatted = d ? d.toISOString().split("T")[0] : "";
                    onAdmissionDateChange(formatted);
                  }}
                  placeholder="Pick admission date"
                  className="w-full h-9 text-xs rounded-xl bg-muted "
                />
              </div>
            </div>

            {/* Academic Status */}
            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">
                Academic Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={academicStatus}
                onValueChange={(val) => onAcademicStatusChange(val)}
              >
                <SelectTrigger data-travel="status" className="h-9 text-xs rounded-xl bg-muted ">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    <span className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      Enrolled / Active
                    </span>
                  </SelectItem>
                  <SelectItem value="inactive">
                    <span className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-amber-500" />
                      Inactive
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* House (Disabled / Reserved for future feature) */}
            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">
                House <span className="text-[10px] text-muted-foreground font-normal">(Not Configured)</span>
              </Label>
              <Select
                value="Not Assigned"
                disabled
              >
                <SelectTrigger data-travel="house" className="h-9 text-xs rounded-xl bg-muted  text-muted-foreground cursor-not-allowed">
                  <SelectValue placeholder="Not Assigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Assigned">Not Assigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      }
    />
  );
}
