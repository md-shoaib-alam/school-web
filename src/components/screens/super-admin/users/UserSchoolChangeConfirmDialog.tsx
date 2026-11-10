import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import type { PendingSchoolChange } from "./user-detail-sheet-model";
import type { TenantInfo } from "./types";

interface UserSchoolChangeConfirmDialogProps {
  pendingSchoolChange: PendingSchoolChange | null;
  setPendingSchoolChange: (value: PendingSchoolChange | null) => void;
  name: string;
  tenant: TenantInfo | null;
  isSaving: boolean;
  onConfirmSchoolChange: (newTenantId: string | null) => void;
}

export function UserSchoolChangeConfirmDialog({
  pendingSchoolChange,
  setPendingSchoolChange,
  name,
  tenant,
  isSaving,
  onConfirmSchoolChange,
}: UserSchoolChangeConfirmDialogProps) {
  return (
    <AlertDialog
      open={!!pendingSchoolChange}
      onOpenChange={(open) => {
        if (!open && !isSaving) {
          setPendingSchoolChange(null);
        }
      }}
    >
      <AlertDialogContent className="rounded-2xl w-[calc(100%-2.5rem)] max-w-sm p-4 sm:p-6">
        <AlertDialogHeader className="text-center sm:text-left">
          <AlertDialogTitle className="text-base font-bold text-foreground">
            {!pendingSchoolChange?.tenantId ? "Deassign School?" : "Assign School?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs sm:text-sm text-muted-foreground">
            {!pendingSchoolChange?.tenantId ? (
              <>
                Remove <strong className="text-foreground">{name || "user"}</strong> from <strong className="text-foreground">{tenant?.name || "school"}</strong>?
              </>
            ) : (
              <>
                Assign <strong className="text-foreground">{name || "user"}</strong> to <strong className="text-foreground">{pendingSchoolChange?.schoolName}</strong>?
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-3 flex flex-row items-center justify-end gap-2.5">
          <AlertDialogCancel
            disabled={isSaving}
            onClick={() => setPendingSchoolChange(null)}
            className="flex-1 sm:flex-none h-9 rounded-xl text-xs font-semibold cursor-pointer m-0"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isSaving}
            onClick={(e) => {
              e.preventDefault();
              if (pendingSchoolChange) {
                onConfirmSchoolChange(pendingSchoolChange.tenantId);
              }
            }}
            className={`flex-1 sm:flex-none h-9 rounded-xl text-xs font-semibold text-white cursor-pointer ${
              !pendingSchoolChange?.tenantId
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                Updating...
              </>
            ) : !pendingSchoolChange?.tenantId ? (
              "Yes, Deassign"
            ) : (
              "Yes, Confirm"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
