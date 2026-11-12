"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Mail,
  User,
  GraduationCap,
  School,
  Printer,
  ChevronLeft,
  MoreVertical,
  Calendar,
  Pencil,
  Check,
  Building2,
  FileText,
  StickyNote,
} from "lucide-react";
import { toast } from "sonner";
import { CopyButton } from "@/components/ui/copy-button";
import { apiFetch } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/graphql/keys";
import type { TeacherInfo } from "./types";

import { TeacherPersonalCard } from "./TeacherPersonalCard";
import { TeacherProfessionalCard } from "./TeacherProfessionalCard";
import { TeacherSubjectsCard } from "./TeacherSubjectsCard";
import { TeacherClassesCard } from "./TeacherClassesCard";
import { TeacherProfileSkeleton } from "@/components/screens/profile/TeacherProfileSkeleton";

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
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"overview" | "academics" | "attendance" | "classes" | "documents" | "notes">("overview");

  // Local live state of the teacher profile
  const [currentTeacher, setCurrentTeacher] = useState<TeacherInfo>(teacher);

  // Track which section is in independent edit mode
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  // Track collapsed status for sections
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    personal: false,
    professional: false,
    subjects: false,
    classes: false,
  });

  const toggleCollapse = (sec: string) => {
    setCollapsed((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  /** "all" is the whole-profile mode the header button enters: every section holds its own form. */
  const isSectionEditing = (sec: string) => editingSection === sec || editingSection === "all";

  /** Another section holds the form on its own: this one sits behind it, dimmed. */
  const dimmed = (sec: string) =>
    editingSection !== null && editingSection !== "all" && editingSection !== sec;

  // Section Form Data
  const [formData, setFormData] = useState({
    name: currentTeacher.name || "",
    email: currentTeacher.email || "",
    phone: currentTeacher.phone || "",
    address: currentTeacher.address || "Bangalore, Karnataka",
    role: currentTeacher.role || "Faculty Member",
    qualification: currentTeacher.qualification || "B.Ed",
    experience: currentTeacher.experience || "2 years",
    joiningDate: currentTeacher.joiningDate || "2024-08-12",
    status: currentTeacher.status || "active",
    subjects: currentTeacher.subjects || [],
    classes: currentTeacher.classes || [],
    newSubjectInput: "",
    newClassInput: "",
  });

  const handlePrint = () => {
    window.print();
  };

  const startEdit = (section: string) => {
    setFormData({
      name: currentTeacher.name || "",
      email: currentTeacher.email || "",
      phone: currentTeacher.phone || "",
      address: currentTeacher.address || "Bangalore, Karnataka",
      role: currentTeacher.role || "Faculty Member",
      qualification: currentTeacher.qualification || "B.Ed",
      experience: currentTeacher.experience || "2 years",
      joiningDate: currentTeacher.joiningDate || "2024-08-12",
      status: currentTeacher.status || "active",
      subjects: [...(currentTeacher.subjects || [])],
      classes: [...(currentTeacher.classes || [])],
      newSubjectInput: "",
      newClassInput: "",
    });
    setEditingSection(section);
  };

  const cancelEdit = () => {
    setEditingSection(null);
  };

  const saveSection = async (sectionName: string, title: string) => {
    if (sectionName === "personal") {
      if (!formData.name.trim() || !formData.email.trim()) {
        toast.error("Name and Email are required");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Please enter a valid email address");
        return;
      }
    }

    setSavingSection(sectionName);
    try {
      const payload: any = {
        id: currentTeacher.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        qualification: formData.qualification,
        experience: formData.experience,
      };

      const res = await apiFetch("/api/teachers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to update ${title}`);
      }

      // Update local state smoothly
      const updated: TeacherInfo = {
        ...currentTeacher,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        role: formData.role,
        qualification: formData.qualification,
        experience: formData.experience,
        joiningDate: formData.joiningDate,
        status: formData.status,
        subjects: formData.subjects,
        classes: formData.classes,
      };

      setCurrentTeacher(updated);
      // One section saved while the whole profile is open: the rest stay editable.
      setEditingSection((now) => (now === "all" ? "all" : null));
      toast.success(`${title} updated successfully`);

      // Refresh teachers in cache
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers });
    } catch (err: any) {
      toast.error(err.message || "Failed to save changes");
    } finally {
      setSavingSection(null);
    }
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
    return <TeacherProfileSkeleton />;
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-6">
      {/* Top Breadcrumbs & Action Row */}
      <div className="flex items-center justify-between gap-3">
        {/* Back Button Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 sm:py-1.5 rounded-full bg-emerald-50/70 hover:bg-emerald-100/70 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-foreground border border-emerald-200/70 dark:border-emerald-800/60 transition-all shadow-xs"
          >
            <ChevronLeft className="size-4 text-foreground stroke-[2.5]" />
            <span className="text-xs sm:text-sm font-semibold tracking-tight">Back to Teachers</span>
          </button>

          <span className="hidden sm:inline-block text-xs text-muted-foreground font-medium">
            Teachers <span className="mx-1.5 text-muted-foreground">›</span> Teacher Profile
          </span>
        </div>

        {/* Actions Right */}
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button
              onClick={() => (editingSection === "all" ? cancelEdit() : startEdit("all"))}
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
            >
              {editingSection === "all" ? <Check className="size-3.5" /> : <Pencil className="size-3.5" />}
              {editingSection === "all" ? "Done" : "Edit Profile"}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-foreground  rounded-xl hover:bg-accent"
          >
            <Printer className="size-3.5" />
            Print
          </Button>

          {/* More actions menu button */}
          <button
            className="p-2.5 sm:p-2 rounded-xl border  text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shadow-xs"
            aria-label="More options"
          >
            <MoreVertical className="size-4" />
          </button>
        </div>
      </div>

      {/* Main Profile Header Box */}
      <div className="relative rounded-2xl border  bg-card p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="flex flex-row items-center gap-4 sm:gap-5 w-full">
            {/* Avatar Square */}
            <div className="size-20 sm:size-24 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center text-teal-800 dark:text-teal-300 text-2xl sm:text-3xl font-bold shadow-xs shrink-0 overflow-hidden">
              {getInitials(currentTeacher.name)}
            </div>

            {/* Profile Info details */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight truncate">
                {currentTeacher.name}
              </h1>

              {/* Status and Role badges */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border/80">
                  <span className="font-mono text-muted-foreground/70">#</span>
                  {displayTeacherId}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 border border-teal-200/80 dark:border-teal-800/80">
                  <Building2 className="size-3" />
                  {displayRole}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80">
                  {currentTeacher.status ? currentTeacher.status.charAt(0).toUpperCase() + currentTeacher.status.slice(1) : "Active"}
                </span>
              </div>

              <p className="text-xs text-muted-foreground pt-0.5">
                Session: 2026-27
              </p>
            </div>
          </div>

          {/* Desktop Right Side Quote Banner with teachertop illustration */}
          <div className="hidden lg:flex items-end justify-end gap-5 pr-2 self-end shrink-0">
            <div className="text-right italic text-xs text-muted-foreground max-w-[210px] pb-2 leading-relaxed">
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

      {/* Tab Navigation Bar — horizontally scrollable pill row */}
      <div className="bg-card rounded-xl border  px-2 py-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max sm:min-w-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground dark:hover:text-muted-foreground"
                }`}
              >
                <Icon className={`size-4 shrink-0 ${
                  isActive ? "text-white stroke-[2.2]" : "text-muted-foreground stroke-[1.8]"
                }`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Section */}
      {activeTab === "overview" ? (
        <div className="space-y-5">
          {/* Card 1: Personal & Contact Information */}
          <TeacherPersonalCard
            currentTeacher={currentTeacher}
            formData={formData}
            setFormData={setFormData}
            displayTeacherId={displayTeacherId}
            displayAddress={displayAddress}
            canEdit={canEdit}
            isEditing={isSectionEditing("personal")}
            isSaving={savingSection === "personal"}
            isCollapsed={collapsed.personal}
            dimmed={dimmed("personal")}
            onToggleCollapse={() => toggleCollapse("personal")}
            onStartEdit={() => startEdit("personal")}
            onCancelEdit={cancelEdit}
            onSave={() => saveSection("personal", "Personal Information")}
            getInitials={getInitials}
          />

          {/* Card 2: Professional Information */}
          <TeacherProfessionalCard
            currentTeacher={currentTeacher}
            formData={formData}
            setFormData={setFormData}
            displayRole={displayRole}
            displayJoiningDate={displayJoiningDate}
            canEdit={canEdit}
            isEditing={isSectionEditing("professional")}
            isSaving={savingSection === "professional"}
            isCollapsed={collapsed.professional}
            dimmed={dimmed("professional")}
            onToggleCollapse={() => toggleCollapse("professional")}
            onStartEdit={() => startEdit("professional")}
            onCancelEdit={cancelEdit}
            onSave={() => saveSection("professional", "Professional Information")}
          />

          {/* Row 2: Assigned Subjects and Classes Taught Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 3: Assigned Subjects */}
            <TeacherSubjectsCard
              currentTeacher={currentTeacher}
              formData={formData}
              setFormData={setFormData}
              canEdit={canEdit}
              isEditing={isSectionEditing("subjects")}
              isSaving={savingSection === "subjects"}
              isCollapsed={collapsed.subjects}
              dimmed={dimmed("subjects")}
              onToggleCollapse={() => toggleCollapse("subjects")}
              onStartEdit={() => startEdit("subjects")}
              onCancelEdit={cancelEdit}
              onSave={() => saveSection("subjects", "Assigned Subjects")}
            />

            {/* Card 4: Classes Taught */}
            <TeacherClassesCard
              currentTeacher={currentTeacher}
              formData={formData}
              setFormData={setFormData}
              canEdit={canEdit}
              isEditing={isSectionEditing("classes")}
              isSaving={savingSection === "classes"}
              isCollapsed={collapsed.classes}
              dimmed={dimmed("classes")}
              onToggleCollapse={() => toggleCollapse("classes")}
              onStartEdit={() => startEdit("classes")}
              onCancelEdit={cancelEdit}
              onSave={() => saveSection("classes", "Classes Taught")}
            />
          </div>
        </div>
      ) : (
        <div className="py-20 text-center text-muted-foreground bg-card rounded-2xl border ">
          <Building2 className="size-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">No records found for {activeTab}</p>
        </div>
      )}

      {/* Mobile Sticky Edit Profile Button */}
      {canEdit && editingSection === null && (
        <div className="sm:hidden sticky bottom-4 z-10 pt-2">
          <Button
            onClick={() => startEdit("all")}
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
