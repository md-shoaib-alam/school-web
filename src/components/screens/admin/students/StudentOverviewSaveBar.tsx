"use client";

import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudentOverviewSaveBarProps {
  editingSection: string;
  saving: boolean;
  onCancel: () => void;
  onSave: (sectionName?: string) => void;
}

export function StudentOverviewSaveBar({
  editingSection,
  saving,
  onCancel,
  onSave,
}: StudentOverviewSaveBarProps) {
  return (
    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 flex items-center justify-between">
      <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
        You have unsaved changes in <span className="font-bold capitalize">{editingSection}</span> section.
      </p>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
          disabled={saving}
          className="text-xs h-8 rounded-xl font-medium"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={() => onSave()}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 rounded-xl font-semibold gap-1.5"
        >
          {saving ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3.5" />}
          Update Student
        </Button>
      </div>
    </div>
  );
}
