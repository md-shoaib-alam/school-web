"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Mail,
  Phone,
  Calendar,
  User,
  Shield,
  MapPin,
  Clock,
  Sparkles,
  Copy,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { StaffMember } from "./types";
import { getInitials } from "./utils";

interface StaffDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: StaffMember | null;
}

export function StaffDetailDialog({
  open,
  onOpenChange,
  member,
}: StaffDetailDialogProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!member) return null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success(`${fieldName} copied to clipboard`);
  };

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

  const initials = getInitials(member.name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-none bg-card shadow-2xl rounded-2xl max-h-[90vh] flex flex-col">
        {/* Profile Card Header Info */}
        <div className="px-6 pt-6 pb-5 border-b flex-shrink-0 relative">
          {/* Subtle Sparkles Section Title */}
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-4 pr-8">
            <Sparkles className="size-3.5 animate-pulse text-emerald-500" />
            Staff Profile
          </div>

          <div className="flex flex-row items-center gap-4 text-left">
            {/* Beautiful Avatar Circle */}
            <div className="size-16 rounded-full border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xl font-bold shadow-md shrink-0">
              {initials}
            </div>
            
            <div className="flex-1 space-y-1 py-0.5">
              <DialogTitle className="text-lg sm:text-xl font-bold text-foreground tracking-tight text-left">
                {member.name}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Staff details and profile.
              </DialogDescription>
              <div className="flex flex-wrap items-center justify-start gap-2">
                {member.customRole ? (
                  <Badge variant="secondary" className="bg-emerald-100 hover:bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 font-medium">
                    {member.customRole.name}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 font-medium">
                    Standard Staff
                  </Badge>
                )}
                <Badge
                  className={
                    member.isActive 
                      ? "bg-emerald-600 text-white font-normal hover:bg-emerald-600" 
                      : "bg-zinc-500 text-white font-normal hover:bg-zinc-500"
                  }
                >
                  {member.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main Details Body Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Grid 1: Basic Information */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User className="size-3.5 text-emerald-600" />
              Role & Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-secondary/20 p-3 rounded-xl border border-secondary/30">
                <p className="text-[10px] text-muted-foreground font-medium uppercase">System Role</p>
                <p className="text-sm font-semibold capitalize mt-0.5 text-foreground flex items-center gap-1.5">
                  <Shield className="size-3.5 text-emerald-600" />
                  {member.customRole?.name || "Standard"}
                </p>
              </div>
              <div className="bg-secondary/20 p-3 rounded-xl border border-secondary/30">
                <p className="text-[10px] text-muted-foreground font-medium uppercase">Registered On</p>
                <p className="text-sm font-semibold mt-0.5 text-foreground flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-emerald-600" />
                  {formatDate(member.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Grid 2: Contacts */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Phone className="size-3.5 text-emerald-600" />
              Contact Information
            </h3>
            <div className="space-y-3">
              {/* Email Field with Copy */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">Email Address</p>
                  <p className="text-sm font-semibold text-foreground truncate mt-0.5">
                    {member.email}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-emerald-600"
                    onClick={() => handleCopy(member.email, 'email')}
                  >
                    {copiedField === 'email' ? (
                      <Check className="size-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-emerald-600"
                    asChild
                  >
                    <a href={`mailto:${member.email}`}>
                      <Mail className="size-3.5" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* Phone Field with Copy */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">Phone Number</p>
                  <p className="text-sm font-semibold text-foreground truncate mt-0.5">
                    {member.phone || "No phone registered"}
                  </p>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-emerald-600"
                      onClick={() => handleCopy(member.phone || '', 'phone')}
                    >
                      {copiedField === 'phone' ? (
                        <Check className="size-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-emerald-600"
                      asChild
                    >
                      <a href={`tel:${member.phone}`}>
                        <Phone className="size-3.5" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              {/* Address Field */}
              <div className="flex items-start p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">Residential Address</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5 flex items-start gap-1.5">
                    <MapPin className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    {member.address || "No address registered"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-secondary/20 border-t flex justify-end flex-shrink-0">
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md shadow-emerald-600/10"
            onClick={() => onOpenChange(false)}
          >
            Close Details
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
