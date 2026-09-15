import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  MoreVertical,
  UserRound,
  Mail,
  Phone,
  Building2,
  Calendar,
  Clock,
  Shield,
  Power,
  Copy,
  Check,
  ExternalLink,
  Edit2,
  Heart,
  Loader2,
  Clock3,
  Users2,
  Settings
} from "lucide-react";
import { PlatformUser, ROLE_CONFIG } from "./types";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UserDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: PlatformUser | null;
  onToggleStatus: (userId: string) => void;
  toggling: boolean;
  formatDateTime: (val: string) => string;
}

export function UserDetailSheet({
  open,
  onOpenChange,
  user,
  onToggleStatus,
  toggling,
  formatDateTime,
}: UserDetailSheetProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "relations" | "settings">("overview");
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!user) return null;

  const roleConf = ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG] ?? ROLE_CONFIG.student;
  const initials = (user.name || "U")
    .split(" ")
    .map((n) => n[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleCopyEmail = () => {
    copyToClipboard(user.email);
    setCopiedEmail(true);
    toast.success("Email copied to clipboard");
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return "–";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "–";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const roleRelationsLabel =
    user.role === "parent" ? "Children" :
    user.role === "teacher" ? "Students" :
    user.role === "student" ? "Classes" : "Team";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        hideClose
        className="w-full sm:max-w-xl p-0 overflow-hidden bg-white dark:bg-zinc-950 border-l border-slate-200/90 dark:border-zinc-800 shadow-2xl flex flex-col focus:outline-none"
      >
        {/* Top Header Controls (Close & Options) */}
        <div className="flex items-center justify-between p-6 pb-2">
          {/* Large Avatar & Name Header */}
          <div className="flex items-start gap-4">
            <div className="size-20 rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 text-white font-bold text-2xl flex items-center justify-center shadow-md shrink-0">
              {initials}
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {user.name}
              </h2>
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <UserRound className="size-3.5 text-slate-400" />
                <span>{roleConf.label} Account</span>
              </div>

              {/* Status and Role Badges */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {user.isActive ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Active Account
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60">
                    <Clock className="size-3 text-amber-500" />
                    Inactive
                  </span>
                )}

                <span
                  className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold border ${roleConf.bg} ${roleConf.color}`}
                >
                  {roleConf.icon}
                  {roleConf.label}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons (Close & More) */}
          <div className="flex flex-col gap-2 shrink-0 self-start">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-9 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-500 transition-colors"
            >
              <X className="size-4" />
            </button>
            <button
              type="button"
              className="size-9 rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-500 transition-colors shadow-2xs"
            >
              <MoreVertical className="size-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-100 dark:border-zinc-800/80 text-xs sm:text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === "overview"
                ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <UserRound className="size-4" />
            <span>Overview</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("activity")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === "activity"
                ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Clock3 className="size-4" />
            <span>Activity</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("relations")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === "relations"
                ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Users2 className="size-4" />
            <span>{roleRelationsLabel}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === "settings"
                ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Settings className="size-4" />
            <span>Settings</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <ScrollArea className="flex-1 px-6 py-5">
          <div className="space-y-6">
            {/* Section 1: Basic Information */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserRound className="size-4 text-blue-600" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Basic Information
                  </h3>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info("Edit mode active")}
                  className="h-8 px-3 rounded-xl border-slate-200/90 dark:border-zinc-800 text-slate-700 dark:text-slate-300 text-xs font-semibold gap-1.5 shadow-2xs hover:bg-slate-50"
                >
                  <Edit2 className="size-3.5" />
                  <span>Edit</span>
                </Button>
              </div>

              {/* 2x2 Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name Card */}
                <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80 flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <UserRound className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Full Name</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                      {user.name}
                    </p>
                  </div>
                </div>

                {/* Email Address Card with Copy */}
                <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Mail className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Email Address</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white dark:hover:bg-zinc-800 shrink-0 transition-colors"
                  >
                    {copiedEmail ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                  </button>
                </div>

                {/* Phone Number Card */}
                <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80 flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Phone className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Phone Number</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                      {user.phone || "Not provided"}
                    </p>
                  </div>
                </div>

                {/* System Role Card */}
                <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80 flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <UserRound className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">System Role</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                      {roleConf.label}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: School Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  School Information
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Building2 className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {user.tenant?.name || "Platform Level (No Tenant)"}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                      {user.tenant?.slug ? `/${user.tenant.slug}` : "Global Admin"}
                    </p>
                  </div>
                </div>

                {user.tenant && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onOpenChange(false);
                      router.push(`/${user.tenant?.slug || user.tenant?.id}`);
                    }}
                    className="h-8 px-3 rounded-xl border-blue-200 dark:border-blue-900/60 bg-blue-50/50 hover:bg-blue-100/70 text-blue-600 dark:text-blue-400 text-xs font-semibold gap-1.5 shrink-0 shadow-2xs"
                  >
                    <span>View School</span>
                    <ExternalLink className="size-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Section 3: Account Status */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Account Status
                </h3>
              </div>

              {/* Status Toggle Card */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  {user.isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      Active Account
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/80">
                      <Clock className="size-3 text-amber-500" />
                      Inactive Account
                    </span>
                  )}
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                    {user.isActive
                      ? "This account is active and can access the platform."
                      : "This account is currently suspended and cannot log in."}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={toggling}
                  onClick={() => onToggleStatus(user.id)}
                  className={`h-9 px-4 rounded-xl text-xs font-semibold gap-1.5 shadow-2xs transition-colors shrink-0 ${
                    user.isActive
                      ? "border-red-200 dark:border-red-900/50 bg-red-50/60 hover:bg-red-100/80 text-red-600 dark:text-red-400 dark:bg-red-950/30"
                      : "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-950/30"
                  }`}
                >
                  {toggling ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Power className="size-3.5" />
                  )}
                  <span>{user.isActive ? "Deactivate" : "Activate"}</span>
                </Button>
              </div>

              {/* 2-Col Dates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Joined Date Card */}
                <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80 flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Calendar className="size-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-slate-400">Joined Date</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {formatDateShort(user.createdAt)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Account creation date</p>
                  </div>
                </div>

                {/* Last Login Card */}
                <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80 flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Clock className="size-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-slate-400">Last Login</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {formatDateTime(user.createdAt)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Last active on platform</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-3 bg-white dark:bg-zinc-950">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10 px-6 rounded-xl border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm shadow-2xs"
          >
            Close
          </Button>

          <Button
            type="button"
            onClick={() => toast.info("Opening edit options")}
            className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xs"
          >
            <Edit2 className="size-3.5" />
            <span>Edit User</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
