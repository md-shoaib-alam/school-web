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
    <div className="rounded-2xl border  bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all">
      {/* ────────────────────────────────────────────────────────── */}
      {/* CARD 1: Personal Information                                */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b ">
        <div className="flex items-center gap-2 text-foreground font-semibold text-sm sm:text-base">
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
                className="h-8 px-3 text-xs rounded-lg font-medium text-foreground  hover:bg-accent"
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
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border  text-xs font-medium text-foreground hover:bg-accent transition-colors"
              >
                <Pencil className="size-3" />
                Edit
              </button>
            )
          )}
          <button
            onClick={() => onToggleCollapse("personal")}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground dark:hover:text-muted-foreground transition-colors"
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
                <Label className="text-xs font-semibold text-foreground">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="Student Name"
                  className="h-9 text-xs rounded-xl bg-muted "
                />
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Gender <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={gender}
                  onValueChange={(val) => onGenderChange(val)}
                >
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-muted ">
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
                <Label className="text-xs font-semibold text-foreground">
                  Date of Birth <span className="text-red-500">*</span>
                </Label>
                <DatePicker
                  date={dateOfBirth && !isNaN(new Date(dateOfBirth).getTime()) ? new Date(dateOfBirth) : undefined}
                  onChange={(d) => {
                    const formatted = d ? d.toISOString().split("T")[0] : "";
                    onDateOfBirthChange(formatted);
                  }}
                  placeholder="Pick date of birth"
                  className="w-full h-9 text-xs rounded-xl bg-muted "
                />
              </div>

              {/* Age (Readonly calculated) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Age</Label>
                <Input
                  value={calculateAge(dateOfBirth)}
                  disabled
                  readOnly
                  className="h-9 text-xs rounded-xl bg-muted text-muted-foreground  cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              {/* Blood Group */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Blood Group</Label>
                <Select
                  value={bloodGroup}
                  onValueChange={(val) => onBloodGroupChange(val)}
                >
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-muted ">
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
                <Label className="text-xs font-semibold text-foreground">Phone Number</Label>
                <div className="flex rounded-xl overflow-hidden border  bg-muted focus-within:ring-1 focus-within:ring-emerald-500">
                  <span className="inline-flex items-center px-2.5 text-xs text-muted-foreground bg-muted border-r  font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => onPhoneChange(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full h-9 px-3 text-xs bg-transparent focus:outline-none text-foreground"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Email Address</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  placeholder="student@school.com"
                  className="h-9 text-xs rounded-xl bg-muted "
                />
              </div>

              {/* Student Photo */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Student Photo</Label>
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                    {name ? name.slice(0, 2).toUpperCase() : "ST"}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 text-xs rounded-xl  font-medium gap-1.5 hover:bg-muted"
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
              <p className="text-[11px] text-muted-foreground font-medium">Full Name</p>
              <p className="font-semibold text-foreground mt-0.5">{name || currentStudent.name}</p>
            </div>

            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Gender</p>
              <p className="font-semibold text-foreground capitalize mt-0.5">
                {gender || currentStudent.gender || "–"}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-muted-foreground font-medium">DOB</p>
              <p className="font-semibold text-foreground mt-0.5">
                {formatDate(dateOfBirth || currentStudent.dateOfBirth)}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Age</p>
              <p className="font-semibold text-foreground mt-0.5">
                {calculateAge(dateOfBirth || currentStudent.dateOfBirth)}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Blood Group</p>
              <p className="font-semibold text-foreground mt-0.5">{bloodGroup || "Not Added"}</p>
            </div>

            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Phone</p>
              <p className="font-semibold text-foreground mt-0.5">
                {phone || currentStudent.phone || "—"}
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
}
