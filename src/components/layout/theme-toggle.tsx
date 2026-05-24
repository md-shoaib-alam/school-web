"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  if (!mounted) {
    return (
      <Button type="button" variant="ghost" size="icon" className="size-10 md:size-9">
        <Sun className="size-[22px] md:size-[18px]" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all cursor-pointer"
        >
          {theme === "dark" ? (
            <Moon className="size-5 text-blue-400" />
          ) : (
            <Sun className="size-5 text-amber-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem
          className="gap-2 cursor-pointer"
          onClick={() => setTheme("light")}
        >
          <Sun className="size-4" />
          Light
          {theme === "light" && <Check className="size-3.5 ml-auto" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2 cursor-pointer"
          onClick={() => setTheme("dark")}
        >
          <Moon className="size-4" />
          Dark
          {theme === "dark" && <Check className="size-3.5 ml-auto" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
