"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import {
  ArrowLeftRight,
  Check,
  Crown,
  KeyRound,
  LifeBuoy,
  Loader2,
  LogOut,
  Monitor,
  Moon,
  MoreVertical,
  Plus,
  Settings as SettingsIcon,
  Sun,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { roleColors, roleLabels } from "../nav-config";
import { AddAccountDialog } from "./AddAccountDialog";
import { revokeSession } from "@/lib/api";
import { toast } from "sonner";
import {
  dashboardHref,
  getActiveAccount,
  listAccounts,
  MAX_ACCOUNTS,
  removeAccount as dropVaultAccount,
  setActiveAccount,
  useAppStore,
  type AppUser,
  type StoredAccount,
} from "@/store/use-app-store";

interface AccountMenuProps {
  currentUser: AppUser;
  initials: string;
  onNavigate: (screen: string) => void;
  onPasswordChange: () => void;
}

/** The avatar keeps saying who you are now that the name and role text are gone from the header. */
const roleRings: Record<AppUser["role"], string> = {
  super_admin: "ring-blue-500/25",
  admin: "ring-emerald-500/25",
  teacher: "ring-blue-500/25",
  staff: "ring-orange-500/25",
  student: "ring-violet-500/25",
  parent: "ring-amber-500/25",
};

export function AccountMenu({ currentUser, initials, onNavigate, onPasswordChange }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [accounts, setAccounts] = useState<StoredAccount[]>(() => listAccounts());
  const [dropping, setDropping] = useState<string | null>(null);
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { logout } = useAppStore();

  const activeId = getActiveAccount()?.user.id ?? currentUser.id;
  // What is on screen, for the trigger's glyph; `chosen` is what the reader picked, for the tick.
  const resolved = resolvedTheme || theme || "light";
  const chosen = theme || "light";
  const isAdmin = currentUser.role === "admin";
  const isSuperAdmin = currentUser.role === "super_admin";

  const syncAccounts = (next: boolean) => {
    setOpen(next);
    if (next) setAccounts(listAccounts());
  };

  const switchTo = (account: StoredAccount) => {
    if (account.user.id === activeId) {
      setOpen(false);
      return;
    }
    if (!setActiveAccount(account.user.id)) return;
    // A full reload is what keeps the previous account's cached queries from being read as this one's.
    window.location.href = dashboardHref(account.user);
  };

  const signOut = () => {
    window.location.href = logout() ?? "/";
  };

  /** Forgets an account you are not using: revoke its session server-side, then drop the entry. */
  const dropAccount = async (account: StoredAccount) => {
    setDropping(account.user.id);
    await revokeSession(account.token, account.refreshToken);
    dropVaultAccount(account.user.id);
    setAccounts(listAccounts());
    setDropping(null);
    toast.success(`${account.user.name} is no longer signed in on this browser.`);
  };

  const renderAccountRow = (account: StoredAccount, isActive: boolean) => (
    <DropdownMenuItem
      key={account.user.id}
      className="gap-2.5 rounded-lg py-2"
      onSelect={() => switchTo(account)}
    >
      <Avatar className="size-7">
        <AvatarImage src={account.user.avatar} alt={account.user.name} className="object-cover" />
        <AvatarFallback className={cn("text-[10px] font-bold text-white", roleColors[account.user.role])}>
          {account.user.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-xs font-semibold">{account.user.name}</span>
        <span className="truncate text-[11px] text-muted-foreground">
          {account.user.tenantName || roleLabels[account.user.role]}
        </span>
      </span>
      {isActive ? (
        <Check className="ml-auto size-4 text-blue-600 dark:text-blue-400" />
      ) : (
        <span
          role="button"
          tabIndex={-1}
          aria-label={`Remove ${account.user.name} from this browser`}
          title={`Remove ${account.user.name} from this browser`}
          className="ml-auto -mr-1 flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
          onClick={(event) => {
            // Without this the row's own select fires first and switches to the account instead.
            event.preventDefault();
            event.stopPropagation();
            if (dropping !== account.user.id) void dropAccount(account);
          }}
        >
          {dropping === account.user.id ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <MoreVertical className="size-4" />
          )}
        </span>
      )}
    </DropdownMenuItem>
  );

  return (
    <>
      <DropdownMenu open={open} onOpenChange={syncAccounts}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            aria-label={`Account menu, ${currentUser.name}`}
            className="size-9 sm:size-11 p-0 rounded-full bg-transparent hover:bg-transparent focus-visible:ring-0 shrink-0 flex items-center justify-center cursor-pointer group"
          >
            <Avatar
              className={cn(
                "size-8 sm:size-9 cursor-pointer shadow-xs ring-2 transition-transform group-hover:scale-105",
                roleRings[currentUser.role],
              )}
            >
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} className="object-cover" />
              <AvatarFallback
                className={cn("text-white text-[11px] sm:text-xs font-bold", roleColors[currentUser.role])}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="mt-2 w-72 rounded-2xl border-0 bg-transparent p-0 shadow-none">
          {/* The card: who is signed in, then the account's entries. */}
          <div className="rounded-2xl border bg-popover p-1.5 shadow-xl shadow-black/10">
            <div className="mb-1 flex items-center gap-2.5 rounded-xl bg-muted p-2.5">
              <Avatar className="size-9 ring-2 ring-white dark:ring-border shadow-xs">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} className="object-cover" />
                <AvatarFallback className={cn("text-xs font-bold text-white", roleColors[currentUser.role])}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col space-y-0.5">
                <p className="truncate text-sm font-semibold text-foreground">{currentUser.name}</p>
                <p className="truncate text-xs text-muted-foreground">{currentUser.email}</p>
              </div>
            </div>

            <DropdownMenuItem className="gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium" onSelect={() => onNavigate("profile")}>
              <User className="size-4 text-blue-500" />
              My Profile
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium">
                {resolved === "dark" ? <Moon className="size-4 text-blue-400" /> : <Sun className="size-4 text-amber-500" />}
                Appearance
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-44">
                {([
                  { value: "light", label: "Light", icon: Sun },
                  { value: "dark", label: "Dark", icon: Moon },
                  { value: "system", label: "System", icon: Monitor },
                ] as const).map(({ value, label, icon: Icon }) => (
                  <DropdownMenuItem
                    key={value}
                    className="gap-2 text-xs"
                    onSelect={(event) => {
                      // Keep the menu open so the flip is visible, the way the reference does it.
                      event.preventDefault();
                      setTheme(value);
                    }}
                  >
                    <Icon className="size-4" />
                    {label}
                    {chosen === value && <Check className="ml-auto size-4 text-blue-600 dark:text-blue-400" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuItem className="gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium" onSelect={onPasswordChange}>
              <KeyRound className="size-4 text-orange-500" />
              Change Password
            </DropdownMenuItem>

            {(isAdmin || isSuperAdmin) && (
              <>
                <DropdownMenuSeparator className="my-1" />
                {isAdmin && (
                  <DropdownMenuItem className="gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium" onSelect={() => onNavigate("school-subscription")}>
                    <Crown className="size-4 text-amber-500" />
                    My Subscription
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium" onSelect={() => onNavigate(isSuperAdmin ? "settings" : "school-settings")}>
                  <SettingsIcon className="size-4 text-blue-500" />
                  {isSuperAdmin ? "Platform Settings" : "School Settings"}
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem className="gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium" onSelect={() => onNavigate(isSuperAdmin ? "settings" : "tickets")}>
              <LifeBuoy className="size-4 text-emerald-500" />
              Help &amp; Support
            </DropdownMenuItem>
          </div>

          {/* The ledge: the two actions that leave or change the account you are on. */}
          <div className="mt-1 rounded-2xl border bg-popover p-1.5 shadow-lg shadow-black/5">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium">
                <ArrowLeftRight className="size-4 text-blue-600 dark:text-blue-400" />
                Switch account
                <span className="ml-auto text-[10px] font-semibold text-muted-foreground">
                  {accounts.length}/{MAX_ACCOUNTS}
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-64">
                {accounts.map((account) => renderAccountRow(account, account.user.id === activeId))}
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  className="gap-2 rounded-lg text-xs font-medium"
                  onSelect={() => {
                    setOpen(false);
                    setAddOpen(true);
                  }}
                >
                  <Plus className="size-4 text-blue-600 dark:text-blue-400" />
                  Add account
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuItem
              className="gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
              onSelect={signOut}
            >
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>

          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddAccountDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        currentName={currentUser.name}
      />
    </>
  );
}
