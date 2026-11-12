"use client";

import { User, Upload } from "lucide-react";
import { ProfileSection } from "@/components/ui/profile-section";
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
  dimmed?: boolean;
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
  dimmed,
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
    <ProfileSection
      icon={User}
      title="Personal Information"
      editing={editing}
      collapsed={collapsed}
      saving={saving}
      canEdit={canEdit}
      dimmed={dimmed}
      onEdit={() => onEditSection("personal")}
      onCancel={onCancel}
      onSave={() => onSave("Personal Information")}
      onToggleCollapse={() => onToggleCollapse("personal")}
      view={
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-4 text-xs sm:text-sm">
          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Full Name</p>
            <p data-travel="name" className="font-semibold text-foreground mt-0.5">{name || currentStudent.name}</p>
          </div>

          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Gender</p>
            <p data-travel="gender" className="font-semibold text-foreground capitalize mt-0.5">
              {gender || currentStudent.gender || "–"}
            </p>
          </div>

          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">DOB</p>
            <p data-travel="dob" className="font-semibold text-foreground mt-0.5">
              {formatDate(dateOfBirth || currentStudent.dateOfBirth)}
            </p>
          </div>

          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Age</p>
            <p data-travel="age" className="font-semibold text-foreground mt-0.5">
              {calculateAge(dateOfBirth || currentStudent.dateOfBirth)}
            </p>
          </div>

          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Blood Group</p>
            <p data-travel="blood" className="font-semibold text-foreground mt-0.5">{bloodGroup || "Not Added"}</p>
          </div>

          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Phone</p>
            <p data-travel="phone" className="font-semibold text-foreground mt-0.5">
              {phone || currentStudent.phone || "—"}
            </p>
          </div>
        </div>
      }
      form={
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                data-travel="name"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Student Name"
                className="h-9 text-xs rounded-xl bg-muted "
              />
            </div>

            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">
                Gender <span className="text-red-500">*</span>
              </Label>
              <Select value={gender} onValueChange={(val) => onGenderChange(val)}>
                <SelectTrigger data-travel="gender" className="h-9 text-xs rounded-xl bg-muted ">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">
                Date of Birth <span className="text-red-500">*</span>
              </Label>
              <div data-travel="dob">
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
            </div>

            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">Age</Label>
              <Input
                data-travel="age"
                value={calculateAge(dateOfBirth)}
                disabled
                readOnly
                className="h-9 text-xs rounded-xl bg-muted text-muted-foreground  cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">Blood Group</Label>
              <Select value={bloodGroup} onValueChange={(val) => onBloodGroupChange(val)}>
                <SelectTrigger data-travel="blood" className="h-9 text-xs rounded-xl bg-muted ">
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

            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">Phone Number</Label>
              <div
                data-travel="phone"
                className="flex rounded-xl overflow-hidden border  bg-muted focus-within:ring-1 focus-within:ring-emerald-500"
              >
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

            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="student@school.com"
                className="h-9 text-xs rounded-xl bg-muted "
              />
            </div>

            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">Student Photo</Label>
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
      }
    />
  );
}
