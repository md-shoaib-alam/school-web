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

interface UserStatusConfirmDialogProps {
  confirmStatusDialogOpen: boolean;
  setConfirmStatusDialogOpen: (open: boolean) => void;
  isActive: boolean;
  name: string;
  toggling: boolean;
  onConfirmToggle: () => Promise<void>;
}

export function UserStatusConfirmDialog({
  confirmStatusDialogOpen,
  setConfirmStatusDialogOpen,
  isActive,
  name,
  toggling,
  onConfirmToggle,
}: UserStatusConfirmDialogProps) {
  return (
    <AlertDialog
      open={confirmStatusDialogOpen}
      onOpenChange={(open) => {
        if (!open && !toggling) {
          setConfirmStatusDialogOpen(false);
        }
      }}
    >
      <AlertDialogContent className="rounded-2xl w-[calc(100%-2.5rem)] max-w-sm p-4 sm:p-6">
        <AlertDialogHeader className="text-center sm:text-left">
          <AlertDialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
            {isActive ? "Deactivate Account?" : "Activate Account?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isActive ? (
              <>
                Deactivate <strong className="text-slate-800 dark:text-slate-200">{name || "this user"}</strong>? They will be suspended from logging into the platform.
              </>
            ) : (
              <>
                Activate <strong className="text-slate-800 dark:text-slate-200">{name || "this user"}</strong>? They will be able to log in and access the platform.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-3 flex flex-row items-center justify-end gap-2.5">
          <AlertDialogCancel
            disabled={toggling}
            onClick={() => setConfirmStatusDialogOpen(false)}
            className="flex-1 sm:flex-none h-9 rounded-xl text-xs font-semibold cursor-pointer m-0"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={toggling}
            onClick={async (e) => {
              e.preventDefault();
              await onConfirmToggle();
            }}
            className={`flex-1 sm:flex-none h-9 rounded-xl text-xs font-semibold text-white cursor-pointer ${
              isActive
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {toggling ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                Updating...
              </>
            ) : isActive ? (
              "Yes, Deactivate"
            ) : (
              "Yes, Activate"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
