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
    <div className="p-4 px-6 border-t  flex items-center justify-end gap-3 bg-card shrink-0">
      {!isEditing ? (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10 px-6 rounded-xl  bg-card hover:bg-muted text-foreground font-semibold text-xs sm:text-sm shadow-2xs cursor-pointer"
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
            className="h-10 px-6 rounded-xl  bg-card hover:bg-muted text-foreground font-semibold text-xs sm:text-sm shadow-2xs cursor-pointer"
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
