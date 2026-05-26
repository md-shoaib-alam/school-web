"use client";

import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { useReducer, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, Users, Eye, FileText, GraduationCap, Trophy, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { useModulePermissions } from "@/hooks/use-permissions";
import { initialState, gradeManagementReducer } from "./grade-management/types";

// Refactored child components
import { CreateAssessmentDialog } from "./grade-management/create-assessment-dialog";
import { ConfirmFinalizeDialog } from "./grade-management/confirm-finalize-dialog";
import { AssessmentsList } from "./grade-management/assessments-list";
import { RecordScoresDialog } from "./grade-management/record-scores-dialog";

export function TeacherGrades() {
  const { canCreate, canEdit, canDelete } = useModulePermissions("grades");
  const [state, dispatch] = useReducer(gradeManagementReducer, initialState);

  const {
    classes,
    subjects,
    students,
    assessments,
    selectedAssessmentId,
    confirmCompleteId,
    completingId,
    marks,
    loading,
    saving,
    gradesLoading,
    isDirty,
    activeTab,
    listLoading,
    isDialogOpen,
    newTitle,
    newType,
    newMode,
    newTotalMarks,
    newPassingMarks,
    isCreating,
    dialogClassId,
    dialogSubjectId,
  } = state;

  // 1. Initial bootstrap data (Classes/Subjects)
  useEffect(() => {
    Promise.all([
      apiFetch("/api/classes"),
      apiFetch("/api/subjects?mine=true"),
    ])
      .then(([cRes, sRes]) => Promise.all([cRes.json(), sRes.json()]))
      .then(([cData, sData]) => {
        dispatch({ type: "SET_BOOTSTRAP_DATA", classes: cData, subjects: sData });
      })
      .catch((e) => {
        console.error(e);
        dispatch({ type: "SET_LOADING", value: false });
      });
  }, []);

  // 1b. Fetch assessments filtered by tab status
  useEffect(() => {
    dispatch({ type: "SET_LIST_LOADING", value: true });
    apiFetch(`/api/assessments?status=${activeTab}`)
      .then((r) => r.json())
      .then((data) => {
        dispatch({ type: "SET_ASSESSMENTS", assessments: data || [] });
      })
      .catch((e) => {
        console.error(e);
        dispatch({ type: "SET_LIST_LOADING", value: false });
      });
  }, [activeTab]);

  // 2. Load students for selected assessment's class
  useEffect(() => {
    if (!selectedAssessmentId) {
      dispatch({ type: "SET_STUDENTS", students: [] });
      dispatch({ type: "SET_MARKS", marks: {} });
      dispatch({ type: "SET_IS_DIRTY", value: false });
      return;
    }
    const assessment = assessments.find(a => a.id === selectedAssessmentId);
    if (!assessment) return;

    apiFetch(`/api/students?classId=${assessment.classId}`)
      .then((r) => r.json())
      .then((data) => {
        const studentArray = Array.isArray(data) ? data : (data?.items || []);
        dispatch({ type: "SET_STUDENTS", students: studentArray });
      });
  }, [selectedAssessmentId, assessments]);

  // 4. Load existing grades for selected isolated assessment
  useEffect(() => {
    if (!selectedAssessmentId) {
      dispatch({ type: "SET_MARKS", marks: {} });
      dispatch({ type: "SET_IS_DIRTY", value: false });
      return;
    }
    dispatch({ type: "SET_GRADES_LOADING", value: true });
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
          dispatch({ type: "SET_MARKS", marks: initialMarks });
          dispatch({ type: "SET_IS_DIRTY", value: false });
        } else {
          dispatch({ type: "SET_MARKS", marks: {} });
          dispatch({ type: "SET_IS_DIRTY", value: false });
        }
      })
      .catch((e) => {
        console.error(e);
        dispatch({ type: "SET_MARKS", marks: {} });
        dispatch({ type: "SET_IS_DIRTY", value: false });
      })
      .finally(() => dispatch({ type: "SET_GRADES_LOADING", value: false }));
  }, [selectedAssessmentId]);

  const activeAssessment = assessments.find(a => a.id === selectedAssessmentId);
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
    dispatch({ type: "SET_IS_CREATING", value: true });
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
      dispatch({ type: "SET_IS_DIALOG_OPEN", value: false });
      dispatch({ type: "SET_NEW_TITLE", value: "" });
      dispatch({ type: "SET_NEW_MODE", value: "offline" });
      
      // Seamlessly shift global view state to immediately display this assessment!
      dispatch({ type: "ADD_ASSESSMENT", assessment: created });
    } catch (e) {
      console.error(e);
      toast.error("Could not create assessment");
    }
    dispatch({ type: "SET_IS_CREATING", value: false });
  };

  // COMPLETE ASSESSMENT PERMANENTLY
  const handleCompleteAssessment = async (assessmentId: string) => {
    dispatch({ type: "SET_COMPLETING_ID", id: assessmentId });
    try {
      const res = await apiFetch(`/api/assessments/${assessmentId}/complete`, {
        method: "PUT",
      });
      if (res.ok) {
        toast.success("Assessment finalized successfully!");
        dispatch({ type: "SET_ASSESSMENTS", assessments: assessments.filter((item) => item.id !== assessmentId) });
        if (selectedAssessmentId === assessmentId) {
          dispatch({ type: "SET_SELECTED_ASSESSMENT_ID", id: "" });
        }
      } else {
        toast.error("Could not complete assessment.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete assessment.");
    } finally {
      dispatch({ type: "SET_COMPLETING_ID", id: null });
    }
  };

  // BULK SAVE GRADES
  const handleSave = async () => {
    if (!selectedAssessmentId) return;
    dispatch({ type: "SET_SAVING", value: true });
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
        dispatch({ type: "SET_SAVING", value: false });
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
      dispatch({ type: "SET_IS_DIRTY", value: false });
    } catch (error) {
      console.error(error);
      toast.error("Failed to save marks");
    }
    dispatch({ type: "SET_SAVING", value: false });
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
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Assessments
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {assessments.length} assessments total
          </p>
        </div>

        {/* Create Assessment Button & Modal */}
        {canCreate && (
          <CreateAssessmentDialog
            isOpen={isDialogOpen}
            onOpenChange={(v) => dispatch({ type: "SET_IS_DIALOG_OPEN", value: v })}
            dialogClassId={dialogClassId}
            dialogSubjectId={dialogSubjectId}
            newTitle={newTitle}
            newType={newType}
            newMode={newMode}
            newTotalMarks={newTotalMarks}
            newPassingMarks={newPassingMarks}
            isCreating={isCreating}
            classes={classes}
            subjects={subjects}
            dispatch={dispatch}
            onCreate={handleCreateAssessment}
          />
        )}
      </div>

      <div className="space-y-6 animate-in fade-in-50 duration-300">
        {/* Read-only banner */}
        {!canCreate && !canEdit && !canDelete && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-3 py-2">
            <Eye className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
              Read-only mode — you have view permission only for this module.
            </span>
          </div>
        )}

        {/* Status Selection Tabs */}
        <div className="flex border-b border-zinc-100 dark:border-zinc-800/80 mb-2">
          <button
            type="button"
            onClick={() => {
              if (!listLoading) dispatch({ type: "SET_ACTIVE_TAB", tab: "active" });
            }}
            disabled={listLoading}
            className={`pb-3 px-6 text-sm font-semibold transition-colors duration-200 outline-none relative flex items-center gap-2 cursor-pointer disabled:opacity-75 ${
              activeTab === "active"
                ? "text-blue-600 dark:text-blue-400"
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            }`}
          >
            <Clock className={`size-4 ${activeTab === "active" ? "text-blue-500" : ""}`} />
            <span>Active</span>
            {!listLoading && activeTab === "active" && assessments.length > 0 && (
              <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50 font-medium px-1.5 py-0 text-[10px] pointer-events-none rounded-full transition-all">
                {assessments.length}
              </span>
            )}
            {activeTab === "active" && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-500 rounded-t-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!listLoading) dispatch({ type: "SET_ACTIVE_TAB", tab: "completed" });
            }}
            disabled={listLoading}
            className={`pb-3 px-6 text-sm font-semibold transition-colors duration-200 outline-none relative flex items-center gap-2 cursor-pointer disabled:opacity-75 ${
              activeTab === "completed"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            }`}
          >
            <CheckCircle2 className={`size-4 ${activeTab === "completed" ? "text-emerald-500" : ""}`} />
            <span>Completed / Finalized</span>
            {!listLoading && activeTab === "completed" && assessments.length > 0 && (
              <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50 font-medium px-1.5 py-0 text-[10px] pointer-events-none rounded-full transition-all">
                {assessments.length}
              </span>
            )}
            {activeTab === "completed" && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-500 rounded-t-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        </div>

        {/* Assessments Card Grid (Homework‑style) */}
        <AssessmentsList
          assessments={assessments}
          listLoading={listLoading}
          selectedAssessmentId={selectedAssessmentId}
          marks={marks}
          classes={classes}
          subjects={subjects}
          completingId={completingId}
          dispatch={dispatch}
        />

        {/* Assessment Dialog for Scores Recording */}
        <RecordScoresDialog
          selectedAssessmentId={selectedAssessmentId}
          activeAssessment={activeAssessment}
          gradesLoading={gradesLoading}
          students={students}
          marks={marks}
          isDirty={isDirty}
          canCreate={canCreate}
          saving={saving}
          dispatch={dispatch}
          onSave={handleSave}
        />

        {/* Empty State */}
        {!loading && !listLoading && assessments.length === 0 && (
          <div className="text-center py-16 bg-zinc-50/40 dark:bg-zinc-900/10 rounded-xl border border-dashed border-border flex flex-col items-center justify-center animate-in fade-in-50 duration-500">
            <div className={`${activeTab === "active" ? "bg-blue-50 dark:bg-blue-900/20" : "bg-emerald-50 dark:bg-emerald-900/20"} p-4 rounded-full mb-4`}>
              {activeTab === "active" ? (
                <FileText className="size-10 text-blue-600 dark:text-blue-400 opacity-90" />
              ) : (
                <CheckCircle2 className="size-10 text-emerald-600 dark:text-emerald-400 opacity-90" />
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
              <button
                type="button"
                onClick={() => dispatch({ type: "SET_IS_DIALOG_OPEN", value: true })}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-200 px-4 py-2 rounded-lg text-sm"
              >
                Create First Assessment
              </button>
            )}
          </div>
        )}

        {/* Empty State: No Students Found */}
        {selectedAssessmentId && students.length === 0 && (
          <div className="text-center py-16 text-zinc-400 dark:text-zinc-500">
            <Users className="size-12 mx-auto mb-4 opacity-50" />
            <p>No students found in this class</p>
          </div>
        )}

        {/* Confirm Complete / Finalize Alert Dialog */}
        <ConfirmFinalizeDialog
          isOpen={!!confirmCompleteId}
          onOpenChange={(open) => !open && dispatch({ type: "SET_CONFIRM_COMPLETE_ID", id: null })}
          onConfirm={() => {
            if (confirmCompleteId) {
              handleCompleteAssessment(confirmCompleteId);
              dispatch({ type: "SET_CONFIRM_COMPLETE_ID", id: null });
            }
          }}
        />
      </div>
    </div>
  );
}
