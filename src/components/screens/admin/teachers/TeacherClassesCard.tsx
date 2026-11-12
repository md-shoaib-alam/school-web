"use client";

import { Users } from "lucide-react";
import { ProfileSection } from "@/components/ui/profile-section";
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
  dimmed?: boolean;
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
  dimmed,
  onToggleCollapse,
  onStartEdit,
  onCancelEdit,
  onSave,
}: ClassesCardProps) {
  return (
    <ProfileSection
      icon={Users}
      title={`Classes Taught (${currentTeacher.classes?.length || 0})`}
      editing={isEditing}
      collapsed={isCollapsed}
      saving={isSaving}
      canEdit={canEdit}
      dimmed={dimmed}
      onEdit={onStartEdit}
      onCancel={onCancelEdit}
      onSave={onSave}
      onToggleCollapse={onToggleCollapse}
      form={
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

          <div data-travel="classes" className="flex flex-wrap gap-2 pt-1">
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
      }
      view={
        !currentTeacher.classes || currentTeacher.classes.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No classes assigned yet.</p>
        ) : (
          <div data-travel="classes" className="flex flex-wrap gap-2">
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
      }
    />
  );
}
