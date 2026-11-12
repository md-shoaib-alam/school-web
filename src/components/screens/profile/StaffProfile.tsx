"use client";

import { useEffect, useRef, useState } from "react";
import {
  User,
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
  FileText,
  Building2,
  Pencil,
  CheckCircle2,
  Download,
  Upload,
  Clock,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppUser } from "@/store/use-app-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

interface StaffProfileProps {
  user: AppUser;
  initials: string;
  onEditClick: () => void;
  tenantName: string | null;
}

interface StaffDoc {
  id: string;
  name: string;
  category: string;
  fileUrl: string;
  size: number;
  status: string;
  verifiedAt: string | null;
  createdAt: string;
}

const DOC_CATEGORIES = [
  { value: "identity", label: "Identity Proof" },
  { value: "degree", label: "Degree Certificate" },
  { value: "appointment", label: "Appointment Letter" },
  { value: "experience", label: "Experience Certificate" },
  { value: "other", label: "Other" },
];

function formatLongDate(value?: string | null) {
  if (!value || isNaN(new Date(value).getTime())) return "—";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return Math.max(1, Math.round(bytes / 1024)) + " KB";
}

const EMPLOYMENT_LABELS: Record<string, string> = {
  "full-time": "Full-Time",
  "part-time": "Part-Time",
  contract: "Contract",
  intern: "Intern",
};

export function StaffProfile({
  user,
  initials,
  onEditClick,
  tenantName,
}: StaffProfileProps) {
  const [activeTab, setActiveTab] = useState<"personal" | "documents" | "employment">("personal");

  const sp = user.staffProfile;
  const empId = sp?.employeeId || "—";
  const department = sp?.department || "—";
  const dateOfBirth = formatLongDate(sp?.dateOfBirth);
  const gender = sp?.gender || "—";
  const bloodGroup = sp?.bloodGroup || "—";
  const maritalStatus = sp?.maritalStatus || "—";
  const nationality = sp?.nationality || "—";
  const religion = sp?.religion || "—";
  const phone = user.phone || "—";
  const email = user.email;
  const panNumber = sp?.panNumber || "—";
  const aadhaarNumber = sp?.aadhaarNumber || "—";
  const sessionYear = user.currentSession || "—";
  const status = sp?.status || "active";
  const roleLabel = user.customRole?.name || "Staff";

  const [docs, setDocs] = useState<StaffDoc[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docCategory, setDocCategory] = useState("other");
  const fileRef = useRef<HTMLInputElement>(null);

  const loadDocs = async () => {
    setDocsLoading(true);
    try {
      const res = await apiFetch("/api/auth/profile/documents");
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
  }, [activeTab]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const res = await apiFetch("/api/auth/profile/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
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
        toast.success("Document uploaded for verification");
        await loadDocs();
      } catch {
        toast.error("Failed to upload document");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteDoc = async (id: string) => {
    try {
      const res = await apiFetch("/api/auth/profile/documents?id=" + id, { method: "DELETE" });
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

  const statusBadge = status === "inactive"
    ? { cls: "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200/70 dark:border-red-800/60", label: "Inactive" }
    : status === "on_leave"
      ? { cls: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200/70 dark:border-amber-800/60", label: "On Leave" }
      : { cls: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-800/60", label: "Active" };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* ─── Header Section ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200/60 dark:border-teal-800/50 shadow-xs shrink-0">
            <User className="size-5.5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              My profile
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Your record as the school holds it
            </p>
          </div>
        </div>

        <Button
          onClick={onEditClick}
          variant="outline"
          size="sm"
          className="gap-2 rounded-xl text-xs font-semibold h-9 self-start sm:self-auto border-border hover:bg-accent shadow-xs"
        >
          <Pencil className="size-3.5" />
          Edit Profile
        </Button>
      </div>

      {/* ─── Navigation Tabs Bar ─── */}
      <div className="flex items-center gap-2">
        {([
          { id: "personal", label: "Personal", icon: User },
          { id: "documents", label: "Documents", icon: FileText },
          { id: "employment", label: "Employment", icon: Building2 },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer",
              activeTab === tab.id
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            <tab.icon className="size-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ─── Tab Content: Personal ─── */}
      {activeTab === "personal" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Main Identity Card */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group shrink-0">
              <div className="size-20 sm:size-24 rounded-2xl overflow-hidden border border-border/80 bg-muted flex items-center justify-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="size-full flex items-center justify-center text-xl sm:text-2xl font-bold text-teal-800 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-950/60">
                    {initials}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={onEditClick}
                className="absolute inset-0 rounded-2xl bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                title="Change Photo"
              >
                <Upload className="size-4" />
                <span className="text-[9px] font-bold mt-1 uppercase">Change</span>
              </button>
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                {user.name}
              </h2>

              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border/80">
                  <span className="font-mono text-muted-foreground/70">#</span>
                  {empId}
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200/70 dark:border-teal-800/60">
                  <ShieldCheck className="size-3" />
                  {roleLabel}
                </span>

                <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border", statusBadge.cls)}>
                  {statusBadge.label}
                </span>
              </div>

              <p className="text-xs text-muted-foreground pt-1">
                Session: {sessionYear}
              </p>
            </div>
          </div>

          {/* Section: Basic Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className="size-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                <User className="size-3.5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Basic Information
              </h3>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 gap-y-7">
                {([
                  { icon: Calendar, label: "DATE OF BIRTH", value: dateOfBirth },
                  { icon: User, label: "GENDER", value: gender, capitalize: true },
                  { icon: Droplets, label: "BLOOD GROUP", value: bloodGroup },
                  { icon: Users, label: "MARITAL STATUS", value: maritalStatus, capitalize: true },
                  { icon: Globe, label: "NATIONALITY", value: nationality },
                  { icon: Star, label: "RELIGION", value: religion },
                ] as const).map((field) => (
                  <div key={field.label} className="flex items-start gap-3">
                    <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
                      <field.icon className="size-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase block">
                        {field.label}
                      </span>
                      <span className={cn("text-sm font-semibold text-foreground mt-0.5 block", "capitalize" in field && field.capitalize && "capitalize")}>
                        {field.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Contact Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className="size-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                <Phone className="size-3.5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Contact Information
              </h3>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/50 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase block">
                      EMAIL
                    </span>
                    <a
                      href={"mailto:" + email}
                      className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline mt-0.5 block truncate"
                    >
                      {email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/50 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase block">
                      MOBILE
                    </span>
                    <a
                      href={"tel:" + phone}
                      className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline mt-0.5 block truncate"
                    >
                      {phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Statutory Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className="size-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                <Building2 className="size-3.5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Statutory Information
              </h3>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                {([
                  { label: "PF", enabled: sp?.pfEnabled },
                  { label: "ESI", enabled: sp?.esiEnabled },
                  { label: "PT", enabled: sp?.ptEnabled },
                ] as const).map((item) => (
                  <span
                    key={item.label}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
                      item.enabled
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-800/60"
                        : "bg-muted/80 text-muted-foreground border-border"
                    )}
                  >
                    {item.enabled ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
                    {item.label} {item.enabled ? "Enabled" : "Disabled"}
                  </span>
                ))}
              </div>

              <div className="border-t border-border/60" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
                    <CreditCard className="size-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase block">
                      PAN NUMBER
                    </span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block font-mono">
                      {panNumber}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase block">
                      AADHAAR NUMBER
                    </span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block font-mono">
                      {aadhaarNumber}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab Content: Documents ─── */}
      {activeTab === "documents" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/70 mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">My Documents</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Certificates and identification on record. Uploads go to the admin for verification.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="h-9 rounded-xl border border-border bg-muted px-2.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                  aria-label="Document category"
                >
                  {DOC_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.txt"
                  onChange={handleUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-xl text-xs font-semibold"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                  {uploading ? "Uploading..." : "Upload New"}
                </Button>
              </div>
            </div>

            {docsLoading ? (
              <div className="py-14 flex items-center justify-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="size-4 animate-spin" />
                Loading documents...
              </div>
            ) : docs.length === 0 ? (
              <div className="py-14 text-center">
                <FileText className="size-9 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm font-semibold text-foreground">No documents on record yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload your ID proof and appointment letter for verification.
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
                              Verified{doc.verifiedAt ? " on " + new Date(doc.verifiedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""}
                            </span>
                          ) : doc.status === "rejected" ? (
                            <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                              <XCircle className="size-3" />
                              Rejected — re-upload a clearer copy
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                              <Clock className="size-3" />
                              Pending verification
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        title="Open document"
                      >
                        <Download className="size-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="inline-flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Remove document"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Tab Content: Employment ─── */}
      {activeTab === "employment" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-6">
            <div className="border-b border-border/70 pb-4">
              <h3 className="text-base font-bold text-foreground">Employment Overview</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Designation, department, and contractual status at {tenantName || "the school"}.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Designation</span>
                <p className="text-sm font-semibold text-foreground">{sp?.designation || "—"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Department</span>
                <p className="text-sm font-semibold text-foreground">{department}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Employment Type</span>
                <p className="text-sm font-semibold text-foreground">{EMPLOYMENT_LABELS[sp?.employmentType || ""] || sp?.employmentType || "—"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Joining Date</span>
                <p className="text-sm font-semibold text-foreground">{formatLongDate(sp?.joiningDate)}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Academic Session</span>
                <p className="text-sm font-semibold text-foreground">{sessionYear}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Service Status</span>
                <p className={cn("text-sm font-semibold flex items-center gap-1.5", status === "inactive" ? "text-red-600 dark:text-red-400" : status === "on_leave" ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")}>
                  <span className={cn("size-2 rounded-full", status === "inactive" ? "bg-red-500" : status === "on_leave" ? "bg-amber-500" : "bg-emerald-500 animate-pulse")} />
                  {statusBadge.label}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Employee ID</span>
                <p className="text-sm font-semibold text-foreground font-mono">{empId}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}