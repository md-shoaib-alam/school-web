"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  GraduationCap,
  Printer,
  Pencil,
  MoreVertical,
  BookOpen,
  CalendarDays,
  CreditCard,
  MoreHorizontal,
  User,
  Building2,
  Phone,
  Mail,
  Calendar,
  Bus,
  Check,
  FileText,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { CopyButton } from "@/components/ui/copy-button";
import type { StudentInfo } from "./types";
import { StudentOverviewTab } from "./StudentOverviewTab";

const DOC_CATEGORIES = [
  { value: "identity", label: "Identity Proof" },
  { value: "birth", label: "Birth Certificate" },
  { value: "transfer", label: "Transfer Certificate" },
  { value: "report-card", label: "Report Card" },
  { value: "medical", label: "Medical Record" },
  { value: "other", label: "Other" },
];

function formatDocSize(bytes: number) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return Math.max(1, Math.round(bytes / 1024)) + " KB";
}

interface StudentDoc {
  id: string;
  name: string;
  category: string;
  fileUrl: string;
  size: number;
  status: string;
  verifiedAt: string | null;
  createdAt: string;
}

interface StudentProfileViewProps {
  student: StudentInfo;
  onBack: () => void;
  canEdit?: boolean;
  onEdit?: (student: StudentInfo) => void;
  isLoading?: boolean;
}

function getInitials(name: string): string {
  if (!name) return "ST";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function StudentProfileView({
  student,
  onBack,
  canEdit = true,
  isLoading = false,
}: StudentProfileViewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "academics" | "attendance" | "fees" | "documents" | "more">("overview");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const [docs, setDocs] = useState<StudentDoc[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docCategory, setDocCategory] = useState("other");
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePrint = () => {
    window.print();
  };

  // Fetch full student details via REST API
  const { data: studentDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ["student-detail", student?.id],
    enabled: !!student?.id,
    queryFn: async () => {
      const res = await apiFetch(`/api/students/${student.id}`);
      if (!res.ok) throw new Error("Failed to load student details");
      return res.json();
    },
  });

  // Fetch transport routes to show the route name
  const { data: routesData } = useQuery({
    queryKey: ["transport-routes-min"],
    queryFn: async () => {
      try {
        const res = await apiFetch("/api/transport-routes?mode=min");
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error("Failed to fetch transport routes:", err);
        return [];
      }
    },
  });

  const routes = Array.isArray(routesData) ? routesData : [];

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "–";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const calculateAge = (dateStr: string | null | undefined) => {
    if (!dateStr) return "–";
    try {
      const birthDate = new Date(dateStr);
      if (isNaN(birthDate.getTime())) return "–";
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age > 0 ? `${age} years` : "–";
    } catch {
      return "–";
    }
  };

  const currentStudent = studentDetails || student;
  const transportRoute = studentDetails?.transport
    ? routes.find((r: any) => r?.id === studentDetails.transport.routeId)
    : null;

  const displayStudentId = currentStudent.username || currentStudent.rollNumber || "–";
  const displayRollNo = currentStudent.rollNumber || "–";

  const loadDocs = async () => {
    if (!currentStudent.id) { setDocs([]); return; }
    setDocsLoading(true);
    try {
      const res = await apiFetch("/api/students/documents?studentId=" + currentStudent.id);
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
  }, [activeTab, currentStudent.id]);

  const handleUploadDoc = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Document must be under 5MB"); return; }
    const reader = new FileReader();
    reader.onloadend = async () => {
      setUploading(true);
      try {
        const res = await apiFetch("/api/students/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId: currentStudent.id, name: file.name, category: docCategory, fileName: file.name, dataUrl: reader.result }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) { toast.error(data.error || "Failed to upload document"); return; }
        toast.success("Document uploaded and verified");
        await loadDocs();
      } catch { toast.error("Failed to upload document"); } finally { setUploading(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleDocStatus = async (id: string, status: string) => {
    try {
      const res = await apiFetch("/api/students/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) { toast.error("Failed to update document status"); return; }
      toast.success(status === "verified" ? "Document verified" : "Document rejected");
      await loadDocs();
    } catch { toast.error("Failed to update document status"); }
  };

  const handleDeleteDoc = async (id: string) => {
    try {
      const res = await apiFetch("/api/students/documents?id=" + id, { method: "DELETE" });
      if (!res.ok) { toast.error("Failed to remove document"); return; }
      toast.success("Document removed");
      await loadDocs();
    } catch { toast.error("Failed to remove document"); }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "academics", label: "Academics", icon: BookOpen },
    { id: "attendance", label: "Attendance", icon: CalendarDays },
    { id: "fees", label: "Fees", icon: CreditCard },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "more", label: "More", icon: MoreHorizontal },
  ] as const;

  if (isLoading || isDetailsLoading) {
    return (
      <div className="min-h-[460px] flex flex-col items-center justify-center py-16 px-4">
        <div className="w-full max-w-sm rounded-3xl bg-white border  p-8 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="relative w-40 h-28 mb-5 flex items-center justify-center">
            <Image
              src="/assets/admin/table.avif"
              alt="Loading student details"
              width={160}
              height={112}
              className="object-contain drop-shadow-sm"
              priority
            />
          </div>
          <div className="relative size-12 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-[3.5px] " />
            <div className="absolute inset-0 rounded-full border-[3.5px] border-emerald-600 dark:border-emerald-400 border-t-transparent border-r-transparent animate-spin" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            Loading Student Profile...
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Please wait a moment
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-6">
      {/* Top Breadcrumbs & Action Row matching TeacherProfileView */}
      <div className="flex items-center justify-between gap-3">
        {/* Back Button Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 sm:py-1.5 rounded-full bg-emerald-50/70 hover:bg-emerald-100/70 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-foreground border border-emerald-200/70 dark:border-emerald-800/60 transition-all shadow-xs"
          >
            <ChevronLeft className="size-4 text-foreground stroke-[2.5]" />
            <span className="text-xs sm:text-sm font-semibold tracking-tight">Back to Students</span>
          </button>

          <span className="hidden sm:inline-block text-xs text-muted-foreground font-medium">
            Students <span className="mx-1.5 text-muted-foreground">›</span> Student Profile
          </span>
        </div>

        {/* Actions Right */}
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button
              onClick={() => {
                if (editingSection === "all") {
                  setEditingSection(null);
                } else {
                  setActiveTab("overview");
                  setEditingSection("all");
                }
              }}
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

      {/* Main Profile Header Box with Teachertop/Table Graphic */}
      <div className="relative rounded-2xl border  bg-card p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="flex flex-row items-center gap-4 sm:gap-5 w-full">
            {/* Avatar Circle */}
            <div className="size-20 sm:size-24 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border-2  flex items-center justify-center text-emerald-800 dark:text-emerald-300 text-2xl sm:text-3xl font-bold shadow-xs shrink-0 overflow-hidden">
              {getInitials(currentStudent.name)}
            </div>

            {/* Profile Info Details */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight truncate">
                  {currentStudent.name}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  {currentStudent.status
                    ? currentStudent.status.charAt(0).toUpperCase() + currentStudent.status.slice(1)
                    : "Active"}
                </span>
              </div>

              {/* Class & Section Badge */}
              <div className="flex items-center gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60">
                  <GraduationCap className="size-3.5 text-emerald-600" />
                  {currentStudent.className || "Unassigned"}
                </span>
              </div>

              {/* ID and Roll No with Copy */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground font-medium pt-0.5">
                <div className="flex items-center gap-1.5">
                  <span>Student ID:</span>
                  <span className="font-semibold text-foreground font-mono">{displayStudentId}</span>
                  <CopyButton value={displayStudentId} toastSubject="Student ID" size="sm" />
                </div>

                <span className="hidden sm:inline text-muted-foreground">|</span>

                <div className="flex items-center gap-1.5">
                  <span>Roll No:</span>
                  <span className="font-semibold text-foreground font-mono">{displayRollNo}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Right Side Decorative Graphic Banner */}
          <div className="hidden lg:flex items-end justify-end gap-5 pr-2 self-end shrink-0">
            <div className="text-right italic text-xs text-muted-foreground max-w-[210px] pb-2 leading-relaxed">
              &ldquo;Learning today, leading tomorrow.&rdquo;
            </div>
            <div className="relative w-36 h-28 shrink-0 overflow-hidden">
              <Image
                src="/assets/admin/teachertop.avif"
                alt="Student Illustration"
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
                onClick={() => { setActiveTab(tab.id); setEditingSection(null); }}
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
        <StudentOverviewTab
          currentStudent={currentStudent}
          studentDetails={studentDetails}
          transportRoute={transportRoute}
          canEdit={canEdit}
          editingSection={editingSection}
          setEditingSection={setEditingSection}
          formatDate={formatDate}
          calculateAge={calculateAge}
        />
      ) : activeTab === "documents" ? (
        <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/70 mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Student Documents</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                ID proof, birth and transfer certificates. Admin uploads are verified instantly; family uploads await review.
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
                  {DOC_CATEGORIES.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
                </select>
                <label className="inline-flex items-center gap-2 h-9 px-3 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-accent transition-colors cursor-pointer">
                  {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                  {uploading ? "Uploading..." : "Upload"}
                  <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.txt" onChange={handleUploadDoc} className="hidden" disabled={uploading} />
                </label>
              </div>
            )}
          </div>

          {docsLoading ? (
            <div className="py-14 flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="size-4 animate-spin" /> Loading documents...
            </div>
          ) : docs.length === 0 ? (
            <div className="py-14 text-center">
              <FileText className="size-9 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm font-semibold text-foreground">No documents on record</p>
              <p className="text-xs text-muted-foreground mt-1">Upload ID proof and birth certificate to complete this profile.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {docs.map((doc) => (
                <div key={doc.id} className="p-4 rounded-xl border border-border bg-muted/40 hover:bg-muted/70 transition-colors flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/50">
                      <FileText className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{doc.name}</p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        <span>{formatDocSize(doc.size)}</span>
                        <span>•</span>
                        {doc.status === "verified" ? (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium"><CheckCircle2 className="size-3" /> Verified</span>
                        ) : doc.status === "rejected" ? (
                          <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium"><XCircle className="size-3" /> Rejected</span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium"><Clock className="size-3" /> Pending review</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {canEdit && doc.status === "pending" && (
                      <>
                        <button type="button" onClick={() => handleDocStatus(doc.id, "verified")} className="inline-flex items-center justify-center size-8 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer" title="Verify document"><CheckCircle2 className="size-4" /></button>
                        <button type="button" onClick={() => handleDocStatus(doc.id, "rejected")} className="inline-flex items-center justify-center size-8 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer" title="Reject document"><XCircle className="size-4" /></button>
                      </>
                    )}
                    <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="Open document"><Download className="size-4" /></a>
                    {canEdit && (
                      <button type="button" onClick={() => handleDeleteDoc(doc.id)} className="inline-flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer" title="Remove document"><Trash2 className="size-4" /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="py-20 text-center text-muted-foreground bg-card rounded-2xl border ">
          <Building2 className="size-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">No records found for {activeTab}</p>
        </div>
      )}
    </div>
  );
}
