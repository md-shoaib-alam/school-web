"use client";

import { Users, Pencil, ChevronUp, ChevronDown, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TeacherInfo } from "./types";

interface ClassesCardProps {
  currentTeacher: TeacherInfo;
  formData: any;
  setFormData: (data: any) => void;
  canEdit?: boolean;
  isEditing: boolean;
  isSaving: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
}

export function TeacherClassesCard({
  currentTeacher,
  formData,
  setFormData,
  canEdit,
  isEditing,
  isSaving,
  isCollapsed,
  onToggleCollapse,
  onStartEdit,
  onCancelEdit,
  onSave,
}: ClassesCardProps) {
  return (
    <div className="rounded-2xl border  bg-card p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
      <div className="flex items-center justify-between pb-3.5 border-b ">
        <div className="flex items-center gap-2 text-foreground font-semibold text-sm sm:text-base">
          <Users className="size-4 text-emerald-600" />
          Classes Taught ({currentTeacher.classes?.length || 0})
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onCancelEdit}
                disabled={isSaving}
                className="h-8 px-3 text-xs rounded-lg font-medium text-foreground  hover:bg-accent"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={onSave}
                disabled={isSaving}
                className="h-8 px-3 text-xs rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
              >
                {isSaving ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3.5" />}
                Save
              </Button>
            </div>
          ) : (
            canEdit && (
              <button
                onClick={onStartEdit}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border  text-xs font-medium text-foreground hover:bg-accent transition-colors"
              >
                <Pencil className="size-3" />
                Edit
              </button>
            )
          )}

          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground dark:hover:text-muted-foreground transition-colors"
            aria-label="Toggle section"
          >
            {isCollapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        isEditing ? (
          /* EDIT CLASSES */
          <div className="space-y-3 pt-1">
            <div className="flex gap-2">
              <Input
                value={formData.newClassInput}
                onChange={(e) => setFormData({ ...formData, newClassInput: e.target.value })}
                placeholder="Add class (e.g. Grade 1-B)"
                className="h-9 text-xs rounded-xl bg-muted "
                onKeyDown={(e) => {
                  if (e.key === "Enter" && formData.newClassInput.trim()) {
                    e.preventDefault();
                    setFormData({
                      ...formData,
                      classes: [...formData.classes, formData.newClassInput.trim()],
                      newClassInput: "",
                    });
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (formData.newClassInput.trim()) {
                    setFormData({
                      ...formData,
                      classes: [...formData.classes, formData.newClassInput.trim()],
                      newClassInput: "",
                    });
                  }
                }}
                className="h-9 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
              >
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {formData.classes.map((cls: string, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60"
                >
                  {cls}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        classes: formData.classes.filter((_: any, i: number) => i !== idx),
                      });
                    }}
                    className="hover:text-red-500 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        ) : (
          /* VIEW CLASSES */
          !currentTeacher.classes || currentTeacher.classes.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No classes assigned yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {currentTeacher.classes.map((cls, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60"
                >
                  {cls}
                </span>
              ))}
            </div>
          )
        )
      )}
    </div>
  );
}
