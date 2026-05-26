"use client";

import { apiFetch } from "@/lib/api";
import { useReducer, useEffect } from "react";
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
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { reducer, initialState, Assignment } from "./reducer";
import { HomeworkCreateDialog } from "./components/HomeworkCreateDialog";
import { OverdueHomeworkCard } from "./components/OverdueHomeworkCard";
import { AssignmentGrid } from "./components/AssignmentGrid";
import { SubmissionsDialog } from "./components/SubmissionsDialog";

export function TeacherAssignments() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    assignments,
    subjects,
    loading,
    dialogOpen,
    form,
    subDialogOpen,
    selectedAssignment,
    submissions,
    subLoading,
    editedGrades,
    bulkSaving,
    completingId,
    confirmCompleteId,
  } = state;

  useEffect(() => {
    Promise.all([
      apiFetch("/api/assignments?mine=true"),
      apiFetch("/api/subjects?mine=true"),
    ])
      .then(([aRes, sRes]) => Promise.all([aRes.json(), sRes.json()]))
      .then(([aData, sData]) => {
        dispatch({ type: "SET_ASSIGNMENTS", payload: aData });
        dispatch({ type: "SET_SUBJECTS", payload: sData });
        dispatch({ type: "SET_LOADING", payload: false });
      });
  }, []);

  const handleCreate = async () => {
    if (!form.title || !form.subjectId || !form.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    const selectedSub = subjects.find((s) => s.id === form.subjectId);
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
          teacherId: selectedSub.teacherId,
        }),
      });
      if (res.ok) {
        toast.success("Assignment created successfully!");
        dispatch({ type: "RESET_FORM" });
        const data = await apiFetch("/api/assignments?mine=true").then((r) => r.json());
        dispatch({ type: "SET_ASSIGNMENTS", payload: data });
      }
    } catch {
      toast.error("Failed to create assignment");
    }
  };

  const handleCompleteAssignment = async (assignmentId: string) => {
    dispatch({ type: "SET_COMPLETING_ID", payload: assignmentId });
    try {
      const res = await apiFetch(`/api/assignments/${assignmentId}/complete`, {
        method: "PUT",
      });
      if (res.ok) {
        toast.success("Assignment marked as completed!");
        const data = await apiFetch("/api/assignments?mine=true").then((r) => r.json());
        dispatch({ type: "SET_ASSIGNMENTS", payload: data });
      } else {
        toast.error("Failed to complete assignment");
      }
    } catch {
      toast.error("Failed to complete assignment");
    } finally {
      dispatch({ type: "SET_COMPLETING_ID", payload: null });
    }
  };

  const handleViewSubmissions = async (assignment: Assignment) => {
    dispatch({ type: "OPEN_SUBMISSIONS", payload: assignment });
    try {
      const res = await apiFetch(`/api/submissions?assignmentId=${assignment.id}`);
      if (res.ok) {
        const json = await res.json();
        dispatch({ type: "SET_SUBMISSIONS", payload: json.data || [] });
      }
    } catch {
      toast.error("Failed to load submissions");
      dispatch({ type: "SET_SUBMISSIONS", payload: [] });
    } finally {
      dispatch({ type: "SET_SUB_LOADING", payload: false });
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

    dispatch({ type: "SET_BULK_SAVING", payload: true });
    try {
      const res = await apiFetch("/api/submissions/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: selectedAssignment?.id,
          updates,
        }),
      });
      if (res.ok) {
        toast.success(`Bulk saved ${updates.length} grades!`);
        dispatch({
          type: "BULK_UPDATE_GRADES",
          payload: updates.map((u) => ({ id: u.id, grade: u.grade, feedback: u.feedback || null })),
        });
      } else {
        toast.error("Failed to bulk save grades");
      }
    } catch {
      toast.error("Failed to bulk save grades");
    } finally {
      dispatch({ type: "SET_BULK_SAVING", payload: false });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">My Homework</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {assignments.length} homework items total
          </p>
        </div>
        <HomeworkCreateDialog
          dialogOpen={dialogOpen}
          onOpenChange={(v) => dispatch({ type: "SET_DIALOG_OPEN", payload: v })}
          form={form}
          subjects={subjects}
          dispatch={dispatch}
          handleCreate={handleCreate}
        />
      </div>

      {/* Overdue */}
      <OverdueHomeworkCard assignments={assignments} />

      {/* Assignment Grid */}
      <AssignmentGrid
        assignments={assignments}
        completingId={completingId}
        dispatch={dispatch}
        handleViewSubmissions={handleViewSubmissions}
      />

      {/* Submissions Dialog */}
      <SubmissionsDialog
        subDialogOpen={subDialogOpen}
        selectedAssignment={selectedAssignment}
        subLoading={subLoading}
        submissions={submissions}
        editedGrades={editedGrades}
        bulkSaving={bulkSaving}
        dispatch={dispatch}
        handleBulkSave={handleBulkSave}
      />

      <AlertDialog
        open={!!confirmCompleteId}
        onOpenChange={(open) => !open && dispatch({ type: "SET_CONFIRM_COMPLETE_ID", payload: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500 fill-amber-500/10" /> Mark homework as
              complete?
            </AlertDialogTitle>
            <AlertDialogDescription className="py-1 text-sm">
              Once you mark this homework as complete, it indicates all work is finished and
              finalized. This action will conclude submissions for students. Are you sure you want to
              continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmCompleteId) {
                  handleCompleteAssignment(confirmCompleteId);
                  dispatch({ type: "SET_CONFIRM_COMPLETE_ID", payload: null });
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
