"use client";

import { Users } from "lucide-react";
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
import type { StudentInfo } from "./types";

interface StudentParentContactCardProps {
  editing: boolean;
  collapsed: boolean;
  saving: boolean;
  canEdit?: boolean;
  dimmed?: boolean;
  currentStudent: StudentInfo;
  parentName: string;
  parentRelationship: string;
  parentPhone: string;
  parentEmail: string;
  email: string;
  address: string;
  onParentNameChange: (value: string) => void;
  onParentPhoneChange: (value: string) => void;
  onParentEmailChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onEditSection: (section: string) => void;
  onToggleCollapse: (section: string) => void;
  onCancel: () => void;
  onSave: (sectionName?: string) => void;
}

export function StudentParentContactCard({
  editing,
  collapsed,
  saving,
  canEdit,
  dimmed,
  currentStudent,
  parentName,
  parentRelationship,
  parentPhone,
  parentEmail,
  email,
  address,
  onParentNameChange,
  onParentPhoneChange,
  onParentEmailChange,
  onEmailChange,
  onAddressChange,
  onEditSection,
  onToggleCollapse,
  onCancel,
  onSave,
}: StudentParentContactCardProps) {
  return (
    <ProfileSection
      icon={Users}
      title="Parent & Contact Details"
      editing={editing}
      collapsed={collapsed}
      saving={saving}
      canEdit={canEdit}
      dimmed={dimmed}
      onEdit={() => onEditSection("parent")}
      onCancel={onCancel}
      onSave={() => onSave("Parent & Contact Details")}
      onToggleCollapse={() => onToggleCollapse("parent")}
      view={
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-4 text-xs sm:text-sm">
          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Parent Name</p>
            <p data-travel="parentName" className="font-semibold text-foreground mt-0.5">
              {parentName || currentStudent.parentName || "–"}
            </p>
          </div>

          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Parent Phone</p>
            <p data-travel="parentPhone" className="font-semibold text-foreground mt-0.5">
              {parentPhone || currentStudent.parentPhone || "—"}
            </p>
          </div>

          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Relationship</p>
            <p className="font-semibold text-foreground mt-0.5">{parentRelationship || "Parent"}</p>
          </div>

          <div className="col-span-2 sm:col-span-1 min-w-0">
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Parent Email</p>
            <p data-travel="parentEmail" className="font-semibold text-foreground break-all mt-0.5">
              {parentEmail || currentStudent.parentEmail || "—"}
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1 min-w-0">
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Student Email</p>
            <p data-travel="studentEmail" className="font-semibold text-foreground break-all mt-0.5">
              {email || currentStudent.email || "—"}
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Address</p>
            <p data-travel="address" className="font-semibold text-foreground mt-0.5">{address || "Not Added"}</p>
          </div>
        </div>
      }
      form={
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Parent / Guardian */}
            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">
                Parent / Guardian <span className="text-red-500">*</span>
              </Label>
              <Input
                data-travel="parentName"
                value={parentName}
                onChange={(e) => onParentNameChange(e.target.value)}
                placeholder="Parent Name"
                className="h-9 text-xs rounded-xl bg-muted "
              />
            </div>

            {/* Relationship (Fixed to Parent on server) */}
            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">
                Relationship <span className="text-[10px] text-muted-foreground font-normal">(Parent)</span>
              </Label>
              <Select
                value="Parent"
                disabled
              >
                <SelectTrigger className="h-9 text-xs rounded-xl bg-muted  text-muted-foreground cursor-not-allowed">
                  <SelectValue placeholder="Parent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Parent">Parent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Phone Number with +91 */}
            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">Parent Phone</Label>
              <div
                data-travel="parentPhone"
                className="flex rounded-xl overflow-hidden border  bg-muted focus-within:ring-1 focus-within:ring-emerald-500"
              >
                <span className="inline-flex items-center px-2.5 text-xs text-muted-foreground bg-muted border-r  font-medium">
                  +91
                </span>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => onParentPhoneChange(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full h-9 px-3 text-xs bg-transparent focus:outline-none text-foreground"
                />
              </div>
            </div>

            {/* Parent Email */}
            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">Parent Email</Label>
              <Input
                data-travel="parentEmail"
                type="email"
                value={parentEmail}
                onChange={(e) => onParentEmailChange(e.target.value)}
                placeholder="parent@email.com"
                className="h-9 text-xs rounded-xl bg-muted "
              />
            </div>

            {/* Student Email */}
            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">Student Email</Label>
              <Input
                data-travel="studentEmail"
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="student@school.com"
                className="h-9 text-xs rounded-xl bg-muted "
              />
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">Address</Label>
              <Input
                data-travel="address"
                value={address}
                onChange={(e) => onAddressChange(e.target.value)}
                placeholder="Enter address"
                className="h-9 text-xs rounded-xl bg-muted "
              />
            </div>
          </div>
        </div>
      }
    />
  );
}
