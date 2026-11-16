"use client";

import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, User, Hash, Calendar, ShieldCheck, BookOpen } from "lucide-react";
import type { StudentInfo } from "@/types";

interface StudentProfileCardProps {
  student: StudentInfo;
}

const formatDob = (dob: string | null | undefined) => {
  if (!dob) return "N/A";
  try {
    return new Date(dob).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch (e) {
    return dob;
  }
};

export function StudentProfileCard({ student }: StudentProfileCardProps) {
  const initials = student.name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
      <CardContent className="p-5 sm:p-6 text-center">
        <div className="max-w-md mx-auto">
          {/* Avatar: Clean rounded square profile with border */}
          <div className="size-20 sm:size-24 rounded-2xl bg-muted border border-border flex items-center justify-center text-foreground text-2xl sm:text-3xl font-bold shadow-xs mx-auto overflow-hidden">
            {student.avatar ? (
              <img src={student.avatar} alt={student.name} className="size-full object-cover" />
            ) : (
              initials
            )}
          </div>

          {/* Identity Details */}
          <div className="mt-3 space-y-0.5">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              {student.name}
            </h3>
            <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5 font-medium">
              <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              Verified Student
            </p>
          </div>

          {/* Vertical Profile Fields */}
          <div className="mt-6 pt-4 border-t border-border space-y-3 text-left">
            {/* Class Row */}
            <div className="flex items-center justify-between py-1 border-b border-border">
              <div className="flex items-center gap-2">
                <GraduationCap className="size-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">Class</span>
              </div>
              <span className="text-xs font-semibold text-foreground">{student.className}</span>
            </div>

            {/* Roll Number */}
            <div className="flex items-center justify-between py-1 border-b border-border">
              <div className="flex items-center gap-2">
                <Hash className="size-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">Roll Number</span>
              </div>
              <span className="text-xs font-semibold text-foreground">{student.rollNumber || "N/A"}</span>
            </div>

            {/* Gender */}
            <div className="flex items-center justify-between py-1 border-b border-border">
              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">Gender</span>
              </div>
              <span className="text-xs font-semibold text-foreground capitalize">{student.gender || "N/A"}</span>
            </div>

            {/* Date of Birth */}
            <div className="flex items-center justify-between py-1 border-b border-border">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">Date of Birth</span>
              </div>
              <span className="text-xs font-semibold text-foreground" suppressHydrationWarning>
                {formatDob(student.dateOfBirth)}
              </span>
            </div>

            {/* Academic Session */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">Academic Session</span>
              </div>
              <span className="text-xs font-semibold text-foreground">{student.academicYear || "Current"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
