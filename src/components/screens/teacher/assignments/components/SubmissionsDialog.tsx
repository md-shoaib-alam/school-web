import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FileText, Users, BookOpen, Star, MessageSquare, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Assignment, Submission, Action } from "../reducer";

export interface SubmissionsDialogProps {
  subDialogOpen: boolean;
  selectedAssignment: Assignment | null;
  subLoading: boolean;
  submissions: Submission[];
  editedGrades: Record<string, { grade: string; feedback: string }>;
  bulkSaving: boolean;
  dispatch: React.Dispatch<Action>;
  handleBulkSave: () => void;
}

export function SubmissionsDialog({
  subDialogOpen,
  selectedAssignment,
  subLoading,
  submissions,
  editedGrades,
  bulkSaving,
  dispatch,
  handleBulkSave,
}: SubmissionsDialogProps) {
  return (
    <Dialog
      open={subDialogOpen}
      onOpenChange={(open) => {
        dispatch({ type: "SET_SUB_DIALOG_OPEN", payload: open });
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-4 text-blue-600" />
            {selectedAssignment?.title}
          </DialogTitle>
          <DialogDescription>
            {selectedAssignment?.subjectName} • {selectedAssignment?.className} • Due:{" "}
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
            <p className="text-xs mt-1">Students haven&apos;t submitted this homework</p>
          </div>
        ) : (
          <div className="flex flex-col max-h-[75vh]">
            <div className="overflow-y-auto pr-2 space-y-3 py-2 custom-scrollbar flex-1">
              {submissions.map((sub) => {
                const isOfflinePending =
                  selectedAssignment?.mode === "offline" && sub.status === "not_submitted";
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
                          <p
                            className={`text-sm font-semibold ${
                              sub.status === "not_submitted" && !isOfflinePending
                                ? "text-zinc-500 dark:text-zinc-400"
                                : "text-zinc-900 dark:text-zinc-100"
                            }`}
                          >
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
                                dispatch({
                                  type: "SET_EDITED_GRADE",
                                  payload: { id: sub.id, grade: e.target.value },
                                });
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
                                dispatch({
                                  type: "SET_EDITED_GRADE",
                                  payload: { id: sub.id, feedback: e.target.value },
                                });
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
                      Save All Entered Grades (
                      {Object.values(editedGrades).filter((x) => x.grade.trim() !== "").length})
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
