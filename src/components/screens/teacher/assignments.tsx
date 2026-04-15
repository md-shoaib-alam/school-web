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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "lucide-react";
import { toast } from "sonner";

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
    { id: string; name: string; className: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    subjectId: "",
    dueDate: "",
  });

  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [subLoading, setSubLoading] = useState(false);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeForm, setGradeForm] = useState({ grade: "", feedback: "" });

  useEffect(() => {
    Promise.all([apiFetch("/api/assignments"), apiFetch("/api/subjects")])
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
    try {
      const res = await apiFetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          classId: "demo",
          teacherId: "demo-teacher",
        }),
      });
      if (res.ok) {
        toast.success("Assignment created successfully!");
        setDialogOpen(false);
        setForm({ title: "", description: "", subjectId: "", dueDate: "" });
        const data = await apiFetch("/api/assignments").then((r) => r.json());
        setAssignments(data);
      }
    } catch {
      toast.error("Failed to create assignment");
    }
  };

  const handleViewSubmissions = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setSubDialogOpen(true);
    setSubLoading(true);
    setGradeForm({ grade: "", feedback: "" });
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
    if (!gradeForm.grade.trim()) {
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
          grade: gradeForm.grade.trim(),
          feedback: gradeForm.feedback.trim() || undefined,
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
                  grade: gradeForm.grade.trim(),
                  feedback: gradeForm.feedback.trim() || null,
                  status: "graded",
                }
              : s,
          ),
        );
        setGradeForm({ grade: "", feedback: "" });
      }
    } catch {
      toast.error("Failed to save grade");
    } finally {
      setGradingId(null);
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            My Assignments
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {assignments.length} assignments total
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" /> Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Assignment title"
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
              <div>
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Assignment details..."
                  className="mt-1.5"
                  rows={3}
                />
              </div>
              <Button
                onClick={handleCreate}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create Assignment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overdue */}
      {assignments.filter(
        (a) => isOverdue(a.dueDate) && a.submissions < a.totalStudents,
      ).length > 0 && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Overdue Assignments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {assignments
              .filter(
                (a) => isOverdue(a.dueDate) && a.submissions < a.totalStudents,
              )
              .map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between bg-white dark:bg-gray-900 p-3 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{a.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {a.className} • {a.subjectName}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                  >
                    {a.totalStudents - a.submissions} pending
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
              className={`rounded-xl shadow-sm ${overdue ? "border-red-200 dark:border-red-800" : "border-gray-100 dark:border-gray-800"} hover:shadow-md transition-shadow`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                      {assignment.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 line-clamp-2">
                    {assignment.description}
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Due: {assignment.dueDate}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      Submissions
                    </span>
                    <span className="font-medium">
                      {assignment.submissions}/{assignment.totalStudents}
                    </span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <Users className="h-3 w-3" />
                    {assignment.totalStudents - assignment.submissions} students
                    haven't submitted
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs gap-1.5"
                    onClick={() => handleViewSubmissions(assignment)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Submissions ({assignment.submissions})
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No assignments yet</p>
          <p className="text-sm mt-1">Create your first assignment</p>
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
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
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
            <div className="py-12 text-center text-gray-400 dark:text-gray-500">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No submissions yet</p>
              <p className="text-xs mt-1">
                Students haven&apos;t submitted this assignment
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[55vh] pr-2">
              <div className="space-y-3 py-2">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className={`p-4 rounded-lg border transition-all ${
                      sub.status === "graded"
                        ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/30 dark:hover:bg-blue-900/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {sub.studentName}
                          </p>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              sub.status === "graded"
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                            }`}
                          >
                            {sub.status === "graded" ? "✓ Graded" : "Submitted"}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500">
                          {sub.studentEmail} • {sub.studentClass}
                        </p>
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0">
                        {new Date(sub.submittedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {sub.content && (
                      <p className="mt-2 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 rounded-md p-2 line-clamp-3">
                        {sub.content}
                      </p>
                    )}

                    {sub.status === "graded" && (
                      <div className="mt-2 flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                          <Star className="h-3 w-3" />
                          Grade: {sub.grade}
                        </span>
                        {sub.feedback && (
                          <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                            <MessageSquare className="h-3 w-3" />
                            {sub.feedback}
                          </span>
                        )}
                      </div>
                    )}

                    {sub.status !== "graded" && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <Label className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                              Grade
                            </Label>
                            <Input
                              placeholder="e.g. A, B+, 95/100"
                              value={
                                gradingId === sub.id ? gradeForm.grade : ""
                              }
                              onChange={(e) => {
                                setGradingId(sub.id);
                                setGradeForm((prev) => ({
                                  ...prev,
                                  grade: e.target.value,
                                }));
                              }}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="flex-1">
                            <Label className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                              Feedback
                            </Label>
                            <Input
                              placeholder="Optional feedback"
                              value={
                                gradingId === sub.id ? gradeForm.feedback : ""
                              }
                              onChange={(e) => {
                                setGradingId(sub.id);
                                setGradeForm((prev) => ({
                                  ...prev,
                                  feedback: e.target.value,
                                }));
                              }}
                              className="h-8 text-xs"
                            />
                          </div>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3 shrink-0"
                            onClick={() => handleGrade(sub.id)}
                            disabled={
                              gradingId === sub.id && !gradeForm.grade.trim()
                            }
                          >
                            {gradingId === sub.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Star className="h-3 w-3 mr-1" />
                            )}
                            Save
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
