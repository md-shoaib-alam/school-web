"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotificationBell() {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="relative size-10 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl transition-all duration-200 cursor-pointer"
      onClick={() => {
        console.log("Bell icon clicked");
      }}
    >
      <Bell className="size-6 md:size-5 text-zinc-500 transition-colors" />
    </Button>
  );
}

