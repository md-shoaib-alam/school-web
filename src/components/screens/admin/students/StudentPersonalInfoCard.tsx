"use client";

import {
  User,
  Pencil,
  ChevronUp,
  ChevronDown,
  Check,
  Upload,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import type { StudentInfo } from "./types";

interface StudentPersonalInfoCardProps {
  editing: boolean;
  collapsed: boolean;
  saving: boolean;
  canEdit?: boolean;
  currentStudent: StudentInfo;
  name: string;
  gender: string;
  dateOfBirth: string;
  bloodGroup: string;
  phone: string;
  email: string;
  onNameChange: (value: string) => void;
  onGenderChange: (value: string) => void;
  onDateOfBirthChange: (value: string) => void;
  onBloodGroupChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onEditSection: (section: string) => void;
  onToggleCollapse: (section: string) => void;
  onCancel: () => void;
  onSave: (sectionName?: string) => void;
  onUploadPhotoClick: () => void;
  formatDate: (dateStr: string | null | undefined) => string;
  calculateAge: (dateStr: string | null | undefined) => string;
}

export function StudentPersonalInfoCard({
  editing,
  collapsed,
  saving,
  canEdit,
  currentStudent,
  name,
  gender,
  dateOfBirth,
  bloodGroup,
  phone,
  email,
  onNameChange,
  onGenderChange,
  onDateOfBirthChange,
  onBloodGroupChange,
  onPhoneChange,
  onEmailChange,
  onEditSection,
  onToggleCollapse,
  onCancel,
  onSave,
  onUploadPhotoClick,
  formatDate,
  calculateAge,
}: StudentPersonalInfoCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all">
      {/* ────────────────────────────────────────────────────────── */}
      {/* CARD 1: Personal Information                                */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100 dark:border-zinc-800/60">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm sm:text-base">
          <User className="size-4 text-emerald-600" />
          Personal Information
        </div>

        <div className="flex items-center gap-2">
          {editing ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onCancel}
                disabled={saving}
                className="h-8 px-3 text-xs rounded-lg font-medium text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => onSave("Personal Information")}
                disabled={saving}
                className="h-8 px-3 text-xs rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
              >
                {saving ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3.5" />}
                Save
              </Button>
            </div>
          ) : (
            canEdit && (
              <button
                onClick={() => onEditSection("personal")}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <Pencil className="size-3" />
                Edit
              </button>
            )
          )}
          <button
            onClick={() => onToggleCollapse("personal")}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
            aria-label="Toggle section"
          >
            {collapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        editing ? (
          /* EDIT FORM */
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="Student Name"
                  className="h-9 text-xs rounded-xl bg-slate-50/50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700"
                />
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Gender <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={gender}
                  onValueChange={(val) => onGenderChange(val)}
                >
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-slate-50/50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Date of Birth <span className="text-red-500">*</span>
                </Label>
                <DatePicker
                  date={dateOfBirth && !isNaN(new Date(dateOfBirth).getTime()) ? new Date(dateOfBirth) : undefined}
                  onChange={(d) => {
                    const formatted = d ? d.toISOString().split("T")[0] : "";
                    onDateOfBirthChange(formatted);
                  }}
                  placeholder="Pick date of birth"
                  className="w-full h-9 text-xs rounded-xl bg-slate-50/50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700"
                />
              </div>

              {/* Age (Readonly calculated) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Age</Label>
                <Input
                  value={calculateAge(dateOfBirth)}
                  disabled
                  readOnly
                  className="h-9 text-xs rounded-xl bg-slate-100/70 dark:bg-zinc-800/40 text-slate-500 border-slate-200 dark:border-zinc-800 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              {/* Blood Group */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Blood Group</Label>
                <Select
                  value={bloodGroup}
                  onValueChange={(val) => onBloodGroupChange(val)}
                >
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-slate-50/50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700">
                    <SelectValue placeholder="Not Added" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Added">Not Added</SelectItem>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Phone Number with +91 */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Phone Number</Label>
                <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/50 focus-within:ring-1 focus-within:ring-emerald-500">
                  <span className="inline-flex items-center px-2.5 text-xs text-slate-500 bg-slate-100 dark:bg-zinc-800 border-r border-slate-200 dark:border-zinc-700 font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => onPhoneChange(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full h-9 px-3 text-xs bg-transparent focus:outline-none text-slate-800 dark:text-zinc-200"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Email Address</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  placeholder="student@school.com"
                  className="h-9 text-xs rounded-xl bg-slate-50/50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700"
                />
              </div>

              {/* Student Photo */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Student Photo</Label>
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                    {name ? name.slice(0, 2).toUpperCase() : "ST"}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 text-xs rounded-xl border-slate-200 dark:border-zinc-700 font-medium gap-1.5 hover:bg-slate-50"
                    onClick={onUploadPhotoClick}
                  >
                    <Upload className="size-3.5" />
                    Upload Photo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* VIEW MODE */
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-4 text-xs sm:text-sm">
            <div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">Full Name</p>
              <p className="font-semibold text-slate-800 dark:text-zinc-100 mt-0.5">{name || currentStudent.name}</p>
            </div>

            <div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">Gender</p>
              <p className="font-semibold text-slate-800 dark:text-zinc-100 capitalize mt-0.5">
                {gender || currentStudent.gender || "–"}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">DOB</p>
              <p className="font-semibold text-slate-800 dark:text-zinc-100 mt-0.5">
                {formatDate(dateOfBirth || currentStudent.dateOfBirth)}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">Age</p>
              <p className="font-semibold text-slate-800 dark:text-zinc-100 mt-0.5">
                {calculateAge(dateOfBirth || currentStudent.dateOfBirth)}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">Blood Group</p>
              <p className="font-semibold text-slate-800 dark:text-zinc-100 mt-0.5">{bloodGroup || "Not Added"}</p>
            </div>

            <div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">Phone</p>
              <p className="font-semibold text-slate-800 dark:text-zinc-100 mt-0.5">
                {phone || currentStudent.phone || "—"}
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
}
