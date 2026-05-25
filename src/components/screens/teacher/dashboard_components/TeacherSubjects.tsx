"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

interface TeacherSubjectsProps {
  subjects: any[];
}

export function TeacherSubjects({ subjects }: TeacherSubjectsProps) {
  return (
    <Card className="rounded-xl shadow-sm border-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BookOpen className="size-4 text-blue-500" />
            My Subjects
          </CardTitle>
          <Badge
            variant="secondary"
            className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs"
          >
            {subjects.length} subjects
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-2">
          {subjects.slice(0, 5).map((subject) => (
            <div
              key={subject.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <BookOpen className="size-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {subject.name}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {subject.className} • {subject.code}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {subjects.length === 0 && (
            <div className="text-center py-6">
              <BookOpen className="size-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
              <p className="text-zinc-400 dark:text-zinc-500 text-sm">
                No subjects assigned
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
