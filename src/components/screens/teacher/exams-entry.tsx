"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, School } from "lucide-react";
import { useEffect, useMemo, useReducer } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

// Subcomponents
import { ExamsSkeleton } from "./exams-entry/exams-skeleton";
import { ExamsSelector } from "./exams-entry/exams-selector";
import { ExamDetailsBanner } from "./exams-entry/exam-details-banner";
import { ResultsSummary } from "./exams-entry/results-summary";
import { ResultsTable } from "./exams-entry/results-table";

// Types
import { ClassInfo, ExamRecord, StudentResultRow } from "./exams-entry/types";

// Reducer State & Types
interface ExamsState {
  classes: ClassInfo[];
  exams: ExamRecord[];
  selectedClass: string;
  selectedExamId: string;
  resultRows: StudentResultRow[];
  loadingClasses: boolean;
  loadingExams: boolean;
  loadingStudents: boolean;
  savingResults: boolean;
  isPublishing: boolean;
}

type ExamsAction =
  | { type: "SET_CLASSES"; payload: ClassInfo[] }
  | { type: "SET_EXAMS"; payload: ExamRecord[] }
  | { type: "SET_SELECTED_CLASS"; payload: string }
  | { type: "SET_SELECTED_EXAM_ID"; payload: string }
  | { type: "SET_RESULT_ROWS"; payload: StudentResultRow[] }
  | { type: "SET_LOADING_CLASSES"; payload: boolean }
  | { type: "SET_LOADING_EXAMS"; payload: boolean }
  | { type: "SET_LOADING_STUDENTS"; payload: boolean }
  | { type: "SET_SAVING_RESULTS"; payload: boolean }
  | { type: "SET_IS_PUBLISHING"; payload: boolean };

const initialState: ExamsState = {
  classes: [],
  exams: [],
  selectedClass: "",
  selectedExamId: "",
  resultRows: [],
  loadingClasses: true,
  loadingExams: false,
  loadingStudents: false,
  savingResults: false,
  isPublishing: false,
};

function examsReducer(state: ExamsState, action: ExamsAction): ExamsState {
  switch (action.type) {
    case "SET_CLASSES":
      return { ...state, classes: action.payload };
    case "SET_EXAMS":
      return { ...state, exams: action.payload };
    case "SET_SELECTED_CLASS":
      return { ...state, selectedClass: action.payload };
    case "SET_SELECTED_EXAM_ID":
      return { ...state, selectedExamId: action.payload };
    case "SET_RESULT_ROWS":
      return { ...state, resultRows: action.payload };
    case "SET_LOADING_CLASSES":
      return { ...state, loadingClasses: action.payload };
    case "SET_LOADING_EXAMS":
      return { ...state, loadingExams: action.payload };
    case "SET_LOADING_STUDENTS":
      return { ...state, loadingStudents: action.payload };
    case "SET_SAVING_RESULTS":
      return { ...state, savingResults: action.payload };
    case "SET_IS_PUBLISHING":
      return { ...state, isPublishing: action.payload };
    default:
      return state;
  }
}

export function TeacherExamsEntry() {
  const [state, dispatch] = useReducer(examsReducer, initialState);
  const {
    classes,
    exams,
    selectedClass,
    selectedExamId,
    resultRows,
    loadingClasses,
    loadingExams,
    loadingStudents,
    savingResults,
    isPublishing,
  } = state;

  const selectedExam = useMemo(() => {
    return exams.find((e) => e.id === selectedExamId) || null;
  }, [exams, selectedExamId]);

  // 1. Load classes assigned to teacher
  useEffect(() => {
    dispatch({ type: "SET_LOADING_CLASSES", payload: true });
    apiFetch("/api/classes")
      .then((r) => r.json())
      .then((data) => {
        dispatch({ type: "SET_CLASSES", payload: Array.isArray(data) ? data : [] });
      })
      .catch((err) => console.error("Load classes failed:", err))
      .finally(() => dispatch({ type: "SET_LOADING_CLASSES", payload: false }));
  }, []);

  // 2. Load teacher's specific exams when class changes
  useEffect(() => {
    if (!selectedClass) {
      dispatch({ type: "SET_EXAMS", payload: [] });
      dispatch({ type: "SET_SELECTED_EXAM_ID", payload: "" });
      dispatch({ type: "SET_RESULT_ROWS", payload: [] });
      return;
    }

    dispatch({ type: "SET_LOADING_EXAMS", payload: true });
    dispatch({ type: "SET_SELECTED_EXAM_ID", payload: "" });
    dispatch({ type: "SET_RESULT_ROWS", payload: [] });

    apiFetch(`/api/exams?classId=${selectedClass}&mine=true&limit=100`)
      .then((r) => r.json())
      .then((data) => {
        const examsList = data?.data || (Array.isArray(data) ? data : []);
        dispatch({
          type: "SET_EXAMS",
          payload: examsList.filter(
            (e: ExamRecord) =>
              e.status !== "cancelled" &&
              (e.examType === "midterm" || e.examType === "final"),
          ),
        });
      })
      .catch((err) => console.error("Load exams failed:", err))
      .finally(() => dispatch({ type: "SET_LOADING_EXAMS", payload: false }));
  }, [selectedClass]);

  // 3. Load student list and existing scores for selected exam
  useEffect(() => {
    if (!selectedExamId || !selectedClass) {
      dispatch({ type: "SET_RESULT_ROWS", payload: [] });
      return;
    }

    dispatch({ type: "SET_LOADING_STUDENTS", payload: true });

    Promise.all([
      apiFetch(`/api/students?classId=${selectedClass}&mode=min&limit=1000`),
      apiFetch(`/api/exams/results?examId=${selectedExamId}`),
    ])
      .then(async ([studentsRes, resultsRes]) => {
        const [studentsData, resultsData] = await Promise.all([
          studentsRes.json(),
          resultsRes.json(),
        ]);

        const studentsList =
          studentsData.items || (Array.isArray(studentsData) ? studentsData : []);
        const resultsList = resultsData.results || [];

        const rows = studentsList.map((s: any) => {
          const match = resultsList.find((r: any) => r.studentId === s.id);
          return {
            studentId: s.id,
            studentName: s.name,
            rollNumber: s.rollNumber || "N/A",
            marksObtained: match ? String(match.marksObtained) : "",
            remarks: match?.remarks || "",
            status: match ? match.status : "pending",
          };
        });
        dispatch({ type: "SET_RESULT_ROWS", payload: rows });
      })
      .catch((err) => {
        console.error("Failed loading entry rows:", err);
        toast.error("Failed to load class students");
      })
      .finally(() => dispatch({ type: "SET_LOADING_STUDENTS", payload: false }));
  }, [selectedExamId, selectedClass]);

  const handleUpdateMark = (studentId: string, val: string) => {
    if (!selectedExam) return;

    const updatedRows: StudentResultRow[] = resultRows.map((row) => {
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
        status: isPass ? "pass" : "fail",
      };
    });

    dispatch({ type: "SET_RESULT_ROWS", payload: updatedRows });
  };

  const handleSaveDraft = async () => {
    if (!selectedExamId) return;
    dispatch({ type: "SET_SAVING_RESULTS", payload: true });
    try {
      const res = await apiFetch("/api/exams/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: selectedExamId,
          results: resultRows
            .filter((r) => r.marksObtained.trim() !== "")
            .map((r) => ({
              studentId: r.studentId,
              marksObtained: parseFloat(r.marksObtained),
              status: r.status,
              remarks: r.remarks || null,
            })),
        }),
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
    dispatch({ type: "SET_SAVING_RESULTS", payload: false });
  };

  const handlePublish = async () => {
    if (!selectedExam) return;

    const hasPending = resultRows.some((r) => r.marksObtained.trim() === "");
    if (hasPending) {
      const proceed = window.confirm(
        "Some students are missing marks. Do you want to publish the results anyway?",
      );
      if (!proceed) return;
    } else {
      const proceed = window.confirm(
        "Publishing will finalize the results and lock them for student viewing. Continue?",
      );
      if (!proceed) return;
    }

    dispatch({ type: "SET_IS_PUBLISHING", payload: true });
    try {
      const saveRes = await apiFetch("/api/exams/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: selectedExam.id,
          results: resultRows
            .filter((r) => r.marksObtained.trim() !== "")
            .map((r) => ({
              studentId: r.studentId,
              marksObtained: parseFloat(r.marksObtained),
              status: r.status,
              remarks: r.remarks || null,
            })),
        }),
      });

      if (!saveRes.ok) throw new Error("Failed to commit final results");

      const updateRes = await apiFetch("/api/exams", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedExam.id,
          status: "completed",
        }),
      });

      if (updateRes.ok) {
        toast.success("Exam results successfully published!");
        dispatch({
          type: "SET_EXAMS",
          payload: exams.map((e) =>
            e.id === selectedExam.id ? { ...e, status: "completed" } : e,
          ),
        });
      } else {
        throw new Error("Failed to lock exam status to published");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to publish exam results");
    }
    dispatch({ type: "SET_IS_PUBLISHING", payload: false });
  };

  const resultSummary = {
    total: resultRows.length,
    pass: resultRows.filter((r) => r.status === "pass").length,
    fail: resultRows.filter((r) => r.status === "fail").length,
    pending: resultRows.filter((r) => r.marksObtained === "").length,
  };

  if (loadingClasses) {
    return <ExamsSkeleton />;
  }

  return (
    <div className="p-4 md:px-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Persistent Selectors Card */}
      <ExamsSelector
        classes={classes}
        selectedClass={selectedClass}
        onClassChange={(val) => dispatch({ type: "SET_SELECTED_CLASS", payload: val })}
        exams={exams}
        selectedExamId={selectedExamId}
        onExamChange={(val) => dispatch({ type: "SET_SELECTED_EXAM_ID", payload: val })}
        loadingExams={loadingExams}
        hasSelectedExam={!!selectedExam}
      />

      {/* Conditional Views */}
      {!selectedExam ? (
        <Card className="border-dashed border-2 bg-transparent">
          <CardContent className="py-20 text-center text-muted-foreground">
            {selectedClass ? (
              <>
                <BookOpen className="size-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">
                  Please select an exam to continue
                </p>
                <p className="text-sm">
                  Pick an exam from your assigned subjects above to start entering
                  results.
                </p>
              </>
            ) : (
              <>
                <School className="size-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No Class Selected</p>
                <p className="text-sm">
                  Choose a class at the top to see available exams.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          {/* Exam Info Card */}
          <ExamDetailsBanner exam={selectedExam} />

          {/* Results Summary Mini Cards */}
          <ResultsSummary
            total={resultSummary.total}
            pass={resultSummary.pass}
            fail={resultSummary.fail}
            pending={resultSummary.pending}
          />

          {/* Scoring Table Card */}
          <ResultsTable
            loadingStudents={loadingStudents}
            resultRows={resultRows}
            onUpdateMark={handleUpdateMark}
            selectedExamStatus={selectedExam.status}
            savingResults={savingResults}
            isPublishing={isPublishing}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
          />
        </div>
      )}
    </div>
  );
}

