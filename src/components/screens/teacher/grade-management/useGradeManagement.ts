"use client";

import { useReducer, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { initialState, gradeManagementReducer, Assessment } from "./types";

export function useGradeManagement() {
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

  return {
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
    activeAssessment,
    dispatch,
    handleCreateAssessment,
    handleCompleteAssessment,
    handleSave,
  };
}
