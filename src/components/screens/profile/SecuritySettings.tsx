"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sun, Moon, Laptop, Lock, KeyRound } from "lucide-react";

interface SecuritySettingsProps {
  theme: string | undefined;
  setTheme: (theme: string) => void;
  onPasswordChange: () => void;
}

export function SecuritySettings({ theme, setTheme, onPasswordChange }: SecuritySettingsProps) {
  return (
    <Card className="border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Preferences & Security</CardTitle>
        <CardDescription>Customize your workspace themes and lock down credentials.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold">Workspace Appearance Mode</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Select a premium color scheme tailored for maximum comfort.</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              onClick={() => setTheme("light")}
              className="h-20 flex flex-col gap-2 rounded-xl justify-center items-center font-bold"
            >
              <Sun className="size-5 text-amber-500" />
              <span className="text-xs">Light Theme</span>
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
              className="h-20 flex flex-col gap-2 rounded-xl justify-center items-center font-bold"
            >
              <Moon className="size-5 text-blue-400" />
              <span className="text-xs">Dark Theme</span>
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              onClick={() => setTheme("system")}
              className="h-20 flex flex-col gap-2 rounded-xl justify-center items-center font-bold"
            >
              <Laptop className="size-5 text-zinc-500" />
              <span className="text-xs">System Default</span>
            </Button>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Lock className="size-4 text-orange-500" />
              <h4 className="text-sm font-semibold">Account Access Code</h4>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Secure password used to authenticate your login sessions. Update regularly to prevent breach.
            </p>
          </div>
          <Button
            onClick={onPasswordChange}
            className="bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl flex items-center gap-2"
          >
            <KeyRound className="size-4" /> Change Password
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
