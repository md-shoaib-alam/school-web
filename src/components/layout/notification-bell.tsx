"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotificationBell() {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8.5 sm:size-9 shrink-0 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100/80 dark:hover:bg-zinc-800 shadow-2xs transition-all cursor-pointer relative"
      onClick={() => {
        console.log("Bell icon clicked");
      }}
    >
      <Bell className="size-4" />
      <span className="absolute top-2 right-2 size-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-zinc-900" />
    </Button>
  );
}

