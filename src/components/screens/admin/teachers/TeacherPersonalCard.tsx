"use client";

import { User, Upload } from "lucide-react";
import { ProfileSection } from "@/components/ui/profile-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { TeacherInfo } from "./types";

interface PersonalCardProps {
  currentTeacher: TeacherInfo;
  formData: any;
  setFormData: (data: any) => void;
  displayTeacherId: string;
  displayAddress: string;
  canEdit?: boolean;
  isEditing: boolean;
  isSaving: boolean;
  isCollapsed: boolean;
  dimmed?: boolean;
  onToggleCollapse: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  getInitials: (name: string) => string;
}

export function TeacherPersonalCard({
  currentTeacher,
  formData,
  setFormData,
  displayTeacherId,
  displayAddress,
  canEdit,
  isEditing,
  isSaving,
  isCollapsed,
  dimmed,
  onToggleCollapse,
  onStartEdit,
  onCancelEdit,
  onSave,
  getInitials,
}: PersonalCardProps) {
  return (
    <ProfileSection
      icon={User}
      title="Personal & Contact Information"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                data-travel="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Teacher Name"
                className="h-9 text-xs rounded-xl bg-muted "
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                data-travel="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="teacher@school.com"
                className="h-9 text-xs rounded-xl bg-muted "
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">
                Phone Number
              </Label>
              <div data-travel="phone" className="flex rounded-xl overflow-hidden border  bg-muted focus-within:ring-1 focus-within:ring-emerald-500">
                <span className="inline-flex items-center px-2.5 text-xs text-muted-foreground bg-muted border-r  font-medium">
                  +91
                </span>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="w-full h-9 px-3 text-xs bg-transparent focus:outline-none text-foreground"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label data-fade className="text-xs font-semibold text-foreground">
                Address
              </Label>
              <Input
                data-travel="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="City, State / Full Address"
                className="h-9 text-xs rounded-xl bg-muted "
              />
            </div>

            {/* Photo Upload */}
            <div className="space-y-1.5">
              <Label data-fade className="text-xs font-semibold text-foreground">Teacher Photo</Label>
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                  {getInitials(formData.name)}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 text-xs rounded-xl  font-medium gap-1.5 hover:bg-muted"
                  onClick={() => toast.info("Photo upload will be saved with profile")}
                >
                  <Upload className="size-3.5" />
                  Upload Photo
                </Button>
              </div>
            </div>
          </div>
        </div>
      }
      view={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 text-xs sm:text-sm">
          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Full Name</p>
            <p data-travel="name" className="font-semibold text-foreground mt-0.5">{currentTeacher.name}</p>
          </div>

          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Email Address</p>
            <p data-travel="email" className="font-semibold text-foreground mt-0.5 truncate">{currentTeacher.email}</p>
          </div>

          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Phone Number</p>
            <p data-travel="phone" className="font-semibold text-foreground mt-0.5">{currentTeacher.phone || "—"}</p>
          </div>

          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Teacher ID</p>
            <p data-travel="teacherId" className="font-semibold text-foreground mt-0.5">{displayTeacherId}</p>
          </div>

          <div className="sm:col-span-2">
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Address</p>
            <p data-travel="address" className="font-semibold text-foreground mt-0.5">{displayAddress}</p>
          </div>
        </div>
      }
    />
  );
}
