"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useAppStore } from "@/store/use-app-store";
import { useParentDashboard } from "@/lib/graphql/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ChildSelector } from "./ChildSelector";
import { cn } from "@/lib/utils";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Globe,
  BookOpen,
  BookMarked,
  Users,
  List,
  CalendarDays,
  Calendar as CalendarIcon,
} from "lucide-react";
import type { StudentInfo, AssignmentInfo } from "@/types";
import { DailyDiaryPlanner } from "@/components/shared/daily-diary-planner";

type HomeworkStatus = "active" | "submitted" | "overdue";

interface StudentSubmission {
  id: string;
  status: string;
  submittedAt: string;
  assignmentId: string;
}

interface EnrichedHomework extends AssignmentInfo {
  status: HomeworkStatus;
  countdown: string;
  daysLeft: number;
  submitted: boolean;
  submissionId: string | null;
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
        .find((row) => row.startsWith("lastSelectedStudent="))
        ?.split("=")[1];
      
      const targetId = savedTab && children.some(s => s.id === savedTab) ? savedTab : children[0].id;
      if (targetId !== activeStudentId) {
        setActiveStudentId(targetId);
      }
    }
  }, [children, activeStudentId]);

  const handleStudentChange = (val: string) => {
    setActiveStudentId(val);
    document.cookie = `lastSelectedStudent=${val}; path=/; max-age=31536000`;
  };

  if (isPending) return <HomeworkSkeleton />;

  if (children.length === 0) {
    return (
      <Card className="rounded-2xl border border-border bg-card shadow-xs">
        <CardContent className="p-12 text-center">
          <div className="size-14 rounded-2xl bg-muted flex items-center justify-center mx-auto text-foreground">
            <Users className="size-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mt-4">No children registered</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Contact administration to link your child to this account.
          </p>
        </CardContent>
      </Card>
    );
  }

  const selectedStudent = children.find((c) => c.id === activeStudentId) || children[0];

  return (
    <div className="space-y-6 pb-10 animate-fade-in select-none">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-3.5 text-left">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-muted text-foreground flex items-center justify-center">
              <BookMarked className="size-4" />
            </div>
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              Homework & Diary
            </h2>
          </div>
          {/* Children Switcher Dropdown */}
          <ChildSelector 
            students={children}
            selectedStudentId={selectedStudent.id}
            onSelect={handleStudentChange}
          />
        </div>
      </div>

      <div className="space-y-6 mt-6 animate-in fade-in duration-300">
        <ChildHomeworkView student={selectedStudent} />
      </div>
    </div>
  );
}

/* ─── Child Homework View ─── */
function ChildHomeworkView({ student }: { student: StudentInfo }) {
  const [loading, setLoading] = useState(true);
  const [homeworks, setHomeworks] = useState<AssignmentInfo[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "diary">("list");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const fetchChildData = useCallback(async () => {
    setLoading(true);
    try {
      const [homeworkRes, submissionsRes] = await Promise.all([
        apiFetch(`/api/homework?classId=${student.classId}`),
        apiFetch(`/api/submissions?studentId=${student.id}`).catch(() => null)
      ]);

      const homeworkData = await homeworkRes.json();
      setHomeworks(Array.isArray(homeworkData) ? homeworkData : []);

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

  const enrichedHomeworks: EnrichedHomework[] = useMemo(() => {
    const now = new Date();
    const subMap = new Map<string, StudentSubmission>();
    submissions.forEach((s) => subMap.set(s.assignmentId, s));

    return homeworks.map((a) => {
      const due = new Date(a.dueDate);
      const diffMs = due.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const pastDue = diffDays < 0;

      const realSub = subMap.get(a.id);
      const isSubmitted = !!realSub;

      let status: HomeworkStatus;
      if (isSubmitted) status = "submitted";
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
        submitted: isSubmitted,
        submissionId: realSub?.id || null,
      };
    });
  }, [homeworks, submissions]);

  // Daily Diary filters
  const selectedDateHomeworks = useMemo(() => {
    if (!selectedDate) return [];
    return enrichedHomeworks.filter((a) => {
      if (!a.createdAt) return false;
      const d = new Date(a.createdAt);
      return (
        d.getFullYear() === selectedDate.getFullYear() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getDate() === selectedDate.getDate()
      );
    });
  }, [enrichedHomeworks, selectedDate]);

  const dueSelectedDateHomeworks = useMemo(() => {
    if (!selectedDate) return [];
    return enrichedHomeworks.filter((a) => {
      const d = new Date(a.dueDate);
      const isDue = (
        d.getFullYear() === selectedDate.getFullYear() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getDate() === selectedDate.getDate()
      );
      if (!isDue) return false;

      // Exclude if already shown in "Assigned Today" to prevent duplicate listing
      if (a.createdAt) {
        const c = new Date(a.createdAt);
        const isAssigned = (
          c.getFullYear() === selectedDate.getFullYear() &&
          c.getMonth() === selectedDate.getMonth() &&
          c.getDate() === selectedDate.getDate()
        );
        if (isAssigned) return false;
      }
      return true;
    });
  }, [enrichedHomeworks, selectedDate]);

  // Homework dates for calendar indicators
  const homeworkDays = useMemo(() => {
    return enrichedHomeworks
      .map((a) => {
        if (!a.createdAt) return null;
        const d = new Date(a.createdAt);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
      })
      .filter(Boolean) as Date[];
  }, [enrichedHomeworks]);

  const counts = useMemo(() => ({
    all: enrichedHomeworks.length,
    active: enrichedHomeworks.filter((a) => a.status === "active").length,
    submitted: enrichedHomeworks.filter((a) => a.status === "submitted").length,
    overdue: enrichedHomeworks.filter((a) => a.status === "overdue").length,
  }), [enrichedHomeworks]);

  const getStatusBadge = (status: HomeworkStatus) => {
    switch (status) {
      case "submitted":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold">Submitted</Badge>;
      case "active":
        return <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[10px] font-semibold">Pending</Badge>;
      case "overdue":
        return <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] font-semibold">Overdue</Badge>;
      default:
        return null;
    }
  };

  const getProgressValue = (status: HomeworkStatus) => {
    switch (status) {
      case "submitted": return 100;
      case "active": return 30;
      case "overdue": return 0;
      default: return 0;
    }
  };

  const getProgressColor = (status: HomeworkStatus) => {
    switch (status) {
      case "submitted": return "[&>div]:bg-emerald-500";
      case "active": return "[&>div]:bg-foreground";
      case "overdue": return "[&>div]:bg-rose-500";
      default: return "[&>div]:bg-foreground";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl bg-muted" />)}
        </div>
        <Skeleton className="h-[400px] rounded-3xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {viewMode === "list" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <HomeworkSummaryCard 
            label="Due Today" 
            count={dueSelectedDateHomeworks.length} 
            icon={<FileText className="size-4" />} 
          />
          <HomeworkSummaryCard 
            label="Active" 
            count={counts.active} 
            icon={<Clock className="size-4" />} 
          />
          <HomeworkSummaryCard 
            label="Submitted" 
            count={counts.submitted} 
            icon={<CheckCircle2 className="size-4" />} 
          />
          <HomeworkSummaryCard 
            label="Overdue" 
            count={counts.overdue} 
            icon={<AlertTriangle className="size-4" />} 
          />
        </div>
      )}

      <Card className="rounded-3xl border border-border bg-card shadow-xs py-0 gap-0 overflow-hidden">
        <CardHeader className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 space-y-0">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0">
              <FileText className="size-4" />
            </div>
            <CardTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
              Homework Tracker & Diary
            </CardTitle>
          </div>
          
          {/* View Mode Segmented Switcher */}
          <div className="flex items-center bg-muted p-1 rounded-xl border border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={cn(
                "text-xs gap-1.5 h-7 px-3 rounded-lg transition-all shadow-none cursor-pointer",
                viewMode === "list" 
                  ? "bg-card text-foreground font-semibold shadow-xs" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="size-3.5" />
              List View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("diary")}
              className={cn(
                "text-xs gap-1.5 h-7 px-3 rounded-lg transition-all shadow-none cursor-pointer",
                viewMode === "diary" 
                  ? "bg-card text-foreground font-semibold shadow-xs" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <CalendarIcon className="size-3.5" />
              Daily Diary
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          {viewMode === "list" ? (
            <div className="space-y-4">
              {/* Date Header / Selector for List View */}
              <div className="flex items-center justify-between border-b border-border pb-3.5">
                <div className="text-left flex flex-col justify-center">
                  <h3 className="text-sm font-semibold tracking-tight text-foreground">
                    {selectedDate ? format(selectedDate, "eeee") : "Select Date"}
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                    {selectedDate ? format(selectedDate, "MMM d, yyyy") : ""}
                  </p>
                </div>
                {/* Popover Calendar for list view */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button 
                      type="button"
                      className="h-8 text-xs font-medium px-3 bg-card border border-border text-foreground hover:bg-muted/70 rounded-xl flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                    >
                      <CalendarDays className="size-3.5 mr-1.5 text-muted-foreground" />
                      Select Date
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border border-border rounded-2xl shadow-xl overflow-hidden" align="end">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      modifiers={{ hasHomework: homeworkDays }}
                      modifiersClassNames={{
                        hasHomework: "relative after:absolute after:bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:size-1.5 after:bg-foreground after:rounded-full font-bold"
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* List of homework for selected date */}
              <ScrollArea className="max-h-[500px] pr-2">
                {selectedDateHomeworks.length === 0 && dueSelectedDateHomeworks.length === 0 ? (
                  <div className="text-center py-14 text-muted-foreground border border-dashed border-border bg-muted/20 rounded-2xl">
                    <FileText className="size-9 mx-auto mb-2.5 opacity-30 text-muted-foreground" />
                    <p className="text-sm font-semibold text-foreground">No homework found</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      No homework assigned or due on this date.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Assigned Today */}
                    {selectedDateHomeworks.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-foreground tracking-tight mb-2.5 flex items-center gap-2">
                          <span className="size-2 rounded-full bg-foreground" />
                          Assigned Today ({selectedDateHomeworks.length})
                        </h4>
                        <div className="space-y-2">
                          {selectedDateHomeworks.map((a) => (
                            <ListHomeworkCard 
                              key={a.id} 
                              a={a} 
                              getStatusBadge={getStatusBadge} 
                              getProgressValue={getProgressValue} 
                              getProgressColor={getProgressColor} 
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Due Today */}
                    {dueSelectedDateHomeworks.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-foreground tracking-tight mb-2.5 flex items-center gap-2 mt-4">
                          <span className="size-2 rounded-full bg-rose-500" />
                          Due Today ({dueSelectedDateHomeworks.length})
                        </h4>
                        <div className="space-y-2">
                          {dueSelectedDateHomeworks.map((a) => (
                            <ListHomeworkCard 
                              key={a.id} 
                              a={a} 
                              getStatusBadge={getStatusBadge} 
                              getProgressValue={getProgressValue} 
                              getProgressColor={getProgressColor} 
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </div>
          ) : (
            <DailyDiaryPlanner
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              homeworkDays={homeworkDays}
              selectedDateAssignments={selectedDateHomeworks}
              dueSelectedDateAssignments={dueSelectedDateHomeworks}
              getStatusBadge={getStatusBadge}
              getProgressValue={getProgressValue}
              getProgressColor={getProgressColor}
              emptyMessage="No homework assigned or due on this date."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── List View Card Sub-component ─── */
function ListHomeworkCard({
  a,
  getStatusBadge,
  getProgressValue,
  getProgressColor,
}: {
  a: EnrichedHomework;
  getStatusBadge: (status: HomeworkStatus) => React.ReactNode;
  getProgressValue: (status: HomeworkStatus) => number;
  getProgressColor: (status: HomeworkStatus) => string;
}) {
  return (
    <div
      className={cn(
        "p-4 rounded-2xl border border-border bg-card hover:bg-muted/40 transition-colors shadow-xs text-left",
        a.status === "overdue" && "border-rose-500/30",
        a.status === "submitted" && "border-emerald-500/30"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 mb-1.5">
            <h4 className="font-semibold text-sm text-foreground truncate">{a.title}</h4>
            {getStatusBadge(a.status)}
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground border-border font-medium">
              {a.subjectName}
            </Badge>
            <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground border-border font-medium flex items-center gap-1">
              {a.mode === "online" ? <Globe className="size-2.5 text-foreground" /> : <BookOpen className="size-2.5 text-foreground" />}
              {a.mode === "online" ? "Online Submission" : "Offline Paper"}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground mb-2">Assigned by {a.teacherName}</p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className={cn("size-3.5", a.status === "overdue" ? "text-rose-500" : "text-muted-foreground")} />
              <span className={a.status === "overdue" ? "text-rose-600 dark:text-rose-400 font-medium" : ""} suppressHydrationWarning>
                {a.countdown}
              </span>
            </div>
            <span suppressHydrationWarning>
              Due: {new Date(a.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-border flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Progress Tracking</span>
          <span className="font-semibold text-foreground">{getProgressValue(a.status)}%</span>
        </div>
        <Progress value={getProgressValue(a.status)} className={cn("h-1.5 bg-muted", getProgressColor(a.status))} />
      </div>
    </div>
  );
}

/* ─── Summary Card Sub-component ─── */
function HomeworkSummaryCard({ 
  label, 
  count, 
  icon 
}: { 
  label: string; 
  count: number; 
  icon: React.ReactNode; 
}) {
  return (
    <Card className="rounded-2xl border border-border bg-card shadow-xs transition-colors hover:border-border">
      <CardContent className="p-4 sm:p-5 text-left flex flex-col justify-between h-full">
        <div className="flex items-center justify-between">
          <div className="p-2.5 rounded-xl bg-muted text-foreground flex items-center justify-center shrink-0">
            {icon}
          </div>
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
            {count}
          </span>
        </div>
        <p className="text-xs font-medium text-muted-foreground mt-3">
          {label}
        </p>
      </CardContent>
    </Card>
  );
}

/* ─── Skeleton Loading ─── */
function HomeworkSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-48 bg-muted" />
      <Skeleton className="h-10 w-full max-w-[300px] rounded-xl bg-muted" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl bg-muted" />)}
      </div>
      <Skeleton className="h-[450px] rounded-3xl bg-muted" />
    </div>
  );
}
