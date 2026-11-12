"use client";

import { useState } from "react";
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
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AppUser } from "@/store/use-app-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TeacherProfileProps {
  user: AppUser;
  initials: string;
  onEditClick: () => void;
  tenantName: string | null;
}

export function TeacherProfile({
  user,
  initials,
  onEditClick,
  tenantName,
}: TeacherProfileProps) {
  const [activeTab, setActiveTab] = useState<"personal" | "documents" | "employment">("personal");

  // Derive display values or fallback to standard demo record values matching the reference
  const empId = (user as any).employeeId || (user as any).teacherId || `EMP2026${user.id?.slice(-4).padStart(4, "0") || "0115"}`;
  const department = user.customRole?.name || (user as any).department || "Administration";
  const dateOfBirth = (user as any).dateOfBirth || (user as any).dob || "7 March 1988";
  const gender = (user as any).gender || "Male";
  const bloodGroup = (user as any).bloodGroup || "—";
  const maritalStatus = (user as any).maritalStatus || "—";
  const nationality = (user as any).nationality || "Indian";
  const religion = (user as any).religion || "—";
  const phone = user.phone || "+916207142699";
  const email = user.email || "anil.agarwal.115@demo.inkwelly.com";
  const panNumber = (user as any).panNumber || (user as any).pan || "—";
  const aadhaarNumber = (user as any).aadhaarNumber || (user as any).aadhaar || "—";
  const sessionYear = "2026-27";

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
        <button
          type="button"
          onClick={() => setActiveTab("personal")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer",
            activeTab === "personal"
              ? "bg-card text-foreground shadow-xs border border-border"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
        >
          <User className="size-4" />
          <span>Personal</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("documents")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer",
            activeTab === "documents"
              ? "bg-card text-foreground shadow-xs border border-border"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
        >
          <FileText className="size-4" />
          <span>Documents</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("employment")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer",
            activeTab === "employment"
              ? "bg-card text-foreground shadow-xs border border-border"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
        >
          <Building2 className="size-4" />
          <span>Employment</span>
        </button>
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
                  <Building2 className="size-3" />
                  {department}
                </span>

                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60">
                  Active
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
                {/* DATE OF BIRTH */}
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
                    <Calendar className="size-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase block">
                      DATE OF BIRTH
                    </span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block">
                      {dateOfBirth}
                    </span>
                  </div>
                </div>

                {/* GENDER */}
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
                    <User className="size-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase block">
                      GENDER
                    </span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block capitalize">
                      {gender}
                    </span>
                  </div>
                </div>

                {/* BLOOD GROUP */}
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
                    <Droplets className="size-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase block">
                      BLOOD GROUP
                    </span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block">
                      {bloodGroup}
                    </span>
                  </div>
                </div>

                {/* MARITAL STATUS */}
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
                    <Users className="size-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase block">
                      MARITAL STATUS
                    </span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block">
                      {maritalStatus}
                    </span>
                  </div>
                </div>

                {/* NATIONALITY */}
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
                    <Globe className="size-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase block">
                      NATIONALITY
                    </span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block">
                      {nationality}
                    </span>
                  </div>
                </div>

                {/* RELIGION */}
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
                    <Star className="size-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase block">
                      RELIGION
                    </span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block">
                      {religion}
                    </span>
                  </div>
                </div>
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
                {/* EMAIL */}
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/50 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase block">
                      EMAIL
                    </span>
                    <a
                      href={`mailto:${email}`}
                      className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline mt-0.5 block truncate"
                    >
                      {email}
                    </a>
                  </div>
                </div>

                {/* MOBILE */}
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/50 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase block">
                      MOBILE
                    </span>
                    <a
                      href={`tel:${phone}`}
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
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted/80 text-muted-foreground border border-border">
                  <XCircle className="size-3.5 text-muted-foreground" />
                  PF Disabled
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted/80 text-muted-foreground border border-border">
                  <XCircle className="size-3.5 text-muted-foreground" />
                  ESI Disabled
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted/80 text-muted-foreground border border-border">
                  <XCircle className="size-3.5 text-muted-foreground" />
                  PT Disabled
                </span>
              </div>

              <div className="border-t border-border/60" />

              {/* PAN & AADHAAR */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
                    <CreditCard className="size-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase block">
                      PAN NUMBER
                    </span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block">
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
                    <span className="text-sm font-semibold text-foreground mt-0.5 block">
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
            <div className="flex items-center justify-between pb-4 border-b border-border/70 mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Verified Documents</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Official certificates and identification documents on record.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl text-xs font-semibold"
                onClick={() => toast.info("Document upload request submitted to admin")}
              >
                <Upload className="size-3.5" />
                Upload New
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: "Government Identity Proof (Aadhaar / Passport)", size: "1.8 MB", date: "Verified on 12 Aug 2024", verified: true },
                { name: "Educational Degree Certificates (M.Sc, B.Ed)", size: "3.4 MB", date: "Verified on 12 Aug 2024", verified: true },
                { name: "Teacher Appointment Letter", size: "1.2 MB", date: "Issued on 10 Aug 2024", verified: true },
                { name: "Prior Experience & Relieving Certificates", size: "2.1 MB", date: "Verified on 12 Aug 2024", verified: true },
              ].map((doc, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-border bg-muted/40 hover:bg-muted/70 transition-colors flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-200/50">
                      <FileText className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="size-3" />
                          {doc.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-lg shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={() => toast.success("Downloading document preview...")}
                  >
                    <Download className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
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
                <p className="text-sm font-semibold text-foreground">{user.customRole?.name || "Senior Faculty Member"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Department</span>
                <p className="text-sm font-semibold text-foreground">{department}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Employment Type</span>
                <p className="text-sm font-semibold text-foreground">Full-Time / Permanent</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Joining Date</span>
                <p className="text-sm font-semibold text-foreground">12 August 2024</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Academic Session</span>
                <p className="text-sm font-semibold text-foreground">{sessionYear}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Service Status</span>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active / Good Standing
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

