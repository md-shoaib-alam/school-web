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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, Save, BookOpen, Users, Eye, Plus, Loader2, FileText, Sparkles, GraduationCap, Trophy, CheckCircle2, Check, Clock, Globe, AlertTriangle } from "lucide-react";
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
  classId: string;
  teacherName?: string;
}

interface Assessment {
  id: string;
  classId: string;
  subjectId: string;
  title: string;
  type: string;
  totalMarks: number;
  passingMarks: number;
  grades?: { id: string }[];
  class?: { students: { id: string }[] };
  status?: string;
}


export function TeacherGrades() {
  const { canCreate, canEdit, canDelete } = useModulePermissions("grades");
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [students, setStudents] = useState<StudentInfo[]>([]);

  // Isolated assessment states
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const [confirmCompleteId, setConfirmCompleteId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const [marks, setMarks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [listLoading, setListLoading] = useState(true);

  // Dialog states for creating a new assessment
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("unit_test");
  const [newMode, setNewMode] = useState("offline");
  const [newTotalMarks, setNewTotalMarks] = useState("25");
  const [newPassingMarks, setNewPassingMarks] = useState("10");
  const [isCreating, setIsCreating] = useState(false);

  const [dialogClassId, setDialogClassId] = useState("");
  const [dialogSubjectId, setDialogSubjectId] = useState("");

  // 1. Initial bootstrap data (Classes/Subjects)
  useEffect(() => {
    Promise.all([
      apiFetch("/api/classes"),
      apiFetch("/api/subjects?mine=true"),
    ])
      .then(([cRes, sRes]) => Promise.all([cRes.json(), sRes.json()]))
      .then(([cData, sData]) => {
        setClasses(cData);
        setSubjects(sData);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  // 1b. Fetch assessments filtered by tab status
  useEffect(() => {
    setListLoading(true);
    apiFetch(`/api/assessments?status=${activeTab}`)
      .then((r) => r.json())
      .then((data) => {
        setAssessments(data || []);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        setListLoading(false);
      });
  }, [activeTab]);

  // 2. Load students for selected assessment's class
  useEffect(() => {
    if (!selectedAssessmentId) {
      setStudents([]);
      setMarks({});
      setIsDirty(false);
      return;
    }
    const assessment = assessments.find(a => a.id === selectedAssessmentId);
    if (!assessment) return;

    apiFetch(`/api/students?classId=${assessment.classId}`)
      .then((r) => r.json())
      .then((data) => {
        const studentArray = Array.isArray(data) ? data : (data?.items || []);
        setStudents(studentArray);
      });
  }, [selectedAssessmentId, assessments]);

  // 4. Load existing grades for selected isolated assessment
  useEffect(() => {
    if (!selectedAssessmentId) {
      setMarks({});
      setIsDirty(false);
      return;
    }
    setGradesLoading(true);
    apiFetch(`/api/assessments/${selectedAssessmentId}/grades`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const initialMarks: Record<string, string> = {};
          data.forEach((g: any) => {
            if (g.studentId && g.marksObtained !== undefined && g.marksObtained !== null) {
              initialMarks[g.studentId] = g.marksObtained.toString();
            }
          });
          setMarks(initialMarks);
          setIsDirty(false);
        } else {
          setMarks({});
          setIsDirty(false);
        }
      })
      .catch((e) => {
        console.error(e);
        setMarks({});
        setIsDirty(false);
      })
      .finally(() => setGradesLoading(false));
  }, [selectedAssessmentId]);



  const activeAssessment = assessments.find(a => a.id === selectedAssessmentId);
  const isActiveAssocCompleted = activeAssessment?.status === 'completed';
  const maxMarks = activeAssessment?.totalMarks || 100;
  const passingMarks = activeAssessment?.passingMarks || 40;

  const marksArray = Object.values(marks)
    .filter((m) => m && m.trim() !== "")
    .map(Number);

  const classAvg =
    marksArray.length > 0
      ? (marksArray.reduce((acc, val) => acc + val, 0) / marksArray.length).toFixed(1)
      : "0.0";

  const passCount = marksArray.filter((m) => m >= passingMarks).length;
  const passPct =
    marksArray.length > 0
      ? Math.round((passCount / marksArray.length) * 100)
      : 0;

  const metricsCards = [
    {
      label: "Total Assessments",
      value: assessments.length,
      icon: <ClipboardList className="h-5 w-5" />,
      color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Class Average",
      value: selectedAssessmentId ? `${classAvg} / ${maxMarks}` : "N/A",
      icon: <GraduationCap className="h-5 w-5" />,
      color: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Passing Ratio",
      value: selectedAssessmentId && marksArray.length > 0 ? `${passPct}%` : "N/A",
      icon: <Trophy className="h-5 w-5" />,
      color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Students Evaluated",
      value: selectedAssessmentId ? `${marksArray.length} / ${students.length}` : students.length,
      icon: <Users className="h-5 w-5" />,
      color: "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400",
    },
  ];


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

  // CREATE ASSESSMENT
  const handleCreateAssessment = async () => {
    if (!newTitle.trim()) {
      toast.error("Please enter an assessment title!");
      return;
    }
    if (!dialogClassId || !dialogSubjectId) {
      toast.error("Please select both a Class and a Subject!");
      return;
    }
    setIsCreating(true);
    try {
      const res = await apiFetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: dialogClassId,
          subjectId: dialogSubjectId,
          title: newTitle,
          type: newType,
          totalMarks: parseFloat(newTotalMarks),
          passingMarks: parseFloat(newPassingMarks),
        }),
      });

      if (!res.ok) throw new Error("Failed to create");
      const created = await res.json();

      toast.success(`Created assessment "${newTitle}"!`);
      setIsDialogOpen(false);
      setNewTitle("");
      setNewMode("offline");
      
      // Seamlessly shift global view state to immediately display this assessment!
      setAssessments((prev) => [created, ...prev]);
      setSelectedAssessmentId(created.id);
    } catch (e) {
      console.error(e);
      toast.error("Could not create assessment");
    }
    setIsCreating(false);
  };

  // COMPLETE ASSESSMENT PERMANENTLY
  const handleCompleteAssessment = async (assessmentId: string) => {
    setCompletingId(assessmentId);
    try {
      const res = await apiFetch(`/api/assessments/${assessmentId}/complete`, {
        method: "PUT",
      });
      if (res.ok) {
        toast.success("Assessment finalized successfully!");
        setAssessments((prev) => prev.filter((item) => item.id !== assessmentId));
        if (selectedAssessmentId === assessmentId) {
          setSelectedAssessmentId("");
        }
      } else {
        toast.error("Could not complete assessment.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete assessment.");
    } finally {
      setCompletingId(null);
    }
  };


  // BULK SAVE GRADES
  const handleSave = async () => {
    if (!selectedAssessmentId) return;
    setSaving(true);
    try {
      const records = Object.entries(marks)
        .filter(([_, val]) => val.trim() !== "")
        .map(([studentId, val]) => ({
          studentId,
          marksObtained: parseFloat(val),
          remarks: "",
        }));

      if (records.length === 0) {
        toast.error("No marks entered to save!");
        setSaving(false);
        return;
      }

      const res = await apiFetch("/api/assessments/bulk-grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: selectedAssessmentId,
          records,
        }),
      });

      if (!res.ok) throw new Error("Bulk save failed");

      toast.success(`Saved marks for ${records.length} students successfully!`);
      setIsDirty(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save marks");
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
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Assessments
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {assessments.length} assessments total
          </p>
        </div>

        {/* Create Assessment Button & Modal */}
        {/* Create Assessment Button & Modal */}
        {canCreate && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md font-semibold transition-all hover:translate-y-[-1px] group">
                <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-all duration-200" />
                Create Assessment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  New Assessment
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-5 py-4">
                {/* Integrated Class & Subject Pickers */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label className="text-xs font-semibold text-muted-foreground">Class *</Label>
                    <Select
                      value={dialogClassId}
                      onValueChange={(v) => {
                        setDialogClassId(v);
                        setDialogSubjectId(""); // reset subject filter
                      }}
                    >
                      <SelectTrigger className="h-9 focus:ring-blue-500 focus-visible:ring-blue-500">
                        <SelectValue placeholder="Select Class" />
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

                  <div className="grid gap-2">
                    <Label className="text-xs font-semibold text-muted-foreground">Subject *</Label>
                    <Select
                      value={dialogSubjectId}
                      onValueChange={setDialogSubjectId}
                      disabled={!dialogClassId}
                    >
                      <SelectTrigger className="h-9 focus:ring-blue-500 focus-visible:ring-blue-500">
                        <SelectValue placeholder="Select Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects
                          .filter((s) => s.classId === dialogClassId)
                          .map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">Title / Name</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Chapter 1 Algebra Quiz"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="focus-visible:ring-blue-500 h-9"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label className="text-xs font-semibold text-muted-foreground">Category Type</Label>
                    <Select value={newType} onValueChange={setNewType}>
                      <SelectTrigger className="w-full h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unit_test">Unit Test</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="practical">Practical / Lab</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-xs font-semibold text-muted-foreground">Submission Mode</Label>
                    <Select value={newMode} onValueChange={setNewMode}>
                      <SelectTrigger className="w-full h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="offline">Offline (Classroom)</SelectItem>
                        <SelectItem value="online" disabled className="text-muted-foreground">
                          Online (🔒 Premium Only)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>


                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="total" className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Marks</Label>
                    <Input
                      id="total"
                      type="number"
                      value={newTotalMarks}
                      onChange={(e) => setNewTotalMarks(e.target.value)}
                      className="focus-visible:ring-blue-500"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="passing" className="text-sm font-medium text-gray-700 dark:text-gray-300">Passing Marks</Label>
                    <Input
                      id="passing"
                      type="number"
                      value={newPassingMarks}
                      onChange={(e) => setNewPassingMarks(e.target.value)}
                      className="focus-visible:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-2">
                <Button
                  onClick={handleCreateAssessment}
                  disabled={isCreating || !newTitle.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Assessment"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-6 animate-in fade-in-50 duration-300">
        {/* Read-only banner */}
        {!canCreate && !canEdit && !canDelete && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-3 py-2">
            <Eye className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
              Read-only mode — you have view permission only for this module.
            </span>
          </div>
        )}



        {/* Status Selection Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-800/80 mb-2 animate-in fade-in-50">
          <button
            onClick={() => {
              if (!listLoading) setActiveTab("active");
            }}
            disabled={listLoading}
            className={`pb-3 px-6 text-sm font-semibold transition-all duration-200 border-b-2 outline-none relative flex items-center gap-2 cursor-pointer disabled:opacity-75 ${
              activeTab === "active"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 translate-y-[1px]"
                : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            <Clock className={`h-4 w-4 ${activeTab === "active" ? "text-blue-500" : ""}`} />
            <span>Active</span>
            {!listLoading && activeTab === "active" && assessments.length > 0 && (
              <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-100 dark:border-blue-900/50 font-medium px-1.5 py-0 text-[10px] pointer-events-none rounded-full transition-all">
                {assessments.length}
              </Badge>
            )}
          </button>
          <button
            onClick={() => {
              if (!listLoading) setActiveTab("completed");
            }}
            disabled={listLoading}
            className={`pb-3 px-6 text-sm font-semibold transition-all duration-200 border-b-2 outline-none relative flex items-center gap-2 cursor-pointer disabled:opacity-75 ${
              activeTab === "completed"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 translate-y-[1px]"
                : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            <CheckCircle2 className={`h-4 w-4 ${activeTab === "completed" ? "text-emerald-500" : ""}`} />
            <span>Completed / Finalized</span>
            {!listLoading && activeTab === "completed" && assessments.length > 0 && (
              <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/50 font-medium px-1.5 py-0 text-[10px] pointer-events-none rounded-full transition-all">
                {assessments.length}
              </Badge>
            )}
          </button>
        </div>

        {/* Assessments Card Grid (Homework‑style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[200px]">
          {listLoading ? (
            [...Array(3)].map((_, i) => (
              <Card key={i} className="rounded-xl border border-gray-100 dark:border-gray-800 p-5 space-y-4 animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800/60 rounded w-1/2" />
                  </div>
                  <div className="h-5 w-16 bg-gray-100 dark:bg-gray-800 rounded-full" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/6" />
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full" />
                </div>
                <div className="h-9 w-full bg-gray-100 dark:bg-gray-800 rounded-lg" />
              </Card>
            ))
          ) : (
            assessments.map((a) => {
            const isCompleted = a.status === "completed";
            // Count actual grades or use backend count if available. For now, filter local state if this is the active assessment,
            // or if not, use the eager-loaded grades array length.
            const gradedCount = selectedAssessmentId === a.id 
              ? Object.entries(marks).filter(([sid, v]) => v && v.trim() !== "").length
              : (a.grades?.length || 0);
            const totalStudents = a.class?.students?.length || 0;
            const total = totalStudents || 1; // avoid division by zero
            const pct = (gradedCount / total) * 100;

            const selectedClassObj = classes.find(c => c.id === a.classId);
            const selectedSubjectObj = subjects.find(s => s.id === a.subjectId);

            return (
              <Card
                key={a.id}
                className={`rounded-xl shadow-sm ${isCompleted ? "border-emerald-200/60 dark:border-emerald-800/60 bg-emerald-50/5 dark:bg-emerald-900/5" : "border-gray-100 dark:border-gray-800"} hover:shadow-md transition-shadow`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                        {a.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {selectedSubjectObj?.name} • {selectedClassObj?.name} {selectedClassObj?.section}
                      </p>
                    </div>
                    {isCompleted && (
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-100/60 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/50 font-medium px-2 py-0.5 flex items-center gap-1 border rounded-full shrink-0"
                      >
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        Completed
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" /> {a.type}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-medium px-2 py-0.5 flex items-center gap-1 border rounded-full bg-indigo-50 text-indigo-700 border-indigo-100/60 dark:bg-indigo-950/20 dark:text-indigo-300 dark:border-indigo-900/50`}
                    >
                      <Globe className="h-2.5 w-2.5" /> Offline
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">
                        Submissions
                      </span>
                      <span className="font-medium">
                        {gradedCount}/{totalStudents}
                      </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <Users className="h-3 w-3" />
                      {totalStudents - gradedCount} students haven't submitted
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs gap-1.5"
                      onClick={() => setSelectedAssessmentId(a.id)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {isCompleted ? "View Final Scores" : "View Submissions"} ({gradedCount})
                    </Button>
                    <Button
                      variant={isCompleted ? "outline" : "secondary"}
                      size="sm"
                      className={`w-full text-xs gap-1.5 ${
                        isCompleted
                          ? "text-gray-400 dark:text-gray-500 border-gray-200/50 dark:border-gray-800/50 bg-transparent cursor-not-allowed opacity-60"
                          : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200/50 dark:border-emerald-800/50"
                      }`}
                      onClick={() => !isCompleted && setConfirmCompleteId(a.id)}
                      disabled={isCompleted || completingId === a.id}
                    >
                      {completingId === a.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      {isCompleted ? "Finalized / Completed" : "Mark Complete"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
         )}
        </div>


        {/* Assessment Dialog */}
        <Dialog 
          open={!!selectedAssessmentId} 
          onOpenChange={(open) => {
            if (!open) {
              setSelectedAssessmentId("");
              setMarks({});
              setIsDirty(false);
            }
          }}
        >
          <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-blue-600" />
                {activeAssessment?.title || "Record Scores"}
              </DialogTitle>
              <DialogDescription>
                Max: {maxMarks} • Passing: {passingMarks} • Students without marks are considered "Pending"
              </DialogDescription>
            </DialogHeader>

            {gradesLoading ? (
              <div className="space-y-3 py-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : students.length === 0 ? (
              <div className="py-12 text-center text-gray-400 dark:text-gray-500">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No students found</p>
                <p className="text-xs mt-1">
                  There are no students in this class.
                </p>
              </div>
            ) : (
              <div className="flex flex-col max-h-[75vh]">
                <div className="overflow-y-auto pr-2 space-y-3 py-2 custom-scrollbar flex-1">
                  {students.map((student) => {
                    const m = parseFloat(marks[student.id] || "0");
                    const hasMark = marks[student.id] && marks[student.id].trim() !== "";
                    const grade = hasMark ? getGrade(m, maxMarks) : "-";
                    const isPass = hasMark && m >= passingMarks;
                    const pct = hasMark ? (m / maxMarks) * 100 : 0;

                    return (
                      <div
                        key={student.id}
                        className={`p-4 rounded-lg border transition-all ${
                          hasMark
                            ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/30 dark:hover:bg-blue-900/20"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`text-sm font-semibold ${!hasMark ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-gray-100"}`}>
                                {student.name}
                              </p>
                              <Badge
                                variant="outline"
                                className={`text-[10px] flex items-center gap-1 ${
                                  hasMark
                                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                    : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50"
                                }`}
                              >
                                {hasMark ? "✓ Graded" : "Pending"}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500">
                              Roll No: {student.rollNumber}
                            </p>
                          </div>
                          {hasMark && (
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className={`${getGradeColor(grade)} font-bold font-mono`}
                              >
                                Grade: {grade}
                              </Badge>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex-1 min-w-[150px]">
                            <div>
                              <Label className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                                Marks Obtained
                              </Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input
                                  type="number"
                                  step="0.5"
                                  min="0"
                                  max={maxMarks}
                                  placeholder="0"
                                  value={marks[student.id] || ""}
                                  disabled={gradesLoading || isActiveAssocCompleted}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "") {
                                      const newMarks = { ...marks };
                                      delete newMarks[student.id];
                                      setMarks(newMarks);
                                      setIsDirty(true);
                                      return;
                                    }
                                    const num = parseFloat(val);
                                    if (num < 0) return;
                                    if (num > maxMarks) {
                                      toast.error(`Max marks for this test is ${maxMarks}!`);
                                      return;
                                    }
                                    setMarks({
                                      ...marks,
                                      [student.id]: val,
                                    });
                                    setIsDirty(true);
                                  }}
                                  className={`h-8 text-xs w-28 text-center font-semibold ${
                                    hasMark && !isPass ? "border-red-300 focus:border-red-500 bg-red-50/50 dark:bg-red-900/10" : "focus:border-blue-500"
                                  }`}
                                />
                                <span className="text-[11px] text-muted-foreground">/ {maxMarks}</span>
                              </div>
                            </div>
                          </div>

                          {hasMark && (
                            <div className="w-full sm:w-48 flex flex-col gap-1.5 justify-center self-end pb-1">
                              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                                <span className={isPass ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                                  {isPass ? "Pass" : "Fail"}
                                </span>
                                <span className="text-muted-foreground">{pct.toFixed(0)}%</span>
                              </div>
                              <Progress
                                value={Math.min(pct, 100)}
                                className={`h-1.5 [&>div]:transition-all ${
                                  isPass ? "[&>div]:bg-emerald-500" : "[&>div]:bg-red-500"
                                }`}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {isDirty && canCreate && !isActiveAssocCompleted && (
                  <div className="mt-2 pt-4 border-t border-gray-100 dark:border-gray-800 bg-background sticky bottom-0 animate-in fade-in slide-in-from-bottom-3 duration-200">
                    <Button
                      size="lg"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 shadow-md py-5 text-sm transition-all flex items-center justify-center"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving grades...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-1" />
                          Save All Entered Grades
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Empty State */}
        {!loading && !listLoading && assessments.length === 0 && (
          <div className="text-center py-16 bg-gray-50/40 dark:bg-gray-900/10 rounded-xl border border-dashed border-border flex flex-col items-center justify-center animate-in fade-in-50 duration-500">
            <div className={`${activeTab === "active" ? "bg-blue-50 dark:bg-blue-900/20" : "bg-emerald-50 dark:bg-emerald-900/20"} p-4 rounded-full mb-4`}>
              {activeTab === "active" ? (
                <FileText className="h-10 w-10 text-blue-600 dark:text-blue-400 opacity-90" />
              ) : (
                <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 opacity-90" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {activeTab === "active" ? "No active assessments yet" : "No completed assessments yet"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-2">
              {activeTab === "active" 
                ? "Create unit tests, quizzes, or labs to track your students' academic progress."
                : "Finalized and locked assessments will appear in this archive section."}
            </p>
            {canCreate && activeTab === "active" && (
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Assessment
              </Button>
            )}
          </div>
        )}

        {/* Empty State: No Students Found */}
        {selectedAssessmentId && students.length === 0 && (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No students found in this class</p>
          </div>
        )}

        {/* Confirm Complete Dialog */}
        <AlertDialog open={!!confirmCompleteId} onOpenChange={(open) => !open && setConfirmCompleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 fill-amber-500/10" /> Finalize Assessment?
              </AlertDialogTitle>
              <AlertDialogDescription className="py-1 text-sm">
                Once you mark this assessment as complete, all student scores will be locked and finalized. You will not be able to edit or save changes to the grades in the future. Are you sure you want to proceed?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-2">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                onClick={() => {
                  if (confirmCompleteId) {
                    handleCompleteAssessment(confirmCompleteId);
                    setConfirmCompleteId(null);
                  }
                }}
              >
                Yes, Finalize it
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </div>
  );
}
