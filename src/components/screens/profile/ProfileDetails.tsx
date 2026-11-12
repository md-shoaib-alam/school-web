"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { Shield, Phone, MapPin, CheckCircle2 } from "lucide-react";
import type { AppUser, UserRole } from "@/store/use-app-store";

const roleQuotes: Record<UserRole, string> = {
  super_admin: "Commanding the platform and steering the digital infrastructure of our schools.",
  admin: "Empowering educators, managing resources, and shaping the future of education.",
  teacher: "Teaching is the greatest act of optimism. Inspiring minds, one class at a time.",
  student: "Knowledge is power. Success is the sum of small efforts, repeated day in and day out.",
  parent: "Supporting children's learning journey and fostering collaboration with the school.",
  staff: "Ensuring operations run smoothly to cultivate an environment of learning excellence.",
};

interface ProfileDetailsProps {
  user: AppUser;
  onEditClick: () => void;
  getSchoolUrl: () => string;
}

export function ProfileDetails({
  user,
  onEditClick,
  getSchoolUrl,
}: ProfileDetailsProps) {
  const schoolUrl = getSchoolUrl();

  return (
    <Card className="border  shadow-sm rounded-2xl">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
        <div>
          <CardTitle className="text-lg font-bold">Profile Details</CardTitle>
          <CardDescription>Personal verified identification records of your school account.</CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
          {user.role === "admin" && (
            <CopyButton
              value={schoolUrl}
              label="Copy School Portal URL"
              toastSubject="School portal URL"
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            />
          )}
          <Button 
            onClick={onEditClick} 
            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold rounded-xl text-xs gap-1.5 h-9 w-full sm:w-auto justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-emerald-500/25 active:translate-y-0 active:scale-[0.98]"
          >
            Edit Profile
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted dark:bg-[#0c0c0e]/30 border  rounded-xl space-y-1 relative group">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Full Name</p>
            <p className="text-sm font-semibold text-foreground truncate pr-6">{user.name}</p>
            <CopyButton
              value={user.name}
              toastSubject="Name"
              className="absolute right-2 top-1/2 -translate-y-1/2"
            />
          </div>

          <div className="p-4 bg-muted dark:bg-[#0c0c0e]/30 border  rounded-xl space-y-1 relative group">
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Email Address</p>
              <Badge variant="outline" className="text-[8px] h-3.5 px-1 py-0 border-emerald-500/30 text-emerald-500 bg-emerald-500/5 font-bold">Verified</Badge>
            </div>
            <p className="text-sm font-semibold text-foreground truncate pr-6">{user.email}</p>
            <CopyButton
              value={user.email}
              toastSubject="Email"
              className="absolute right-2 top-1/2 -translate-y-1/2"
            />
          </div>

          <div className="p-4 bg-muted dark:bg-[#0c0c0e]/30 border  rounded-xl space-y-1">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Primary Authority Role</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Shield className="size-4 text-emerald-500" />
              <span className="text-sm font-semibold text-foreground capitalize">{user.role.replace("_", " ")}</span>
            </div>
          </div>

          <div className="p-4 bg-muted dark:bg-[#0c0c0e]/30 border  rounded-xl space-y-1 relative group">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Mobile Number</p>
            <div className="flex items-center gap-1.5 mt-0.5 pr-6">
              <Phone className="size-4 text-blue-500" />
              <span className="text-sm font-semibold text-foreground">
                {user.phone || "Not set"}
              </span>
            </div>
            <CopyButton
              value={user.phone || ""}
              toastSubject="Mobile number"
              className="absolute right-2 top-1/2 -translate-y-1/2"
            />
          </div>

          <div className="p-4 bg-muted dark:bg-[#0c0c0e]/30 border  rounded-xl space-y-1 relative group md:col-span-2">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Residential Address</p>
            <div className="flex items-start gap-1.5 mt-0.5 pr-6">
              <MapPin className="size-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="text-sm font-semibold text-foreground leading-normal">
                {user.address || "Not set"}
              </span>
            </div>
            <CopyButton
              value={user.address || ""}
              toastSubject="Address"
              className="absolute right-2 top-1/2 -translate-y-1/2"
            />
          </div>

          {user.role !== "super_admin" && (
            <>
              {user.role === "admin" && (
                <div className="p-4 bg-violet-500/5 dark:bg-violet-500/10 border border-violet-500/15 rounded-xl space-y-2 md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative group">
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="text-[10px] uppercase font-bold text-violet-600 dark:text-violet-400">Shareable School Portal URL</p>
                    <p className="text-xs font-mono font-bold text-foreground break-all">
                      {getSchoolUrl()}
                    </p>
                  </div>
                  <CopyButton
                    value={getSchoolUrl()}
                    label="Copy URL"
                    toastSubject="School portal URL"
                    variant="outline"
                    className="shrink-0"
                  />
                </div>
              )}
              <div className="p-4 bg-muted dark:bg-[#0c0c0e]/30 border  rounded-xl space-y-1 relative group">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">School URL Identifier</p>
                <p className="text-sm font-semibold text-foreground break-all pr-10">{user.tenantSlug || "N/A"}</p>
                <CopyButton
                  value={user.tenantSlug || ""}
                  toastSubject="School URL identifier"
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                />
              </div>
            </>
          )}
        </div>

        <div className="p-4 bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/20 dark:to-zinc-900 border border-violet-100 dark:border-violet-950/50 rounded-2xl flex items-start gap-3 mt-6">
          <CheckCircle2 className="size-5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-violet-950 dark:text-violet-200">Role Purpose & Duty</p>
            <p className="text-xs text-violet-700 dark:text-violet-300/85 mt-1 leading-relaxed italic">
              &ldquo;{roleQuotes[user.role]}&rdquo;
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
