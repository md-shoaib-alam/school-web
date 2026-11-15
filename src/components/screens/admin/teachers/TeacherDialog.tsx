"use client";

import { useState, useEffect, useRef } from "react";
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
  GraduationCap,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Upload,
  RotateCcw,
  Plus,
  Check,
  Building2,
  Camera,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import type { TeacherInfo } from "./types";

interface TeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTeacher: TeacherInfo | null;
  formData: any;
  setFormData: (data: any) => void;
  submitting: boolean;
  onSubmit: () => void;
  isFormValid: boolean;
}

export function TeacherDialog({
  open,
  onOpenChange,
  editingTeacher,
  formData,
  setFormData,
  submitting,
  onSubmit,
  isFormValid,
}: TeacherDialogProps) {
  const isCreate = !editingTeacher;

  // Track initial snapshot for reset
  const [initialSnapshot, setInitialSnapshot] = useState<any>(formData);
  const photoRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (open) {
      setInitialSnapshot({ ...formData });
    }
  }, [open]);

  const handleReset = () => {
    if (isCreate) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        qualification: "",
        experience: "",
        password: "",
        gender: "male",
        dateOfBirth: "",
        teacherId: "",
        alternatePhone: "",
        address: "",
        role: "Faculty Member",
        subjects: "",
        joiningDate: "",
        status: "active",
        employeeId: "",
        department: "",
        designation: "",
        employmentType: "full-time",
        bloodGroup: "",
        maritalStatus: "",
        nationality: "",
        religion: "",
        panNumber: "",
        aadhaarNumber: "",
        pfEnabled: false,
        esiEnabled: false,
        ptEnabled: false,
        avatar: "",
      });
    } else {
      setFormData({ ...initialSnapshot });
    }
    toast.info("Form reset to initial values");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full sm:w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-0 overflow-hidden border  bg-card shadow-2xl rounded-2xl max-h-[92vh] flex flex-col focus:outline-none"
        data-lenis-prevent
        showCloseButton={false}
      >
        {/* Top Header Section with mint gradient aura and table.avif illustration */}
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
                {isCreate ? "ADD NEW TEACHER" : "EDIT TEACHER"}
              </p>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                {isCreate ? "Add New Teacher" : "Edit Teacher Profile"}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {isCreate
                  ? "Fill in the teacher details below. A unique Teacher ID will be generated automatically for login."
                  : "Update the teacher information below and save your changes."}
              </DialogDescription>
            </div>

            {/* Top Right Decorative Illustration Image (teacheraddtop.avif / table.avif) */}
            <div className="hidden sm:block relative w-36 h-24 shrink-0 -mr-2 select-none pointer-events-none">
              <Image
                src="/assets/admin/teacheraddtop.avif"
                alt="Teacher card graphic"
                fill
                className="object-contain drop-shadow-sm opacity-95"
                priority
              />
            </div>
          </div>
        </div>

        {/* Form Boundary: Isolates browser autofill strictly within this dialog */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
          autoComplete="on"
        >
          {/* Scrollable Form Body with Section Cards */}
          <div
            className="flex-1 overflow-y-auto px-5 sm:px-8 py-5 space-y-5 overscroll-contain touch-pan-y"
            data-lenis-prevent
          >
            {/* ────────────────────────────────────────────────────────── */}
            {/* SECTION 0: Profile Photo                                   */}
            {/* ────────────────────────────────────────────────────────── */}
            <div className="rounded-2xl border  bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                  <Camera className="size-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Profile Photo</p>
                  <p className="text-[11px] text-muted-foreground">Upload a clear photo of the teacher (Optional)</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="size-14 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-base flex items-center justify-center shrink-0 overflow-hidden">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="" className="size-full object-cover" />
                  ) : formData.name ? (
                    formData.name.slice(0, 2).toUpperCase()
                  ) : (
                    <User className="size-6 text-emerald-600/70" />
                  )}
                </div>
                <div className="space-y-1.5">
                  <input ref={photoRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 text-xs font-semibold rounded-xl  text-foreground hover:bg-muted gap-2"
                    onClick={() => photoRef.current?.click()}
                  >
                    <Upload className="size-3.5 text-emerald-600" />
                    Upload Photo
                  </Button>
                  <p className="text-[10px] text-muted-foreground">JPG, PNG up to 2MB</p>
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

              {/* Row 1: Full Name, Gender, Date of Birth */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="t_name" className="text-xs font-semibold text-foreground">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="t_name"
                      name="name"
                      autoComplete="name"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  value={formData.gender || "male"}
                  onValueChange={(val) => setFormData({ ...formData, gender: val })}
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

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Date of Birth
                </Label>
                <DatePicker
                  date={formData.dateOfBirth && !isNaN(new Date(formData.dateOfBirth).getTime()) ? new Date(formData.dateOfBirth) : undefined}
                  onChange={(d) => {
                    const formatted = d ? d.toISOString().split("T")[0] : "";
                    setFormData({ ...formData, dateOfBirth: formatted });
                  }}
                  placeholder="Pick date of birth"
                  className="w-full h-9 text-xs rounded-xl bg-muted "
                />
              </div>
            </div>

            {/* Row 2: Teacher ID, Qualification, Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Teacher ID (auto-generated placeholder) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Teacher ID</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-xs">#</span>
                  <Input
                    value={formData.teacherId || ""}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    placeholder="Auto-generate"
                    className="pl-7 h-9 text-xs rounded-xl bg-muted text-foreground "
                  />
                </div>
              </div>

              {/* Qualification */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Qualification <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.qualification || "B.Ed"}
                  onValueChange={(val) => setFormData({ ...formData, qualification: val })}
                >
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-muted ">
                    <SelectValue placeholder="Select qualification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="B.Ed">B.Ed</SelectItem>
                    <SelectItem value="M.Ed">M.Ed</SelectItem>
                    <SelectItem value="B.Sc, B.Ed">B.Sc, B.Ed</SelectItem>
                    <SelectItem value="M.Sc, B.Ed">M.Sc, B.Ed</SelectItem>
                    <SelectItem value="B.A, B.Ed">B.A, B.Ed</SelectItem>
                    <SelectItem value="M.A, B.Ed">M.A, B.Ed</SelectItem>
                    <SelectItem value="Ph.D.">Ph.D.</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Experience */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Experience
                </Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    value={formData.experience || ""}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="e.g., 5 years"
                    className="pl-9 h-9 text-xs rounded-xl bg-muted  focus-visible:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Blood Group, Marital Status, Nationality, Religion */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Blood Group</Label>
                <Select
                  value={formData.bloodGroup || undefined}
                  onValueChange={(val) => setFormData({ ...formData, bloodGroup: val })}
                >
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-muted ">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Marital Status</Label>
                <Select
                  value={formData.maritalStatus || undefined}
                  onValueChange={(val) => setFormData({ ...formData, maritalStatus: val })}
                >
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-muted ">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Nationality</Label>
                <Input
                  value={formData.nationality || ""}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  placeholder="e.g. Indian"
                  className="h-9 text-xs rounded-xl bg-muted  focus-visible:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Religion</Label>
                <Select value={formData.religion || undefined} onValueChange={(v) => setFormData({ ...formData, religion: v })}>
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-muted  focus-visible:ring-emerald-500">
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

          {/* ────────────────────────────────────────────────────────── */}
          {/* SECTION 2: Contact Information                            */}
          {/* ────────────────────────────────────────────────────────── */}
          <div className="rounded-2xl border  bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b  text-foreground font-semibold text-sm sm:text-base">
              <Phone className="size-4 text-emerald-600" />
              Contact Information
            </div>

            {/* Row 1: Email, Phone, Alternate Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <Label htmlFor="t_email" className="text-xs font-semibold text-foreground">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="t_email"
                    name="email"
                    autoComplete="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="teacher@school.com"
                    className="pl-9 h-9 text-xs rounded-xl bg-muted  focus-visible:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Phone Number
                </Label>
                <div className="flex rounded-xl overflow-hidden border  bg-muted focus-within:ring-1 focus-within:ring-emerald-500">
                  <span className="inline-flex items-center px-2.5 text-xs text-muted-foreground bg-muted border-r  font-medium">
                    +91
                  </span>
                  <input
                    name="phone"
                    autoComplete="tel"
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                    value={formData.alternatePhone || ""}
                    onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                    placeholder="Enter alternate number"
                    className="w-full h-9 px-3 text-xs bg-transparent focus:outline-none text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold text-foreground">
                  Address
                </Label>
                <span className="text-[10px] text-muted-foreground">0/200</span>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <textarea
                  rows={2}
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter full address"
                  maxLength={200}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-muted border  focus:outline-none focus:ring-1 focus:ring-emerald-500 text-foreground resize-none"
                />
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────── */}
          {/* SECTION 3: Professional Information                       */}
          {/* ────────────────────────────────────────────────────────── */}
          <div className="rounded-2xl border  bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b  text-foreground font-semibold text-sm sm:text-base">
              <Briefcase className="size-4 text-emerald-600" />
              Professional Information
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Role (Fixed to Teacher / Faculty Member on server) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Role <span className="text-[10px] text-muted-foreground font-normal">(Teacher)</span>
                </Label>
                <Select
                  value="Faculty Member"
                  disabled
                >
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-muted  text-muted-foreground cursor-not-allowed">
                    <SelectValue placeholder="Faculty Member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Faculty Member">Faculty Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subject(s) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Subject(s) <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <Select
                  value={formData.subjects || "Mathematics"}
                  onValueChange={(val) => setFormData({ ...formData, subjects: val })}
                >
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-muted ">
                    <SelectValue placeholder="Select subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Social Studies">Social Studies</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date of Joining */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Date of Joining <span className="text-red-500">*</span>
                </Label>
                <DatePicker
                  date={formData.joiningDate && !isNaN(new Date(formData.joiningDate).getTime()) ? new Date(formData.joiningDate) : undefined}
                  onChange={(d) => {
                    const formatted = d ? d.toISOString().split("T")[0] : "";
                    setFormData({ ...formData, joiningDate: formatted });
                  }}
                  placeholder="Pick date of joining"
                  className="w-full h-9 text-xs rounded-xl bg-muted "
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Department</Label>
                <Input
                  value={formData.department || ""}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Science, Administration"
                  className="h-9 text-xs rounded-xl bg-muted  focus-visible:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Designation</Label>
                <Input
                  value={formData.designation || ""}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Senior Faculty Member"
                  className="h-9 text-xs rounded-xl bg-muted  focus-visible:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Employment Type</Label>
                <Select
                  value={formData.employmentType || "full-time"}
                  onValueChange={(val) => setFormData({ ...formData, employmentType: val })}
                >
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-muted ">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-Time</SelectItem>
                    <SelectItem value="part-time">Part-Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────── */}
          {/* SECTION 3b: Statutory Information                          */}
          {/* ────────────────────────────────────────────────────────── */}
          <div className="rounded-2xl border  bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b  text-foreground font-semibold text-sm sm:text-base">
              <CheckCircle2 className="size-4 text-emerald-600" />
              Statutory Information
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">PAN Number</Label>
                <Input
                  value={formData.panNumber || ""}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className="h-9 text-xs rounded-xl bg-muted font-mono focus-visible:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Aadhaar Number</Label>
                <Input
                  value={formData.aadhaarNumber || ""}
                  onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value.replace(/[^0-9]/g, "").slice(0, 12) })}
                  placeholder="12-digit number"
                  inputMode="numeric"
                  className="h-9 text-xs rounded-xl bg-muted font-mono focus-visible:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
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
          </div>

          {/* ────────────────────────────────────────────────────────── */}
          {/* SECTION 4: Account Settings                               */}
          {/* ────────────────────────────────────────────────────────── */}
          <div className="rounded-2xl border  bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b  text-foreground font-semibold text-sm sm:text-base">
              <CheckCircle2 className="size-4 text-emerald-600" />
              Account Settings
            </div>

            <div className="space-y-1.5 max-w-xs">
              <Label className="text-xs font-semibold text-foreground">Status</Label>
              <div className="flex items-center gap-3">
                <Select
                  value={formData.status || "active"}
                  onValueChange={(val) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-400 font-semibold w-40">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      <SelectValue placeholder="Active" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Inactive teachers will not be able to log in to the system.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Reset on left, Cancel & Add Teacher on right */}
        <div className="px-6 sm:px-8 py-4 border-t  bg-muted flex items-center justify-between gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={submitting}
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
              disabled={submitting}
              className="h-9 px-4 text-xs rounded-xl font-medium text-foreground  hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting || !isFormValid}
              className="h-9 px-5 text-xs rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm shadow-emerald-600/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  {editingTeacher ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>
                  <Plus className="size-4 stroke-[2.5]" />
                  {editingTeacher ? "Update Teacher" : "Add Teacher"}
                </>
              )}
            </Button>
          </div>
        </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
