"use client";

import { ShieldCheck } from "lucide-react";
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

interface StudentStatutoryCardProps {
  editing: boolean;
  collapsed: boolean;
  saving: boolean;
  canEdit?: boolean;
  dimmed?: boolean;
  currentStudent: StudentInfo;
  nationality: string;
  religion: string;
  maritalStatus: string;
  category: string;
  alternatePhone: string;
  aadhaarNumber: string;
  onNationalityChange: (value: string) => void;
  onReligionChange: (value: string) => void;
  onMaritalStatusChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onAlternatePhoneChange: (value: string) => void;
  onAadhaarChange: (value: string) => void;
  onEditSection: (section: string) => void;
  onToggleCollapse: (section: string) => void;
  onCancel: () => void;
  onSave: (sectionName?: string) => void;
}

const dash = (v: string) => (v && v.trim() ? v : "—");

export function StudentStatutoryCard({
  editing,
  collapsed,
  saving,
  canEdit,
  dimmed,
  nationality,
  religion,
  maritalStatus,
  category,
  alternatePhone,
  aadhaarNumber,
  onNationalityChange,
  onReligionChange,
  onMaritalStatusChange,
  onCategoryChange,
  onAlternatePhoneChange,
  onAadhaarChange,
  onEditSection,
  onToggleCollapse,
  onCancel,
  onSave,
}: StudentStatutoryCardProps) {
  return (
    <ProfileSection
      icon={ShieldCheck}
      title="Background & Statutory Details"
      editing={editing}
      collapsed={collapsed}
      saving={saving}
      canEdit={canEdit}
      dimmed={dimmed}
      onEdit={() => onEditSection("statutory")}
      onCancel={onCancel}
      onSave={() => onSave("Background & Statutory Details")}
      onToggleCollapse={() => onToggleCollapse("statutory")}
      view={
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-4 text-xs sm:text-sm">
          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Nationality</p>
            <p data-travel="nationality" className="font-semibold text-foreground mt-0.5">{dash(nationality)}</p>
          </div>
          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Religion</p>
            <p data-travel="religion" className="font-semibold text-foreground mt-0.5">{dash(religion)}</p>
          </div>
          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Marital Status</p>
            <p data-travel="marital" className="font-semibold text-foreground capitalize mt-0.5">{dash(maritalStatus)}</p>
          </div>
          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Category</p>
            <p data-travel="category" className="font-semibold text-foreground capitalize mt-0.5">{dash(category)}</p>
          </div>
          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Aadhaar Number</p>
            <p data-travel="aadhaar" className="font-semibold text-foreground font-mono mt-0.5">{dash(aadhaarNumber)}</p>
          </div>
          <div>
            <p data-fade className="text-[11px] text-muted-foreground font-medium">Alternate Phone</p>
            <p data-travel="altphone" className="font-semibold text-foreground mt-0.5">{dash(alternatePhone)}</p>
          </div>
        </div>
      }
      form={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label data-fade className="text-xs font-semibold text-foreground">Nationality</Label>
            <Input
              data-travel="nationality"
              value={nationality}
              onChange={(e) => onNationalityChange(e.target.value)}
              placeholder="e.g. Indian"
              className="h-9 text-xs rounded-xl bg-muted"
            />
          </div>
          <div className="space-y-1.5">
            <Label data-fade className="text-xs font-semibold text-foreground">Religion</Label>
            <Select value={religion || undefined} onValueChange={onReligionChange}>
              <SelectTrigger data-travel="religion" className="h-9 text-xs rounded-xl bg-muted">
                <SelectValue placeholder="Select religion" />
              </SelectTrigger>
              <SelectContent>
                {["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Parsi", "Jewish", "Other"].map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label data-fade className="text-xs font-semibold text-foreground">Marital Status</Label>
            <Select value={maritalStatus || undefined} onValueChange={onMaritalStatusChange}>
              <SelectTrigger data-travel="marital" className="h-9 text-xs rounded-xl bg-muted">
                <SelectValue placeholder="Not Added" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label data-fade className="text-xs font-semibold text-foreground">Category</Label>
            <Select value={category || undefined} onValueChange={onCategoryChange}>
              <SelectTrigger data-travel="category" className="h-9 text-xs rounded-xl bg-muted">
                <SelectValue placeholder="Not Added" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="obc">OBC</SelectItem>
                <SelectItem value="sc">SC</SelectItem>
                <SelectItem value="st">ST</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label data-fade className="text-xs font-semibold text-foreground">Aadhaar Number</Label>
            <Input
              data-travel="aadhaar"
              value={aadhaarNumber}
              onChange={(e) => onAadhaarChange(e.target.value.replace(/[^0-9]/g, "").slice(0, 12))}
              inputMode="numeric"
              placeholder="12-digit number"
              className="h-9 text-xs rounded-xl bg-muted font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label data-fade className="text-xs font-semibold text-foreground">Alternate Phone</Label>
            <Input
              data-travel="altphone"
              value={alternatePhone}
              onChange={(e) => onAlternatePhoneChange(e.target.value)}
              placeholder="+91 …"
              className="h-9 text-xs rounded-xl bg-muted"
            />
          </div>
        </div>
      }
    />
  );
}
