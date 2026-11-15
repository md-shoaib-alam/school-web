"use client";

import { useRef } from "react";
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
  CheckCircle2,
} from "lucide-react";
import { ProfileSection } from "@/components/ui/profile-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import type { TeacherInfo } from "./types";

interface CardProps {
  currentTeacher: TeacherInfo;
  formData: any;
  setFormData: (data: any) => void;
  canEdit?: boolean;
  isEditing: boolean;
  isSaving: boolean;
  isCollapsed: boolean;
  dimmed?: boolean;
  onToggleCollapse: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  getInitials?: (name: string) => string;
}

function fmtDate(value?: string | null) {
  if (!value || isNaN(new Date(value).getTime())) return "—";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/* ── Card 1: Personal Information ── */
export function TeacherPersonalInfoCard({
  currentTeacher,
  formData,
  setFormData,
  canEdit,
  isEditing,
  isSaving,
  isCollapsed,
  dimmed,
  onToggleCollapse,
  onStartEdit,
  onCancelEdit,
  onSave,
}: CardProps) {
  return (
    <ProfileSection
      icon={User}
      title="Personal Information"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          <div className="space-y-1.5">
            <Label data-fade className="text-xs font-semibold text-foreground">Full Name <span className="text-red-500">*</span></Label>
            <Input
              data-travel="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Teacher Name"
              className="h-9 text-xs rounded-xl bg-muted"
            />
          </div>

          <div className="space-y-1.5">
            <Label data-fade className="text-xs font-semibold text-foreground">Date of Birth</Label>
            <div data-travel="dateOfBirth">
              <DatePicker
                date={formData.dateOfBirth && !isNaN(new Date(formData.dateOfBirth).getTime()) ? new Date(formData.dateOfBirth) : undefined}
                onChange={(d) => setFormData({ ...formData, dateOfBirth: d ? d.toISOString().split("T")[0] : "" })}
                placeholder="Pick date of birth"
                className="w-full h-9 text-xs rounded-xl bg-muted"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label data-fade className="text-xs font-semibold text-foreground">Gender</Label>
            <div data-travel="gender">
              <Select value={formData.gender || undefined} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                <SelectTrigger className="h-9 text-xs rounded-xl bg-muted">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label data-fade className="text-xs font-semibold text-foreground">Blood Group</Label>
            <div data-travel="bloodGroup">
              <Select value={formData.bloodGroup || undefined} onValueChange={(v) => setFormData({ ...formData, bloodGroup: v })}>
                <SelectTrigger className="h-9 text-xs rounded-xl bg-muted">
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label data-fade className="text-xs font-semibold text-foreground">Marital Status</Label>
            <div data-travel="maritalStatus">
              <Select value={formData.maritalStatus || undefined} onValueChange={(v) => setFormData({ ...formData, maritalStatus: v })}>
                <SelectTrigger className="h-9 text-xs rounded-xl bg-muted">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                  <SelectItem value="widowed">Widowed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label data-fade className="text-xs font-semibold text-foreground">Nationality</Label>
            <Input
              data-travel="nationality"
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              placeholder="e.g. Indian"
              className="h-9 text-xs rounded-xl bg-muted"
            />
          </div>

          <div className="space-y-1.5">
            <Label data-fade className="text-xs font-semibold text-foreground">Religion</Label>
            <div data-travel="religion">
              <Select value={formData.religion || undefined} onValueChange={(v) => setFormData({ ...formData, religion: v })}>
                <SelectTrigger className="h-9 text-xs rounded-xl bg-muted">
                  <SelectValue placeholder="Select religion" />
                </SelectTrigger>
                <SelectContent>
                  {["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Parsi", "Jewish", "Other"].map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      }
      view={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs sm:text-sm">
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
              <p data-travel="dateOfBirth" className="font-semibold text-foreground mt-0.5">{fmtDate(currentTeacher.dateOfBirth)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
              <User className="size-4" />
            </div>
            <div>
              <p data-fade className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Gender</p>
              <p data-travel="gender" className="font-semibold text-foreground mt-0.5 capitalize">{currentTeacher.gender || "—"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
              <Droplets className="size-4" />
            </div>
            <div>
              <p data-fade className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Blood Group</p>
              <p data-travel="bloodGroup" className="font-semibold text-foreground mt-0.5">{currentTeacher.bloodGroup || "—"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
              <Users className="size-4" />
            </div>
            <div>
              <p data-fade className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Marital Status</p>
              <p data-travel="maritalStatus" className="font-semibold text-foreground mt-0.5 capitalize">{currentTeacher.maritalStatus || "—"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
              <Globe className="size-4" />
            </div>
            <div>
              <p data-fade className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Nationality</p>
              <p data-travel="nationality" className="font-semibold text-foreground mt-0.5">{currentTeacher.nationality || "—"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
              <Star className="size-4" />
            </div>
            <div>
              <p data-fade className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Religion</p>
              <p data-travel="religion" className="font-semibold text-foreground mt-0.5">{currentTeacher.religion || "—"}</p>
            </div>
          </div>
        </div>
      }
    />
  );
}

/* ── Card 2: Contact Information ── */
export function TeacherContactInfoCard({
  currentTeacher,
  formData,
  setFormData,
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
}: CardProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Photo must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, avatar: reader.result });
      toast.success("Photo attached — save to apply");
    };
    reader.readAsDataURL(file);
  };

  return (
    <ProfileSection
      icon={Phone}
      title="Contact Information"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          <div className="space-y-1.5">
            <Label data-fade className="text-xs font-semibold text-foreground">Email Address <span className="text-red-500">*</span></Label>
            <Input
              data-travel="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="teacher@school.com"
              className="h-9 text-xs rounded-xl bg-muted"
            />
          </div>

          <div className="space-y-1.5">
            <Label data-fade className="text-xs font-semibold text-foreground">Phone Number</Label>
            <Input
              data-travel="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter phone number"
              className="h-9 text-xs rounded-xl bg-muted"
            />
          </div>

          <div className="space-y-1.5">
            <Label data-fade className="text-xs font-semibold text-foreground">Alternate Phone</Label>
            <Input
              data-fade
              type="tel"
              value={formData.alternatePhone}
              onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
              placeholder="Optional alternate number"
              className="h-9 text-xs rounded-xl bg-muted"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label data-fade className="text-xs font-semibold text-foreground">Address</Label>
            <Input
              data-travel="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="City, State / Full Address"
              className="h-9 text-xs rounded-xl bg-muted"
            />
          </div>

          <div className="space-y-1.5" data-fade>
            <Label className="text-xs font-semibold text-foreground">Teacher Photo</Label>
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="" className="size-full object-cover" />
                ) : (
                  getInitials ? getInitials(formData.name) : ""
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-3 text-xs rounded-xl font-medium gap-1.5 hover:bg-muted"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="size-3.5" />
                Upload Photo
              </Button>
            </div>
          </div>
        </div>
      }
      view={
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm">
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200/50 dark:border-teal-800/40 flex items-center justify-center shrink-0 mt-0.5">
              <Mail className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p data-fade className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Email</p>
              <a
                href={"mailto:" + currentTeacher.email}
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
                href={"tel:" + (currentTeacher.phone || "")}
                data-travel="phone"
                className="font-semibold text-teal-600 dark:text-teal-400 hover:underline mt-0.5 block truncate"
              >
                {currentTeacher.phone || "—"}
              </a>
            </div>
          </div>

          <div className="md:col-span-2">
            <p data-fade className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Address</p>
            <p data-travel="address" className="font-semibold text-foreground mt-0.5">{currentTeacher.address || "—"}</p>
          </div>
        </div>
      }
    />
  );
}

/* ── Card 3: Statutory Information ── */
export function TeacherStatutoryInfoCard({
  currentTeacher,
  formData,
  setFormData,
  canEdit,
  isEditing,
  isSaving,
  isCollapsed,
  dimmed,
  onToggleCollapse,
  onStartEdit,
  onCancelEdit,
  onSave,
}: CardProps) {
  return (
    <ProfileSection
      icon={ShieldCheck}
      title="Statutory Information"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          <div className="space-y-1.5">
            <Label data-fade className="text-xs font-semibold text-foreground">PAN Number</Label>
            <Input
              data-travel="panNumber"
              value={formData.panNumber}
              onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
              placeholder="ABCDE1234F"
              maxLength={10}
              className="h-9 text-xs rounded-xl bg-muted font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label data-fade className="text-xs font-semibold text-foreground">Aadhaar Number</Label>
            <Input
              data-travel="aadhaarNumber"
              value={formData.aadhaarNumber}
              onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value.replace(/[^0-9]/g, "").slice(0, 12) })}
              placeholder="12-digit number"
              inputMode="numeric"
              className="h-9 text-xs rounded-xl bg-muted font-mono"
            />
          </div>

          <div className="space-y-1.5" data-fade>
            <Label className="text-xs font-semibold text-foreground">Statutory Registrations</Label>
            <div className="flex items-center gap-4 h-9">
              {([
                ["pfEnabled", "PF"],
                ["esiEnabled", "ESI"],
                ["ptEnabled", "PT"],
              ] as const).map(([key, label]) => (
                <label key={key} className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                    className="size-3.5 rounded accent-emerald-600 cursor-pointer"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>
      }
      view={
        <div className="space-y-4 text-xs sm:text-sm">
          <div data-fade className="flex flex-wrap items-center gap-2.5">
            {([
              ["PF", currentTeacher.pfEnabled],
              ["ESI", currentTeacher.esiEnabled],
              ["PT", currentTeacher.ptEnabled],
            ] as const).map(([label, enabled]) => (
              <span
                key={label}
                className={
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border " +
                  (enabled
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-800/60"
                    : "bg-muted text-muted-foreground border-border")
                }
              >
                {enabled ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
                {label} {enabled ? "Enabled" : "Disabled"}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex items-start gap-3">
              <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
                <CreditCard className="size-4" />
              </div>
              <div>
                <p data-fade className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">PAN NUMBER</p>
                <p data-travel="panNumber" className="font-semibold text-foreground mt-0.5 font-mono">{currentTeacher.panNumber || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
                <ShieldCheck className="size-4" />
              </div>
              <div>
                <p data-fade className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">AADHAAR NUMBER</p>
                <p data-travel="aadhaarNumber" className="font-semibold text-foreground mt-0.5 font-mono">{currentTeacher.aadhaarNumber || "—"}</p>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}