import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  UserRound,
  Mail,
  Phone,
  Building2,
  Calendar,
  Activity,
  UserCog,
  Shield,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { PlatformUser, ROLE_CONFIG } from "./types";
import React, { useState } from "react";
import { copyToClipboard } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";

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
  if (!user) return null;

  const roleConf = ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG] ?? ROLE_CONFIG.student;
  const initials = (user.name || "").split(" ").map((n) => n?.[0] || "").join("").slice(0, 2).toUpperCase();

  const roleAccentBg =
    user.role === "super_admin" ? "bg-teal-600" :
    user.role === "admin" ? "bg-emerald-600" :
    user.role === "teacher" ? "bg-blue-600" :
    user.role === "student" ? "bg-violet-600" :
    user.role === "staff" ? "bg-violet-600" : "bg-amber-600";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-hidden bg-card border-l border-border">
        {/* Banner */}
        <div className={`p-8 pb-12 ${roleAccentBg}`}>
          <SheetHeader className="relative z-10 text-left">
            <div className="flex items-center gap-5">
              <div className="size-20 rounded-3xl bg-white/20 flex items-center justify-center text-white text-2xl font-bold shadow-lg border border-white/20">
                {initials}
              </div>
              <div className="min-w-0">
                <SheetTitle className="text-2xl font-bold text-white leading-tight">
                  {user.name}
                </SheetTitle>
                <SheetDescription className="text-white/80 text-xs font-medium mt-1">
                  {roleConf.label} Account
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="p-8 space-y-8">
            {/* Status Section */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <StatusBadge tone={user.isActive ? "positive" : "negative"}>
                  {user.isActive ? "Active Account" : "Suspended Account"}
                </StatusBadge>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-4 rounded-xl text-xs font-medium"
                onClick={() => onToggleStatus(user.id)}
                disabled={toggling}
              >
                {toggling ? <Loader2 className="size-3 animate-spin mr-2" /> : (user.isActive ? "Deactivate" : "Activate")}
              </Button>
            </div>

            <Separator />

            {/* User Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-muted-foreground mb-4">Core Information</h3>

              <InfoRow icon={<UserRound />} label="Full Name" value={user.name} />
              <InfoRow
                icon={<Mail />}
                label="Email Address"
                value={user.email}
                canCopy={true}
              />
              <InfoRow icon={<Phone />} label="Phone Number" value={user.phone || "Not provided"} />
              <InfoRow icon={<UserCog />} label="System Role" value={roleConf.label} />
            </div>

            <Separator />

            {/* Context Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-muted-foreground mb-4">Context & Metadata</h3>

              <div className="p-4 rounded-2xl bg-muted border border-transparent hover:border-border transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-8 rounded-lg bg-card flex items-center justify-center shadow-sm">
                    <Building2 className="size-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">Tenant Affiliation</p>
                </div>
                {user.tenant ? (
                  <div className="pl-11">
                    <p className="text-sm font-semibold text-foreground">{user.tenant.name}</p>
                    <p className="text-xs font-medium text-muted-foreground">@{user.tenant.slug}</p>
                  </div>
                ) : (
                  <p className="pl-11 text-sm font-medium text-muted-foreground italic">Platform Level (No Tenant)</p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-muted border border-transparent">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-8 rounded-lg bg-card flex items-center justify-center shadow-sm">
                    <Calendar className="size-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">Registration Date</p>
                </div>
                <div className="pl-11">
                  <p className="text-sm font-semibold text-foreground">{formatDateTime(user.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function InfoRow({ icon, label, value, canCopy }: any) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyToClipboard(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-start justify-between group gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors">
      <div className="flex items-start gap-4 min-w-0">
        <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
          {React.cloneElement(icon, { className: "size-4 text-muted-foreground" })}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground mb-0.5">{label}</p>
          <p className="text-sm font-semibold text-foreground truncate">{value}</p>
        </div>
      </div>

      {canCopy && (
        <Button
          variant="ghost"
          size="icon"
          className={`size-8 rounded-lg shrink-0 transition-all hover:bg-muted ${copied ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-600" />
          ) : (
            <Copy className="size-3.5 text-muted-foreground" />
          )}
        </Button>
      )}
    </div>
  );
}
