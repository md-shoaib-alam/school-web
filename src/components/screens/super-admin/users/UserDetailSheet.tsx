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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-hidden bg-white dark:bg-gray-800 border-l-2 border-gray-100 dark:border-gray-900">
        {/* Banner */}
        <div className={`p-8 pb-12 relative overflow-hidden ${
          user.role === "super_admin" ? "bg-teal-600" : 
          user.role === "admin" ? "bg-emerald-600" : 
          user.role === "teacher" ? "bg-blue-600" : 
          user.role === "student" ? "bg-violet-600" : 
          user.role === "staff" ? "bg-indigo-600" : "bg-amber-600"
        }`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
          
          <SheetHeader className="relative z-10 text-left">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl font-black shadow-lg border border-white/20">
                {initials}
              </div>
              <div className="min-w-0">
                <SheetTitle className="text-2xl font-black text-white leading-tight">
                  {user.name}
                </SheetTitle>
                <SheetDescription className="text-white/80 text-xs font-black uppercase tracking-widest mt-1">
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
                <Badge variant="outline" className={`h-8 px-3 rounded-full font-black text-[10px] uppercase tracking-widest border-2 ${
                  user.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
                }`}>
                  <div className={`h-1.5 w-1.5 rounded-full mr-2 ${user.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                  {user.isActive ? "Active Account" : "Suspended Account"}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                className={`h-8 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${
                  user.isActive ? "hover:bg-red-50 hover:text-red-600 hover:border-red-200" : "hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                }`}
                onClick={() => onToggleStatus(user.id)}
                disabled={toggling}
              >
                {toggling ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : (user.isActive ? "Deactivate" : "Activate")}
              </Button>
            </div>

            <Separator className="bg-gray-100 dark:bg-gray-900" />

            {/* User Details */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Core Information</h3>
              
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

            <Separator className="bg-gray-100 dark:bg-gray-900" />

            {/* Context Section */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Context & Metadata</h3>
              
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent hover:border-teal-500/20 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                    <Building2 className="h-4 w-4 text-teal-600" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tenant Affiliation</p>
                </div>
                {user.tenant ? (
                  <div className="pl-11">
                    <p className="text-sm font-black text-gray-900 dark:text-gray-100">{user.tenant.name}</p>
                    <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">@{user.tenant.slug}</p>
                  </div>
                ) : (
                  <p className="pl-11 text-sm font-bold text-muted-foreground italic">Platform Level (No Tenant)</p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                    <Calendar className="h-4 w-4 text-violet-600" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Registration Date</p>
                </div>
                <div className="pl-11">
                  <p className="text-sm font-black text-gray-900 dark:text-gray-100">{formatDateTime(user.createdAt)}</p>
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
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-start justify-between group gap-4 p-4 rounded-2xl hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
      <div className="flex items-start gap-4 min-w-0">
        <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center shrink-0">
          {React.cloneElement(icon, { className: "h-4 w-4 text-muted-foreground" })}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">{label}</p>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{value}</p>
        </div>
      </div>
      
      {canCopy && (
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 rounded-lg shrink-0 transition-all hover:bg-gray-100 dark:hover:bg-gray-900 ${copied ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </Button>
      )}
    </div>
  );
}
