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
      <Button variant="ghost" size="icon" className="h-10 w-10 md:h-9 md:w-9">
        <Sun className="h-[22px] w-[22px] md:h-[18px] md:w-[18px]" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 md:h-9 md:w-9 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {theme === "dark" ? (
            <Moon className="h-[28px] w-[28px] md:h-[22px] md:w-[22px] text-blue-400" />
          ) : (
            <Sun className="h-[28px] w-[28px] md:h-[22px] md:w-[22px] text-amber-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem
          className={cn(
            "gap-2 cursor-pointer",
            theme === "light" && "bg-accent",
          )}
          onClick={() => setTheme("light")}
        >
          <Sun className="h-4 w-4" />
          Light
          {theme === "light" && <Check className="h-3.5 w-3.5 ml-auto" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(
            "gap-2 cursor-pointer",
            theme === "dark" && "bg-accent",
          )}
          onClick={() => setTheme("dark")}
        >
          <Moon className="h-4 w-4" />
          Dark
          {theme === "dark" && <Check className="h-3.5 w-3.5 ml-auto" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
