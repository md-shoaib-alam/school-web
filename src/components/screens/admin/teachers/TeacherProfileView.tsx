"use client";

import { useEffect, useState } from "react";
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
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/graphql/keys";
import type { TeacherInfo, TeacherDocumentInfo } from "./types";

import { TeacherPersonalInfoCard, TeacherContactInfoCard, TeacherStatutoryInfoCard } from "./TeacherPersonalCard";
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
  currentSession?: string | null;
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

function initFormData(t: TeacherInfo) {
  return {
    name: t.name || "",
    email: t.email || "",
    phone: t.phone || "",
    address: t.address || "",
    alternatePhone: t.alternatePhone || "",
    avatar: t.avatar || "",
    role: t.role || "Faculty Member",
    qualification: t.qualification || "",
    experience: t.experience || "",
    joiningDate: t.joiningDate || "",
    status: t.status || "active",
    employeeId: t.employeeId || "",
    department: t.department || "",
    designation: t.designation || "",
    employmentType: t.employmentType || "full-time",
    dateOfBirth: t.dateOfBirth || "",
    gender: t.gender || "",
    bloodGroup: t.bloodGroup || "",
    maritalStatus: t.maritalStatus || "",
    nationality: t.nationality || "",
    religion: t.religion || "",
    panNumber: t.panNumber || "",
    aadhaarNumber: t.aadhaarNumber || "",
    pfEnabled: !!t.pfEnabled,
    esiEnabled: !!t.esiEnabled,
    ptEnabled: !!t.ptEnabled,
    subjects: [...(t.subjects || [])],
    classes: [...(t.classes || [])],
    newSubjectInput: "",
    newClassInput: "",
  };
}

const DOC_CATEGORIES = [
  { value: "identity", label: "Identity Proof" },
  { value: "degree", label: "Degree Certificate" },
  { value: "appointment", label: "Appointment Letter" },
  { value: "experience", label: "Experience Certificate" },
  { value: "other", label: "Other" },
];

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return Math.max(1, Math.round(bytes / 1024)) + " KB";
}

export function TeacherProfileView({
  teacher,
  onBack,
  canEdit = true,
  onEdit,
  isLoading = false,
  currentSession = null,
}: TeacherProfileViewProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"overview" | "academics" | "attendance" | "classes" | "documents" | "notes">("overview");

  const [currentTeacher, setCurrentTeacher] = useState<TeacherInfo>(teacher);
  useEffect(() => {
    setCurrentTeacher(teacher);
  }, [teacher]);

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    basic: false,
    contact: false,
    statutory: false,
    professional: false,
    subjects: false,
    classes: false,
  });

  const toggleCollapse = (sec: string) => {
    setCollapsed((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const isSectionEditing = (sec: string) => editingSection === sec || editingSection === "all";

  const dimmed = (sec: string) =>
    editingSection !== null && editingSection !== "all" && editingSection !== sec;

  const [formData, setFormData] = useState(initFormData(teacher));

  const [docs, setDocs] = useState<TeacherDocumentInfo[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docCategory, setDocCategory] = useState("other");

  const loadDocs = async () => {
    setDocsLoading(true);
    try {
      const res = await apiFetch("/api/teachers/documents?teacherId=" + currentTeacher.id);
      const data = await res.json().catch(() => ({}));
      if (res.ok) setDocs(data.documents || []);
    } catch {
      toast.error("Failed to load documents");
    } finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "documents") loadDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentTeacher.id]);

  const handleUploadDoc = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Document must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      setUploading(true);
      try {
        const res = await apiFetch("/api/teachers/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teacherId: currentTeacher.id,
            name: file.name,
            category: docCategory,
            fileName: file.name,
            dataUrl: reader.result,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(data.error || "Failed to upload document");
          return;
        }
        toast.success("Document uploaded and verified");
        await loadDocs();
      } catch {
        toast.error("Failed to upload document");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDocStatus = async (id: string, status: string) => {
    try {
      const res = await apiFetch("/api/teachers/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        toast.error("Failed to update document status");
        return;
      }
      toast.success(status === "verified" ? "Document verified" : "Document rejected");
      await loadDocs();
    } catch {
      toast.error("Failed to update document status");
    }
  };

  const handleDeleteDoc = async (id: string) => {
    try {
      const res = await apiFetch("/api/teachers/documents?id=" + id, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to remove document");
        return;
      }
      toast.success("Document removed");
      await loadDocs();
    } catch {
      toast.error("Failed to remove document");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const startEdit = (section: string) => {
    setFormData(initFormData(currentTeacher));
    setEditingSection(section);
  };

  const cancelEdit = () => {
    setEditingSection(null);
  };

  const saveSection = async (sectionName: string, title: string) => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Name and Email are required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSavingSection(sectionName);
    try {
      const { newSubjectInput, newClassInput, role, ...fields } = formData;
      const payload = { id: currentTeacher.id, ...fields };

      const res = await apiFetch("/api/teachers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update " + title);
      }

      const updated: TeacherInfo = {
        ...currentTeacher,
        ...fields,
        avatar: fields.avatar || null,
      };

      setCurrentTeacher(updated);
      setEditingSection((now) => (now === "all" ? "all" : null));
      toast.success(title + " updated successfully");

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

  const displayTeacherId = currentTeacher.employeeId || "Not assigned";
  const displayDepartment = currentTeacher.department || "—";
  const displayAddress = currentTeacher.address || "—";
  const displayRole = currentTeacher.designation || currentTeacher.role || "Faculty Member";
  const displayJoiningDate = currentTeacher.joiningDate
    ? new Date(currentTeacher.joiningDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  if (isLoading) {
    return <TeacherProfileSkeleton />;
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-6">
      {/* Top Breadcrumbs & Action Row */}
      <div className="flex items-center justify-between gap-3">
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
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-foreground rounded-xl hover:bg-accent"
          >
            <Printer className="size-3.5" />
            Print
          </Button>

          <button
            className="p-2.5 sm:p-2 rounded-xl border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shadow-xs"
            aria-label="More options"
          >
            <MoreVertical className="size-4" />
          </button>
        </div>
      </div>

      {/* Main Profile Header Box */}
      <div className="relative rounded-2xl border bg-card p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="flex flex-row items-center gap-4 sm:gap-5 w-full">
            <div className="size-20 sm:size-24 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center text-teal-800 dark:text-teal-300 text-2xl sm:text-3xl font-bold shadow-xs shrink-0 overflow-hidden">
              {currentTeacher.avatar ? (
                <img src={currentTeacher.avatar} alt={currentTeacher.name} className="size-full object-cover" />
              ) : (
                getInitials(currentTeacher.name)
              )}
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight truncate">
                {currentTeacher.name}
              </h1>

              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border/80">
                  <span className="font-mono text-muted-foreground/70">#</span>
                  {displayTeacherId}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 border border-teal-200/80 dark:border-teal-800/80">
                  <GraduationCap className="size-3" />
                  Teacher
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80">
                  {currentTeacher.status ? currentTeacher.status.charAt(0).toUpperCase() + currentTeacher.status.slice(1) : "Active"}
                </span>
              </div>

              <p className="text-xs text-muted-foreground pt-0.5">
                Session: {currentSession || "—"}
              </p>
            </div>
          </div>

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

      {/* Tab Navigation Bar */}
      <div className="bg-card rounded-xl border px-2 py-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max sm:min-w-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={"flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all " + (
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground dark:hover:text-muted-foreground"
                )}
              >
                <Icon className={"size-4 shrink-0 " + (isActive ? "text-white stroke-[2.2]" : "text-muted-foreground stroke-[1.8]")} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Section */}
      {activeTab === "overview" ? (
        <div className="space-y-5">
          <TeacherPersonalInfoCard
            currentTeacher={currentTeacher}
            formData={formData}
            setFormData={setFormData}
            canEdit={canEdit}
            isEditing={isSectionEditing("basic")}
            isSaving={savingSection === "basic"}
            isCollapsed={collapsed.basic}
            dimmed={dimmed("basic")}
            onToggleCollapse={() => toggleCollapse("basic")}
            onStartEdit={() => startEdit("basic")}
            onCancelEdit={cancelEdit}
            onSave={() => saveSection("basic", "Personal Information")}
          />

          <TeacherContactInfoCard
            currentTeacher={currentTeacher}
            formData={formData}
            setFormData={setFormData}
            canEdit={canEdit}
            isEditing={isSectionEditing("contact")}
            isSaving={savingSection === "contact"}
            isCollapsed={collapsed.contact}
            dimmed={dimmed("contact")}
            onToggleCollapse={() => toggleCollapse("contact")}
            onStartEdit={() => startEdit("contact")}
            onCancelEdit={cancelEdit}
            onSave={() => saveSection("contact", "Contact Information")}
            getInitials={getInitials}
          />

          <TeacherStatutoryInfoCard
            currentTeacher={currentTeacher}
            formData={formData}
            setFormData={setFormData}
            canEdit={canEdit}
            isEditing={isSectionEditing("statutory")}
            isSaving={savingSection === "statutory"}
            isCollapsed={collapsed.statutory}
            dimmed={dimmed("statutory")}
            onToggleCollapse={() => toggleCollapse("statutory")}
            onStartEdit={() => startEdit("statutory")}
            onCancelEdit={cancelEdit}
            onSave={() => saveSection("statutory", "Statutory Information")}
          />

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
      ) : activeTab === "documents" ? (
        <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/70 mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Teacher Documents</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Certificates and ID proof on record. Admin uploads are verified instantly; teacher uploads await review.
              </p>
            </div>
            {canEdit && (
              <div className="flex items-center gap-2">
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="h-9 rounded-xl border border-border bg-muted px-2.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  aria-label="Document category"
                >
                  {DOC_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <label className="inline-flex items-center gap-2 h-9 px-3 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-accent transition-colors cursor-pointer">
                  {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                  {uploading ? "Uploading..." : "Upload"}
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.txt"
                    onChange={handleUploadDoc}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            )}
          </div>

          {docsLoading ? (
            <div className="py-14 flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="size-4 animate-spin" />
              Loading documents...
            </div>
          ) : docs.length === 0 ? (
            <div className="py-14 text-center">
              <FileText className="size-9 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm font-semibold text-foreground">No documents on record</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload degree certificates, ID proof and the appointment letter to complete this profile.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {docs.map((doc) => (
                <div key={doc.id} className="p-4 rounded-xl border border-border bg-muted/40 hover:bg-muted/70 transition-colors flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-200/50">
                      <FileText className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{doc.name}</p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        <span>{formatSize(doc.size)}</span>
                        <span>•</span>
                        {doc.status === "verified" ? (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="size-3" />
                            Verified
                          </span>
                        ) : doc.status === "rejected" ? (
                          <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                            <XCircle className="size-3" />
                            Rejected
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                            <Clock className="size-3" />
                            Pending review
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {canEdit && doc.status === "pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleDocStatus(doc.id, "verified")}
                          className="inline-flex items-center justify-center size-8 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                          title="Verify document"
                        >
                          <CheckCircle2 className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDocStatus(doc.id, "rejected")}
                          className="inline-flex items-center justify-center size-8 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Reject document"
                        >
                          <XCircle className="size-4" />
                        </button>
                      </>
                    )}
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      title="Open document"
                    >
                      <Download className="size-4" />
                    </a>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="inline-flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Remove document"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="py-20 text-center text-muted-foreground bg-card rounded-2xl border">
          <Building2 className="size-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">No records found for {activeTab}</p>
        </div>
      )}

      {/* Mobile Sticky Edit Profile Button */}
      {canEdit && editingSection === null && activeTab === "overview" && (
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