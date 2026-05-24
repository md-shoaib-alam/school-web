import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Info, Layers } from "lucide-react";

interface ClassSettingsCardProps {
  enableGradeSelection: boolean;
  onToggleGradeSelection: (checked: boolean) => void;
}

export function ClassSettingsCard({
  enableGradeSelection,
  onToggleGradeSelection,
}: ClassSettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-lg">
            🏫
          </div>
          <div>
            <CardTitle className="text-lg">Class Creation Mode</CardTitle>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Choose whether to prompt for a separate Grade value when creating classes
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Switch settings & info */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-lg border border-zinc-150 dark:border-zinc-800/60 w-full">
              <div className="space-y-0.5 pr-4">
                <Label htmlFor="enableGradeSelection" className="text-sm font-semibold cursor-pointer text-zinc-800 dark:text-zinc-200">
                  Separate Grade Selection
                </Label>
                <p className="text-xs text-muted-foreground">
                  Show and select a separate Grade value instead of auto-mapping from Class Name.
                </p>
              </div>
              <Switch
                id="enableGradeSelection"
                checked={enableGradeSelection}
                onCheckedChange={onToggleGradeSelection}
              />
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800 text-xs text-muted-foreground flex gap-2">
              <Info className="size-4 text-emerald-500 shrink-0" />
              <span>
                Disabling this will simplify class creation by automatically mapping grades (e.g. LKG ➔ LKG, Class 1 ➔ Grade 1).
              </span>
            </div>
          </div>

          {/* Right Column: Visual Form Demo */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start pl-0 lg:pl-6 border-t lg:border-t-0 lg:border-l border-zinc-100 dark:border-zinc-800 pt-6 lg:pt-0">
            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2.5 flex items-center gap-1.5 select-none">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
              </span>
              Form Layout Demonstration
            </div>
            
            <div className="w-full max-w-[280px] bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/60 rounded-xl p-4 space-y-3.5 shadow-sm relative overflow-hidden select-none">
              {/* Form Header Mock */}
              <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/60 pb-2">
                <div className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">Add Class Form</div>
                <Layers className="size-3.5 text-zinc-400" />
              </div>

              {/* Class Name field */}
              <div className="space-y-1">
                <div className="text-[10px] font-semibold text-zinc-500">Class Name</div>
                <div className="h-7 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center px-2 text-[11px] text-zinc-700 dark:text-zinc-300 shadow-sm">
                  Class 1
                </div>
              </div>

              {/* Grade field (conditional transition) */}
              <div className={`space-y-1 transition-all duration-500 ease-in-out ${
                enableGradeSelection ? "opacity-100 max-h-16" : "opacity-0 max-h-0 overflow-hidden pointer-events-none"
              }`}>
                <div className="text-[10px] font-semibold text-zinc-500 flex items-center justify-between">
                  <span>Grade</span>
                  <span className="text-[9px] font-normal text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1 rounded">Required</span>
                </div>
                <div className="h-7 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center px-2 text-[11px] text-zinc-700 dark:text-zinc-300 shadow-sm border-dashed">
                  1
                </div>
              </div>

              {/* Auto Mapping Notification Badge */}
              <div className={`transition-all duration-500 ease-in-out ${
                !enableGradeSelection ? "opacity-100 max-h-16" : "opacity-0 max-h-0 overflow-hidden pointer-events-none"
              }`}>
                <div className="flex items-center gap-1.5 p-2 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-150 dark:border-emerald-900/30 rounded text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                  <span>⚡ Auto-maps:</span>
                  <span className="bg-emerald-100/60 dark:bg-emerald-900/40 px-1 py-0.5 rounded font-bold">Grade = 1</span>
                </div>
              </div>

              {/* Button Action mock */}
              <div className="h-7 rounded bg-emerald-600 dark:bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm mt-1">
                Add Class
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
