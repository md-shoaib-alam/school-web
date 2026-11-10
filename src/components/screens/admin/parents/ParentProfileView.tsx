"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
import { DatePicker } from "@/components/ui/date-picker";
import {
  ChevronLeft, Printer, Pencil, MoreVertical,
  User, Users, Phone, Mail, Briefcase,
  Link as LinkIcon, Copy, Check, GraduationCap,
  CreditCard, FileText, StickyNote, MoreHorizontal,
  Building2, ChevronUp, ChevronDown, Eye, EyeOff, Lock,
  Loader2, Upload, MapPin, Unlink2
} from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/clipboard";
import api from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/graphql/keys";
import { ParentInfo, getInitials } from "./types";

interface ParentProfileViewProps {
  parent: ParentInfo;
  onBack: () => void;
  canEdit?: boolean;
  onEdit?: (parent: ParentInfo) => void;
  onLinkChild?: (parent: ParentInfo) => void;
  onUnlinkChild?: (parentId: string, studentId: string) => void;
}

export function ParentProfileView({
  parent,
  onBack,
  canEdit = true,
  onEdit,
  onLinkChild,
  onUnlinkChild,
}: ParentProfileViewProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"overview"|"children"|"fees"|"documents"|"notes"|"more">("overview");
  const [copiedField, setCopiedField] = useState<string|null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [collapsed, setCollapsed] = useState({ personal: false, account: false, children: false });

  // Local live state of the parent profile
  const [currentParent, setCurrentParent] = useState<ParentInfo>(parent);

  useEffect(() => {
    setCurrentParent(parent);
  }, [parent]);

  // Keep children reactive to both incoming parent prop and local updates
  const currentChildren = parent?.children ?? currentParent?.children ?? [];

  // Track which section is in independent edit mode
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  // Form Data for inline editing
  const [formData, setFormData] = useState({
    name: parent.name || "",
    email: parent.email || "",
    phone: parent.phone || "",
    alternatePhone: parent.alternatePhone || "",
    occupation: parent.occupation || "",
    address: parent.address || "",
    gender: parent.gender || "male",
    dateOfBirth: parent.dateOfBirth || "",
  });

  const handleCopy = (text: string, label: string) => {
    copyToClipboard(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success(`${label} copied to clipboard`);
  };

  const toggleCollapse = (key: keyof typeof collapsed) =>
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  const startEdit = (section: string) => {
    setFormData({
      name: currentParent.name || "",
      email: currentParent.email || "",
      phone: currentParent.phone || "",
      alternatePhone: currentParent.alternatePhone || "",
      occupation: currentParent.occupation || "",
      address: currentParent.address || "",
      gender: currentParent.gender || "male",
      dateOfBirth: currentParent.dateOfBirth || "",
    });
    setEditingSection(section);
  };

  const cancelEdit = () => {
    setEditingSection(null);
  };

  const saveSection = async (sectionName: string, title: string) => {
    if (sectionName === "personal") {
      if (!formData.name.trim() || !formData.phone.trim()) {
        toast.error("Full Name and Phone Number are required");
        return;
      }
      if (formData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          toast.error("Please enter a valid email address");
          return;
        }
      }
    }

    setSavingSection(sectionName);
    try {
      const payload: any = {
        id: currentParent.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        occupation: formData.occupation,
        address: formData.address,
      };

      await api.put("/parents", payload);

      const updated: ParentInfo = {
        ...currentParent,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        alternatePhone: formData.alternatePhone,
        occupation: formData.occupation,
        address: formData.address,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
      };

      setCurrentParent(updated);
      setEditingSection(null);
      toast.success(`${title} updated successfully`);

      queryClient.invalidateQueries({ queryKey: queryKeys.parents });
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || "Failed to save changes");
    } finally {
      setSavingSection(null);
    }
  };

  const displayId = currentParent.username || currentParent.id?.slice(-6).toUpperCase() || "—";

  const tabs = [
    { id: "overview",  label: "Overview",       icon: User },
    { id: "children",  label: "Children",        icon: Users },
    { id: "fees",      label: "Fees & Payments", icon: CreditCard },
    { id: "documents", label: "Documents",       icon: FileText },
    { id: "notes",     label: "Notes",           icon: StickyNote },
    { id: "more",      label: "More",            icon: MoreHorizontal },
  ] as const;

  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-6">

      {/* Breadcrumb */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="inline-flex items-center gap-2 px-3.5 py-2 sm:py-1.5 rounded-full bg-emerald-50/70 hover:bg-emerald-100/70 dark:hover:bg-zinc-700 text-foreground border border-emerald-100 transition-all shadow-xs">
            <ChevronLeft className="size-4 text-foreground stroke-[2.5]" />
            <span className="text-xs sm:text-sm font-semibold tracking-tight">Back to Parents</span>
          </button>
          <span className="hidden sm:inline-block text-xs text-muted-foreground font-medium">
            Parents <span className="mx-1.5 text-muted-foreground">›</span> Parent Profile
          </span>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button
              onClick={() => startEdit("personal")}
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
            >
              <Pencil className="size-3.5" /> Edit Profile
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => window.print()} className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-foreground  rounded-xl hover:bg-accent">
            <Printer className="size-3.5" /> Print
          </Button>
          <button className="p-2.5 sm:p-2 rounded-xl border  text-muted-foreground hover:bg-accent transition-colors shadow-xs" aria-label="More options">
            <MoreVertical className="size-4" />
          </button>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="relative rounded-2xl border  bg-card p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-4">
              <div className="size-16 sm:size-[72px] rounded-full bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-200/60 flex items-center justify-center text-emerald-800 dark:text-emerald-300 text-xl sm:text-2xl font-bold shadow-xs shrink-0">
                {getInitials(currentParent.name)}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight truncate">{currentParent.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80">Parent / Guardian</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80">
                    <span className="size-1.5 rounded-full bg-emerald-500" />Active
                  </span>
                </div>
              </div>
            </div>

            {/* Horizontal info row */}
            <div className="flex flex-wrap items-start gap-x-6 gap-y-3 pt-1 mt-1 border-t ">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-muted"><User className="size-3.5 text-emerald-600 dark:text-emerald-400" /></div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium leading-none mb-0.5">Parent Login ID</p>
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-foreground font-mono">{displayId}</p>
                    <button onClick={() => handleCopy(displayId, "Login ID")} className="text-muted-foreground hover:text-emerald-600 transition-colors">
                      {copiedField === "Login ID" ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-muted"><Mail className="size-3.5 text-emerald-600 dark:text-emerald-400" /></div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium leading-none mb-0.5">Email Address</p>
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-foreground break-all">{currentParent.email}</p>
                    <button onClick={() => handleCopy(currentParent.email, "Email")} className="text-muted-foreground hover:text-emerald-600 transition-colors shrink-0">
                      {copiedField === "Email" ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                    </button>
                  </div>
                </div>
              </div>
              {currentParent.phone && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-muted"><Phone className="size-3.5 text-emerald-600 dark:text-emerald-400" /></div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium leading-none mb-0.5">Phone Number</p>
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-bold text-foreground">{currentParent.phone}</p>
                      <button onClick={() => handleCopy(currentParent.phone!, "Phone")} className="text-muted-foreground hover:text-emerald-600 transition-colors">
                        {copiedField === "Phone" ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Illustration */}
          <div className="hidden lg:flex flex-col items-end justify-end gap-2 shrink-0 self-end">
            <p className="text-right text-xs text-muted-foreground italic font-medium leading-snug max-w-[130px]">Together for a Brighter Tomorrow</p>
            <div className="relative w-40 h-28 shrink-0">
              <Image src="/assets/admin/parenttop.avif" alt="Parent Illustration" fill className="object-contain object-bottom-right" priority />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-card rounded-xl border  px-2 py-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max sm:min-w-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all ${isActive ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30" : "text-muted-foreground hover:bg-accent hover:text-foreground dark:hover:text-muted-foreground"}`}>
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

          {/* Personal & Contact Information Card */}
          <div className="bg-card rounded-2xl border  shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b ">
              <div className="flex items-center gap-2.5">
                <User className="size-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-bold text-foreground">Personal &amp; Contact Information</h2>
              </div>

              <div className="flex items-center gap-2">
                {editingSection === "personal" ? (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEdit}
                      disabled={savingSection === "personal"}
                      className="h-8 px-3 text-xs rounded-lg font-medium text-foreground  hover:bg-accent"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => saveSection("personal", "Personal & Contact Information")}
                      disabled={savingSection === "personal"}
                      className="h-8 px-3 text-xs rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
                    >
                      {savingSection === "personal" ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3.5" />}
                      Save
                    </Button>
                  </div>
                ) : (
                  canEdit && (
                    <button
                      onClick={() => startEdit("personal")}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground px-3 py-1.5 rounded-lg border  hover:bg-accent transition-colors"
                    >
                      <Pencil className="size-3" /> Edit
                    </button>
                  )
                )}

                <button
                  onClick={() => toggleCollapse("personal")}
                  className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground ml-1"
                  aria-label="Toggle collapse"
                >
                  {collapsed.personal ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
                </button>
              </div>
            </div>

            {!collapsed.personal && (
              editingSection === "personal" ? (
                /* INLINE EDIT FORM - Matches Teacher Form */
                <div className="px-5 sm:px-6 py-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Parent Name"
                        className="h-9 text-xs rounded-xl bg-muted "
                      />
                    </div>

                    {/* Email Address */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="parent@school.com"
                        className="h-9 text-xs rounded-xl bg-muted "
                      />
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
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Enter phone number"
                          className="w-full h-9 px-3 text-xs bg-transparent focus:outline-none text-foreground"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-semibold text-foreground">
                        Address
                      </Label>
                      <Input
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="City, State / Full Address"
                        className="h-9 text-xs rounded-xl bg-muted "
                      />
                    </div>

                    {/* Photo Upload */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">Parent Photo</Label>
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                          {getInitials(formData.name)}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-9 px-3 text-xs rounded-xl  font-medium gap-1.5 hover:bg-muted"
                          onClick={() => toast.info("Photo upload will be saved with profile")}
                        >
                          <Upload className="size-3.5" />
                          Upload Photo
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* VIEW MODE */
                <div className="px-5 sm:px-6 py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
                  <div>
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Full Name</p>
                    <p className="text-sm font-semibold text-foreground truncate">{currentParent.name}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Relationship</p>
                    <p className="text-sm font-semibold text-foreground truncate">Parent / Guardian</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Phone Number</p>
                    <p className="text-sm font-semibold text-foreground truncate">{currentParent.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Gender</p>
                    <p className="text-sm font-semibold text-foreground truncate capitalize">{currentParent.gender || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Date of Birth</p>
                    <p className="text-sm font-semibold text-foreground truncate">{currentParent.dateOfBirth || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Email Address</p>
                    <p className="text-sm font-semibold text-foreground truncate">{currentParent.email}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Occupation</p>
                    <p className="text-sm font-semibold text-foreground truncate">{currentParent.occupation || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Address</p>
                    <p className="text-sm font-semibold text-foreground truncate">{currentParent.address || "Bangalore, Karnataka"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Alternate Phone</p>
                    <p className="text-sm font-semibold text-foreground truncate">{currentParent.alternatePhone || "—"}</p>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Account Information Card */}
          <div className="bg-card rounded-2xl border  shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b ">
              <div className="flex items-center gap-2.5">
                <Lock className="size-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-bold text-foreground">Account Information</h2>
              </div>

              <div className="flex items-center gap-2">
                {editingSection === "account" ? (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEdit}
                      disabled={savingSection === "account"}
                      className="h-8 px-3 text-xs rounded-lg font-medium text-foreground  hover:bg-accent"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => saveSection("account", "Account Information")}
                      disabled={savingSection === "account"}
                      className="h-8 px-3 text-xs rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
                    >
                      {savingSection === "account" ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3.5" />}
                      Save
                    </Button>
                  </div>
                ) : (
                  canEdit && (
                    <button
                      onClick={() => startEdit("account")}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground px-3 py-1.5 rounded-lg border  hover:bg-accent transition-colors"
                    >
                      <Pencil className="size-3" /> Edit
                    </button>
                  )
                )}

                <button
                  onClick={() => toggleCollapse("account")}
                  className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground ml-1"
                  aria-label="Toggle collapse"
                >
                  {collapsed.account ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
                </button>
              </div>
            </div>

            {!collapsed.account && (
              editingSection === "account" ? (
                /* INLINE EDIT FOR ACCOUNT / OCCUPATION */
                <div className="px-5 sm:px-6 py-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">
                        Occupation
                      </Label>
                      <Input
                        value={formData.occupation}
                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                        placeholder="e.g. Engineer, Business"
                        className="h-9 text-xs rounded-xl bg-muted "
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">
                        Alternate Phone
                      </Label>
                      <Input
                        value={formData.alternatePhone}
                        onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                        placeholder="Enter alternate phone"
                        className="h-9 text-xs rounded-xl bg-muted "
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-5 sm:px-6 py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
                  <div>
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Parent Login ID</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold font-mono text-foreground">{displayId}</p>
                      <button onClick={() => handleCopy(displayId, "Login ID")} className="text-muted-foreground hover:text-emerald-600 transition-colors">
                        {copiedField === "Login ID" ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Password</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground tracking-widest">••••••••••</p>
                      <button onClick={() => setShowPassword(p => !p)} className="text-muted-foreground hover:text-foreground dark:hover:text-muted-foreground transition-colors">
                        {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Account Created</p>
                    <p className="text-sm font-semibold text-foreground">—</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Account Status</p>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60">
                      <span className="size-1.5 rounded-full bg-emerald-500" /> Active
                    </span>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Last Login</p>
                    <p className="text-sm font-semibold text-foreground">Never</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Created By</p>
                    <p className="text-sm font-semibold text-foreground">School Admin</p>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Linked Children Card */}
          <div className="bg-card rounded-2xl border  shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b ">
              <div className="flex items-center gap-2.5">
                <Users className="size-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-bold text-foreground">Linked Children ({currentChildren.length})</h2>
              </div>
              <div className="flex items-center gap-1">
                {onLinkChild && (
                  <button onClick={() => onLinkChild(currentParent)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-200/70 dark:border-emerald-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors">
                    <LinkIcon className="size-3.5" /> Link Child
                  </button>
                )}
                <button onClick={() => toggleCollapse("children")} className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground ml-1">
                  {collapsed.children ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
                </button>
              </div>
            </div>
            {!collapsed.children && (
              <div className="px-5 sm:px-6 py-5">
                {currentChildren.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <GraduationCap className="size-10 text-muted-foreground mb-3" />
                    <p className="text-sm font-semibold text-muted-foreground">No children linked to this parent</p>
                    <p className="text-xs text-muted-foreground mt-1 text-center max-w-xs">
                      Click on &ldquo;Link Child&rdquo; to add and link a student to this parent.
                    </p>
                    {onLinkChild && (
                      <Button onClick={() => onLinkChild(currentParent)} className="mt-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl px-6 gap-2">
                        <LinkIcon className="size-3.5" /> Link Child
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentChildren.map((child) => (
                      <div key={child.id} className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-muted border  hover:border-emerald-200 dark:hover:border-emerald-800/60 transition-colors">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="size-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-base shrink-0">
                            {child.gender === "male" ? "👦" : "👧"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-foreground truncate">{child.name}</p>
                            <p className="text-[11px] text-muted-foreground font-medium truncate mt-0.5">{child.className || "Unassigned"} · Roll {child.rollNumber}</p>
                          </div>
                        </div>
                        {onUnlinkChild ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUnlinkChild(currentParent.id, child.id);
                            }}
                            title="Unlink student"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                          >
                            <Unlink2 className="size-4" />
                          </button>
                        ) : (
                          <GraduationCap className="size-4 text-muted-foreground shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Children Tab */}
      {activeTab === "children" && (
        <div className="bg-card rounded-2xl border  p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <Users className="size-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-bold text-foreground">All Linked Children ({currentChildren.length})</h2>
            </div>
            {onLinkChild && (
              <button onClick={() => onLinkChild(currentParent)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-200/70 dark:border-emerald-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors">
                <LinkIcon className="size-3.5" /> Link Child
              </button>
            )}
          </div>
          {currentChildren.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border border-dashed  rounded-xl">
              <GraduationCap className="size-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No children linked</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentChildren.map((child) => (
                <div key={child.id} className="flex flex-col gap-3 p-4 rounded-xl bg-muted border  hover:border-emerald-200 dark:hover:border-emerald-800/60 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="size-11 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-lg shrink-0">{child.gender === "male" ? "👦" : "👧"}</div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{child.name}</p>
                        <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{child.className || "Unassigned"}</p>
                      </div>
                    </div>
                    {onUnlinkChild && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnlinkChild(currentParent.id, child.id);
                        }}
                        title="Unlink student"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                      >
                        <Unlink2 className="size-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t ">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Roll No</p>
                      <p className="text-xs font-semibold text-foreground mt-0.5 font-mono">{child.rollNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Gender</p>
                      <p className="text-xs font-semibold text-foreground mt-0.5 capitalize">{child.gender}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Placeholder tabs */}
      {(activeTab === "fees" || activeTab === "documents" || activeTab === "notes" || activeTab === "more") && (
        <div className="py-20 text-center text-muted-foreground bg-card rounded-2xl border ">
          <Building2 className="size-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Coming soon</p>
        </div>
      )}

      {/* Mobile Edit Button */}
      {canEdit && (
        <div className="sm:hidden sticky bottom-4 z-10 pt-2">
          <Button onClick={() => startEdit("personal")} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl py-3 gap-2 shadow-lg shadow-emerald-600/20">
            <Pencil className="size-4" /> Edit Profile
          </Button>
        </div>
      )}
    </div>
  );
}
