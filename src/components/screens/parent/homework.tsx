"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useAppStore } from "@/store/use-app-store";
import { useParentDashboard } from "@/lib/graphql/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Star,
  Globe,
  BookOpen,
  BookMarked,
  Users,
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

export function ParentHomework() {
  const { currentUser } = useAppStore();
  const [activeStudentId, setActiveStudentId] = useState("");
  const { data, isPending } = useParentDashboard(currentUser?.name || "");
  const children = useMemo(() => (data?.children || []) as StudentInfo[], [data?.children]);

  useEffect(() => {
    if (children.length > 0) {
      const savedTab = document.cookie
        .split("; ")
        .find((row) => row.startsWith("parentSelectedStudentHome="))
        ?.split("=")[1];
      
      const targetId = savedTab && children.some(s => s.id === savedTab) ? savedTab : children[0].id;
      if (targetId !== activeStudentId) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveStudentId(targetId);
      }
    }
  }, [children, activeStudentId]);

  const handleStudentChange = (val: string) => {
    setActiveStudentId(val);
    document.cookie = `parentSelectedStudentHome=${val}; path=/; max-age=31536000`;
  };

  if (isPending) return <HomeworkSkeleton />;

  if (children.length === 0) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardContent className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-4">No children registered</h3>
          <p className="text-sm text-muted-foreground mt-1">Contact administration to link your child to this account.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BookMarked className="h-5 w-5 text-violet-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-tight">
          Children&apos;s Homework
        </h2>
      </div>

      <Tabs value={activeStudentId} onValueChange={handleStudentChange}>
        <TabsList className="bg-violet-50/50 dark:bg-violet-950/20 p-1 border border-violet-100/50 dark:border-violet-900/20">
          {children.map((child) => (
            <TabsTrigger
              key={child.id}
              value={child.id}
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-400 data-[state=active]:shadow-sm px-4 text-xs font-medium transition-all hover:bg-violet-100/30 dark:hover:bg-violet-900/20 hover:text-violet-800 dark:hover:text-violet-300"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-400" />
                {child.name}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {children.map((child) => (
          <TabsContent
            key={child.id}
            value={child.id}
            className="space-y-6 mt-6 animate-in fade-in duration-300"
          >
            <ChildHomeworkView student={child} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

/* ─── Child Homework View ─── */
function ChildHomeworkView({ student }: { student: StudentInfo }) {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<AssignmentInfo[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [filterTab, setFilterTab] = useState("all");

  const fetchChildData = useCallback(async () => {
    setLoading(true);
    try {
      const [assignmentsRes, submissionsRes] = await Promise.all([
        apiFetch(`/api/assignments?classId=${student.classId}`),
        apiFetch(`/api/submissions?studentId=${student.id}`).catch(() => null)
      ]);

      const assignmentsData = await assignmentsRes.json();
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);

      if (submissionsRes && submissionsRes.ok) {
        const subsJson = await submissionsRes.json();
        setSubmissions(subsJson.data || []);
      } else {
        setSubmissions([]);
      }
    } catch (e) {
      console.error("Failed to fetch homework data", e);
    } finally {
      setLoading(false);
    }
  }, [student.id, student.classId]);

  useEffect(() => {
    fetchChildData();
  }, [fetchChildData]);

  const enrichedAssignments: EnrichedAssignment[] = useMemo(() => {
    const now = new Date();
    const subMap = new Map<string, StudentSubmission>();
    submissions.forEach((s) => subMap.set(s.assignmentId, s));

    return assignments.map((a) => {
      const due = new Date(a.dueDate);
      const diffMs = due.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const pastDue = diffDays < 0;

      const realSub = subMap.get(a.id);
      const isGraded = realSub && realSub.status === "graded";
      const isSubmitted = realSub && !isGraded;

      let status: AssignmentStatus;
      if (isGraded) status = "graded";
      else if (isSubmitted) status = "submitted";
      else if (pastDue) status = "overdue";
      else status = "active";

      let countdown: string;
      if (diffDays === 0) countdown = "Due today";
      else if (diffDays > 0) countdown = `${diffDays} day${diffDays > 1 ? "s" : ""} left`;
      else countdown = `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""} overdue`;

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
  }, [assignments, submissions]);

  const filteredAssignments = useMemo(() => {
    if (filterTab === "all") return enrichedAssignments;
    return enrichedAssignments.filter((a) => a.status === filterTab);
  }, [enrichedAssignments, filterTab]);

  const counts = useMemo(() => ({
    all: enrichedAssignments.length,
    active: enrichedAssignments.filter((a) => a.status === "active").length,
    submitted: enrichedAssignments.filter((a) => a.status === "submitted").length,
    graded: enrichedAssignments.filter((a) => a.status === "graded").length,
    overdue: enrichedAssignments.filter((a) => a.status === "overdue").length,
  }), [enrichedAssignments]);

  const getStatusBadge = (status: AssignmentStatus) => {
    switch (status) {
      case "graded":
        return <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400 border-0 text-[10px] font-bold shadow-none">Graded</Badge>;
      case "submitted":
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-0 text-[10px] font-bold shadow-none">Submitted</Badge>;
      case "active":
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-0 text-[10px] font-bold shadow-none">Pending</Badge>;
      case "overdue":
        return <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-0 text-[10px] font-bold shadow-none">Overdue</Badge>;
      default:
        return null;
    }
  };

  const getProgressValue = (status: AssignmentStatus) => {
    switch (status) {
      case "graded": return 100;
      case "submitted": return 80;
      case "active": return 30;
      case "overdue": return 0;
      default: return 0;
    }
  };

  const getProgressColor = (status: AssignmentStatus) => {
    switch (status) {
      case "graded": return "[&>div]:bg-violet-600";
      case "submitted": return "[&>div]:bg-emerald-500";
      case "active": return "[&>div]:bg-violet-500/70";
      case "overdue": return "[&>div]:bg-rose-500";
      default: return "";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <HomeworkSummaryCard label="Total" count={counts.all} icon={<FileText className="h-4 w-4" />} themeColor="violet" />
        <HomeworkSummaryCard label="Active" count={counts.active} icon={<Clock className="h-4 w-4" />} themeColor="amber" />
        <HomeworkSummaryCard label="Submitted" count={counts.submitted} icon={<CheckCircle2 className="h-4 w-4" />} themeColor="emerald" />
        <HomeworkSummaryCard label="Graded" count={counts.graded} icon={<Star className="h-4 w-4" />} themeColor="violet" />
        <HomeworkSummaryCard label="Overdue" count={counts.overdue} icon={<AlertTriangle className="h-4 w-4" />} themeColor="red" />
      </div>

      <Card className="rounded-xl shadow-sm border-gray-200/60 dark:border-zinc-800">
        <CardHeader className="pb-3 pt-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 tracking-tight">
            <FileText className="h-4 w-4 text-violet-500" />
            Homework Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-5 pb-5">
          <Tabs defaultValue="all" value={filterTab} onValueChange={setFilterTab}>
            <TabsList className="mb-4 bg-violet-50/60 dark:bg-zinc-900 p-1 text-xs font-medium border border-violet-100/50 dark:border-zinc-800 w-fit rounded-lg">
              <TabsTrigger value="all" className="px-3 py-1.5 transition-all rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-300 data-[state=active]:shadow-sm hover:bg-violet-100/60 dark:hover:bg-violet-950/40 hover:text-violet-700 dark:hover:text-violet-400">All ({counts.all})</TabsTrigger>
              <TabsTrigger value="active" className="px-3 py-1.5 transition-all rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-300 data-[state=active]:shadow-sm hover:bg-violet-100/60 dark:hover:bg-violet-950/40 hover:text-violet-700 dark:hover:text-violet-400">Active ({counts.active})</TabsTrigger>
              <TabsTrigger value="submitted" className="px-3 py-1.5 transition-all rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-300 data-[state=active]:shadow-sm hover:bg-violet-100/60 dark:hover:bg-violet-950/40 hover:text-violet-700 dark:hover:text-violet-400">Submitted ({counts.submitted})</TabsTrigger>
              <TabsTrigger value="graded" className="px-3 py-1.5 transition-all rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-300 data-[state=active]:shadow-sm hover:bg-violet-100/60 dark:hover:bg-violet-950/40 hover:text-violet-700 dark:hover:text-violet-400">Graded ({counts.graded})</TabsTrigger>
              <TabsTrigger value="overdue" className="px-3 py-1.5 transition-all rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-300 data-[state=active]:shadow-sm hover:bg-violet-100/60 dark:hover:bg-violet-950/40 hover:text-violet-700 dark:hover:text-violet-400">Overdue ({counts.overdue})</TabsTrigger>
            </TabsList>

            <TabsContent value={filterTab}>
              <ScrollArea className="max-h-[500px] pr-3">
                {filteredAssignments.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-100 dark:border-zinc-800 rounded-xl">
                    <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">No assignments found</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {filterTab === "all" ? "No homework records found for this child." : `No homework marked as ${filterTab} at this time.`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAssignments.map((a) => (
                      <div
                        key={a.id}
                        className={`p-4 rounded-xl border bg-card hover:shadow-sm transition-all ${
                          a.status === "overdue" ? "border-rose-100 dark:border-rose-950/40 bg-rose-50/10" :
                          a.status === "graded" ? "border-violet-100 dark:border-violet-950/40 bg-violet-50/10" :
                          a.status === "submitted" ? "border-emerald-100 dark:border-emerald-950/40 bg-emerald-50/10" :
                          "border-gray-100 dark:border-zinc-800"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{a.title}</h4>
                              {getStatusBadge(a.status)}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-[10px] bg-muted/30 border-border shadow-none font-medium">{a.subjectName}</Badge>
                              <Badge variant="outline" className="text-[10px] bg-muted/30 border-border shadow-none font-medium flex items-center gap-1">
                                {a.mode === "online" ? <Globe className="h-2.5 w-2.5 text-sky-500" /> : <BookOpen className="h-2.5 w-2.5 text-amber-500" />}
                                {a.mode === "online" ? "Online Submission" : "Offline Paper"}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground mb-2">Assigned by {a.teacherName}</p>

                            {a.status === "graded" && a.grade && (
                              <div className="bg-violet-50 dark:bg-violet-950/30 rounded-lg p-2 mb-2 border border-violet-100 dark:border-violet-900/30">
                                <p className="text-xs font-bold text-violet-700 dark:text-violet-400">✨ Received Grade: {a.grade}</p>
                                {a.feedback && <p className="text-[11px] text-violet-600 dark:text-violet-300 mt-0.5 italic">Teacher remarks: "{a.feedback}"</p>}
                              </div>
                            )}

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className={`h-3.5 w-3.5 ${a.status === "overdue" ? "text-rose-500" : "text-muted-foreground"}`} />
                                <span className={a.status === "overdue" ? "text-rose-600 font-medium" : ""}>{a.countdown}</span>
                              </div>
                              <span>Due: {new Date(a.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-gray-100/70 dark:border-zinc-800/60 flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>Progress Tracking</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{getProgressValue(a.status)}%</span>
                          </div>
                          <Progress value={getProgressValue(a.status)} className={`h-1 ${getProgressColor(a.status)}`} />
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

/* ─── Summary Card Sub-component ─── */
function HomeworkSummaryCard({ label, count, icon, themeColor }: { label: string; count: number; icon: React.ReactNode; themeColor: "violet" | "amber" | "emerald" | "red" }) {
  const schemes = {
    violet: "from-violet-500 to-purple-600 text-violet-700 bg-violet-50 dark:bg-violet-950/20",
    amber: "from-amber-500 to-orange-500 text-amber-700 bg-amber-50 dark:bg-amber-950/20",
    emerald: "from-emerald-500 to-teal-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20",
    red: "from-rose-500 to-red-600 text-rose-700 bg-rose-50 dark:bg-rose-950/20",
  };
  const theme = schemes[themeColor];
  return (
    <Card className="rounded-xl shadow-none border-gray-200/60 dark:border-zinc-800">
      <CardContent className="p-4 text-left flex flex-col justify-between h-full">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${theme.split(" ").slice(0,2).join(" ")} text-white shadow-xs`}>{icon}</div>
          <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-gray-100">{count}</span>
        </div>
        <p className="text-[11px] font-semibold text-muted-foreground mt-2">{label} Tasks</p>
      </CardContent>
    </Card>
  );
}

/* ─── Skeleton Loading ─── */
function HomeworkSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-10 w-full max-w-[300px] rounded-md" />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <Skeleton className="h-[450px] rounded-xl" />
    </div>
  );
}
