"use client";

import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
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
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setIdentifier("");
    setPassword("");
    setBusy(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!identifier.trim() || !password) {
      toast.error("Enter your email (or School ID / phone) and password.");
      return;
    }

    setBusy(true);
    try {
      const data = await loginWithElysia(identifier.trim(), password);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <UserPlus className="size-4 text-blue-600 dark:text-blue-400" />
            Add an account
          </DialogTitle>
          <DialogDescription className="text-xs">
            Up to {MAX_ACCOUNTS} accounts can be signed in here at once. Adding one keeps
            {" "}{currentName} active until you switch.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="add-account-identifier" className="text-xs">
              Email, School ID or mobile number
            </Label>
            <Input
              id="add-account-identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="you@school.com"
              autoComplete="username"
              className="h-10 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-account-password" className="text-xs">
              Password
            </Label>
            <Input
              id="add-account-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="h-10 text-sm"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => { reset(); onOpenChange(false); }}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={busy} className="min-w-28">
              {busy ? <Loader2 className="size-4 animate-spin" /> : "Add account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
