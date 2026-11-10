"use client";

import {
  Users,
  Pencil,
  ChevronUp,
  ChevronDown,
  Check,
  Loader2,
} from "lucide-react";
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
import type { StudentInfo } from "./types";

interface StudentParentContactCardProps {
  editing: boolean;
  collapsed: boolean;
  saving: boolean;
  canEdit?: boolean;
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
    <div className="rounded-2xl border  bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all">
      {/* ────────────────────────────────────────────────────────── */}
      {/* CARD 3: Parent & Contact Details                           */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b ">
        <div className="flex items-center gap-2 text-foreground font-semibold text-sm sm:text-base">
          <Users className="size-4 text-emerald-600" />
          Parent & Contact Details
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
                onClick={() => onSave("Parent & Contact Details")}
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
                onClick={() => onEditSection("parent")}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border  text-xs font-medium text-foreground hover:bg-accent transition-colors"
              >
                <Pencil className="size-3" />
                Edit
              </button>
            )
          )}
          <button
            onClick={() => onToggleCollapse("parent")}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Parent / Guardian */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Parent / Guardian <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={parentName}
                  onChange={(e) => onParentNameChange(e.target.value)}
                  placeholder="Parent Name"
                  className="h-9 text-xs rounded-xl bg-muted "
                />
              </div>

              {/* Relationship (Fixed to Parent on server) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
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
                <Label className="text-xs font-semibold text-foreground">Parent Phone</Label>
                <div className="flex rounded-xl overflow-hidden border  bg-muted focus-within:ring-1 focus-within:ring-emerald-500">
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
                <Label className="text-xs font-semibold text-foreground">Parent Email</Label>
                <Input
                  type="email"
                  value={parentEmail}
                  onChange={(e) => onParentEmailChange(e.target.value)}
                  placeholder="parent@email.com"
                  className="h-9 text-xs rounded-xl bg-muted "
                />
              </div>

              {/* Student Email */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Student Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  placeholder="student@school.com"
                  className="h-9 text-xs rounded-xl bg-muted "
                />
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Address</Label>
                <Input
                  value={address}
                  onChange={(e) => onAddressChange(e.target.value)}
                  placeholder="Enter address"
                  className="h-9 text-xs rounded-xl bg-muted "
                />
              </div>
            </div>
          </div>
        ) : (
          /* VIEW MODE */
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-4 text-xs sm:text-sm">
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Parent Name</p>
              <p className="font-semibold text-foreground mt-0.5">
                {parentName || currentStudent.parentName || "–"}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Parent Phone</p>
              <p className="font-semibold text-foreground mt-0.5">
                {parentPhone || currentStudent.parentPhone || "—"}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Relationship</p>
              <p className="font-semibold text-foreground mt-0.5">{parentRelationship || "Parent"}</p>
            </div>

            <div className="col-span-2 sm:col-span-1 min-w-0">
              <p className="text-[11px] text-muted-foreground font-medium">Parent Email</p>
              <p className="font-semibold text-foreground break-all mt-0.5">
                {parentEmail || currentStudent.parentEmail || "—"}
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 min-w-0">
              <p className="text-[11px] text-muted-foreground font-medium">Student Email</p>
              <p className="font-semibold text-foreground break-all mt-0.5">
                {email || currentStudent.email || "—"}
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <p className="text-[11px] text-muted-foreground font-medium">Address</p>
              <p className="font-semibold text-foreground mt-0.5">{address || "Not Added"}</p>
            </div>
          </div>
        )
      )}
    </div>
  );
}
