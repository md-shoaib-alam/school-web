"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { 
  FileText, BookOpen, Users, CalendarDays, Clock, Save, 
  CheckCircle2, XCircle, AlertCircle, Loader2, School, Award
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import { goeyToast as toast } from "goey-toast";

interface ExamRecord {
  id: string;
  classId: string;
  className: string;
  classSection: string;
  subjectId: string;
  subjectName: string;
  name: string;
  examType: string;
  totalMarks: number;
  passingMarks: number;
  date: string;
  startTime?: string;
  endTime?: string;
  status: string;
}

interface ClassInfo {
  id: string;
  name: string;
  section: string;
}

interface StudentResultRow {
  studentId: string;
  studentName: string;
  rollNumber: string;
  marksObtained: string;
  remarks: string;
  status: "pass" | "fail" | "pending";
}

export function TeacherExamsEntry() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");
  const [resultRows, setResultRows] = useState<StudentResultRow[]>([]);
  
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [savingResults, setSavingResults] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const selectedExam = useMemo(() => {
    return exams.find(e => e.id === selectedExamId) || null;
  }, [exams, selectedExamId]);

  // 1. Load classes assigned to teacher
  useEffect(() => {
    setLoadingClasses(true);
    apiFetch("/api/classes")
      .then(r => r.json())
      .then(data => {
        setClasses(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Load classes failed:", err))
      .finally(() => setLoadingClasses(false));
  }, []);

  // 2. Load teacher's specific exams when class changes
  useEffect(() => {
    if (!selectedClass) {
      setExams([]);
      setSelectedExamId("");
      setResultRows([]);
      return;
    }

    setLoadingExams(true);
    setSelectedExamId("");
    setResultRows([]);
    
    // Fetch structured exams filtered to this class and strictly the requesting teacher's assigned subjects
    apiFetch(`/api/exams?classId=${selectedClass}&mine=true&limit=100`)
      .then(r => r.json())
      .then(data => {
        const examsList = data?.data || (Array.isArray(data) ? data : []);
        // Exclude completely published/completed exams if admin does locks, or allow editing
        // Let's match the admin view by letting teachers record pending results
        setExams(examsList.filter((e: ExamRecord) => 
          e.status !== "cancelled" && 
          (e.examType === "midterm" || e.examType === "final")
        ));

      })
      .catch(err => console.error("Load exams failed:", err))
      .finally(() => setLoadingExams(false));
  }, [selectedClass]);

  // 3. Load student list and existing scores for selected structured exam
  useEffect(() => {
    if (!selectedExamId || !selectedClass) {
      setResultRows([]);
      return;
    }

    setLoadingStudents(true);
    
    Promise.all([
      apiFetch(`/api/students?classId=${selectedClass}&mode=min&limit=1000`),
      apiFetch(`/api/exams/results?examId=${selectedExamId}`)
    ])
      .then(async ([studentsRes, resultsRes]) => {
        const [studentsData, resultsData] = await Promise.all([
          studentsRes.json(),
          resultsRes.json()
        ]);

        const studentsList = studentsData.items || (Array.isArray(studentsData) ? studentsData : []);
        const resultsList = resultsData.results || [];

        const rows = studentsList.map((s: any) => {
          const match = resultsList.find((r: any) => r.studentId === s.id);
          return {
            studentId: s.id,
            studentName: s.name,
            rollNumber: s.rollNumber || "N/A",
            marksObtained: match ? String(match.marksObtained) : "",
            remarks: match?.remarks || "",
            status: match ? match.status : "pending"
          };
        });
        setResultRows(rows);
      })
      .catch(err => {
        console.error("Failed loading entry rows:", err);
        toast.error("Failed to load class students");
      })
      .finally(() => setLoadingStudents(false));
  }, [selectedExamId, selectedClass]);

  const handleUpdateMark = (studentId: string, val: string) => {
    if (!selectedExam) return;

    setResultRows(prev => prev.map(row => {
      if (row.studentId !== studentId) return row;
      
      if (val === "") {
        return { ...row, marksObtained: "", status: "pending" };
      }

      const num = parseFloat(val);
      if (num < 0) return row;
      if (num > selectedExam.totalMarks) {
        toast.error(`Marks cannot exceed total (${selectedExam.totalMarks})!`);
        return row;
      }

      const isPass = num >= selectedExam.passingMarks;
      return {
        ...row,
        marksObtained: val,
        status: isPass ? "pass" : "fail"
      };
    }));
  };



  const handleSaveDraft = async () => {
    if (!selectedExamId) return;
    setSavingResults(true);
    try {
      const res = await apiFetch("/api/exams/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: selectedExamId,
          results: resultRows
            .filter(r => r.marksObtained.trim() !== "")
            .map(r => ({
              studentId: r.studentId,
              marksObtained: parseFloat(r.marksObtained),
              status: r.status,
              remarks: r.remarks || null
            }))
        })
      });

      if (res.ok) {
        toast.success("Exam marks draft saved successfully!");
      } else {
        throw new Error("Draft save returned failure status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save marks draft");
    }
    setSavingResults(false);
  };

  const handlePublish = async () => {
    if (!selectedExam) return;
    
    const hasPending = resultRows.some(r => r.marksObtained.trim() === "");
    if (hasPending) {
      const proceed = window.confirm("Some students are missing marks. Do you want to publish the results anyway?");
      if (!proceed) return;
    } else {
      const proceed = window.confirm("Publishing will finalize the results and lock them for student viewing. Continue?");
      if (!proceed) return;
    }

    setIsPublishing(true);
    try {
      // 1. Save All Entered Results
      const saveRes = await apiFetch("/api/exams/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: selectedExam.id,
          results: resultRows
            .filter(r => r.marksObtained.trim() !== "")
            .map(r => ({
              studentId: r.studentId,
              marksObtained: parseFloat(r.marksObtained),
              status: r.status,
              remarks: r.remarks || null
            }))
        })
      });

      if (!saveRes.ok) throw new Error("Failed to commit final results");

      // 2. Transition exam status to completed (published)
      const updateRes = await apiFetch("/api/exams", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedExam.id,
          status: "completed"
        })
      });

      if (updateRes.ok) {
        toast.success("Exam results successfully published!");
        // Refresh selection status locally
        setExams(prev => prev.map(e => e.id === selectedExam.id ? { ...e, status: "completed" } : e));
      } else {
        throw new Error("Failed to lock exam status to published");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to publish exam results");
    }
    setIsPublishing(false);
  };

  const resultSummary = {
    total: resultRows.length,
    pass: resultRows.filter((r) => r.status === "pass").length,
    fail: resultRows.filter((r) => r.status === "fail").length,
    pending: resultRows.filter((r) => r.marksObtained === "").length,
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  if (loadingClasses) {
    return (
      <div className="space-y-4 animate-pulse">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-4 md:px-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Persistent Selectors Card */}
      <Card className="border-orange-500/20 dark:border-orange-500/10 shadow-sm overflow-hidden">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base flex items-center gap-3">
            <div className="size-7 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 flex items-center justify-center text-sm font-bold">
              {selectedExam ? <CheckCircle2 className="size-4" /> : "1"}
            </div>
            Select Class & Subject
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-72">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full h-10">
                  <div className="flex items-center gap-2">
                    <School className="size-4 text-orange-500" />
                    <SelectValue placeholder="Choose a class..." />
                  </div>
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

            <div className="w-full sm:w-80">
              <Select 
                value={selectedExamId} 
                onValueChange={setSelectedExamId}
                disabled={!selectedClass || loadingExams}
              >
                <SelectTrigger className={`w-full h-10 ${selectedClass ? 'border-orange-200 dark:border-orange-900/50' : 'opacity-50'}`}>
                  <div className="flex items-center gap-2">
                    {loadingExams ? (
                      <Loader2 className="size-4 animate-spin text-blue-500" />
                    ) : (
                      <BookOpen className="size-4 text-emerald-500" />
                    )}
                    <SelectValue placeholder={loadingExams ? "Fetching exams..." : "Select Subject/Exam..."} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {exams.length > 0 ? (
                    exams.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name} ({e.subjectName})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No scheduled exams</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conditional Views */}
      {!selectedExam ? (
        <Card className="border-dashed border-2 bg-transparent">
          <CardContent className="py-20 text-center text-muted-foreground">
            {selectedClass ? (
              <>
                <BookOpen className="size-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">Please select an exam to continue</p>
                <p className="text-sm">Pick an exam from your assigned subjects above to start entering results.</p>
              </>
            ) : (
              <>
                <School className="size-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No Class Selected</p>
                <p className="text-sm">Choose a class at the top to see available exams.</p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          {/* Exam Info Card */}
          <Card className="border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-950/10">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="size-5 text-blue-600" />
                    {selectedExam.name}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="size-3.5" />
                      {selectedExam.subjectName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="size-3.5" />
                      {selectedExam.className} - {selectedExam.classSection}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="size-3.5" />
                      {formatDate(selectedExam.date)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {selectedExam.examType.replace("_", " ")}
                  </Badge>
                  {selectedExam.status === "completed" ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
                      Published
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">
                      Draft
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t text-sm">
                <span className="font-medium">
                  Total Marks: <span className="text-blue-600 font-bold">{selectedExam.totalMarks}</span>
                </span>
                <span className="font-medium">
                  Passing Marks: <span className="text-emerald-600 font-bold">{selectedExam.passingMarks}</span>
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary Mini Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground">Total Students</p>
                <p className="text-xl font-bold">{resultSummary.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Passed</p>
                <p className="text-xl font-bold text-emerald-600">{resultSummary.pass}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xs text-red-600 dark:text-red-400">Failed</p>
                <p className="text-xl font-bold text-red-600">{resultSummary.fail}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xs text-amber-600 dark:text-amber-400">Pending</p>
                <p className="text-xl font-bold text-amber-600">{resultSummary.pending}</p>
              </CardContent>
            </Card>
          </div>

          {/* Scoring Table Card */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-base">Enter Results</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Enter marks for each student. Pass/fail is auto-calculated.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={savingResults || isPublishing || resultRows.length === 0}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  {savingResults ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
                  Save Draft
                </Button>
                <Button 
                  onClick={handlePublish}
                  disabled={savingResults || isPublishing || resultRows.length === 0 || selectedExam.status === "completed"}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                >
                  {isPublishing ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                  {selectedExam.status === "completed" ? "Already Published" : "Publish Results"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loadingStudents ? (
                <div className="p-6 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : resultRows.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="size-10 mx-auto mb-2 opacity-30" />
                  <p>No students found for this class</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">#</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead className="hidden sm:table-cell w-20">Roll No</TableHead>
                        <TableHead className="w-28">Marks</TableHead>
                        <TableHead className="w-20 text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resultRows.map((row, idx) => (
                        <TableRow key={row.studentId}>
                          <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                          <TableCell className="font-medium text-sm">{row.studentName}</TableCell>
                          <TableCell className="hidden sm:table-cell text-xs text-muted-foreground font-mono">
                            {row.rollNumber}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={row.marksObtained}
                              onChange={(e) => handleUpdateMark(row.studentId, e.target.value)}
                              placeholder="0"
                              disabled={selectedExam.status === "completed"}
                              className="h-8 text-sm"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            {row.marksObtained.trim() === "" ? (
                              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 py-0 h-5">
                                <AlertCircle className="size-3 mr-1" /> Pending
                              </Badge>
                            ) : row.status === "pass" ? (
                              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0 h-5">
                                <CheckCircle2 className="size-3 mr-1" /> Pass
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none px-2 py-0 h-5">
                                <XCircle className="size-3 mr-1" /> Fail
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
