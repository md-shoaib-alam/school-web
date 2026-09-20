"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  User,
  BookOpen,
  School,
  Copy,
  Check,
  Printer,
  ChevronLeft,
  MoreVertical,
  Calendar,
  MapPin,
  Pencil,
  Building2,
  FileText,
  StickyNote,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/utils";
import type { TeacherInfo } from "./types";

interface TeacherProfileViewProps {
  teacher: TeacherInfo;
  onBack: () => void;
  canEdit?: boolean;
  onEdit?: (teacher: TeacherInfo) => void;
  isLoading?: boolean;
}

function getInitials(name: string): string {
  if (!name) return "TC";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function TeacherProfileView({
  teacher,
  onBack,
  canEdit = true,
  onEdit,
  isLoading = false,
}: TeacherProfileViewProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "academics" | "attendance" | "classes" | "documents" | "notes">("overview");

  const currentTeacher = teacher;

  const handleCopy = (text: string, fieldName: string) => {
    copyToClipboard(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success(`${fieldName} copied to clipboard`);
  };

  const handlePrint = () => {
    window.print();
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "academics", label: "Academics", icon: GraduationCap },
    { id: "attendance", label: "Attendance", icon: Calendar },
    { id: "classes", label: "Classes", icon: School },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "notes", label: "Notes", icon: StickyNote },
  ] as const;

  const displayTeacherId = currentTeacher.teacherId || (currentTeacher.id ? `TCH${currentTeacher.id.slice(-3).toUpperCase()}` : "TCH002");
  const displayAddress = currentTeacher.address || "Bangalore, Karnataka";
  const displayRole = currentTeacher.role || "Faculty Member";
  const displayJoiningDate = currentTeacher.joiningDate || "12 Aug 2024";

  if (isLoading) {
    return (
      <div className="min-h-[460px] flex flex-col items-center justify-center py-16 px-4">
        <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-800/90 border border-slate-100 dark:border-zinc-700/80 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="relative w-40 h-28 mb-5 flex items-center justify-center">
            <Image
              src="/assets/admin/table.avif"
              alt="Loading teacher details"
              width={160}
              height={112}
              className="object-contain drop-shadow-sm"
              priority
            />
          </div>
          <div className="relative size-12 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-[3.5px] border-slate-100 dark:border-zinc-700" />
            <div className="absolute inset-0 rounded-full border-[3.5px] border-emerald-600 dark:border-emerald-400 border-t-transparent border-r-transparent animate-spin" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Loading Teacher Profile...
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 dark:text-zinc-400 mt-1">
            Please wait a moment
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Breadcrumbs & Action Row */}
      <div className="flex items-center justify-between gap-3">
        {/* Back Button Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 sm:py-1.5 rounded-full bg-emerald-50/70 hover:bg-emerald-100/70 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-emerald-100 dark:border-zinc-700 transition-all shadow-xs"
          >
            <ChevronLeft className="size-4 text-slate-700 dark:text-zinc-300 stroke-[2.5]" />
            <span className="text-xs sm:text-sm font-semibold tracking-tight">Back to Teachers</span>
          </button>

          <span className="hidden sm:inline-block text-xs text-slate-400 dark:text-zinc-500 font-medium">
            Teachers <span className="mx-1.5 text-slate-300 dark:text-zinc-700">›</span> Teacher Profile
          </span>
        </div>

        {/* Actions Right */}
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button
              onClick={() => onEdit && onEdit(currentTeacher)}
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
            >
              <Pencil className="size-3.5" />
              Edit Profile
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-slate-700 dark:text-zinc-200 border-slate-200 dark:border-zinc-700 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800"
          >
            <Printer className="size-3.5" />
            Print
          </Button>

          {/* More actions menu button */}
          <button
            className="p-2.5 sm:p-2 rounded-xl border border-slate-200/90 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
            aria-label="More options"
          >
            <MoreVertical className="size-4" />
          </button>
        </div>
      </div>

      {/* Main Profile Header Box */}
      <div className="relative rounded-2xl border border-slate-200/90 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="flex flex-row items-center gap-4 sm:gap-5 w-full">
            {/* Avatar Circle */}
            <div className="size-20 sm:size-24 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border-2 border-slate-100 dark:border-zinc-700 flex items-center justify-center text-emerald-800 dark:text-emerald-300 text-2xl sm:text-3xl font-bold shadow-xs shrink-0 overflow-hidden">
              {getInitials(currentTeacher.name)}
            </div>

            {/* Profile Info details */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                {currentTeacher.name}
              </h1>

              {/* Status and Role badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80">
                  {displayRole}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  {currentTeacher.status ? currentTeacher.status.charAt(0).toUpperCase() + currentTeacher.status.slice(1) : "Active"}
                </span>
              </div>

              {/* Email line */}
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 font-medium truncate pt-0.5">
                <Mail className="size-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{currentTeacher.email}</span>
              </div>

              {/* Teacher ID with Copy Button */}
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium">
                <span>Teacher ID:</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">{displayTeacherId}</span>
                <button
                  onClick={() => handleCopy(displayTeacherId, "Teacher ID")}
                  className="p-1 text-slate-400 hover:text-emerald-600 transition-colors rounded"
                  aria-label="Copy Teacher ID"
                >
                  {copiedField === "Teacher ID" ? (
                    <Check className="size-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Right Side Quote Banner with teachertop illustration */}
          <div className="hidden lg:flex items-end justify-end gap-5 pr-2 self-end shrink-0">
            <div className="text-right italic text-xs text-slate-400 dark:text-zinc-500 max-w-[210px] pb-2 leading-relaxed">
              &ldquo;Educating minds, building brighter futures.&rdquo;
            </div>
            <div className="relative w-36 h-28 shrink-0 overflow-hidden">
              <Image
                src="/assets/admin/teachertop.avif"
                alt="Teacher Illustration"
                fill
                className="object-contain object-bottom-right"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation Bar */}
      <div className="border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl px-2 sm:px-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-around sm:justify-start gap-1 sm:gap-6 -mb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-3 px-2 sm:px-3 text-[11px] sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-emerald-600 text-emerald-700 dark:text-emerald-400 font-semibold"
                    : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
                }`}
              >
                <Icon className={`size-4 ${isActive ? "text-emerald-600 dark:text-emerald-400 stroke-[2.2]" : "text-slate-400 stroke-[1.8]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Section */}
      {activeTab === "overview" ? (
        <div className="space-y-5">
          {/* Row 1: Personal & Contact Information and Professional Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1: Personal & Contact Information */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800/60">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm sm:text-base">
                  <User className="size-4 text-emerald-600" />
                  Personal & Contact Information
                </div>
                {canEdit && (
                  <button
                    onClick={() => onEdit && onEdit(currentTeacher)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Pencil className="size-3" />
                    Edit
                  </button>
                )}
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                {/* Full Name */}
                <div className="flex items-center justify-between py-0.5">
                  <span className="flex items-center gap-2.5 text-slate-400 dark:text-zinc-500 font-medium">
                    <User className="size-4 text-slate-400" />
                    Full Name
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-100 text-right">
                    {currentTeacher.name}
                  </span>
                </div>

                {/* Email Address */}
                <div className="flex items-center justify-between py-0.5">
                  <span className="flex items-center gap-2.5 text-slate-400 dark:text-zinc-500 font-medium">
                    <Mail className="size-4 text-slate-400" />
                    Email Address
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-100 text-right truncate max-w-[200px] sm:max-w-xs">
                    {currentTeacher.email}
                  </span>
                </div>

                {/* Phone Number */}
                <div className="flex items-center justify-between py-0.5">
                  <span className="flex items-center gap-2.5 text-slate-400 dark:text-zinc-500 font-medium">
                    <Phone className="size-4 text-slate-400" />
                    Phone Number
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-100 text-right">
                    {currentTeacher.phone || "—"}
                  </span>
                </div>

                {/* Teacher ID */}
                <div className="flex items-center justify-between py-0.5">
                  <span className="flex items-center gap-2.5 text-slate-400 dark:text-zinc-500 font-medium">
                    <Building2 className="size-4 text-slate-400" />
                    Teacher ID
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-100 text-right">
                    {displayTeacherId}
                  </span>
                </div>

                {/* Address */}
                <div className="flex items-center justify-between py-0.5">
                  <span className="flex items-center gap-2.5 text-slate-400 dark:text-zinc-500 font-medium">
                    <MapPin className="size-4 text-slate-400" />
                    Address
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-100 text-right">
                    {displayAddress}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Professional Information */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800/60">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm sm:text-base">
                  <Briefcase className="size-4 text-emerald-600" />
                  Professional Information
                </div>
                {canEdit && (
                  <button
                    onClick={() => onEdit && onEdit(currentTeacher)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Pencil className="size-3" />
                    Edit
                  </button>
                )}
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                {/* Role */}
                <div className="flex items-center justify-between py-0.5">
                  <span className="flex items-center gap-2.5 text-slate-400 dark:text-zinc-500 font-medium">
                    <User className="size-4 text-slate-400" />
                    Role
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-100 text-right">
                    {displayRole}
                  </span>
                </div>

                {/* Qualification */}
                <div className="flex items-center justify-between py-0.5">
                  <span className="flex items-center gap-2.5 text-slate-400 dark:text-zinc-500 font-medium">
                    <GraduationCap className="size-4 text-slate-400" />
                    Qualification
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-100 text-right">
                    {currentTeacher.qualification || "B.Ed"}
                  </span>
                </div>

                {/* Experience */}
                <div className="flex items-center justify-between py-0.5">
                  <span className="flex items-center gap-2.5 text-slate-400 dark:text-zinc-500 font-medium">
                    <Calendar className="size-4 text-slate-400" />
                    Experience
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-100 text-right">
                    {currentTeacher.experience || "2 years"}
                  </span>
                </div>

                {/* Date of Joining */}
                <div className="flex items-center justify-between py-0.5">
                  <span className="flex items-center gap-2.5 text-slate-400 dark:text-zinc-500 font-medium">
                    <Calendar className="size-4 text-slate-400" />
                    Date of Joining
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-100 text-right">
                    {displayJoiningDate}
                  </span>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between py-0.5">
                  <span className="flex items-center gap-2.5 text-slate-400 dark:text-zinc-500 font-medium">
                    <Check className="size-4 text-slate-400" />
                    Status
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    {currentTeacher.status ? currentTeacher.status.charAt(0).toUpperCase() + currentTeacher.status.slice(1) : "Active"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Assigned Subjects and Classes Taught Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 3: Assigned Subjects */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800/60">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm sm:text-base">
                  <BookOpen className="size-4 text-emerald-600" />
                  Assigned Subjects ({currentTeacher.subjects?.length || 0})
                </div>
                {canEdit && (
                  <button
                    onClick={() => onEdit && onEdit(currentTeacher)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Pencil className="size-3" />
                    Edit
                  </button>
                )}
              </div>

              {!currentTeacher.subjects || currentTeacher.subjects.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-zinc-500 italic">No subjects assigned yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {currentTeacher.subjects.map((subj, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60"
                    >
                      {subj}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Card 4: Classes Taught */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800/60">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm sm:text-base">
                  <Users className="size-4 text-emerald-600" />
                  Classes Taught ({currentTeacher.classes?.length || 0})
                </div>
                {canEdit && (
                  <button
                    onClick={() => onEdit && onEdit(currentTeacher)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Pencil className="size-3" />
                    Edit
                  </button>
                )}
              </div>

              {!currentTeacher.classes || currentTeacher.classes.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-zinc-500 italic">No classes assigned yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {currentTeacher.classes.map((cls, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60"
                    >
                      {cls}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center text-slate-400 dark:text-zinc-500 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
          <Building2 className="size-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">No records found for {activeTab}</p>
        </div>
      )}

      {/* Mobile Sticky Edit Profile Button */}
      {canEdit && (
        <div className="sm:hidden sticky bottom-4 z-10 pt-2">
          <Button
            onClick={() => onEdit && onEdit(currentTeacher)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl py-3 gap-2 shadow-lg shadow-emerald-600/20"
          >
            <Pencil className="size-4" />
            Edit Profile
          </Button>
        </div>
      )}
    </div>
  );
}
