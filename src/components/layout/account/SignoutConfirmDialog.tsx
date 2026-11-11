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
import { Badge } from "@/components/ui/badge";
import { Loader2, LogOut, UserMinus } from "lucide-react";

export type SignoutMode = "remove" | "logout";

interface SignoutConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: SignoutMode;
  /** The account the action is about. */
  name: string;
  /** How many other accounts this browser still holds. */
  others: number;
  busy: boolean;
  onConfirm: () => void;
}

export function SignoutConfirmDialog({
  open,
  onOpenChange,
  mode,
  name,
  others,
  busy,
  onConfirm,
}: SignoutConfirmDialogProps) {
  const isRemove = mode === "remove";
  const Icon = isRemove ? UserMinus : LogOut;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !busy) onOpenChange(false);
      }}
    >
      <AlertDialogContent className="w-[calc(100%-2.5rem)] max-w-sm rounded-2xl p-4 sm:p-6">
        <AlertDialogHeader className="items-center text-center">
          <span className="mb-1 flex size-11 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            <Icon className="size-5" />
          </span>
          <AlertDialogTitle className="text-base font-bold text-foreground">
            {isRemove ? "Remove this account?" : "Log out?"}
          </AlertDialogTitle>
          <Badge variant="secondary" className="mb-1.5 max-w-full truncate text-[11px] font-semibold">
            {name}
          </Badge>
          <AlertDialogDescription className="text-xs sm:text-sm text-muted-foreground">
            {isRemove ? (
              <>
                Sign <strong className="text-foreground">{name}</strong> out and forget them on this
                browser. Their saved session is revoked on the server, so they would have to sign in
                again to appear here.
              </>
            ) : (
              <>
                Log <strong className="text-foreground">{name}</strong> out of this browser. Their
                session is revoked,{" "}
                {others > 0
                  ? "and you will be switched to another account still held here."
                  : "and you will land on the sign-in page."}
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-3 flex flex-row items-center justify-end gap-2.5">
          <AlertDialogCancel
            disabled={busy}
            className="m-0 h-9 flex-1 cursor-pointer rounded-xl text-xs font-semibold sm:flex-none"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={busy}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            className="h-9 flex-1 cursor-pointer rounded-xl bg-rose-600 text-xs font-semibold text-white hover:bg-rose-700 sm:flex-none"
          >
            {busy ? (
              <>
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                {isRemove ? "Removing..." : "Logging out..."}
              </>
            ) : isRemove ? (
              "Yes, Remove"
            ) : (
              "Yes, Log out"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
