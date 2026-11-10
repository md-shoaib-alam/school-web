import React from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings, Check } from "lucide-react";

interface StatusToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function StatusToggle({ enabled, onToggle }: StatusToggleProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-card  h-10 px-4 rounded-xl flex items-center gap-3 hover:bg-accent transition-colors shadow-sm"
        >
          <span className="text-sm font-normal text-foreground">
            {enabled ? "Enabled" : "Disabled"}
          </span>
          <Settings className="size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px] rounded-xl p-1.5 ">
        <DropdownMenuItem 
          onClick={() => onToggle(true)}
          className="flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer focus:bg-muted dark:focus:bg-zinc-800"
        >
          <span className="font-normal text-sm">Enabled</span>
          {enabled && <Check className="size-4 text-emerald-500" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onToggle(false)}
          className="flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer focus:bg-muted dark:focus:bg-zinc-800"
        >
          <span className="font-normal text-sm">Disabled</span>
          {!enabled && <Check className="size-4 text-emerald-500" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
