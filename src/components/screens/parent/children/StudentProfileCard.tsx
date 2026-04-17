"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, User, Hash, Calendar, Clock, Award, BookOpen } from "lucide-react";
import type { StudentInfo } from "@/lib/types";

interface StudentProfileCardProps {
  student: StudentInfo;
  attendancePct: number;
  overallAvg: number;
  overallGrade: string;
  subjectCount: number;
}

export function StudentProfileCard({
  student,
  attendancePct,
  overallAvg,
  overallGrade,
  subjectCount,
}: StudentProfileCardProps) {
  return (
    <Card className="rounded-xl shadow-sm border-gray-100 dark:border-gray-800 shadow-none">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">
            {student.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><User className="h-3 w-3" /> Full Name</div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{student.name}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><GraduationCap className="h-3 w-3" /> Class</div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{student.className}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Hash className="h-3 w-3" /> Roll Number</div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{student.rollNumber}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><User className="h-3 w-3" /> Gender</div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{student.gender === "male" ? "Male" : "Female"}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="h-3 w-3" /> Date of Birth</div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> Attendance</div>
              <div className="flex items-center gap-2">
                <Progress value={attendancePct} className="h-2 w-16 [&>div]:bg-amber-500" />
                <p className={`text-sm font-bold ${attendancePct >= 80 ? "text-emerald-600 dark:text-emerald-400" : attendancePct >= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                  {attendancePct}%
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Award className="h-3 w-3" /> Average Grade</div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{overallAvg}%</span>
                <Badge variant="outline" className={`font-bold text-xs shadow-none ${overallGrade.startsWith("A") ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : overallGrade.startsWith("B") ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"}`}>
                  {overallGrade}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><BookOpen className="h-3 w-3" /> Subjects</div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{subjectCount}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
