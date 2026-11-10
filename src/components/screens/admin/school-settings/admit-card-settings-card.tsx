import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusToggle } from "./status-toggle";
import { IdCard } from "lucide-react";

interface AdmitCardSettingsCardProps {
  enableModalAdmitCardPreview: boolean;
  onToggleAdmitCardPreview: (checked: boolean) => void;
}

export function AdmitCardSettingsCard({
  enableModalAdmitCardPreview,
  onToggleAdmitCardPreview,
}: AdmitCardSettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <IdCard className="size-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Admit Card Preference</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted rounded-xl border  w-full gap-4">
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-foreground">
                  Admit Card Preview Mode
                </h4>
                <p className="text-xs text-muted-foreground">
                  Open admit card previews in a popup modal
                </p>
              </div>
              
              <StatusToggle 
                enabled={enableModalAdmitCardPreview} 
                onToggle={onToggleAdmitCardPreview} 
              />
            </div>
          </div>

          {/* Right Column: Previews - Desktop Only */}
          <div className="hidden lg:block lg:col-span-5 pl-6 border-l ">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5 flex items-center gap-1.5 select-none">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-amber-500"></span>
              </span>
              Interactive Preview Demonstration
            </div>
            
            <div className="relative w-full max-w-[340px] h-[185px] bg-card border  rounded-xl overflow-hidden shadow-xl select-none mx-auto lg:mx-0 flex flex-col transition-all duration-300">
              <div className="h-8  border-b  px-2.5 flex items-end gap-1.5 shrink-0 justify-between">
                <div className="flex items-center gap-1 mb-2">
                  <span className="size-2 rounded-full bg-red-500/50" />
                  <span className="size-2 rounded-full bg-yellow-500/50" />
                  <span className="size-2 rounded-full bg-green-500/50" />
                </div>
                <div className="flex-1 flex gap-1 items-end max-w-[190px] h-6 overflow-hidden">
                  <div className={`h-5 px-2 rounded-t-md text-[8px] font-medium flex items-center gap-1 shrink-0 transition-colors ${
                    enableModalAdmitCardPreview ? "bg-card text-amber-650 dark:text-amber-400 border-t border-x " : "bg-muted text-muted-foreground"
                  }`}>
                    Admin Portal
                  </div>
                  {!enableModalAdmitCardPreview && (
                    <div className="h-5 px-2 rounded-t-md bg-card text-amber-650 dark:text-amber-400 border-t border-x  text-[8px] font-semibold flex items-center gap-1 animate-in slide-in-from-bottom-2 shrink-0">
                      Preview Tab
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 mb-1.5 shrink-0">
                  <span className="text-[7.5px] text-foreground font-semibold bg-muted border  px-1 py-0.5 rounded leading-none">
                    {enableModalAdmitCardPreview ? "Inline" : "Separate"}
                  </span>
                </div>
              </div>

              <div className="flex-1 bg-muted p-3 relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-1.5 opacity-60">
                  <div className="flex justify-between items-center">
                    <div className="h-2 w-14 bg-muted rounded-sm" />
                    <div className="h-2.5 w-8 bg-amber-500/10 border border-amber-500/20 rounded-sm" />
                  </div>
                  <div className="h-1.5 w-full bg-muted dark:/55 rounded-sm" />
                  <div className="h-1.5 w-full bg-muted rounded-sm" />
                </div>

                {enableModalAdmitCardPreview ? (
                  <div className="absolute inset-0 bg-zinc-950/65 dark:bg-black/65 backdrop-blur-[0.5px] flex flex-col items-center justify-center p-2.5 transition-all duration-300 z-30 animate-in fade-in">
                    <div className="w-[190px] h-[105px] bg-card border  rounded-lg shadow-2xl flex flex-col p-2 justify-between mt-2.5 animate-in zoom-in-95">
                      <div className="flex items-center justify-between border-b  pb-1 mb-1">
                        <span className="text-[7px] font-bold text-foreground">Admit Card popover</span>
                        <span className="text-[7px] text-muted-foreground">✕</span>
                      </div>
                      <div className="flex-1 bg-amber-50 dark:bg-amber-500/5 rounded border border-amber-100 dark:border-amber-500/20 p-1 flex flex-col items-center justify-center gap-1">
                        <span className="text-[5px]  font-semibold">Exam Admit Cards</span>
                      </div>
                      <div className="flex justify-between items-center text-[5px]  mt-1">
                        <span>Close dialog</span>
                        <span className="bg-amber-600 px-1 py-0.5 rounded text-white font-bold leading-none">Print</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-3 transition-all duration-300 z-30 pointer-events-none animate-in fade-in">
                    <div className="w-[185px] h-[105px] bg-card border border-amber-200 dark:border-amber-500/40 rounded-lg shadow-[0_4px_20px_rgba(245,158,11,0.12)] flex flex-col absolute right-2 bottom-1 z-20 animate-in slide-in-from-bottom-4 slide-in-from-right-4">
                      <div className="h-4.5 bg-muted border-b  px-1.5 flex items-center gap-1 justify-between">
                        <div className="flex items-center gap-0.5">
                          <span className="size-1 rounded-full bg-red-500/60" />
                          <span className="size-1 rounded-full bg-amber-500/60 animate-pulse" />
                        </div>
                        <div className="flex-1 mx-1.5 h-3 bg-muted border  rounded px-1 text-[5px] text-amber-650 dark:text-amber-400 font-mono flex items-center justify-center truncate">
                          school.edu/admit-card-tab
                        </div>
                      </div>
                      <div className="flex-1 p-1.5 bg-card flex flex-col justify-between overflow-hidden">
                        <div className="flex items-center justify-between border-b  pb-0.5 text-[5px] text-foreground font-semibold truncate">
                          Admit Cards Hall Tickets
                        </div>
                        <div className="flex-1 my-1 border border-dashed  rounded p-1 flex items-center justify-center bg-muted gap-1.5">
                          <div className="flex flex-col gap-0.5 leading-none">
                            <span className="text-[5px]  font-medium">Class 1A batch</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
