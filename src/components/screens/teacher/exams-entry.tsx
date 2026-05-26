"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, School } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
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

export function TeacherExamsEntry() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");
  const [resultRows, setResultRows] = useState<StudentResultRow[]>([]);

  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [savingResults, setSavingResults] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const selectedExam = useMemo(() => {
    return exams.find((e) => e.id === selectedExamId) || null;
  }, [exams, selectedExamId]);

  // 1. Load classes assigned to teacher
  useEffect(() => {
    setLoadingClasses(true);
    apiFetch("/api/classes")
      .then((r) => r.json())
      .then((data) => {
        setClasses(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Load classes failed:", err))
      .finally(() => setLoadingClasses(false));
  }, []);

  // 2. Load teacher's specific exams when class changes
  useEffect(() => {
    if (!selectedClass) {
      setExams([]);
      setSelectedExamId("");
      setResultRows([]);
      return;
    }

    setLoadingExams(true);
    setSelectedExamId("");
    setResultRows([]);

    apiFetch(`/api/exams?classId=${selectedClass}&mine=true&limit=100`)
      .then((r) => r.json())
      .then((data) => {
        const examsList = data?.data || (Array.isArray(data) ? data : []);
        setExams(
          examsList.filter(
            (e: ExamRecord) =>
              e.status !== "cancelled" &&
              (e.examType === "midterm" || e.examType === "final"),
          ),
        );
      })
      .catch((err) => console.error("Load exams failed:", err))
      .finally(() => setLoadingExams(false));
  }, [selectedClass]);

  // 3. Load student list and existing scores for selected exam
  useEffect(() => {
    if (!selectedExamId || !selectedClass) {
      setResultRows([]);
      return;
    }

    setLoadingStudents(true);

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
        setResultRows(rows);
      })
      .catch((err) => {
        console.error("Failed loading entry rows:", err);
        toast.error("Failed to load class students");
      })
      .finally(() => setLoadingStudents(false));
  }, [selectedExamId, selectedClass]);

  const handleUpdateMark = (studentId: string, val: string) => {
    if (!selectedExam) return;

    setResultRows((prev) =>
      prev.map((row) => {
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
      }),
    );
  };

  const handleSaveDraft = async () => {
    if (!selectedExamId) return;
    setSavingResults(true);
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
    setSavingResults(false);
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

    setIsPublishing(true);
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
        setExams((prev) =>
          prev.map((e) =>
            e.id === selectedExam.id ? { ...e, status: "completed" } : e,
          ),
        );
      } else {
        throw new Error("Failed to lock exam status to published");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to publish exam results");
    }
    setIsPublishing(false);
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
        onClassChange={setSelectedClass}
        exams={exams}
        selectedExamId={selectedExamId}
        onExamChange={setSelectedExamId}
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
