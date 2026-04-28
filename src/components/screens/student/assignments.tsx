"use client";


import { apiFetch } from "@/lib/api";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useAppStore } from "@/store/use-app-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { goeyToast as toast } from "goey-toast";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Star,
  Loader2,
} from "lucide-react";
import type { StudentInfo, AssignmentInfo } from "@/lib/types";

type AssignmentStatus = "active" | "submitted" | "overdue" | "graded";

interface StudentSubmission {
  id: string;
  status: string;
  grade: string | null;
  feedback: string | null;
  submittedAt: string;
  assignmentId: string;
}

interface EnrichedAssignment extends AssignmentInfo {
  status: AssignmentStatus;
  countdown: string;
  daysLeft: number;
  submitted: boolean;
  submissionId: string | null;
  grade: string | null;
  feedback: string | null;
}

export function StudentAssignments() {
  const { currentUser } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [assignments, setAssignments] = useState<AssignmentInfo[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [mySubmissions, setMySubmissions] = useState<StudentSubmission[]>([]);

  const student = useMemo(
    () =>
      Array.isArray(students)
        ? students.find((s) => s.email === currentUser?.email) ||
          students[0] ||
          null
        : null,
    [students, currentUser?.email],
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const studentsJson = await apiFetch("/api/students").then((r) => r.json());
      const studentsRes = Array.isArray(studentsJson?.items) ? studentsJson.items : [];
      setStudents(studentsRes);

      const matchedStudent =
        studentsRes.find((s: StudentInfo) => s.email === currentUser?.email) ||
        studentsRes[0];

      if (!matchedStudent) {
        setLoading(false);
        return;
      }

      const assignmentsRes = await apiFetch(
        `/api/assignments?classId=${matchedStudent.classId}`,
      );
      const assignmentsData = await assignmentsRes.json();
      setAssignments(assignmentsData);

      // Fetch real submissions for this student
      try {
        const subRes = await apiFetch(
          `/api/submissions?studentId=${matchedStudent.id}`,
        );
        if (subRes.ok) {
          const subJson = await subRes.json();
          setMySubmissions(subJson.data || []);
        }
      } catch {
        /* no submissions yet */
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.email]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Enrich assignments with REAL submission status from the submissions API
  const enrichedAssignments: EnrichedAssignment[] = useMemo(() => {
    const now = new Date();
    // Build a map of assignmentId -> submission for quick lookup
    const subMap = new Map<string, StudentSubmission>();
    mySubmissions.forEach((s) => subMap.set(s.assignmentId, s));

    return assignments.map((a) => {
      const due = new Date(a.dueDate);
      const diffMs = due.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const pastDue = diffDays < 0;

      // Check if student has a REAL submission
      const realSub = subMap.get(a.id);
      const isGraded = realSub && realSub.status === "graded";
      const isSubmitted = realSub && !isGraded;

      let status: AssignmentStatus;
      if (isGraded) {
        status = "graded";
      } else if (isSubmitted) {
        status = "submitted";
      } else if (pastDue) {
        status = "overdue";
      } else {
        status = "active";
      }

      let countdown: string;
      if (diffDays === 0) {
        countdown = "Due today";
      } else if (diffDays > 0) {
        countdown = `${diffDays} day${diffDays > 1 ? "s" : ""} left`;
      } else {
        countdown = `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""} overdue`;
      }

      return {
        ...a,
        status,
        countdown,
        daysLeft: diffDays,
        submitted: !!(isSubmitted || isGraded),
        submissionId: realSub?.id || null,
        grade: realSub?.grade || null,
        feedback: realSub?.feedback || null,
      };
    });
  }, [assignments, mySubmissions]);

  const filteredAssignments = useMemo(() => {
    if (activeTab === "all") return enrichedAssignments;
    return enrichedAssignments.filter((a) => a.status === activeTab);
  }, [enrichedAssignments, activeTab]);

  const counts = useMemo(
    () => ({
      all: enrichedAssignments.length,
      active: enrichedAssignments.filter((a) => a.status === "active").length,
      submitted: enrichedAssignments.filter((a) => a.status === "submitted")
        .length,
      graded: enrichedAssignments.filter((a) => a.status === "graded").length,
      overdue: enrichedAssignments.filter((a) => a.status === "overdue").length,
    }),
    [enrichedAssignments],
  );

  const handleSubmit = async (assignment: EnrichedAssignment) => {
    if (!student) return;
    setSubmittingId(assignment.id);
    try {
      const res = await apiFetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: assignment.id,
          studentId: student.id,
          status: "submitted",
        }),
      });
      if (res.ok) {
        toast.success("Assignment Submitted!", {
          description: `"${assignment.title}" has been submitted successfully.`,
        });
        // Refresh submissions
        try {
          const subRes = await apiFetch(
            `/api/submissions?studentId=${student.id}`,
          );
          if (subRes.ok) {
            const subJson = await subRes.json();
            setMySubmissions(subJson.data || []);
          }
        } catch {
          /* ignore */
        }
      } else {
        toast.error("Failed to submit assignment");
      }
    } catch {
      toast.error("Failed to submit assignment");
    } finally {
      setSubmittingId(null);
    }
  };

  const getStatusBadge = (status: AssignmentStatus) => {
    switch (status) {
      case "graded":
        return (
          <Badge className="bg-violet-100 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800 text-[10px]">
            Graded
          </Badge>
        );
      case "submitted":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">
            Submitted
          </Badge>
        );
      case "active":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">
            Pending
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">
            Overdue
          </Badge>
        );
      default:
        return null;
    }
  };

  const getCountdownColor = (status: AssignmentStatus) => {
    switch (status) {
      case "graded":
        return "text-violet-600";
      case "submitted":
        return "text-emerald-600";
      case "active":
        return "text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400";
      case "overdue":
        return "text-red-600 dark:text-red-400 font-medium";
      default:
        return "text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400";
    }
  };

  const getProgressValue = (status: AssignmentStatus) => {
    switch (status) {
      case "graded":
        return 100;
      case "submitted":
        return 80;
      case "active":
        return 30;
      case "overdue":
        return 0;
      default:
        return 0;
    }
  };

  const getProgressColor = (status: AssignmentStatus) => {
    switch (status) {
      case "graded":
        return "[&>div]:bg-violet-500";
      case "submitted":
        return "[&>div]:bg-emerald-500";
      case "active":
        return "[&>div]:bg-violet-500";
      case "overdue":
        return "[&>div]:bg-red-500";
      default:
        return "";
    }
  };

  if (loading) return <AssignmentsSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          My Assignments
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 mt-0.5">
          Manage and track your homework and assignments
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <SummaryCard
          label="Total"
          count={counts.all}
          icon={<FileText className="h-4 w-4" />}
          color="violet"
        />
        <SummaryCard
          label="Active"
          count={counts.active}
          icon={<Clock className="h-4 w-4" />}
          color="amber"
        />
        <SummaryCard
          label="Submitted"
          count={counts.submitted}
          icon={<CheckCircle2 className="h-4 w-4" />}
          color="emerald"
        />
        <SummaryCard
          label="Graded"
          count={counts.graded}
          icon={<Star className="h-4 w-4" />}
          color="violet"
        />
        <SummaryCard
          label="Overdue"
          count={counts.overdue}
          icon={<AlertTriangle className="h-4 w-4" />}
          color="red"
        />
      </div>

      {/* Assignments List */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-violet-500" />
            Assignment List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
              <TabsTrigger value="active">Active ({counts.active})</TabsTrigger>
              <TabsTrigger value="submitted">
                Submitted ({counts.submitted})
              </TabsTrigger>
              <TabsTrigger value="graded">Graded ({counts.graded})</TabsTrigger>
              <TabsTrigger value="overdue">
                Overdue ({counts.overdue})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <ScrollArea className="max-h-[600px]">
                {filteredAssignments.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 dark:text-gray-500 dark:text-gray-400">
                    <FileText className="h-10 w-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No assignments found</p>
                    <p className="text-xs mt-1">
                      {activeTab === "all"
                        ? "Your teachers haven't assigned any work yet"
                        : `No ${activeTab} assignments at this time`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className={`
                          p-4 rounded-xl border transition-all hover:shadow-sm
                          ${
                            assignment.status === "overdue"
                              ? "border-red-200 dark:border-red-800 bg-red-50/50"
                              : assignment.status === "graded"
                                ? "border-violet-200 dark:border-violet-800 dark:border-violet-800 bg-violet-50/50"
                                : assignment.status === "submitted"
                                  ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50"
                                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-violet-200 dark:border-violet-800 dark:hover:border-violet-800"
                          }
                        `}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                                {assignment.title}
                              </h4>
                              {getStatusBadge(assignment.status)}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-[10px]">
                                {assignment.subjectName}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className="text-[10px]"
                              >
                                {assignment.className}
                              </Badge>
                            </div>

                            <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 mb-2">
                              Teacher: {assignment.teacherName}
                            </p>

                            {/* Show grade and feedback for graded assignments */}
                            {assignment.status === "graded" &&
                              assignment.grade && (
                                <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-2.5 mb-2 border border-violet-200 dark:border-violet-800">
                                  <p className="text-xs font-semibold text-violet-700 dark:text-violet-400">
                                    ✨ Grade: {assignment.grade}
                                  </p>
                                  {assignment.feedback && (
                                    <p className="text-[11px] text-violet-600 mt-1">
                                      💬 {assignment.feedback}
                                    </p>
                                  )}
                                </div>
                              )}

                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5">
                                <Clock
                                  className={`h-3.5 w-3.5 ${getCountdownColor(assignment.status)}`}
                                />
                                <span
                                  className={`text-xs ${getCountdownColor(assignment.status)}`}
                                >
                                  {assignment.countdown}
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500 dark:text-gray-400">
                                Due:{" "}
                                {new Date(
                                  assignment.dueDate,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col items-end gap-2 sm:ml-4 shrink-0">
                            {assignment.status !== "submitted" &&
                              assignment.status !== "graded" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleSubmit(assignment)}
                                  disabled={submittingId === assignment.id}
                                  className={`
                                  text-xs gap-1.5
                                  ${
                                    assignment.status === "overdue"
                                      ? "bg-red-500 hover:bg-red-600 text-white"
                                      : "bg-violet-500 hover:bg-violet-600 text-white"
                                  }
                                `}
                                >
                                  {submittingId === assignment.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Send className="h-3.5 w-3.5" />
                                  )}
                                  Submit
                                </Button>
                              )}
                            {assignment.status === "submitted" && (
                              <Badge className="bg-emerald-100 text-emerald-700 text-[10px] gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Submitted
                              </Badge>
                            )}
                            {assignment.status === "graded" && (
                              <Badge className="bg-violet-100 text-violet-700 dark:text-violet-400 text-[10px] gap-1">
                                <Star className="h-3 w-3" />
                                Graded
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-3 pt-2 border-t border-gray-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 dark:text-gray-400">
                              Progress
                            </span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                              {getProgressValue(assignment.status)}%
                            </span>
                          </div>
                          <Progress
                            value={getProgressValue(assignment.status)}
                            className={`h-1.5 ${getProgressColor(assignment.status)}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Summary Card ─── */
function SummaryCard({
  label,
  count,
  icon,
  color,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    violet:
      "from-violet-500 to-purple-600 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400",
    amber:
      "from-amber-500 to-orange-600 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
    emerald:
      "from-emerald-500 to-teal-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400",
    red: "from-red-500 to-rose-600 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400",
  };
  const [iconBg, , textClr] = (colorMap[color] || colorMap.violet).split(" ");

  return (
    <Card className="rounded-xl shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div
            className={`p-2 rounded-lg bg-gradient-to-br ${iconBg} text-white`}
          >
            {icon}
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {count}
          </p>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 mt-2">
          {label} Assignments
        </p>
      </CardContent>
    </Card>
  );
}

/* ─── Skeleton ─── */
function AssignmentsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-44 mb-2" />
        <Skeleton className="h-4 w-60" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[520px] rounded-xl" />
    </div>
  );
}
