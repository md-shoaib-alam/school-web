"use client";

import { useState, useEffect } from "react";
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
  GraduationCap,
  Bus,
  Copy,
  Check,
  MapPin,
  Clock,
  Sparkles,
  HeartHandshake,
  Users
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/utils";
import type { StudentInfo } from "./types";

interface StudentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentInfo;
}

export function StudentDetailDialog({
  open,
  onOpenChange,
  student,
}: StudentDetailDialogProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Invalidate cache when dialog opens to force fresh loading of siblings/details
  useEffect(() => {
    if (open && student.id) {
      queryClient.invalidateQueries({ queryKey: ['student-detail', student.id] });
    }
  }, [open, student.id, queryClient]);

  // Fetch full student details (including transport info and siblings) via REST API
  const { data: studentDetails, isLoading } = useQuery({
    queryKey: ['student-detail', student.id],
    enabled: open && !!student.id,
    staleTime: 0,
    queryFn: async () => {
      const res = await apiFetch(`/api/students/${student.id}?t=${Date.now()}`);
      if (!res.ok) throw new Error("Failed to load student details");
      return res.json();
    }
  });

  // Fetch transport routes to show the route name and fee rather than just routeId
  const { data: routes = [] } = useQuery({
    queryKey: ['transport-routes-min'],
    enabled: open,
    queryFn: async () => {
      const res = await apiFetch('/api/transport-routes?mode=min');
      return res.json();
    }
  });

  const handleCopy = (text: string, fieldName: string) => {
    copyToClipboard(text);
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

  // Map routeId to actual Route Info
  const transportRoute = studentDetails?.transport
    ? routes.find((r: any) => r.id === studentDetails.transport.routeId)
    : null;

  // Use either freshly loaded details or fallback to table row details
  const currentStudent = studentDetails || student;
  
  // Get initials for Avatar
  const initials = currentStudent.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-none bg-card shadow-2xl rounded-2xl max-h-[90vh] flex flex-col">
        {/* Profile Card Header Info */}
        <div className="px-6 pt-6 pb-5 border-b flex-shrink-0 relative">
          {/* Subtle Sparkles Section Title */}
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-4 pr-8">
            <Sparkles className="size-3.5 animate-pulse text-emerald-500" />
            Student Profile
          </div>

          <div className="flex flex-row items-center gap-4 text-left">
            {/* Beautiful Avatar Circle */}
            <div className="size-16 rounded-full border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xl font-bold shadow-md shrink-0">
              {initials}
            </div>
            
            <div className="flex-1 space-y-1 py-0.5">
              <DialogTitle className="text-lg sm:text-xl font-bold text-foreground tracking-tight text-left">
                {currentStudent.name}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Student details and profile.
              </DialogDescription>
              <div className="flex flex-wrap items-center justify-start gap-2">
                <Badge variant="secondary" className="bg-emerald-100 hover:bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 font-medium">
                  {currentStudent.className || "Unassigned Class"}
                </Badge>
                <Badge variant="outline" className="font-mono text-xs bg-secondary/30">
                  Roll: {currentStudent.rollNumber}
                </Badge>
                <Badge className="bg-emerald-600 text-white font-normal hover:bg-emerald-600">
                  Active
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main Details Body Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {isLoading ? (
            /* Premium Pulsing Skeleton Loader */
            <div className="animate-pulse space-y-6 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-14 bg-muted rounded-xl" />
                <div className="h-14 bg-muted rounded-xl" />
                <div className="h-14 bg-muted rounded-xl" />
                <div className="h-14 bg-muted rounded-xl" />
              </div>
              <div className="h-28 bg-muted rounded-xl" />
              <div className="h-24 bg-muted rounded-xl" />
            </div>
          ) : (
            <>
              {/* Grid 1: Basic Information */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <User className="size-3.5 text-emerald-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-secondary/20 p-3 rounded-xl border border-secondary/30">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase">Gender</p>
                    <p className="text-sm font-semibold capitalize mt-0.5 text-foreground flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      {currentStudent.gender}
                    </p>
                  </div>
                  <div className="bg-secondary/20 p-3 rounded-xl border border-secondary/30">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase">Date of Birth</p>
                    <p className="text-sm font-semibold mt-0.5 text-foreground flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-emerald-600" />
                      {formatDate(currentStudent.dateOfBirth)}
                    </p>
                  </div>
                  <div className="bg-secondary/20 p-3 rounded-xl border border-secondary/30">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase">Admission Date</p>
                    <p className="text-sm font-semibold mt-0.5 text-foreground flex items-center gap-1.5">
                      <Clock className="size-3.5 text-emerald-600" />
                      {formatDate(currentStudent.admissionDate)}
                    </p>
                  </div>
                  <div className="bg-secondary/20 p-3 rounded-xl border border-secondary/30">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase">Academic Status</p>
                    <p className="text-sm font-semibold mt-0.5 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <GraduationCap className="size-3.5" />
                      Enrolled
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid 2: Contacts & Parent Information */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <HeartHandshake className="size-3.5 text-emerald-600" />
                  Contact & Parents
                </h3>
                <div className="space-y-3">
                  {/* Parent Field */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground font-medium uppercase">Parent / Guardian</p>
                      <p className="text-sm font-semibold text-foreground truncate mt-0.5">
                        {currentStudent.parentName || "Not Linked"}
                      </p>
                    </div>
                    {currentStudent.parentEmail && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-emerald-600 hover:text-emerald-700 h-8 gap-1.5"
                        asChild
                      >
                        <a href={`mailto:${currentStudent.parentEmail}`}>
                          <Mail className="size-3.5" />
                          Email Parent
                        </a>
                      </Button>
                    )}
                  </div>

                  {/* Email Field with Copy */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-muted-foreground font-medium uppercase">Email Address</p>
                      <p className="text-sm font-semibold text-foreground truncate mt-0.5">
                        {currentStudent.email || "–"}
                      </p>
                    </div>
                    {currentStudent.email && (
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-emerald-600"
                          onClick={() => handleCopy(currentStudent.email, 'email')}
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
                          <a href={`mailto:${currentStudent.email}`}>
                            <Mail className="size-3.5" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Phone Field with Copy */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-muted-foreground font-medium uppercase">Phone Number</p>
                      <p className="text-sm font-semibold text-foreground truncate mt-0.5">
                        {currentStudent.phone || "–"}
                      </p>
                    </div>
                    {currentStudent.phone && (
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-emerald-600"
                          onClick={() => handleCopy(currentStudent.phone || '', 'phone')}
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
                          <a href={`tel:${currentStudent.phone}`}>
                            <Phone className="size-3.5" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Siblings Section (if present) */}
              {currentStudent.siblings && currentStudent.siblings.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Users className="size-3.5 text-emerald-600" />
                    Siblings (Brother / Sister)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentStudent.siblings.map((sib) => {
                      const sibInitials = sib.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();
                      return (
                        <div
                          key={sib.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-secondary/15 border border-secondary/20 hover:bg-emerald-500/5 dark:hover:bg-emerald-950/10 transition-colors"
                        >
                          <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0">
                            {sibInitials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {sib.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {sib.className || "Unassigned"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 3: Transport service info (Premium Bento-style display) */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Bus className="size-3.5 text-emerald-600" />
                  Transport Details
                </h3>

                {studentDetails?.transport ? (
                  <div className="bg-emerald-500/5 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/10 space-y-3.5">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Bus className="size-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[10px]">Service Status</p>
                        <p className="text-sm font-bold capitalize">Active Subscription</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
                      <div>
                        <p className="text-muted-foreground font-medium uppercase text-[9px] tracking-wide">Assigned Route</p>
                        <p className="font-semibold text-foreground mt-0.5">
                          {transportRoute ? transportRoute.name : "Loading Route..."}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-medium uppercase text-[9px] tracking-wide">Pickup Point</p>
                        <p className="font-semibold text-foreground mt-0.5 flex items-center gap-1">
                          <MapPin className="size-3 text-emerald-600" />
                          {studentDetails.transport.pickupPoint || "–"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-muted p-5 rounded-xl text-center">
                    <Bus className="size-6 text-muted-foreground/30 mx-auto mb-1.5" />
                    <p className="text-xs text-muted-foreground font-medium">No transport services assigned</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-secondary/20 border-t flex justify-end flex-shrink-0">
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md shadow-emerald-600/10"
            onClick={() => onOpenChange(false)}
          >
            Close Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
