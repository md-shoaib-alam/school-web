"use client";


import { apiFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  School,
  Users,
  ChevronRight,
} from "lucide-react";

interface ClassInfo {
  id: string;
  name: string;
  section: string;
  grade: string;
  studentCount: number;
  classTeacher: string;
}

interface StudentInfo {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  rollNumber: string;
  className: string;
  classId: string;
  gender: string;
  parentName: string | null;
}

export function TeacherClasses() {
  const { data: classData, isLoading: classesLoading } = useQuery<ClassInfo[]>({
    queryKey: ["teacher-classes"],
    queryFn: async () => {
      const res = await apiFetch("/api/classes");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const classes = [...(classData || [])].sort((a, b) => {
    // Extract numeric part from grade name (e.g. "Grade 5" → 5)
    const gradeNum = (g: string) => parseInt(g.replace(/\D/g, ""), 10) || 0;
    const gradeDiff = gradeNum(a.name) - gradeNum(b.name);
    if (gradeDiff !== 0) return gradeDiff;
    return a.section.localeCompare(b.section);
  });
  const loading = classesLoading;

  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenClass = async (cls: ClassInfo) => {
    setSelectedClass(cls);
    setDialogOpen(true);
    setStudentsLoading(true);
    try {
      const res = await apiFetch(`/api/students?classId=${cls.id}`);
      const data = await res.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setStudentsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getGenderColor = (gender: string) => {
    return gender === "male"
      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
      : "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          My Classes
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {classes.length} classes assigned to you. Click on a class to view
          student details.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
            <Card
              key={cls.id}
              className="rounded-xl shadow-sm border-0 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer group"
              onClick={() => handleOpenClass(cls)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                      <School className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {cls.name}
                      </h3>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        Section {cls.section}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300 dark:text-gray-600 group-hover:text-blue-400 dark:group-hover:text-blue-400 transition-colors" />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                    <span className="font-medium">{cls.studentCount}</span>
                    <span className="text-gray-400 dark:text-gray-500">
                      Students
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
        ))}
      </div>

      {classes.length === 0 && (
        <div className="text-center py-20 bg-gray-900/20 rounded-3xl border border-dashed border-gray-800">
          <School className="h-16 w-16 text-gray-700 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-gray-300">
            No Classes Assigned
          </h3>
          <p className="text-gray-500 mt-2 max-w-xs mx-auto">
            You don't have any classes assigned to you at the moment. Please contact your administrator.
          </p>
        </div>
      )}

      {/* Student List Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <span className="text-lg font-semibold">
                  {selectedClass?.name} - Section {selectedClass?.section}
                </span>
                <DialogDescription className="mt-0.5">
                  {students.length} students enrolled
                </DialogDescription>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6">
            {studentsLoading ? (
              <div className="space-y-3 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-lg" />
                ))}
              </div>
            ) : students.length > 0 ? (
              <div className="mt-4 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 dark:bg-gray-800/50 hover:bg-gray-50/80 dark:hover:bg-gray-800/50">
                      <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400 w-[50px]">
                        #
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Student
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                        Roll No
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400 hidden md:table-cell">
                        Gender
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400 hidden md:table-cell">
                        Parent
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student, index) => (
                      <TableRow
                        key={student.id}
                        className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors"
                      >
                        <TableCell className="text-sm text-gray-400 dark:text-gray-500 font-mono">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                {getInitials(student.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                {student.name}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 sm:hidden">
                                {student.rollNumber}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400 hidden sm:table-cell">
                          {student.rollNumber}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge
                            variant="secondary"
                            className={`text-[10px] px-2 py-0.5 ${getGenderColor(student.gender)}`}
                          >
                            {student.gender}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                          {student.parentName || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-10 w-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  No students in this class yet
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
