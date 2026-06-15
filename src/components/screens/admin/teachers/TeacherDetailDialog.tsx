"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Briefcase,
  GraduationCap,
  User,
  Sparkles,
  BookOpen,
  School,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/utils";
import type { TeacherInfo } from "./types";

interface TeacherDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: TeacherInfo | null;
}

function getInitials(name: string): string {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function TeacherDetailDialog({
  open,
  onOpenChange,
  teacher,
}: TeacherDetailDialogProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!teacher) return null;

  const handleCopy = (text: string, fieldName: string) => {
    copyToClipboard(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success(`${fieldName} copied to clipboard`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-none bg-card shadow-2xl rounded-2xl max-h-[90vh] flex flex-col">
        {/* Profile Card Header Info */}
        <div className="px-6 pt-6 pb-5 border-b flex-shrink-0 relative">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-4 pr-8">
            <Sparkles className="size-3.5 animate-pulse text-emerald-500" />
            Teacher Profile
          </div>

          <div className="flex flex-row items-center gap-4 text-left">
            {/* Avatar Circle */}
            <div className="size-16 rounded-full border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xl font-bold shadow-md shrink-0">
              {getInitials(teacher.name)}
            </div>

            <div className="flex-1 space-y-1 py-0.5 min-w-0">
              <DialogTitle className="text-lg sm:text-xl font-bold text-foreground tracking-tight text-left truncate">
                {teacher.name}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Teacher details and assigned workload.
              </DialogDescription>
              <div className="flex flex-wrap items-center justify-start gap-2">
                <Badge variant="secondary" className="bg-emerald-100 hover:bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 font-medium">
                  Faculty Member
                </Badge>
                <Badge 
                  variant={teacher.status === 'active' ? 'secondary' : 'destructive'} 
                  className={teacher.status === 'active' 
                    ? 'bg-emerald-150 hover:bg-emerald-150 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold uppercase tracking-wide text-[10px] border-emerald-500/20' 
                    : 'font-semibold uppercase tracking-wide text-[10px]'
                  }
                >
                  {teacher.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main Details Body Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Contact & Bio Info */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User className="size-3.5 text-emerald-600" />
              General Information
            </h3>
            <div className="space-y-3">
              {/* Email */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Mail className="size-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase leading-none">Email Address</p>
                    <p className="text-sm font-semibold text-foreground truncate mt-1">{teacher.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-emerald-600"
                    onClick={() => handleCopy(teacher.email, 'Email')}
                  >
                    {copiedField === 'Email' ? (
                      <Check className="size-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Phone className="size-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase leading-none">Phone Number</p>
                    <p className="text-sm font-semibold text-foreground truncate mt-1">{teacher.phone || "—"}</p>
                  </div>
                </div>
                {teacher.phone && teacher.phone !== "—" && (
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-emerald-600"
                      onClick={() => handleCopy(teacher.phone || '', 'Phone')}
                    >
                      {copiedField === 'Phone' ? (
                        <Check className="size-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Qualification */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                <GraduationCap className="size-4 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase leading-none">Qualification</p>
                  <p className="text-sm font-semibold text-foreground truncate mt-1">{teacher.qualification || "—"}</p>
                </div>
              </div>

              {/* Experience */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                <Briefcase className="size-4 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase leading-none">Experience</p>
                  <p className="text-sm font-semibold text-foreground truncate mt-1">{teacher.experience || "—"}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Workload Section (Subjects & Classes) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Subjects */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BookOpen className="size-3.5 text-emerald-600" />
                Assigned Subjects ({teacher.subjects?.length || 0})
              </h3>
              {!teacher.subjects || teacher.subjects.length === 0 ? (
                <p className="text-xs text-muted-foreground italic pl-1">No subjects assigned yet.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {teacher.subjects.map((subj, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-emerald-500/10 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 font-medium">
                      {subj}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Classes */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <School className="size-3.5 text-emerald-600" />
                Classes Taught ({teacher.classes?.length || 0})
              </h3>
              {!teacher.classes || teacher.classes.length === 0 ? (
                <p className="text-xs text-muted-foreground italic pl-1">No classes assigned yet.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {teacher.classes.map((cls, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-emerald-500/10 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 font-medium">
                      {cls}
                    </Badge>
                  ))}
                </div>
              )}
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
