import { Check, MoreVertical, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { roleColors, roleLabels } from "../nav-config";
import { MAX_ACCOUNTS, type StoredAccount } from "@/store/use-app-store";

export type SubmenuKind = "appearance" | "accounts";

interface AccountSubmenuSheetProps {
  kind: SubmenuKind | null;
  onClose: () => void;
  appearanceOptions: readonly { value: string; label: string; Icon: any }[];
  chosenTheme: string;
  onSelectTheme: (value: string) => void;
  accounts: StoredAccount[];
  activeId: string;
  onPickAccount: (account: StoredAccount) => void;
  onAskRemove: (account: StoredAccount) => void;
  onAddAccount: () => void;
}

const rowClass =
  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left text-xs font-medium text-foreground hover:bg-accent transition-colors cursor-pointer";

/**
 * Phones have no room for a submenu beside the menu, so the same two lists open as their own
 * panel instead of expanding the menu into a long scroll.
 */
export function AccountSubmenuSheet({
  kind,
  onClose,
  appearanceOptions,
  chosenTheme,
  onSelectTheme,
  accounts,
  activeId,
  onPickAccount,
  onAskRemove,
  onAddAccount,
}: AccountSubmenuSheetProps) {
  const isAccounts = kind === "accounts";

  return (
    <Dialog open={kind !== null} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-2xl border bg-card p-2 shadow-xl">
        <DialogHeader className="px-1.5 pt-1.5 pb-1">
          <DialogTitle className="text-sm font-bold text-foreground">
            {isAccounts ? "Switch account" : "Appearance"}
          </DialogTitle>
          <DialogDescription className="text-[11px]">
            {isAccounts
              ? `${accounts.length} of ${MAX_ACCOUNTS} accounts signed in on this browser.`
              : "Choose how the workspace looks."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-0.5">
          {isAccounts
            ? accounts.map((account) => {
                const isActive = account.user.id === activeId;
                return (
                  <div key={account.user.id} className={cn(rowClass, isActive && "bg-accent/60")}>
                    <button type="button" className="flex min-w-0 flex-1 items-center gap-2.5 text-left" onClick={() => onPickAccount(account)}>
                      <Avatar className="size-7 shrink-0">
                        <AvatarImage src={account.user.avatar} alt={account.user.name} className="object-cover" />
                        <AvatarFallback className={cn("text-[10px] font-bold text-white", roleColors[account.user.role])}>
                          {account.user.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-xs font-semibold">{account.user.name}</span>
                        <span className="truncate text-[11px] font-normal text-muted-foreground">
                          {account.user.tenantName || roleLabels[account.user.role]}
                        </span>
                      </span>
                    </button>
                    {isActive ? (
                      <Check className="ml-auto size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <button
                        type="button"
                        aria-label={`Remove ${account.user.name} from this browser`}
                        onClick={() => onAskRemove(account)}
                        className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                    )}
                  </div>
                );
              })
            : appearanceOptions.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onSelectTheme(value)}
                  className={cn(rowClass, chosenTheme === value && "bg-accent/60")}
                >
                  <Icon className="size-4" />
                  {label}
                  {chosenTheme === value && <Check className="ml-auto size-4 text-blue-600 dark:text-blue-400" />}
                </button>
              ))}

          {isAccounts && (
            <button type="button" onClick={onAddAccount} className={cn(rowClass, "mt-1 border-t pt-2")}>
              <Plus className="size-4 text-blue-600 dark:text-blue-400" />
              Add account
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
