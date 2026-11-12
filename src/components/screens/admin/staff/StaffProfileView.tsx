"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft, Printer, Pencil, MoreVertical,
  User, Phone, Mail, Briefcase, Calendar,
  Building2, FileText, StickyNote, Droplets, Users, Globe, Star,
  CreditCard, ShieldCheck, CheckCircle2, XCircle, Clock, Upload, Download, Trash2, Loader2, Shield,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { ProfileSection } from "@/components/ui/profile-section";
import { useQueryClient } from "@tanstack/react-query";
import type { StaffMember, CustomRole } from "./types";
import { getInitials } from "./utils";

interface StaffDocumentInfo {
  id: string;
  staffId: string;
  name: string;
  category: string;
  fileUrl: string;
  size: number;
  status: string;
  verifiedAt: string | null;
  createdAt: string;
}

interface StaffProfileViewProps {
  member: StaffMember;
  roles?: CustomRole[];
  onBack: () => void;
  canEdit?: boolean;
  onEditModal?: (member: StaffMember) => void;
  currentSession?: string | null;
}

const EMPLOYMENT_LABELS: Record<string, string> = {
  "full-time": "Full-Time",
  "part-time": "Part-Time",
  contract: "Contract",
  intern: "Intern",
};

const DOC_CATEGORIES = [
  { value: "identity", label: "Identity Proof" },
  { value: "degree", label: "Degree Certificate" },
  { value: "appointment", label: "Appointment Letter" },
  { value: "experience", label: "Experience Certificate" },
  { value: "other", label: "Other" },
];

function fmtDate(value?: string | null) {
  if (!value || isNaN(new Date(value).getTime())) return "—";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return Math.max(1, Math.round(bytes / 1024)) + " KB";
}

function initFormData(m: StaffMember) {
  return {
    name: m.name || "",
    email: m.email || "",
    phone: m.phone || "",
    address: m.address || "",
    alternatePhone: m.alternatePhone || "",
    avatar: m.avatar || "",
    customRoleId: m.customRole?.id || "none",
    employeeId: m.employeeId || "",
    department: m.department || "",
    designation: m.designation || "",
    employmentType: m.employmentType || "full-time",
    joiningDate: m.joiningDate || "",
    status: m.status || (m.isActive ? "active" : "inactive"),
    dateOfBirth: m.dateOfBirth || "",
    gender: m.gender || "",
    bloodGroup: m.bloodGroup || "",
    maritalStatus: m.maritalStatus || "",
    nationality: m.nationality || "",
    religion: m.religion || "",
    panNumber: m.panNumber || "",
    aadhaarNumber: m.aadhaarNumber || "",
    pfEnabled: !!m.pfEnabled,
    esiEnabled: !!m.esiEnabled,
    ptEnabled: !!m.ptEnabled,
  };
}

export function StaffProfileView({
  member,
  roles = [],
  onBack,
  canEdit = true,
  onEditModal,
  currentSession = null,
}: StaffProfileViewProps) {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"overview" | "attendance" | "documents" | "notes">("overview");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    personal: false, contact: false, statutory: false, professional: false, role: false,
  });

  const [currentMember, setCurrentMember] = useState<StaffMember>(member);
  useEffect(() => { setCurrentMember(member); }, [member]);

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  const [formData, setFormData] = useState(initFormData(member));

  const [docs, setDocs] = useState<StaffDocumentInfo[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docCategory, setDocCategory] = useState("other");
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleCollapse = (sec: string) => setCollapsed((prev) => ({ ...prev, [sec]: !prev[sec] }));
  const isSectionEditing = (sec: string) => editingSection === sec || editingSection === "all";
  const dimmed = (sec: string) => editingSection !== null && editingSection !== "all" && editingSection !== sec;

  const startEdit = (section: string) => {
    setFormData(initFormData(currentMember));
    setEditingSection(section);
  };
  const cancelEdit = () => setEditingSection(null);

  const loadDocs = async () => {
    if (!currentMember.staffId) { setDocs([]); return; }
    setDocsLoading(true);
    try {
      const res = await apiFetch("/api/staff/documents?staffId=" + currentMember.staffId);
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
  }, [activeTab, currentMember.staffId]);

  const handleUploadDoc = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Document must be under 5MB"); return; }
    const reader = new FileReader();
    reader.onloadend = async () => {
      setUploading(true);
      try {
        const res = await apiFetch("/api/staff/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ staffId: currentMember.staffId, name: file.name, category: docCategory, fileName: file.name, dataUrl: reader.result }),
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
      const res = await apiFetch("/api/staff/documents", {
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
      const res = await apiFetch("/api/staff/documents?id=" + id, { method: "DELETE" });
      if (!res.ok) { toast.error("Failed to remove document"); return; }
      toast.success("Document removed");
      await loadDocs();
    } catch { toast.error("Failed to remove document"); }
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
      const payload = {
        id: currentMember.id,
        ...formData,
        customRoleId: formData.customRoleId === "none" ? null : formData.customRoleId,
      };
      const res = await apiFetch("/api/staff", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update " + title);
      }

      const matchingRole = roles.find((r) => r.id === formData.customRoleId);
      const updated: StaffMember = {
        ...currentMember,
        ...formData,
        avatar: formData.avatar || null,
        isActive: formData.status !== "inactive",
        customRole: matchingRole ? { id: matchingRole.id, name: matchingRole.name, color: matchingRole.color } : (formData.customRoleId === "none" ? null : currentMember.customRole),
      };
      setCurrentMember(updated);
      setEditingSection((now) => (now === "all" ? "all" : null));
      toast.success(title + " updated successfully");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to save changes");
    } finally {
      setSavingSection(null);
    }
  };

  const displayStaffId = currentMember.employeeId || (currentMember.id ? `STF${currentMember.id.slice(-4).toUpperCase()}` : "—");
  const displayRole = currentMember.designation || currentMember.customRole?.name || "Standard Staff";
  const displayDepartment = currentMember.department || "—";
  const initials = getInitials(currentMember.name);

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "attendance", label: "Attendance", icon: Calendar },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "notes", label: "Notes", icon: StickyNote },
  ] as const;

  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-6">
      {/* Breadcrumb Navigation Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 sm:py-1.5 rounded-full bg-emerald-50/70 hover:bg-emerald-100/70 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-foreground border border-emerald-200/70 dark:border-emerald-800/60 transition-all shadow-xs"
          >
            <ChevronLeft className="size-4 text-foreground stroke-[2.5]" />
            <span className="text-xs sm:text-sm font-semibold tracking-tight">Back to Staff</span>
          </button>
          <span className="hidden sm:inline-block text-xs text-muted-foreground font-medium">
            Staff <span className="mx-1.5 text-muted-foreground">›</span> Staff Profile
          </span>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button
              onClick={() => (editingSection === "all" ? cancelEdit() : startEdit("all"))}
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
            >
              {editingSection === "all" ? <CheckCircle2 className="size-3.5" /> : <Pencil className="size-3.5" />}
              {editingSection === "all" ? "Done" : "Edit Profile"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-foreground rounded-xl hover:bg-accent"
          >
            <Printer className="size-3.5" /> Print
          </Button>
          <button
            className="p-2.5 sm:p-2 rounded-xl border text-muted-foreground hover:bg-accent transition-colors shadow-xs"
            aria-label="More options"
          >
            <MoreVertical className="size-4" />
          </button>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="relative rounded-2xl border bg-card p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-4">
              <div className="size-16 sm:size-[72px] rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-200/60 flex items-center justify-center text-emerald-800 dark:text-emerald-300 text-xl sm:text-2xl font-bold shadow-xs shrink-0 overflow-hidden">
                {currentMember.avatar ? (
                  <img src={currentMember.avatar} alt={currentMember.name} className="size-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight truncate">{currentMember.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground border border-border/80">
                    <span className="font-mono text-muted-foreground/70">#</span>
                    {displayStaffId}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 border border-teal-200/80 dark:border-teal-800/80">
                    <Shield className="size-3" />
                    {currentMember.customRole?.name || "Staff"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80">
                    <span className={`size-1.5 rounded-full ${currentMember.isActive ? "bg-emerald-500" : "bg-zinc-400"}`} />
                    {currentMember.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Session: {currentSession || "—"}</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-end justify-end gap-5 pr-2 self-end shrink-0">
            <p className="text-right italic text-xs text-muted-foreground max-w-[210px] pb-2 leading-relaxed">
              Dedicated service, driving institutional excellence.
            </p>
            <div className="relative w-36 h-28 shrink-0 overflow-hidden">
              <Image src="/assets/admin/table.avif" alt="Staff Illustration" fill className="object-contain object-bottom-right opacity-90" priority />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-card rounded-xl border px-2 py-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max sm:min-w-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all ${
                  isActive ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30" : "text-muted-foreground hover:bg-accent hover:text-foreground dark:hover:text-muted-foreground"
                }`}
              >
                <Icon className={`size-4 shrink-0 ${isActive ? "text-white stroke-[2.2]" : "text-muted-foreground stroke-[1.8]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Card 1: Personal Information */}
          <ProfileSection
            icon={User}
            title="Personal Information"
            editing={isSectionEditing("personal")}
            collapsed={collapsed.personal}
            saving={savingSection === "personal"}
            canEdit={canEdit}
            dimmed={dimmed("personal")}
            onEdit={() => startEdit("personal")}
            onCancel={cancelEdit}
            onSave={() => saveSection("personal", "Personal Information")}
            onToggleCollapse={() => toggleCollapse("personal")}
            view={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
                <div>
                  <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Full Name</p>
                  <p data-travel="name" className="text-sm font-semibold text-foreground truncate">{currentMember.name}</p>
                </div>
                <div>
                  <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Date of Birth</p>
                  <p data-travel="dateOfBirth" className="text-sm font-semibold text-foreground">{fmtDate(currentMember.dateOfBirth)}</p>
                </div>
                <div>
                  <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Gender</p>
                  <p data-travel="gender" className="text-sm font-semibold text-foreground capitalize">{currentMember.gender || "—"}</p>
                </div>
                <div>
                  <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Blood Group</p>
                  <p data-travel="bloodGroup" className="text-sm font-semibold text-foreground">{currentMember.bloodGroup || "—"}</p>
                </div>
                <div>
                  <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Marital Status</p>
                  <p data-travel="maritalStatus" className="text-sm font-semibold text-foreground capitalize">{currentMember.maritalStatus || "—"}</p>
                </div>
                <div>
                  <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Nationality</p>
                  <p data-travel="nationality" className="text-sm font-semibold text-foreground">{currentMember.nationality || "—"}</p>
                </div>
                <div>
                  <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Religion</p>
                  <p data-travel="religion" className="text-sm font-semibold text-foreground">{currentMember.religion || "—"}</p>
                </div>
              </div>
            }
            form={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label data-fade className="text-xs font-semibold text-foreground">Full Name <span className="text-red-500">*</span></Label>
                  <Input data-travel="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Staff Name" className="h-9 text-xs rounded-xl bg-muted" />
                </div>
                <div className="space-y-1.5">
                  <Label data-fade className="text-xs font-semibold text-foreground">Date of Birth</Label>
                  <div data-travel="dateOfBirth">
                    <DatePicker
                      date={formData.dateOfBirth && !isNaN(new Date(formData.dateOfBirth).getTime()) ? new Date(formData.dateOfBirth) : undefined}
                      onChange={(d) => setFormData({ ...formData, dateOfBirth: d ? d.toISOString().split("T")[0] : "" })}
                      placeholder="Pick date of birth"
                      className="w-full h-9 text-xs rounded-xl bg-muted"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label data-fade className="text-xs font-semibold text-foreground">Gender</Label>
                  <div data-travel="gender">
                    <Select value={formData.gender || undefined} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                      <SelectTrigger className="h-9 text-xs rounded-xl bg-muted"><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label data-fade className="text-xs font-semibold text-foreground">Blood Group</Label>
                  <div data-travel="bloodGroup">
                    <Select value={formData.bloodGroup || undefined} onValueChange={(v) => setFormData({ ...formData, bloodGroup: v })}>
                      <SelectTrigger className="h-9 text-xs rounded-xl bg-muted"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label data-fade className="text-xs font-semibold text-foreground">Marital Status</Label>
                  <div data-travel="maritalStatus">
                    <Select value={formData.maritalStatus || undefined} onValueChange={(v) => setFormData({ ...formData, maritalStatus: v })}>
                      <SelectTrigger className="h-9 text-xs rounded-xl bg-muted"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label data-fade className="text-xs font-semibold text-foreground">Nationality</Label>
                  <Input data-travel="nationality" value={formData.nationality} onChange={(e) => setFormData({ ...formData, nationality: e.target.value })} placeholder="e.g. Indian" className="h-9 text-xs rounded-xl bg-muted" />
                </div>
                <div className="space-y-1.5">
                  <Label data-fade className="text-xs font-semibold text-foreground">Religion</Label>
                  <div data-travel="religion">
                    <Select value={formData.religion || undefined} onValueChange={(v) => setFormData({ ...formData, religion: v })}>
                      <SelectTrigger className="h-9 text-xs rounded-xl bg-muted"><SelectValue placeholder="Select religion" /></SelectTrigger>
                      <SelectContent>
                        {["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Parsi", "Jewish", "Other"].map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            }
          />

          {/* Card 2: Contact Information */}
          <ProfileSection
            icon={Phone}
            title="Contact Information"
            editing={isSectionEditing("contact")}
            collapsed={collapsed.contact}
            saving={savingSection === "contact"}
            canEdit={canEdit}
            dimmed={dimmed("contact")}
            onEdit={() => startEdit("contact")}
            onCancel={cancelEdit}
            onSave={() => saveSection("contact", "Contact Information")}
            onToggleCollapse={() => toggleCollapse("contact")}
            view={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
                <div>
                  <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Email Address</p>
                  <p data-travel="email" className="text-sm font-semibold text-foreground truncate">{currentMember.email}</p>
                </div>
                <div>
                  <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Phone Number</p>
                  <p data-travel="phone" className="text-sm font-semibold text-foreground truncate">{currentMember.phone || "—"}</p>
                </div>
                <div>
                  <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Alternate Phone</p>
                  <p data-travel="alternatePhone" className="text-sm font-semibold text-foreground truncate">{currentMember.alternatePhone || "—"}</p>
                </div>
                <div className="lg:col-span-3">
                  <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Residential Address</p>
                  <p data-travel="address" className="text-sm font-semibold text-foreground">{currentMember.address || "—"}</p>
                </div>
              </div>
            }
            form={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label data-fade className="text-xs font-semibold text-foreground">Email Address <span className="text-red-500">*</span></Label>
                  <Input data-travel="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="staff@school.com" className="h-9 text-xs rounded-xl bg-muted" />
                </div>
                <div className="space-y-1.5">
                  <Label data-fade className="text-xs font-semibold text-foreground">Phone Number</Label>
                  <Input data-travel="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Enter phone number" className="h-9 text-xs rounded-xl bg-muted" />
                </div>
                <div className="space-y-1.5">
                  <Label data-fade className="text-xs font-semibold text-foreground">Alternate Phone</Label>
                  <Input data-travel="alternatePhone" type="tel" value={formData.alternatePhone} onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })} placeholder="Optional" className="h-9 text-xs rounded-xl bg-muted" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label data-fade className="text-xs font-semibold text-foreground">Residential Address</Label>
                  <Input data-travel="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="City, State / Full Address" className="h-9 text-xs rounded-xl bg-muted" />
                </div>
                <div className="space-y-1.5" data-fade>
                  <Label className="text-xs font-semibold text-foreground">Staff Photo</Label>
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                      {formData.avatar ? <img src={formData.avatar} alt="" className="size-full object-cover" /> : getInitials(formData.name)}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0]; e.target.value = "";
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) { toast.error("Photo must be under 2MB"); return; }
                      const reader = new FileReader();
                      reader.onloadend = () => { setFormData({ ...formData, avatar: reader.result as string }); toast.success("Photo attached — save to apply"); };
                      reader.readAsDataURL(file);
                    }} className="hidden" />
                    <Button type="button" variant="outline" size="sm" className="h-9 px-3 text-xs rounded-xl font-medium gap-1.5 hover:bg-muted" onClick={() => fileRef.current?.click()}>
                      <Upload className="size-3.5" /> Upload Photo
                    </Button>
                  </div>
                </div>
              </div>
            }
          />

          {/* Card 3: Statutory Information */}
          <ProfileSection
            icon={ShieldCheck}
            title="Statutory Information"
            editing={isSectionEditing("statutory")}
            collapsed={collapsed.statutory}
            saving={savingSection === "statutory"}
            canEdit={canEdit}
            dimmed={dimmed("statutory")}
            onEdit={() => startEdit("statutory")}
            onCancel={cancelEdit}
            onSave={() => saveSection("statutory", "Statutory Information")}
            onToggleCollapse={() => toggleCollapse("statutory")}
            view={
              <div className="space-y-4">
                <div data-fade className="flex flex-wrap items-center gap-2.5">
                  {([["PF", currentMember.pfEnabled], ["ESI", currentMember.esiEnabled], ["PT", currentMember.ptEnabled]] as const).map(([label, enabled]) => (
                    <span key={label} className={"inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border " + (enabled ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-800/60" : "bg-muted text-muted-foreground border-border")}>
                      {enabled ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
                      {label} {enabled ? "Enabled" : "Disabled"}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                  <div>
                    <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">PAN Number</p>
                    <p data-travel="panNumber" className="text-sm font-semibold text-foreground font-mono">{currentMember.panNumber || "—"}</p>
                  </div>
                  <div>
                    <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Aadhaar Number</p>
                    <p data-travel="aadhaarNumber" className="text-sm font-semibold text-foreground font-mono">{currentMember.aadhaarNumber || "—"}</p>
                  </div>
                </div>
              </div>
            }
            form={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label data-fade className="text-xs font-semibold text-foreground">PAN Number</Label>
                  <Input data-travel="panNumber" value={formData.panNumber} onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })} placeholder="ABCDE1234F" maxLength={10} className="h-9 text-xs rounded-xl bg-muted font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label data-fade className="text-xs font-semibold text-foreground">Aadhaar Number</Label>
                  <Input data-travel="aadhaarNumber" value={formData.aadhaarNumber} onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value.replace(/[^0-9]/g, "").slice(0, 12) })} placeholder="12-digit number" inputMode="numeric" className="h-9 text-xs rounded-xl bg-muted font-mono" />
                </div>
                <div className="space-y-1.5" data-fade>
                  <Label className="text-xs font-semibold text-foreground">Statutory Registrations</Label>
                  <div className="flex items-center gap-4 h-9">
                    {([["pfEnabled", "PF"], ["esiEnabled", "ESI"], ["ptEnabled", "PT"]] as const).map(([key, label]) => (
                      <label key={key} className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground cursor-pointer">
                        <input type="checkbox" checked={!!formData[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })} className="size-3.5 rounded accent-emerald-600 cursor-pointer" />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            }
          />

          {/* Card 4: Professional Information */}
          <ProfileSection
            icon={Briefcase}
            title="Professional Information"
            editing={isSectionEditing("professional")}
            collapsed={collapsed.professional}
            saving={savingSection === "professional"}
            canEdit={canEdit}
            dimmed={dimmed("professional")}
            onEdit={() => startEdit("professional")}
            onCancel={cancelEdit}
            onSave={() => saveSection("professional", "Professional Information")}
            onToggleCollapse={() => toggleCollapse("professional")}
            view={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
                <div>
                  <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Employee ID</p>
                  <p data-travel="employeeId" className="text-sm font-semibold text-foreground font-mono">{currentMember.employeeId || "—"}</p>
                </div>
                <div>
                  <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Department</p>
                  <p data-travel="department" className="text-sm font-semibold text-foreground">{currentMember.department || "—"}</p>
                </div>
                <div>
                  <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Designation</p>
                  <p data-travel="designation" className="text-sm font-semibold text-foreground">{currentMember.designation || "—"}</p>
                </div>
                <div>
                  <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Employment Type</p>
                  <p data-travel="employmentType" className="text-sm font-semibold text-foreground">{EMPLOYMENT_LABELS[currentMember.employmentType || ""] || currentMember.employmentType || "—"}</p>
                </div>
                <div>
                  <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Date of Joining</p>
                  <p data-travel="joiningDate" className="text-sm font-semibold text-foreground">{fmtDate(currentMember.joiningDate)}</p>
                </div>
                <div>
                  <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Status</p>
                  <div data-travel="status" className="mt-0.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      {(currentMember.status || "active").charAt(0).toUpperCase() + (currentMember.status || "active").slice(1).replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>
            }
            form={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label data-fade className="text-xs font-semibold text-foreground">Employee ID</Label>
                  <Input data-travel="employeeId" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} placeholder="Auto-generate if empty" className="h-9 text-xs rounded-xl bg-muted font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label data-fade className="text-xs font-semibold text-foreground">Department</Label>
                  <Input data-travel="department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="e.g. Administration" className="h-9 text-xs rounded-xl bg-muted" />
                </div>
                <div className="space-y-1.5">
                  <Label data-fade className="text-xs font-semibold text-foreground">Designation</Label>
                  <Input data-travel="designation" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} placeholder="e.g. Office Administrator" className="h-9 text-xs rounded-xl bg-muted" />
                </div>
                <div className="space-y-1.5">
                  <Label data-fade className="text-xs font-semibold text-foreground">Employment Type</Label>
                  <div data-travel="employmentType">
                    <Select value={formData.employmentType || "full-time"} onValueChange={(v) => setFormData({ ...formData, employmentType: v })}>
                      <SelectTrigger className="h-9 text-xs rounded-xl bg-muted"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-Time</SelectItem>
                        <SelectItem value="part-time">Part-Time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="intern">Intern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label data-fade className="text-xs font-semibold text-foreground">Date of Joining</Label>
                  <div data-travel="joiningDate">
                    <DatePicker
                      date={formData.joiningDate && !isNaN(new Date(formData.joiningDate).getTime()) ? new Date(formData.joiningDate) : undefined}
                      onChange={(d) => setFormData({ ...formData, joiningDate: d ? d.toISOString().split("T")[0] : "" })}
                      placeholder="Pick date of joining"
                      className="w-full h-9 text-xs rounded-xl bg-muted"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label data-fade className="text-xs font-semibold text-foreground">Status</Label>
                  <div data-travel="status">
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                      <SelectTrigger className="h-9 text-xs rounded-xl bg-muted"><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            }
          />

          {/* Card 5: Role & Permissions */}
          <ProfileSection
            icon={Shield}
            title="Role & Permissions"
            editing={isSectionEditing("role")}
            collapsed={collapsed.role}
            saving={savingSection === "role"}
            canEdit={canEdit}
            dimmed={dimmed("role")}
            onEdit={() => startEdit("role")}
            onCancel={cancelEdit}
            onSave={() => saveSection("role", "Role & Permissions")}
            onToggleCollapse={() => toggleCollapse("role")}
            view={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
                <div>
                  <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Assigned Role</p>
                  <p data-travel="role" className="text-sm font-semibold text-foreground">{currentMember.customRole?.name || "Standard Staff"}</p>
                </div>
                <div>
                  <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Access Level</p>
                  <p className="text-sm font-semibold text-foreground">{currentMember.role === "admin" ? "Administrator" : "Staff Portal"}</p>
                </div>
              </div>
            }
            form={
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label data-fade className="text-xs font-semibold text-foreground">Assigned Role</Label>
                  <div data-travel="role">
                    <Select value={formData.customRoleId} onValueChange={(v) => setFormData({ ...formData, customRoleId: v })}>
                      <SelectTrigger className="h-9 text-xs rounded-xl bg-muted"><SelectValue placeholder="Select role" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Standard Staff</SelectItem>
                        {roles.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            <div className="flex items-center gap-2">
                              <span className="size-2 rounded-full" style={{ backgroundColor: r.color }} />
                              {r.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            }
          />
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === "attendance" && (
        <div className="py-20 text-center text-muted-foreground bg-card rounded-2xl border">
          <Calendar className="size-10 mx-auto mb-2 opacity-30 text-emerald-600" />
          <p className="text-sm font-medium text-muted-foreground">Attendance records for {currentMember.name}</p>
          <p className="text-xs text-muted-foreground mt-1">Check staff attendance overview from the main attendance module.</p>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === "documents" && (
        <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/70 mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Staff Documents</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                ID proof and certificates on record. Admin uploads are verified instantly; staff uploads await review.
              </p>
            </div>
            {canEdit && currentMember.staffId && (
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

          {!currentMember.staffId ? (
            <div className="py-14 text-center">
              <FileText className="size-9 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm font-semibold text-foreground">No staff profile record yet</p>
              <p className="text-xs text-muted-foreground mt-1">Save this profile once to create the record, then manage documents.</p>
            </div>
          ) : docsLoading ? (
            <div className="py-14 flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="size-4 animate-spin" /> Loading documents...
            </div>
          ) : docs.length === 0 ? (
            <div className="py-14 text-center">
              <FileText className="size-9 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm font-semibold text-foreground">No documents on record</p>
              <p className="text-xs text-muted-foreground mt-1">Upload ID proof and appointment letter to complete this profile.</p>
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
      )}

      {/* Notes Tab */}
      {activeTab === "notes" && (
        <div className="py-20 text-center text-muted-foreground bg-card rounded-2xl border">
          <StickyNote className="size-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">No notes on record</p>
        </div>
      )}

      {/* Mobile Sticky Edit Button */}
      {canEdit && editingSection === null && activeTab === "overview" && (
        <div className="sm:hidden sticky bottom-4 z-10 pt-2">
          <Button onClick={() => startEdit("all")} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl py-3 gap-2 shadow-lg shadow-emerald-600/20">
            <Pencil className="size-4" /> Edit Profile
          </Button>
        </div>
      )}
    </div>
  );
}