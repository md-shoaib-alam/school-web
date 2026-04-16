"use client";


import { apiFetch } from "@/lib/api";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, Save, BookOpen, Users, Eye } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { useModulePermissions } from "@/hooks/use-permissions";

interface ClassInfo {
  id: string;
  name: string;
  section: string;
  studentCount: number;
  classTeacher?: string;
}
interface StudentInfo {
  id: string;
  name: string;
  rollNumber: string;
}
interface SubjectInfo {
  id: string;
  name: string;
  code: string;
  className: string;
  teacherName?: string;
}

export function TeacherGrades() {
  const { canCreate, canEdit, canDelete } = useModulePermissions("grades");
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [examType, setExamType] = useState("midterm");
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([apiFetch("/api/classes"), apiFetch("/api/subjects")])
      .then(([cRes, sRes]) => Promise.all([cRes.json(), sRes.json()]))
      .then(([cData, sData]) => {
        setClasses(cData);
        setSubjects(sData);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    apiFetch(`/api/students?classId=${selectedClass}`)
      .then((r) => r.json())
      .then((data) => {
        setStudents(data);
        setMarks({});
      });
  }, [selectedClass]);

  const filteredSubjects = subjects.filter((s) =>
    s.className.includes(
      classes.find((c) => c.id === selectedClass)?.name || "",
    ),
  );

  const getGrade = (m: number, max: number) => {
    const pct = (m / max) * 100;
    if (pct >= 90) return "A+";
    if (pct >= 80) return "A";
    if (pct >= 70) return "B+";
    if (pct >= 60) return "B";
    if (pct >= 50) return "C";
    return "D";
  };

  const getGradeColor = (g: string) => {
    if (g === "A+" || g === "A")
      return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30";
    if (g === "B+" || g === "B")
      return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30";
    if (g === "C")
      return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30";
    return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30";
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const maxMarks =
        examType === "quiz" ? 20 : examType === "midterm" ? 50 : 100;
      for (const student of students) {
        const m = marks[student.id];
        if (m && parseFloat(m) > 0) {
          await apiFetch("/api/grades", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentId: student.id,
              subjectId: selectedSubject,
              teacherId: "demo-teacher",
              examType,
              marks: parseFloat(m),
              maxMarks,
              remarks: "",
            }),
          });
        }
      }
      toast.success("Grades saved successfully!");
    } catch {
      toast.error("Failed to save grades");
    }
    setSaving(false);
  };

  if (loading)
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-xl" />
        ))}
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Read-only banner */}
      {!canCreate && !canEdit && !canDelete && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-3 py-2">
          <Eye className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
            Read-only mode — you have view permission only for this module.
          </span>
        </div>
      )}

      {/* Filters */}
      <Card className="rounded-xl shadow-sm">
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">
                Class
              </Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} - {c.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 w-full">
              <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">
                Subject
              </Label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 w-full">
              <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">
                Exam Type
              </Label>
              <Select value={examType} onValueChange={setExamType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="midterm">Midterm (50 marks)</SelectItem>
                  <SelectItem value="final">Final (100 marks)</SelectItem>
                  <SelectItem value="quiz">Quiz (20 marks)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {canCreate && (
              <Button
                onClick={handleSave}
                disabled={
                  !selectedClass ||
                  !selectedSubject ||
                  students.length === 0 ||
                  saving
                }
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />{" "}
                {saving ? "Saving..." : "Save Grades"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grade Table */}
      {students.length > 0 && (
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-500" />
              Enter Marks — {
                classes.find((c) => c.id === selectedClass)?.name
              }{" "}
              ({students.length} students)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="w-40">Marks</TableHead>
                    <TableHead className="w-24">Grade</TableHead>
                    <TableHead className="w-48">Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, idx) => {
                    const maxMarks =
                      examType === "quiz"
                        ? 20
                        : examType === "midterm"
                          ? 50
                          : 100;
                    const m = parseFloat(marks[student.id] || "0");
                    const grade = marks[student.id]
                      ? getGrade(m, maxMarks)
                      : "-";
                    const pct = marks[student.id] ? (m / maxMarks) * 100 : 0;
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="text-gray-400 dark:text-gray-500 text-sm">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {student.rollNumber}
                        </TableCell>
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max={maxMarks}
                            placeholder="0"
                            value={marks[student.id] || ""}
                            onChange={(e) =>
                              setMarks({
                                ...marks,
                                [student.id]: e.target.value,
                              })
                            }
                            className="w-24 h-9 text-center"
                          />
                        </TableCell>
                        <TableCell>
                          {grade !== "-" && (
                            <Badge
                              variant="secondary"
                              className={getGradeColor(grade)}
                            >
                              {grade}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {marks[student.id] && (
                            <div className="flex items-center gap-2">
                              <Progress
                                value={Math.min(pct, 100)}
                                className="h-2 flex-1"
                              />
                              <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">
                                {pct.toFixed(0)}%
                              </span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedClass && students.length === 0 && (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No students found in this class</p>
        </div>
      )}

      {!selectedClass && (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Select a class to enter grades</p>
          <p className="text-sm mt-1">
            Choose a class, subject, and exam type to get started
          </p>
        </div>
      )}
    </div>
  );
}
