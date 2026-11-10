"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Loader2,
  X,
  User,
  Phone,
  Mail,
  RotateCcw,
  Pencil,
  MapPin,
  Camera,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import type { ParentInfo } from "./types";

interface EditParentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingParent: ParentInfo | null;
  editForm: any;
  setEditForm: (form: any) => void;
  onSave: () => void;
  editing: boolean;
}

export function EditParentDialog({
  open,
  onOpenChange,
  editingParent,
  editForm,
  setEditForm,
  onSave,
  editing,
}: EditParentDialogProps) {
  // Track initial snapshot for reset functionality
  const [initialSnapshot, setInitialSnapshot] = useState<any>(editForm);

  useEffect(() => {
    if (open) {
      setInitialSnapshot({ ...editForm });
    }
  }, [open, editingParent]);

  const handleReset = () => {
    setEditForm({ ...initialSnapshot });
    toast.info("Form reset to initial values");
  };

  const isFormValid = Boolean(editForm.name?.trim() && editForm.phone?.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full sm:w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-0 overflow-hidden border  bg-card shadow-2xl rounded-2xl max-h-[92vh] flex flex-col focus:outline-none"
        data-lenis-prevent
        showCloseButton={false}
      >
        {/* Top Header Section with mint gradient aura and parentaddtop.avif illustration */}
        <div className="relative px-6 sm:px-8 pt-6 pb-5 border-b  bg-gradient-to-r from-emerald-50/50 via-white to-emerald-50/20 dark:from-emerald-950/20 dark:via-zinc-900 dark:to-zinc-900 shrink-0 overflow-hidden">
          {/* Close button at top right */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-5 right-5 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent dark:hover:text-muted-foreground transition-colors z-20"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>

          <div className="flex items-center justify-between gap-6 pr-8">
            <div className="space-y-1 z-10 max-w-lg">
              <p className="text-[11px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
                EDIT PARENT
              </p>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                Edit Parent Profile
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Update the parent account information and contact details below.
              </DialogDescription>
            </div>

            {/* Top Right Decorative Illustration Image */}
            <div className="hidden sm:block relative w-36 h-24 shrink-0 -mr-2 select-none pointer-events-none">
              <Image
                src="/assets/admin/parentaddtop.avif"
                alt="Parent card graphic"
                fill
                className="object-contain drop-shadow-sm opacity-95"
                priority
              />
            </div>
          </div>
        </div>

        {/* Scrollable Form Body with Section Cards */}
        <div
          className="flex-1 overflow-y-auto px-5 sm:px-8 py-5 space-y-5 overscroll-contain touch-pan-y"
          data-lenis-prevent
        >
          {/* ────────────────────────────────────────────────────────── */}
          {/* SECTION 0: Profile Photo                                   */}
          {/* ────────────────────────────────────────────────────────── */}
          <div className="rounded-2xl border  bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm sm:text-base">
              <Camera className="size-4 text-emerald-600" />
              <div>
                <span>Profile Photo</span>
                <p className="text-[11px] font-normal text-muted-foreground">
                  Parent account avatar (Optional)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <div className="size-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xl flex items-center justify-center shrink-0">
                {editForm.name ? editForm.name.slice(0, 2).toUpperCase() : <User className="size-7 text-emerald-600/70" />}
              </div>
              <div className="space-y-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 text-xs font-semibold rounded-xl  text-foreground hover:bg-muted gap-2"
                  onClick={() => toast.info("Photo upload will be saved with profile")}
                >
                  <Upload className="size-3.5 text-emerald-600" />
                  Upload Photo
                </Button>
                <p className="text-[10px] text-muted-foreground">JPG, PNG up to 5MB</p>
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────── */}
          {/* SECTION 1: Personal Information                           */}
          {/* ────────────────────────────────────────────────────────── */}
          <div className="rounded-2xl border  bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b  text-foreground font-semibold text-sm sm:text-base">
              <User className="size-4 text-emerald-600" />
              Personal Information
            </div>

            {/* Row 1: Full Name, Gender, Relationship */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="edit_p_name" className="text-xs font-semibold text-foreground">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="edit_p_name"
                    value={editForm.name || ""}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Enter full name"
                    className="pl-9 h-9 text-xs rounded-xl bg-muted  focus-visible:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Gender
                </Label>
                <Select
                  value={editForm.gender || "male"}
                  onValueChange={(val) => setEditForm({ ...editForm, gender: val })}
                >
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-muted ">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Relationship with Student(s) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Relationship with Student(s) <span className="text-[10px] text-muted-foreground font-normal">(Parent)</span>
                </Label>
                <Select value="Parent" disabled>
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-muted  text-muted-foreground cursor-not-allowed">
                    <SelectValue placeholder="Parent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Parent">Parent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Date of Birth & Occupation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date of Birth */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Date of Birth <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <DatePicker
                  date={editForm.dateOfBirth && !isNaN(new Date(editForm.dateOfBirth).getTime()) ? new Date(editForm.dateOfBirth) : undefined}
                  onChange={(d) => {
                    const formatted = d ? d.toISOString().split("T")[0] : "";
                    setEditForm({ ...editForm, dateOfBirth: formatted });
                  }}
                  placeholder="Pick date of birth"
                  className="w-full h-9 text-xs rounded-xl bg-muted "
                />
              </div>

              {/* Occupation */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Occupation <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <Input
                  value={editForm.occupation || ""}
                  onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })}
                  placeholder="e.g. Engineer, Business"
                  className="h-9 text-xs rounded-xl bg-muted  focus-visible:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────── */}
          {/* SECTION 2: Contact Information                            */}
          {/* ────────────────────────────────────────────────────────── */}
          <div className="rounded-2xl border  bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b  text-foreground font-semibold text-sm sm:text-base">
              <Phone className="size-4 text-emerald-600" />
              Contact Information
            </div>

            {/* Row 1: Email Address, Phone Number, Alternate Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <Label htmlFor="edit_p_email" className="text-xs font-semibold text-foreground">
                  Email Address <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="edit_p_email"
                    type="email"
                    value={editForm.email || ""}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="parent@example.com"
                    className="pl-9 h-9 text-xs rounded-xl bg-muted  focus-visible:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <div className="flex rounded-xl overflow-hidden border  bg-muted focus-within:ring-1 focus-within:ring-emerald-500">
                  <span className="inline-flex items-center px-2.5 text-xs text-muted-foreground bg-muted border-r  font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={editForm.phone || ""}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="w-full h-9 px-3 text-xs bg-transparent focus:outline-none text-foreground"
                  />
                </div>
              </div>

              {/* Alternate Phone */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Alternate Phone <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <div className="flex rounded-xl overflow-hidden border  bg-muted focus-within:ring-1 focus-within:ring-emerald-500">
                  <span className="inline-flex items-center px-2.5 text-xs text-muted-foreground bg-muted border-r  font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={editForm.alternatePhone || ""}
                    onChange={(e) => setEditForm({ ...editForm, alternatePhone: e.target.value })}
                    placeholder="Enter alternate number"
                    className="w-full h-9 px-3 text-xs bg-transparent focus:outline-none text-foreground"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────── */}
          {/* SECTION 3: Address Information                            */}
          {/* ────────────────────────────────────────────────────────── */}
          <div className="rounded-2xl border  bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b  text-foreground font-semibold text-sm sm:text-base">
              <MapPin className="size-4 text-emerald-600" />
              Address Information
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold text-foreground">
                  Address <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <span className="text-[10px] text-muted-foreground">
                  {(editForm.address || "").length}/200
                </span>
              </div>
              <div className="relative">
                <textarea
                  rows={2}
                  value={editForm.address || ""}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  placeholder="Enter full address"
                  maxLength={200}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-muted border  focus:outline-none focus:ring-1 focus:ring-emerald-500 text-foreground resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer matching TeacherDialog */}
        <div className="px-6 sm:px-8 py-4 border-t  bg-muted flex items-center justify-between gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={editing}
            className="h-9 px-3 text-xs rounded-xl font-medium text-muted-foreground  hover:bg-muted gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={editing}
              className="h-9 px-4 text-xs rounded-xl font-medium text-foreground  hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onSave}
              disabled={editing || !isFormValid}
              className="h-9 px-5 text-xs rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm shadow-emerald-600/20"
            >
              {editing ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Pencil className="size-3.5" />
                  Update Parent
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
