"use client";


import { apiFetch } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/store/use-app-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BookOpen, GraduationCap, User } from "lucide-react";
import type { StudentInfo, SubjectInfo } from "@/types";

export function StudentClasses() {
  const { currentUser } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);

  const student = students.find((s) => s.email === currentUser?.email) || null;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsData, subjectsData] = await Promise.all([
        apiFetch("/api/students").then((res) => res.json()),
        apiFetch("/api/subjects").then((res) => res.json()),
      ]);
      
      setStudents(Array.isArray(studentsData?.items) ? studentsData.items : []);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const mySubjects = student
    ? subjects.filter((s) => s.className === student.className)
    : [];

  if (loading) return <ClassesSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            My Subjects
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {mySubjects.length} subjects enrolled in{" "}
            {student?.className || "your class"}
          </p>
        </div>
        {student && (
          <Badge
            variant="secondary"
            className="text-sm px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80"
          >
            <GraduationCap className="size-3.5 mr-1.5" />
            {student.className} • Roll {student.rollNumber}
          </Badge>
        )}
      </div>

      {/* Subjects Grid */}
      {mySubjects.length === 0 ? (
        <Card className="rounded-xl shadow-sm">
          <CardContent className="py-16 text-center">
            <BookOpen className="size-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground font-medium">
              No subjects found
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Your class subjects will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mySubjects.map((subject) => (
            <div
              key={subject.id}
              className="flex flex-col rounded-xl border  bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/60"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <BookOpen className="size-5" />
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono text-muted-foreground"
                >
                  {subject.code}
                </Badge>
              </div>

              <h3 className="mt-4 font-semibold text-foreground text-sm line-clamp-1">
                {subject.name}
              </h3>

              {/* Pushed to the bottom so every card in the row ends at the same line. */}
              <div className="mt-auto space-y-2 border-t  pt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="size-3.5 shrink-0" />
                  <span className="truncate">{subject.teacherName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="size-3.5 shrink-0" />
                  <span className="truncate">{subject.className}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClassesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-7 w-36 rounded-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
