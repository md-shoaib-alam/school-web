"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
] as const;

/**
 * Shows the choice, not just the result: with System selected the icon stays a monitor, the way
 * the profile page marks System Default, instead of looking stuck on Light.
 */
export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  const chosen = mounted ? theme || "light" : "light";
  const resolved = resolvedTheme || chosen;
  const active = OPTIONS.find((option) => option.value === chosen) ?? OPTIONS[0];
  const label = !mounted
    ? "Theme"
    : chosen === "system"
      ? `Theme: System (currently ${resolved})`
      : `Theme: ${active.label}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          title={label}
          aria-label={label}
          className="size-8.5 sm:size-9 shrink-0 rounded-xl border bg-card/80 text-foreground hover:bg-muted shadow-2xs cursor-pointer"
        >
          <active.Icon
            className={cn(
              "size-4",
              chosen === "dark"
                ? "text-blue-400"
                : chosen === "system"
                  ? "text-muted-foreground"
                  : "text-amber-500",
            )}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className="gap-2 text-xs"
            onClick={() => setTheme(option.value)}
          >
            <option.Icon className="size-4" />
            {option.label}
            {chosen === option.value && <Check className="ml-auto size-4 text-blue-600 dark:text-blue-400" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
