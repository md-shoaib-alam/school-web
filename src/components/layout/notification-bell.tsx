"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotificationBell() {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-9 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      onClick={() => {
        console.log("Bell icon clicked");
      }}
    >
      <Bell className="size-4.5" />
    </Button>
  );
}

