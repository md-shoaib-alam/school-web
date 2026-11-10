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
import { Check, Copy, Edit2, Loader2, Mail, Phone, UserRound } from "lucide-react";
import type { RoleConfigEntry } from "./user-detail-sheet-model";

interface UserBasicInfoSectionProps {
  name: string;
  email: string;
  phone: string | null;
  roleConf: RoleConfigEntry;
  isEditing: boolean;
  editName: string;
  setEditName: (value: string) => void;
  editEmail: string;
  setEditEmail: (value: string) => void;
  editPhone: string;
  setEditPhone: (value: string) => void;
  editRole: string;
  setEditRole: (value: string) => void;
  isSaving: boolean;
  copiedEmail: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onCopyEmail: () => void;
}

export function UserBasicInfoSection({
  name,
  email,
  phone,
  roleConf,
  isEditing,
  editName,
  setEditName,
  editEmail,
  setEditEmail,
  editPhone,
  setEditPhone,
  editRole,
  setEditRole,
  isSaving,
  copiedEmail,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onCopyEmail,
}: UserBasicInfoSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserRound className="size-4 text-blue-600" />
          <h3 className="font-bold text-sm text-foreground">
            Basic Information
          </h3>
        </div>

          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onStartEdit}
              className="h-8 px-3 rounded-xl  text-foreground text-xs font-semibold gap-1.5 shadow-2xs hover:bg-accent cursor-pointer"
            >
              <Edit2 className="size-3.5" />
              <span>Edit</span>
            </Button>
          ) : (
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-full border border-blue-200/80 dark:border-blue-800/60">
              Editing Mode
            </span>
          )}
        </div>

        {isEditing ? (
          /* Editable Form */
          <div className="p-4 rounded-2xl bg-muted border border-blue-200/80 dark:border-blue-900/50 space-y-3.5 animate-in fade-in-50 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="h-9 text-xs rounded-xl bg-card "
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  System Role <span className="text-red-500">*</span>
                </Label>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-card ">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl ">
                    <SelectItem value="admin" className="text-xs">Admin</SelectItem>
                    <SelectItem value="teacher" className="text-xs">Teacher</SelectItem>
                    <SelectItem value="student" className="text-xs">Student</SelectItem>
                    <SelectItem value="parent" className="text-xs">Parent</SelectItem>
                    <SelectItem value="staff" className="text-xs">Staff</SelectItem>
                    <SelectItem value="super_admin" className="text-xs">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-foreground">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="e.g. user@school.com"
                  className="h-9 text-xs rounded-xl bg-card "
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-foreground">
                  Phone Number
                </Label>
                <Input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g. +1 234 567 8900"
                  className="h-9 text-xs rounded-xl bg-card "
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t ">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancelEdit}
                disabled={isSaving}
                className="h-8 px-3 rounded-xl text-xs font-medium cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={onSaveEdit}
                disabled={isSaving}
                className="h-8 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* View Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Full Name Card */}
            <div className="p-3.5 rounded-2xl bg-muted border  flex items-center gap-3">
              <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <UserRound className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground">Full Name</p>
                <p className="text-xs sm:text-sm font-bold text-foreground truncate mt-0.5">
                  {name}
                </p>
              </div>
            </div>

            {/* System Role Card */}
            <div className="p-3.5 rounded-2xl bg-muted border  flex items-center gap-3">
              <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <UserRound className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground">System Role</p>
                <p className="text-xs sm:text-sm font-bold text-foreground truncate mt-0.5">
                  {roleConf.label}
                </p>
              </div>
            </div>

            {/* Email Address Card - FULL WIDTH (sm:col-span-2) so full email is always visible on desktop */}
            <div className="col-span-1 sm:col-span-2 p-3.5 rounded-2xl bg-muted border  flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Mail className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-muted-foreground">Email Address</p>
                  <p className="text-xs sm:text-sm font-bold text-foreground break-all select-all mt-0.5 leading-snug">
                    {email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCopyEmail}
                title="Copy Email"
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground dark:hover:text-muted-foreground hover:bg-white shrink-0 transition-colors cursor-pointer border border-transparent hover: dark:hover: shadow-2xs"
              >
                {copiedEmail ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
              </button>
            </div>

            {/* Phone Number Card - FULL WIDTH (sm:col-span-2) */}
            <div className="col-span-1 sm:col-span-2 p-3.5 rounded-2xl bg-muted border  flex items-center gap-3">
              <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Phone className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground">Phone Number</p>
                <p className="text-xs sm:text-sm font-bold text-foreground truncate mt-0.5">
                  {phone || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
