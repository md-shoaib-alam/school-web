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
    <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all">
      {/* ────────────────────────────────────────────────────────── */}
      {/* CARD 3: Parent & Contact Details                           */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100 dark:border-zinc-800/60">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm sm:text-base">
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
                className="h-8 px-3 text-xs rounded-lg font-medium text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800"
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
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <Pencil className="size-3" />
                Edit
              </button>
            )
          )}
          <button
            onClick={() => onToggleCollapse("parent")}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Parent / Guardian */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Parent / Guardian <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={parentName}
                  onChange={(e) => onParentNameChange(e.target.value)}
                  placeholder="Parent Name"
                  className="h-9 text-xs rounded-xl bg-slate-50/50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700"
                />
              </div>

              {/* Relationship (Fixed to Parent on server) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Relationship <span className="text-[10px] text-slate-400 font-normal">(Parent)</span>
                </Label>
                <Select
                  value="Parent"
                  disabled
                >
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-slate-100/70 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 cursor-not-allowed">
                    <SelectValue placeholder="Parent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Parent">Parent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Phone Number with +91 */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Parent Phone</Label>
                <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/50 focus-within:ring-1 focus-within:ring-emerald-500">
                  <span className="inline-flex items-center px-2.5 text-xs text-slate-500 bg-slate-100 dark:bg-zinc-800 border-r border-slate-200 dark:border-zinc-700 font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={parentPhone}
                    onChange={(e) => onParentPhoneChange(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full h-9 px-3 text-xs bg-transparent focus:outline-none text-slate-800 dark:text-zinc-200"
                  />
                </div>
              </div>

              {/* Parent Email */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Parent Email</Label>
                <Input
                  type="email"
                  value={parentEmail}
                  onChange={(e) => onParentEmailChange(e.target.value)}
                  placeholder="parent@email.com"
                  className="h-9 text-xs rounded-xl bg-slate-50/50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700"
                />
              </div>

              {/* Student Email */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Student Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  placeholder="student@school.com"
                  className="h-9 text-xs rounded-xl bg-slate-50/50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700"
                />
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Address</Label>
                <Input
                  value={address}
                  onChange={(e) => onAddressChange(e.target.value)}
                  placeholder="Enter address"
                  className="h-9 text-xs rounded-xl bg-slate-50/50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700"
                />
              </div>
            </div>
          </div>
        ) : (
          /* VIEW MODE */
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-4 text-xs sm:text-sm">
            <div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">Parent Name</p>
              <p className="font-semibold text-slate-800 dark:text-zinc-100 mt-0.5">
                {parentName || currentStudent.parentName || "–"}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">Parent Phone</p>
              <p className="font-semibold text-slate-800 dark:text-zinc-100 mt-0.5">
                {parentPhone || currentStudent.parentPhone || "—"}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">Relationship</p>
              <p className="font-semibold text-slate-800 dark:text-zinc-100 mt-0.5">{parentRelationship || "Parent"}</p>
            </div>

            <div className="col-span-2 sm:col-span-1 min-w-0">
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">Parent Email</p>
              <p className="font-semibold text-slate-800 dark:text-zinc-100 break-all mt-0.5">
                {parentEmail || currentStudent.parentEmail || "—"}
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 min-w-0">
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">Student Email</p>
              <p className="font-semibold text-slate-800 dark:text-zinc-100 break-all mt-0.5">
                {email || currentStudent.email || "—"}
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">Address</p>
              <p className="font-semibold text-slate-800 dark:text-zinc-100 mt-0.5">{address || "Not Added"}</p>
            </div>
          </div>
        )
      )}
    </div>
  );
}
