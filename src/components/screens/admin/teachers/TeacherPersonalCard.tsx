"use client";

import {
  User,
  Upload,
  Calendar,
  Droplets,
  Users,
  Globe,
  Star,
  Mail,
  Phone,
  CreditCard,
  ShieldCheck,
  XCircle,
  Building2,
} from "lucide-react";
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
        <div className="space-y-6 text-xs sm:text-sm">
          {/* Section: Basic Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                <User className="size-3.5" />
              </div>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Basic Information
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-4 rounded-xl border border-border/80 bg-muted/20">
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
                  <User className="size-4" />
                </div>
                <div>
                  <p data-fade className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Full Name</p>
                  <p data-travel="name" className="font-semibold text-foreground mt-0.5">{currentTeacher.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
                  <Calendar className="size-4" />
                </div>
                <div>
                  <p data-fade className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Date of Birth</p>
                  <p className="font-semibold text-foreground mt-0.5">{(currentTeacher as any).dateOfBirth || "7 March 1988"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
                  <User className="size-4" />
                </div>
                <div>
                  <p data-fade className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Gender</p>
                  <p className="font-semibold text-foreground mt-0.5 capitalize">{(currentTeacher as any).gender || "Male"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
                  <Droplets className="size-4" />
                </div>
                <div>
                  <p data-fade className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Blood Group</p>
                  <p className="font-semibold text-foreground mt-0.5">{(currentTeacher as any).bloodGroup || "—"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
                  <Users className="size-4" />
                </div>
                <div>
                  <p data-fade className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Marital Status</p>
                  <p className="font-semibold text-foreground mt-0.5">{(currentTeacher as any).maritalStatus || "—"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
                  <Globe className="size-4" />
                </div>
                <div>
                  <p data-fade className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Nationality</p>
                  <p className="font-semibold text-foreground mt-0.5">{(currentTeacher as any).nationality || "Indian"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
                  <Star className="size-4" />
                </div>
                <div>
                  <p data-fade className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Religion</p>
                  <p className="font-semibold text-foreground mt-0.5">{(currentTeacher as any).religion || "—"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Contact Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                <Phone className="size-3.5" />
              </div>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Contact Information
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-xl border border-border/80 bg-muted/20">
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200/50 dark:border-teal-800/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p data-fade className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Email</p>
                  <a
                    href={`mailto:${currentTeacher.email}`}
                    data-travel="email"
                    className="font-semibold text-teal-600 dark:text-teal-400 hover:underline mt-0.5 block truncate"
                  >
                    {currentTeacher.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200/50 dark:border-teal-800/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p data-fade className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Mobile</p>
                  <a
                    href={`tel:${currentTeacher.phone}`}
                    data-travel="phone"
                    className="font-semibold text-teal-600 dark:text-teal-400 hover:underline mt-0.5 block truncate"
                  >
                    {currentTeacher.phone || "+916207142699"}
                  </a>
                </div>
              </div>

              <div className="md:col-span-2">
                <p data-fade className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Address</p>
                <p data-travel="address" className="font-semibold text-foreground mt-0.5">{displayAddress}</p>
              </div>
            </div>
          </div>

          {/* Section: Statutory Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                <Building2 className="size-3.5" />
              </div>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Statutory Information
              </h4>
            </div>

            <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                  <XCircle className="size-3.5 text-muted-foreground" />
                  PF Disabled
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                  <XCircle className="size-3.5 text-muted-foreground" />
                  ESI Disabled
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                  <XCircle className="size-3.5 text-muted-foreground" />
                  PT Disabled
                </span>
              </div>

              <div className="border-t border-border/60" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
                    <CreditCard className="size-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">PAN NUMBER</p>
                    <p className="font-semibold text-foreground mt-0.5">{(currentTeacher as any).panNumber || "—"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">AADHAAR NUMBER</p>
                    <p className="font-semibold text-foreground mt-0.5">{(currentTeacher as any).aadhaarNumber || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}
