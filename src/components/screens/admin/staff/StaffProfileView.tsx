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
import {
  ChevronLeft, Printer, Pencil, MoreVertical,
  User, Users, Phone, Mail, Briefcase,
  Calendar, MapPin, Building2,
  FileText, StickyNote, MoreHorizontal,
  Lock, Upload, Shield, Clock, Key
} from "lucide-react";
import { toast } from "sonner";
import { ProfileSection } from "@/components/ui/profile-section";
import { CopyButton } from "@/components/ui/copy-button";
import { useGraphQLMutation, useAssignRoleToUser } from "@/lib/graphql/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/graphql/keys";
import { useAppStore } from "@/store/use-app-store";
import type { StaffMember, CustomRole } from "./types";
import { getInitials } from "./utils";

const UPDATE_USER = `
  mutation UpdateUser($id: ID!, $data: UpdateUserInput!) {
    updateUser(id: $id, data: $data) {
      id
      name
    }
  }
`;

interface StaffProfileViewProps {
  member: StaffMember;
  roles?: CustomRole[];
  onBack: () => void;
  canEdit?: boolean;
  onEditModal?: (member: StaffMember) => void;
}

export function StaffProfileView({
  member,
  roles = [],
  onBack,
  canEdit = true,
  onEditModal,
}: StaffProfileViewProps) {
  const { currentTenantId } = useAppStore();
  const queryClient = useQueryClient();

  const { mutateAsync: updateUser } = useGraphQLMutation<{ updateUser: { id: string; name: string } }, { id: string; data: any }>(UPDATE_USER);
  const { mutateAsync: assignRole } = useAssignRoleToUser();

  const [activeTab, setActiveTab] = useState<"overview" | "attendance" | "documents" | "notes">("overview");
  const [collapsed, setCollapsed] = useState({ personal: false, role: false, security: false });

  // Local live state of the staff member
  const [currentMember, setCurrentMember] = useState<StaffMember>(member);

  useEffect(() => {
    setCurrentMember(member);
  }, [member]);

  // Track which section is in independent edit mode
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  // Form Data for inline editing
  const [formData, setFormData] = useState({
    name: member.name || "",
    email: member.email || "",
    phone: member.phone || "",
    address: member.address || "",
    customRoleId: member.customRole?.id || "none",
    isActive: member.isActive,
  });

  const toggleCollapse = (key: keyof typeof collapsed) =>
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  /** Another section holds the form: this one sits behind it, dimmed. */
  const dimmed = (sec: string) => editingSection !== null && editingSection !== sec;

  const startEdit = (section: string) => {
    setFormData({
      name: currentMember.name || "",
      email: currentMember.email || "",
      phone: currentMember.phone || "",
      address: currentMember.address || "",
      customRoleId: currentMember.customRole?.id || "none",
      isActive: currentMember.isActive,
    });
    setEditingSection(section);
  };

  const cancelEdit = () => {
    setEditingSection(null);
  };

  const saveSection = async (sectionName: string, title: string) => {
    if (sectionName === "personal") {
      if (!formData.name.trim()) {
        toast.error("Full Name is required");
        return;
      }
    }

    setSavingSection(sectionName);
    try {
      // 1. Update user details
      await updateUser({
        id: currentMember.id,
        data: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          isActive: formData.isActive,
        },
      });

      // 2. If role was changed in role section
      if (sectionName === "role") {
        await assignRole({
          userId: currentMember.id,
          roleId: formData.customRoleId === "none" ? "" : formData.customRoleId,
          tenantId: currentTenantId!,
        });
      }

      // Update local state
      const matchingRole = roles.find((r) => r.id === formData.customRoleId);
      const updated: StaffMember = {
        ...currentMember,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        isActive: formData.isActive,
        customRole: matchingRole ? { id: matchingRole.id, name: matchingRole.name, color: matchingRole.color } : (formData.customRoleId === "none" ? null : currentMember.customRole),
      };

      setCurrentMember(updated);
      setEditingSection(null);
      toast.success(`${title} updated successfully`);

      queryClient.invalidateQueries({ queryKey: ["staff"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to save changes");
    } finally {
      setSavingSection(null);
    }
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "—";
    try {
      if (/^\d+$/.test(dateStr)) {
        const num = Number(dateStr);
        const d = new Date(num > 1e11 ? num : num * 1000);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
        }
      }
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

  const displayStaffId = currentMember.id ? `STF${currentMember.id.slice(-4).toUpperCase()}` : "STF001";
  const displayRole = currentMember.customRole?.name || "Standard Staff";
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
              onClick={() => startEdit("personal")}
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
            >
              <Pencil className="size-3.5" /> Edit Profile
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-foreground  rounded-xl hover:bg-accent"
          >
            <Printer className="size-3.5" /> Print
          </Button>
          <button
            className="p-2.5 sm:p-2 rounded-xl border  text-muted-foreground hover:bg-accent transition-colors shadow-xs"
            aria-label="More options"
          >
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
                {initials}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight truncate">
                  {currentMember.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80">
                    {displayRole}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80">
                    <span className={`size-1.5 rounded-full ${currentMember.isActive ? "bg-emerald-500" : "bg-zinc-400"}`} />
                    {currentMember.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Horizontal info row */}
            <div className="flex flex-wrap items-start gap-x-6 gap-y-3 pt-1 mt-1 border-t ">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-muted">
                  <User className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium leading-none mb-0.5">Staff ID</p>
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-foreground font-mono">{displayStaffId}</p>
                    <CopyButton value={displayStaffId} toastSubject="Staff ID" size="sm" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-muted">
                  <Mail className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium leading-none mb-0.5">Email Address</p>
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-foreground break-all">{currentMember.email}</p>
                    <CopyButton value={currentMember.email} toastSubject="Email" size="sm" className="shrink-0" />
                  </div>
                </div>
              </div>

              {currentMember.phone && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-muted">
                    <Phone className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium leading-none mb-0.5">Phone Number</p>
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-bold text-foreground">{currentMember.phone}</p>
                      <CopyButton value={currentMember.phone || ""} toastSubject="Phone" size="sm" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Illustration with Quote */}
          <div className="hidden lg:flex flex-col items-end justify-end gap-2 shrink-0 self-end">
            <p className="text-right text-xs text-muted-foreground italic font-medium leading-snug max-w-[150px]">
              Dedicated service, driving institutional excellence.
            </p>
            <div className="relative w-36 h-26 shrink-0">
              <Image src="/assets/admin/table.avif" alt="Staff Illustration" fill className="object-contain object-bottom-right opacity-90" priority />
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
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground dark:hover:text-muted-foreground"
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

          {/* Card 1: Personal & Contact Information */}
          <ProfileSection
            icon={User}
            title="Personal & Contact Information"
            editing={editingSection === "personal"}
            collapsed={collapsed.personal}
            saving={savingSection === "personal"}
            canEdit={canEdit}
            dimmed={dimmed("personal")}
            onEdit={() => startEdit("personal")}
            onCancel={cancelEdit}
            onSave={() => saveSection("personal", "Personal & Contact Information")}
            onToggleCollapse={() => toggleCollapse("personal")}
            view={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
                <div>
                  <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Full Name</p>
                  <p data-travel="name" className="text-sm font-semibold text-foreground truncate">{currentMember.name}</p>
                </div>
                <div>
                  <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Email Address</p>
                  <p data-travel="email" className="text-sm font-semibold text-foreground truncate">{currentMember.email}</p>
                </div>
                <div>
                  <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Phone Number</p>
                  <p data-travel="phone" className="text-sm font-semibold text-foreground truncate">{currentMember.phone || "—"}</p>
                </div>
                <div>
                  <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Staff ID</p>
                  <p className="text-sm font-semibold text-foreground truncate">{displayStaffId}</p>
                </div>
                <div className="sm:col-span-2">
                  <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Residential Address</p>
                  <p data-travel="address" className="text-sm font-semibold text-foreground truncate">{currentMember.address || "No address registered"}</p>
                </div>
              </div>
            }
            form={
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label data-fade className="text-xs font-semibold text-foreground">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      data-travel="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Staff Name"
                      className="h-9 text-xs rounded-xl bg-muted "
                    />
                  </div>

                  {/* Email Address (Read-only on edit) */}
                  <div className="space-y-1.5">
                    <Label data-fade className="text-xs font-semibold text-foreground">
                      Email Address
                    </Label>
                    <Input
                      data-travel="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="h-9 text-xs rounded-xl bg-muted  text-muted-foreground cursor-not-allowed"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <Label data-fade className="text-xs font-semibold text-foreground">
                      Phone Number
                    </Label>
                    <div
                      data-travel="phone"
                      className="flex rounded-xl overflow-hidden border  bg-muted focus-within:ring-1 focus-within:ring-emerald-500"
                    >
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
                    <Label data-fade className="text-xs font-semibold text-foreground">
                      Residential Address
                    </Label>
                    <Input
                      data-travel="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="City, State / Full Address"
                      className="h-9 text-xs rounded-xl bg-muted "
                    />
                  </div>

                  {/* Photo Upload */}
                  <div className="space-y-1.5">
                    <Label data-fade className="text-xs font-semibold text-foreground">Staff Photo</Label>
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
            }
          />

          {/* Card 2: Role & System Information */}
          <ProfileSection
            icon={Shield}
            title="Role & Permissions"
            editing={editingSection === "role"}
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
                  <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">System Role</p>
                  <p data-travel="role" className="text-sm font-semibold text-foreground">{displayRole}</p>
                </div>
                <div>
                  <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Registered On</p>
                  <p className="text-sm font-semibold text-foreground">{formatDate(currentMember.createdAt)}</p>
                </div>
                <div>
                  <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Account Status</p>
                  <span
                    data-travel="status"
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80"
                  >
                    <span className={`size-1.5 rounded-full ${currentMember.isActive ? "bg-emerald-500" : "bg-zinc-400"}`} />
                    {currentMember.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div>
                  <p data-fade className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Access Level</p>
                  <p className="text-sm font-semibold text-foreground">
                    {currentMember.role === "admin" ? "Administrator" : "Staff Portal"}
                  </p>
                </div>
              </div>
            }
            form={
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label data-fade className="text-xs font-semibold text-foreground">
                      Assigned Role
                    </Label>
                    <Select
                      value={formData.customRoleId}
                      onValueChange={(val) => setFormData({ ...formData, customRoleId: val })}
                    >
                      <SelectTrigger data-travel="role" className="h-9 text-xs rounded-xl bg-muted ">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
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

                  <div className="space-y-1.5">
                    <Label data-fade className="text-xs font-semibold text-foreground">
                      Account Status
                    </Label>
                    <Select
                      value={formData.isActive ? "active" : "inactive"}
                      onValueChange={(val) => setFormData({ ...formData, isActive: val === "active" })}
                    >
                      <SelectTrigger data-travel="status" className="h-9 text-xs rounded-xl bg-muted ">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            }
          />

          {/* Row 2: Additional Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 3: Security & Activity */}
            <div className={`rounded-2xl border  bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 transition-[opacity,filter] duration-300 ${editingSection !== null ? "opacity-60 blur-[1.5px]" : ""}`}>
              <div className="flex items-center justify-between pb-3 border-b ">
                <div className="flex items-center gap-2 text-foreground font-semibold text-sm sm:text-base">
                  <Clock className="size-4 text-emerald-600" />
                  Activity &amp; Security
                </div>
              </div>
              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-muted-foreground font-medium">Last Active</span>
                  <span className="font-semibold text-foreground">Recent</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-muted-foreground font-medium">Password Status</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Configured</span>
                </div>
              </div>
            </div>

            {/* Card 4: Department Notes */}
            <div className={`rounded-2xl border  bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 transition-[opacity,filter] duration-300 ${editingSection !== null ? "opacity-60 blur-[1.5px]" : ""}`}>
              <div className="flex items-center justify-between pb-3 border-b ">
                <div className="flex items-center gap-2 text-foreground font-semibold text-sm sm:text-base">
                  <StickyNote className="size-4 text-emerald-600" />
                  Department Notes
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Active staff member registered within the school management system. Access permissions and assigned roles can be updated inline or via the edit action.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === "attendance" && (
        <div className="py-20 text-center text-muted-foreground bg-card rounded-2xl border ">
          <Calendar className="size-10 mx-auto mb-2 opacity-30 text-emerald-600" />
          <p className="text-sm font-medium text-muted-foreground">Attendance records for {currentMember.name}</p>
          <p className="text-xs text-muted-foreground mt-1">Check staff attendance overview from the main attendance module.</p>
        </div>
      )}

      {/* Documents & Notes Tabs */}
      {(activeTab === "documents" || activeTab === "notes") && (
        <div className="py-20 text-center text-muted-foreground bg-card rounded-2xl border ">
          <Building2 className="size-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Coming soon</p>
        </div>
      )}

      {/* Mobile Sticky Edit Button */}
      {canEdit && (
        <div className="sm:hidden sticky bottom-4 z-10 pt-2">
          <Button
            onClick={() => startEdit("personal")}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl py-3 gap-2 shadow-lg shadow-emerald-600/20"
          >
            <Pencil className="size-4" /> Edit Profile
          </Button>
        </div>
      )}
    </div>
  );
}
