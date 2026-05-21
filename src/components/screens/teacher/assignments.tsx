"use client";


import { apiFetch } from "@/lib/api";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  FileText,
  Clock,
  AlertTriangle,
  Users,
  Eye,
  Loader2,
  Star,
  MessageSquare,
  CalendarDays,
  Check,
  Globe,
  BookOpen,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";

interface Assignment {
  id: string;
  title: string;
  description?: string;
  subjectName: string;
  className: string;
  teacherName: string;
  dueDate: string;
  submissions: number;
  totalStudents: number;
  ungradedSubmissions: number;
  mode: "online" | "offline";
}

interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentClass: string;
  content: string | null;
  status: string;
  submittedAt: string;
  grade: string | null;
  feedback: string | null;
}

export function TeacherAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<
    { id: string; name: string; className: string; classId: string; teacherId: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<{
    title: string;
    description: string;
    subjectId: string;
    dueDate: Date | undefined;
    mode: "online" | "offline";
  }>({
    title: "",
    description: "",
    subjectId: "",
    dueDate: undefined,
    mode: "offline",
  });

  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [subLoading, setSubLoading] = useState(false);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [editedGrades, setEditedGrades] = useState<Record<string, { grade: string; feedback: string }>>({});
  const [bulkSaving, setBulkSaving] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [confirmCompleteId, setConfirmCompleteId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([apiFetch("/api/assignments?mine=true"), apiFetch("/api/subjects?mine=true")])
      .then(([aRes, sRes]) => Promise.all([aRes.json(), sRes.json()]))
      .then(([aData, sData]) => {
        setAssignments(aData);
        setSubjects(sData);
        setLoading(false);
      });
  }, []);

  const handleCreate = async () => {
    if (!form.title || !form.subjectId || !form.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    const selectedSub = subjects.find(s => s.id === form.subjectId);
    if (!selectedSub) {
      toast.error("Selected subject not found");
      return;
    }

    try {
      const res = await apiFetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          dueDate: form.dueDate ? format(form.dueDate, "yyyy-MM-dd") : "",
          classId: selectedSub.classId,
          teacherId: selectedSub.teacherId,
        }),
      });
      if (res.ok) {
        toast.success("Assignment created successfully!");
        setDialogOpen(false);
        setForm({ title: "", description: "", subjectId: "", dueDate: undefined, mode: "offline" });
        const data = await apiFetch("/api/assignments?mine=true").then((r) => r.json());
        setAssignments(data);
      }
    } catch {
      toast.error("Failed to create assignment");
    }
  };

  const handleCompleteAssignment = async (assignmentId: string) => {
    setCompletingId(assignmentId);
    try {
      const res = await apiFetch(`/api/assignments/${assignmentId}/complete`, {
        method: "PUT",
      });
      if (res.ok) {
        toast.success("Assignment marked as completed!");
        const data = await apiFetch("/api/assignments?mine=true").then((r) => r.json());
        setAssignments(data);
      } else {
        toast.error("Failed to complete assignment");
      }
    } catch {
      toast.error("Failed to complete assignment");
    } finally {
      setCompletingId(null);
    }
  };

  const handleViewSubmissions = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setSubDialogOpen(true);
    setSubLoading(true);
    setEditedGrades({});
    try {
      const res = await apiFetch(`/api/submissions?assignmentId=${assignment.id}`);
      if (res.ok) {
        const json = await res.json();
        setSubmissions(json.data || []);
      }
    } catch {
      toast.error("Failed to load submissions");
      setSubmissions([]);
    } finally {
      setSubLoading(false);
    }
  };

  const handleGrade = async (submissionId: string) => {
    const data = editedGrades[submissionId];
    if (!data || !data.grade.trim()) {
      toast.error("Please enter a grade");
      return;
    }
    setGradingId(submissionId);
    try {
      const res = await apiFetch("/api/submissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: submissionId,
          assignmentId: selectedAssignment?.id,
          grade: data.grade.trim(),
          feedback: data.feedback.trim() || undefined,
          status: "graded",
        }),
      });
      if (res.ok) {
        toast.success("Grade saved!");
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === submissionId
              ? {
                  ...s,
                  grade: data.grade.trim(),
                  feedback: data.feedback.trim() || null,
                  status: "graded",
                }
              : s,
          ),
        );
        setEditedGrades((prev) => {
          const next = { ...prev };
          delete next[submissionId];
          return next;
        });
      }
    } catch {
      toast.error("Failed to save grade");
    } finally {
      setGradingId(null);
    }
  };

  const handleBulkSave = async () => {
    const updates = Object.entries(editedGrades)
      .filter(([_, val]) => val.grade.trim() !== "")
      .map(([id, val]) => ({
        id,
        grade: val.grade.trim(),
        feedback: val.feedback.trim() || undefined,
        status: "graded",
      }));

    if (updates.length === 0) {
      toast.error("No grades entered yet");
      return;
    }

    setBulkSaving(true);
    try {
      const res = await apiFetch("/api/submissions/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          assignmentId: selectedAssignment?.id,
          updates 
        }),
      });
      if (res.ok) {
        toast.success(`Bulk saved ${updates.length} grades!`);
        setSubmissions((prev) =>
          prev.map((s) => {
            const update = updates.find((u) => u.id === s.id);
            return update
              ? {
                  ...s,
                  grade: update.grade,
                  feedback: update.feedback || null,
                  status: "graded",
                }
              : s;
          })
        );
        setEditedGrades({});
      } else {
        toast.error("Failed to bulk save grades");
      }
    } catch {
      toast.error("Failed to bulk save grades");
    } finally {
      setBulkSaving(false);
    }
  };

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();
  const getSubmissionPct = (a: Assignment) =>
    a.totalStudents > 0
      ? Math.round((a.submissions / a.totalStudents) * 100)
      : 0;

  if (loading)
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            My Homework
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {assignments.length} homework items total
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="size-4 mr-2" /> Create Homework
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Homework</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Homework title"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Subject *</Label>
                <Select
                  value={form.subjectId}
                  onValueChange={(v) => setForm({ ...form, subjectId: v })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({s.className})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Due Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal mt-0.5"
                      >
                        <CalendarDays className="mr-2 size-4" />
                        {form.dueDate ? format(form.dueDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.dueDate}
                        onSelect={(date) =>
                          setForm({ ...form, dueDate: date })
                        }
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Submission Mode</Label>
                  <Select
                    value={form.mode}
                    onValueChange={(v: any) => setForm({ ...form, mode: v })}
                  >
                    <SelectTrigger className="mt-1.5">
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
              <div>
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Homework details..."
                  className="mt-1.5"
                  rows={3}
                />
              </div>
              <Button
                onClick={handleCreate}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create Homework
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overdue */}
      {assignments.filter(
        (a) => isOverdue(a.dueDate) && a.ungradedSubmissions > 0,
      ).length > 0 && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="size-5" /> Overdue Homework
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {assignments
              .filter(
                (a) => isOverdue(a.dueDate) && a.ungradedSubmissions > 0,
              )
              .map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between bg-white dark:bg-zinc-900 p-3 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{a.title}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {a.className} • {a.subjectName}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                  >
                    {a.ungradedSubmissions} pending
                  </Badge>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Assignment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {assignments.map((assignment) => {
          const pct = getSubmissionPct(assignment);
          const overdue = isOverdue(assignment.dueDate) && pct < 100;
          return (
            <Card
              key={assignment.id}
              className={`rounded-xl shadow-sm ${overdue ? "border-red-200 dark:border-red-800" : "border-zinc-100 dark:border-zinc-800"} hover:shadow-md transition-shadow`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                      {assignment.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      {assignment.subjectName} • {assignment.className}
                    </p>
                  </div>
                  {overdue && (
                    <Badge
                      variant="secondary"
                      className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px]"
                    >
                      Overdue
                    </Badge>
                  )}
                </div>

                {assignment.description && (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-3 line-clamp-2">
                    {assignment.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" /> Due: {assignment.dueDate}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-medium px-2 py-0.5 flex items-center gap-1 border rounded-full ${
                      assignment.mode === "online"
                        ? "bg-violet-50 text-violet-700 border-violet-100/60 dark:bg-violet-950/20 dark:text-violet-300 dark:border-violet-900/50"
                        : "bg-amber-50 text-amber-700 border-amber-100/60 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/50"
                    }`}
                  >
                    {assignment.mode === "online" ? (
                      <>
                        <Globe className="size-2.5" /> Online
                      </>
                    ) : (
                      <>
                        <BookOpen className="size-2.5" /> Offline
                      </>
                    )}
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 dark:text-zinc-400">
                      Submissions
                    </span>
                    <span className="font-medium">
                      {assignment.submissions}/{assignment.totalStudents}
                    </span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    <Users className="size-3" />
                    {assignment.totalStudents - assignment.submissions} students
                    haven't submitted
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs gap-1.5"
                    onClick={() => handleViewSubmissions(assignment)}
                  >
                    <Eye className="size-3.5" />
                    View Submissions ({assignment.submissions})
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full text-xs gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200/50 dark:border-emerald-800/50"
                    onClick={() => setConfirmCompleteId(assignment.id)}
                    disabled={completingId === assignment.id}
                  >
                    {completingId === assignment.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Check className="size-3.5" />
                    )}
                    Mark Complete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-16 text-zinc-400 dark:text-zinc-500">
          <FileText className="size-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No homework yet</p>
          <p className="text-sm mt-1">Create your first homework</p>
        </div>
      )}

      {/* Submissions Dialog */}
      <Dialog
        open={subDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSubDialogOpen(false);
            setSelectedAssignment(null);
            setSubmissions([]);
            setEditedGrades({});
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-4 text-blue-600" />
              {selectedAssignment?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedAssignment?.subjectName} •{" "}
              {selectedAssignment?.className} • Due:{" "}
              {selectedAssignment?.dueDate}
            </DialogDescription>
          </DialogHeader>

          {subLoading ? (
            <div className="space-y-3 py-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 dark:text-zinc-500">
              <Users className="size-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No submissions yet</p>
              <p className="text-xs mt-1">
                Students haven&apos;t submitted this homework
              </p>
            </div>
          ) : (
            <div className="flex flex-col max-h-[75vh]">
              <div className="overflow-y-auto pr-2 space-y-3 py-2 custom-scrollbar flex-1">
                {submissions.map((sub) => {
                  const isOfflinePending = selectedAssignment?.mode === "offline" && sub.status === "not_submitted";
                  const canGrade = sub.status === "submitted" || isOfflinePending;

                  return (
                    <div
                      key={sub.id}
                      className={`p-4 rounded-lg border transition-all ${
                        sub.status === "graded"
                          ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/20"
                          : sub.status === "not_submitted" && !isOfflinePending
                          ? "border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 opacity-80"
                          : "border-zinc-200 dark:border-zinc-700 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/30 dark:hover:bg-blue-900/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-semibold ${(sub.status === "not_submitted" && !isOfflinePending) ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-900 dark:text-zinc-100"}`}>
                              {sub.studentName}
                            </p>
                            <Badge
                              variant="outline"
                              className={`text-[10px] flex items-center gap-1 ${
                                sub.status === "graded"
                                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                  : isOfflinePending
                                  ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50"
                                  : sub.status === "not_submitted"
                                  ? "bg-zinc-100 dark:bg-zinc-900/20 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800"
                                  : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                              }`}
                            >
                              {sub.status === "graded" ? (
                                "✓ Graded"
                              ) : isOfflinePending ? (
                                <>
                                  <BookOpen className="size-2.5" /> Offline
                                </>
                              ) : sub.status === "not_submitted" ? (
                                "Not Submitted"
                              ) : (
                                "Submitted"
                              )}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                            {sub.studentEmail} • {sub.studentClass}
                          </p>
                        </div>
                        {sub.status !== "not_submitted" && (
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 shrink-0" suppressHydrationWarning>
                            {new Date(sub.submittedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>

                      {sub.content && (
                        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 rounded-md p-2 line-clamp-3">
                          {sub.content}
                        </p>
                      )}

                      {sub.status === "graded" && (
                        <div className="mt-2 flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                            <Star className="size-3" />
                            Grade: {sub.grade}
                          </span>
                          {sub.feedback && (
                            <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                              <MessageSquare className="size-3" />
                              {sub.feedback}
                            </span>
                          )}
                        </div>
                      )}

                      {canGrade && (
                        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              <Label className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                                Grade
                              </Label>
                              <Input
                                placeholder="e.g. A, B+, 95/100"
                                value={editedGrades[sub.id]?.grade || ""}
                                onChange={(e) => {
                                  setEditedGrades((prev) => ({
                                    ...prev,
                                    [sub.id]: {
                                      grade: e.target.value,
                                      feedback: prev[sub.id]?.feedback || "",
                                    },
                                  }));
                                }}
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="flex-1">
                              <Label className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                                Feedback
                              </Label>
                              <Input
                                placeholder="Optional feedback"
                                value={editedGrades[sub.id]?.feedback || ""}
                                onChange={(e) => {
                                  setEditedGrades((prev) => ({
                                    ...prev,
                                    [sub.id]: {
                                      grade: prev[sub.id]?.grade || "",
                                      feedback: e.target.value,
                                    },
                                  }));
                                }}
                                className="h-8 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {Object.values(editedGrades).some((x) => x.grade.trim() !== "") && (
                <div className="mt-2 pt-4 border-t border-zinc-100 dark:border-zinc-800 bg-background sticky bottom-0 animate-in fade-in slide-in-from-bottom-3 duration-200">
                  <Button
                    size="lg"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 shadow-md py-5 text-sm transition-all flex items-center justify-center"
                    onClick={handleBulkSave}
                    disabled={bulkSaving}
                  >
                    {bulkSaving ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Saving all grades...
                      </>
                    ) : (
                      <>
                        <Star className="size-4 mr-1 fill-white/20" />
                        Save All Entered Grades ({Object.values(editedGrades).filter((x) => x.grade.trim() !== "").length})
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmCompleteId} onOpenChange={(open) => !open && setConfirmCompleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500 fill-amber-500/10" /> Mark homework as complete?
            </AlertDialogTitle>
            <AlertDialogDescription className="py-1 text-sm">
              Once you mark this homework as complete, it indicates all work is finished and finalized. This action will conclude submissions for students. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmCompleteId) {
                  handleCompleteAssignment(confirmCompleteId);
                  setConfirmCompleteId(null);
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Yes, Complete it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
