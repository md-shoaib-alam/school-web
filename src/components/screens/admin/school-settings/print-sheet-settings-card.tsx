import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Info } from "lucide-react";
import { PrintSheetModePreview } from "./print-sheet-preview";

interface PrintSheetSettingsCardProps {
  enableModalTabulationPreview: boolean;
  onToggleTabulationPreview: (checked: boolean) => void;
}

export function PrintSheetSettingsCard({
  enableModalTabulationPreview,
  onToggleTabulationPreview,
}: PrintSheetSettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-lg">
            📊
          </div>
          <div>
            <CardTitle className="text-lg">Print Sheet Preference</CardTitle>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Configure the default preview and printing mode for class academic print sheets
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column (7 cols): Switch settings & info */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-lg border border-zinc-150 dark:border-zinc-800/60 w-full">
              <div className="space-y-0.5 pr-4">
                <Label htmlFor="enableModalTabulationPreview" className="text-sm font-semibold cursor-pointer text-zinc-800 dark:text-zinc-200">
                  Print Sheet
                </Label>
                <p className="text-xs text-muted-foreground">
                  Open print sheets in a popover dialog modal instead of a new browser tab.
                </p>
              </div>
              <Switch
                id="enableModalTabulationPreview"
                checked={enableModalTabulationPreview}
                onCheckedChange={onToggleTabulationPreview}
              />
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800 text-xs text-muted-foreground flex gap-2">
              <Info className="size-4 text-emerald-500 shrink-0" />
              <span>Changing this default will format how administrators and teachers preview finalized results sheets.</span>
            </div>
          </div>

          {/* Right Column (5 cols): Example preview animation */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start pl-0 lg:pl-6 border-t lg:border-t-0 lg:border-l border-zinc-100 dark:border-zinc-800 pt-6 lg:pt-0">
            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2.5 flex items-center gap-1.5 select-none">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
              </span>
              Interactive Preview Demonstration
            </div>
            <PrintSheetModePreview isEnabled={enableModalTabulationPreview} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
