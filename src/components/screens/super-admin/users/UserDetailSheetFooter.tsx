import { Button } from "@/components/ui/button";
import { Check, Edit2, Loader2 } from "lucide-react";

interface UserDetailSheetFooterProps {
  isEditing: boolean;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
}

export function UserDetailSheetFooter({
  isEditing,
  isSaving,
  onOpenChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
}: UserDetailSheetFooterProps) {
  return (
    <div className="p-4 px-6 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-3 bg-white dark:bg-zinc-950 shrink-0">
      {!isEditing ? (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10 px-6 rounded-xl border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 text-slate-700 dark:text-zinc-300 font-semibold text-xs sm:text-sm shadow-2xs cursor-pointer"
          >
            Close
          </Button>

          <Button
            type="button"
            onClick={onStartEdit}
            className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Edit2 className="size-3.5" />
            <span>Edit User</span>
          </Button>
        </>
      ) : (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onCancelEdit}
            disabled={isSaving}
            className="h-10 px-6 rounded-xl border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 text-slate-700 dark:text-zinc-300 font-semibold text-xs sm:text-sm shadow-2xs cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={onSaveEdit}
            disabled={isSaving}
            className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xs cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="size-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
}
