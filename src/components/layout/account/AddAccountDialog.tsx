"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginWithElysia } from "@/lib/api";
import { addAccount, MAX_ACCOUNTS, type AppUser } from "@/store/use-app-store";
import { toast } from "sonner";

/** Signs a second account in without disturbing the one already on screen. */
export function AddAccountDialog({
  open,
  onOpenChange,
  currentName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
}) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setIdentifier("");
    setPassword("");
    setShowPassword(false);
    setBusy(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      toast.error("Please enter your Email address or School ID and password.");
      return;
    }

    setBusy(true);
    try {
      const data = await loginWithElysia(identifier.trim(), password.trim());
      const userData = data.user;
      const added = addAccount({
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role as AppUser["role"],
          avatar: userData.avatar,
          tenantId: userData.tenantId,
          tenantSlug: userData.tenantSlug,
          tenantName: userData.tenantName,
          tenantLogo: userData.tenantLogo || null,
          customRole: userData.customRole || null,
        } satisfies AppUser,
        token: data.token,
        refreshToken: data.refreshToken,
      });
      if (!added.ok) {
        toast.error(`This browser already holds ${MAX_ACCOUNTS} accounts. Sign one out first.`);
        setBusy(false);
        return;
      }
      toast.success(`${userData.name} is ready to switch to. You're still signed in as ${currentName}.`);
      reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message || "Could not sign that account in.");
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!busy) onOpenChange(next); }}>
      <DialogContent className="w-[calc(100%-2.5rem)] max-w-md rounded-2xl border bg-card p-4 shadow-xl sm:p-6">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <UserPlus className="size-5" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold text-foreground">Add an account</DialogTitle>
              <DialogDescription className="mt-0.5 text-xs leading-snug">
                You stay signed in as <strong className="text-foreground">{currentName}</strong> until
                you switch.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={submit} className="mt-2 space-y-3.5">
          <div className="space-y-1">
            <Label htmlFor="add-account-identifier" className="text-xs font-semibold text-foreground">
              Email, School ID or mobile number
            </Label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <Mail className="size-4" />
              </div>
              <Input
                id="add-account-identifier"
                type="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@school.com"
                autoComplete="username"
                className="pl-10 h-10 text-xs sm:text-sm bg-muted rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500 placeholder:text-muted-foreground"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="add-account-password" className="text-xs font-semibold text-foreground">
              Password
            </Label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <Lock className="size-4" />
              </div>
              <Input
                id="add-account-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="pl-10 pr-10 h-10 text-xs sm:text-sm bg-muted rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500 placeholder:text-muted-foreground"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <DialogFooter className="mt-4 flex flex-row items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => { reset(); onOpenChange(false); }}
              className="m-0 h-9 flex-1 cursor-pointer rounded-xl text-xs font-semibold sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={busy}
              className="h-9 flex-1 cursor-pointer rounded-xl bg-blue-600 text-xs font-semibold text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 active:scale-[0.99] sm:flex-none"
            >
              {busy ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add account"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
