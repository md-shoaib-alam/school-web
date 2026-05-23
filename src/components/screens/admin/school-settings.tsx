"use client";

import { apiFetch } from "@/lib/api";
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Settings, Info, Save, CheckCircle2, Eye } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { useAppStore } from "@/store/use-app-store";
import { MARKSHEET_TEMPLATES } from "./exams/marksheet-templates";
import { handleMarksheetPreview } from "./school-settings/marksheet-preview";
import { Switch } from "@/components/ui/switch";

const ALL_DAYS = [
  { key: "monday", label: "Monday", short: "Mon", icon: "📅" },
  { key: "tuesday", label: "Tuesday", short: "Tue", icon: "📝" },
  { key: "wednesday", label: "Wednesday", short: "Wed", icon: "📚" },
  { key: "thursday", label: "Thursday", short: "Thu", icon: "✏️" },
  { key: "friday", label: "Friday", short: "Fri", icon: "🎉" },
  { key: "saturday", label: "Saturday", short: "Sat", icon: "📖" },
  { key: "sunday", label: "Sunday", short: "Sun", icon: "🏫" },
] as const;

type DayKey = (typeof ALL_DAYS)[number]["key"];

const DEFAULT_WORKING_DAYS: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

interface TenantSettings {
  workingDays: string[];
  [key: string]: unknown;
}

function MarksheetTemplatePreviewWidget({ templateId, isEnabled }: { templateId: string, isEnabled: boolean }) {
  const getTemplateStyle = (id: string) => {
    switch (id) {
      case "classic":
        return {
          title: "Classic Academy Layout",
          badge: "Navy Traditional",
          containerClass: "border-blue-900/30 bg-zinc-950/90 shadow-[0_0_12px_rgba(59,130,246,0.08)]",
          headerBg: "bg-blue-955/80 border-blue-900/40 text-blue-400",
          accentText: "text-blue-400",
          tableBorder: "border-blue-950/50",
          badgeClass: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
          isCompact: false,
          accentBg: "bg-blue-600",
        };
      case "modern":
        return {
          title: "Modern Minimalist Layout",
          badge: "Clean Slate",
          containerClass: "border-zinc-800 bg-zinc-950/90 shadow-[0_0_12px_rgba(244,244,245,0.05)]",
          headerBg: "bg-zinc-900/80 border-zinc-800 text-zinc-300",
          accentText: "text-zinc-300",
          tableBorder: "border-zinc-850",
          badgeClass: "bg-zinc-800 text-zinc-400 border border-zinc-700/50",
          isCompact: false,
          accentBg: "bg-zinc-400",
        };
      case "royal":
        return {
          title: "Royal Gold Elite Layout",
          badge: "Premium Gold",
          containerClass: "border-amber-500/30 bg-zinc-950/90 shadow-[0_0_15px_rgba(245,158,11,0.12)]",
          headerBg: "bg-slate-900 border-amber-500/40 text-amber-400",
          accentText: "text-amber-400",
          tableBorder: "border-amber-900/30",
          badgeClass: "bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse",
          isCompact: false,
          accentBg: "bg-amber-500",
        };
      case "creative":
        return {
          title: "Creative Compact Layout",
          badge: "Indigo Round",
          containerClass: "border-indigo-900/30 bg-zinc-950/90 shadow-[0_0_12px_rgba(99,102,241,0.1)]",
          headerBg: "bg-indigo-955/80 border-indigo-900/40 text-indigo-400 rounded-lg",
          accentText: "text-indigo-400",
          tableBorder: "border-indigo-950/50",
          badgeClass: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
          isCompact: true,
          accentBg: "bg-indigo-600",
        };
      case "cbse":
        return {
          title: "CBSE Public School Layout",
          badge: "Formal CBSE",
          containerClass: "border-red-900/30 bg-zinc-950/90 shadow-[0_0_12px_rgba(239,68,68,0.08)]",
          headerBg: "bg-red-955/80 border-red-900/40 text-red-400",
          accentText: "text-red-400",
          tableBorder: "border-red-950/50",
          badgeClass: "bg-red-500/10 text-red-400 border border-red-500/20",
          isCompact: false,
          accentBg: "bg-red-600",
        };
      case "icse":
        return {
          title: "ICSE Semester Layout",
          badge: "Academic Semi",
          containerClass: "border-cyan-900/30 bg-zinc-950/90 shadow-[0_0_12px_rgba(6,182,212,0.08)]",
          headerBg: "bg-cyan-955/80 border-cyan-900/40 text-cyan-400",
          accentText: "text-cyan-400",
          tableBorder: "border-cyan-950/50",
          badgeClass: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
          isCompact: false,
          accentBg: "bg-cyan-600",
        };
      case "stateboard":
      default:
        return {
          title: "State Board Green-Elite",
          badge: "Green Elite",
          containerClass: "border-emerald-900/30 bg-zinc-950/90 shadow-[0_0_12px_rgba(16,185,129,0.08)]",
          headerBg: "bg-emerald-955/80 border-emerald-900/40 text-emerald-400",
          accentText: "text-emerald-400",
          tableBorder: "border-emerald-950/50",
          badgeClass: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
          isCompact: false,
          accentBg: "bg-emerald-600",
        };
    }
  };

  const style = getTemplateStyle(templateId);

  return (
    <div className={`relative w-full max-w-[340px] h-[185px] border rounded-xl overflow-hidden flex flex-col p-2.5 transition-all duration-300 ${style.containerClass}`}>
      {/* Browser bar tab headers */}
      <div className="h-8 bg-zinc-900 border-b border-zinc-850 px-2.5 flex items-end gap-1.5 shrink-0 justify-between mb-1.5">
        <div className="flex items-center gap-1 mb-2">
          <span className="size-2 rounded-full bg-red-500/50" />
          <span className="size-2 rounded-full bg-yellow-500/50" />
          <span className="size-2 rounded-full bg-green-500/50" />
        </div>
        
        {/* Real browser tabs */}
        <div className="flex-1 flex gap-1 items-end max-w-[190px] h-6 overflow-hidden">
          <div className={`h-5 px-2 rounded-t-md text-[8px] font-medium flex items-center gap-1 shrink-0 transition-colors ${
            isEnabled ? "bg-zinc-950 text-violet-400 border-t border-x border-zinc-800" : "bg-zinc-900/60 text-zinc-500"
          }`}>
            🏫 Portal
          </div>
          {!isEnabled && (
            <div className="h-5 px-2 rounded-t-md bg-zinc-950 text-violet-400 border-t border-x border-zinc-800/80 text-[8px] font-semibold flex items-center gap-1 animate-in slide-in-from-bottom-2 shrink-0">
              📄 Marksheet
            </div>
          )}
        </div>

        <div className="flex items-center gap-0.5 mb-1.5 shrink-0">
          <span className="text-[7.5px] text-zinc-400 font-semibold bg-zinc-855 border border-zinc-800 px-1 py-0.5 rounded leading-none">
            {isEnabled ? "Inline" : "Separate"}
          </span>
        </div>
      </div>

      {/* Main mockup canvas */}
      <div className="flex-1 bg-zinc-900/40 relative overflow-hidden flex flex-col justify-between p-1.5">
        {/* Mock dashboard base behind everything */}
        <div className="space-y-1.5 opacity-60">
          <div className="flex justify-between items-center px-1">
            <div className="h-2 w-12 bg-zinc-800 rounded-sm" />
            <div className="h-2.5 w-8 bg-violet-500/10 border border-violet-500/20 rounded-sm" />
          </div>
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-zinc-805/55 rounded-sm" />
            <div className="h-1.5 w-full bg-zinc-900/60 rounded-sm" />
          </div>
        </div>

        {/* Mode-specific Overlay Visualizers */}
        {isEnabled ? (
          /* Inline Popover Dialog Modal Mode */
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[0.5px] flex flex-col items-center justify-center p-2 transition-all duration-300 z-30 animate-in fade-in">
            {/* Explainer badge */}
            <div className="absolute top-1 text-[7px] text-zinc-350 font-bold bg-zinc-905 border border-zinc-800 px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow select-none animate-pulse">
              <span className="size-1 bg-violet-500 rounded-full animate-ping" />
              <span>Modal overlay on same screen</span>
            </div>

            {/* Centralized popover report card */}
            <div className="w-[190px] h-[105px] bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl flex flex-col p-1.5 justify-between scale-100 opacity-100 transition-all duration-300 ease-out transform animate-in zoom-in-95 mt-2.5">
              {/* Mini Modal Title Bar */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-1 mb-1">
                <div className="flex items-center gap-1 overflow-hidden">
                  <span className="size-1 bg-violet-500 shrink-0" />
                  <span className="text-[6.5px] font-bold text-zinc-300 truncate">{style.title}</span>
                </div>
                <span className="text-[6px] text-zinc-550">✕</span>
              </div>
              
              {/* Mini Report Sheet Mockup */}
              <div className="flex-1 bg-zinc-950 rounded border border-zinc-850 p-1 flex flex-col gap-0.5 overflow-hidden">
                <div className="grid grid-cols-4 gap-0.5 border-b border-zinc-900 pb-0.5 text-[4.5px] text-zinc-500 font-bold">
                  <span>Subject</span>
                  <span>Marks</span>
                  <span>Grade</span>
                  <span className="text-right">Result</span>
                </div>
                <div className="grid grid-cols-4 gap-0.5 items-center text-[4.5px] text-zinc-400">
                  <span className="text-zinc-300 truncate font-semibold">Maths</span>
                  <span>95/100</span>
                  <span className={`font-semibold ${style.accentText}`}>A+</span>
                  <span className="text-right text-emerald-500 font-medium">Pass</span>
                </div>
              </div>

              {/* Action close button */}
              <div className="flex justify-between items-center mt-1 border-t border-zinc-800 pt-0.5">
                <span className="text-[4.5px] text-zinc-500">Esc key to exit</span>
                <span className="px-1 py-0.5 bg-violet-600 rounded text-[5px] text-white font-semibold flex items-center leading-none">
                  Print Marksheet
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* New Tab Preview Mode */
          <div className="absolute inset-0 flex items-center justify-center p-2 transition-all duration-300 z-30 pointer-events-none animate-in fade-in">
            {/* Explainer badge */}
            <div className="absolute top-1 text-[7px] text-zinc-355 font-bold bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow select-none">
              <span className="size-1 bg-violet-500 rounded-full animate-ping" />
              <span>Slides open in a separate tab</span>
            </div>

            {/* Click pointer indicator */}
            <div className="absolute left-[38%] top-[25%] size-5 z-40 animate-ping rounded-full border border-violet-500/40 bg-violet-500/10 duration-1000" />
            
            {/* The second overlapping page representing "New Browser Window/Tab" */}
            <div className="w-[185px] h-[105px] bg-zinc-950 border border-violet-500/40 rounded-lg shadow-[0_4px_20px_rgba(139,92,246,0.18)] flex flex-col absolute right-2 bottom-1 translate-x-0 translate-y-0 z-20 scale-100 opacity-100 transition-all duration-500 ease-out transform animate-in slide-in-from-bottom-4 slide-in-from-right-4 mt-2.5">
              {/* Mini browser top bar of the new window */}
              <div className="h-4.5 bg-zinc-900 border-b border-zinc-800/80 px-1.5 flex items-center gap-1 justify-between">
                <div className="flex items-center gap-0.5">
                  <span className="size-1 rounded-full bg-red-500/60" />
                  <span className="size-1 rounded-full bg-violet-500/60 animate-pulse" />
                </div>
                <div className="flex-1 mx-1.5 h-3 bg-zinc-950 border border-zinc-850 rounded px-1 text-[5px] text-violet-400 font-mono flex items-center justify-center truncate">
                  school.edu/marksheet-preview-tab
                </div>
                <div className="size-1.5 bg-violet-500 rounded-full animate-ping shrink-0" />
              </div>

              {/* Content of the standalone tab */}
              <div className="flex-1 p-1 bg-zinc-950 flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-0.5">
                  <span className="text-[5.5px] text-zinc-300 font-semibold truncate">{style.title}</span>
                  <span className="text-[4.5px] text-violet-400 font-bold bg-violet-500/10 px-0.5 rounded">Standalone</span>
                </div>

                <div className="flex-1 my-1 border border-dashed border-zinc-800 rounded p-0.5 flex flex-col gap-0.5 bg-zinc-900/40 justify-center">
                  <div className="flex items-center gap-1 justify-center">
                    <span className="text-[12px] animate-bounce">📄</span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[5px] text-zinc-400">Class teacher copy</span>
                      <span className="text-[4px] text-zinc-550">Dual monitor print preview ready</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[4px] text-zinc-500">
                  <span>Zoom: 100%</span>
                  <span>Vector PDF Style</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PrintSheetModePreview({ isEnabled }: { isEnabled: boolean }) {
  return (
    <div className="relative w-full max-w-[340px] h-[185px] bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-xl select-none mx-auto lg:mx-0 flex flex-col transition-all duration-300">
      {/* Dynamic Simulated Browser Tabs Bar */}
      <div className="h-8 bg-zinc-900 border-b border-zinc-850 px-2.5 flex items-end gap-1.5 shrink-0 justify-between">
        {/* Window controls */}
        <div className="flex items-center gap-1 mb-2">
          <span className="size-2 rounded-full bg-red-500/50" />
          <span className="size-2 rounded-full bg-yellow-500/50" />
          <span className="size-2 rounded-full bg-green-500/50" />
        </div>
        
        {/* Real-looking browser tabs! */}
        <div className="flex-1 flex gap-1 items-end max-w-[210px] h-6 overflow-hidden">
          {/* Main App Tab */}
          <div className={`h-5 px-2 rounded-t-md text-[8px] font-medium flex items-center gap-1 shrink-0 transition-colors duration-200 ${
            isEnabled ? "bg-zinc-950 text-emerald-400 border-t border-x border-zinc-800" : "bg-zinc-900/60 text-zinc-500"
          }`}>
            🏫 Admin Portal
          </div>
          
          {/* Standalone Tab */}
          {!isEnabled && (
            <div className="h-5 px-2 rounded-t-md bg-zinc-950 text-emerald-400 border-t border-x border-zinc-800/80 text-[8px] font-semibold flex items-center gap-1 animate-in slide-in-from-bottom-2 duration-300 shrink-0">
              🖨️ Print Sheet
            </div>
          )}
        </div>

        {/* Tab badge indicator */}
        <div className="flex items-center gap-1 mb-1.5">
          <span className="text-[7.5px] text-zinc-400 font-semibold bg-zinc-855 border border-zinc-800 px-1 py-0.5 rounded leading-none shrink-0">
            {isEnabled ? "Inline" : "Separate"}
          </span>
        </div>
      </div>

      {/* Main mockup canvas */}
      <div className="flex-1 bg-zinc-900/40 p-3 relative overflow-hidden flex flex-col justify-between">
        {/* Mock dashboard base behind everything */}
        <div className="space-y-2 opacity-60">
          {/* Header Row */}
          <div className="flex justify-between items-center">
            <div className="h-3 w-16 bg-zinc-800 rounded-sm" />
            <div className="h-3.5 w-10 bg-emerald-500/10 border border-emerald-500/20 rounded-sm" />
          </div>
          
          {/* Fake Table Grid */}
          <div className="space-y-1">
            <div className="h-2 w-full bg-zinc-800/50 rounded-sm flex items-center px-1 gap-1">
              <div className="h-1 w-4 bg-zinc-700 rounded-sm" />
              <div className="h-1 w-6 bg-zinc-700 rounded-sm" />
              <div className="h-1 w-8 bg-zinc-700 rounded-sm" />
            </div>
            {["row-1", "row-2"].map((rowId) => (
              <div key={rowId} className="h-2 w-full bg-zinc-900/60 rounded-sm flex items-center px-1 gap-1 border-t border-zinc-800/30">
                <div className="h-1 w-3 bg-zinc-800 rounded-sm" />
                <div className="h-1 w-5 bg-zinc-800 rounded-sm" />
                <div className="h-1 w-7 bg-zinc-800 rounded-sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Mode-specific Overlay Visualizers */}
        {isEnabled ? (
          /* Inline Popover Dialog Modal Mode */
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[0.5px] flex flex-col items-center justify-center p-2.5 transition-all duration-300 z-30 animate-in fade-in">
            {/* Explainer badge */}
            <div className="absolute top-1 text-[7.5px] text-zinc-350 font-bold bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded-full flex items-center gap-1 select-none shadow">
              <span className="size-1 bg-emerald-500 rounded-full animate-ping" />
              <span>Modal overlay on the current screen</span>
            </div>

            <div className="w-[190px] h-[105px] bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl flex flex-col p-2 justify-between scale-100 opacity-100 transition-all duration-300 ease-out transform animate-in zoom-in-95 mt-2.5">
              {/* Mini Modal Title Bar */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-1 mb-1">
                <div className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[7px] font-bold text-zinc-300">Inline Preview Dialog</span>
                </div>
                <span className="text-[7px] text-zinc-500 hover:text-zinc-300 cursor-pointer">✕</span>
              </div>
              
              {/* Mini Report Sheet Mockup */}
              <div className="flex-1 bg-zinc-950/95 rounded border border-zinc-800/60 p-1 flex flex-col gap-1 overflow-hidden">
                <div className="grid grid-cols-4 gap-0.5 border-b border-zinc-900 pb-0.5">
                  <span className="text-[5px] text-zinc-500 font-bold">Roll</span>
                  <span className="text-[5px] text-zinc-500 font-bold">Student</span>
                  <span className="text-[5px] text-zinc-500 font-bold">GPA</span>
                  <span className="text-[5px] text-zinc-500 font-bold">Status</span>
                </div>
                <div className="grid grid-cols-4 gap-0.5 items-center">
                  <span className="text-[5px] text-zinc-400">101</span>
                  <span className="text-[5px] text-zinc-300 truncate">A. Khan</span>
                  <span className="text-[5px] text-emerald-400 font-bold">4.00</span>
                  <span className="text-[4px] px-0.5 py-0 bg-emerald-500/10 text-emerald-400 rounded-sm font-medium w-fit">Pass</span>
                </div>
              </div>

              {/* Mini Modal Action Button */}
              <div className="flex justify-between items-center mt-1 pt-1 border-t border-zinc-800">
                <span className="text-[5px] text-zinc-500">Esc key to exit modal</span>
                <span className="px-1 py-0.5 bg-emerald-600 rounded text-[5px] text-white font-semibold flex items-center gap-0.5 leading-none">
                  🖨️ Print
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* New Tab Preview Mode */
          <div className="absolute inset-0 flex items-center justify-center p-3 transition-all duration-300 z-30 pointer-events-none animate-in fade-in">
            {/* Explainer badge */}
            <div className="absolute top-1 text-[7.5px] text-zinc-355 font-bold bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded-full flex items-center gap-1 select-none shadow">
              <span className="size-1 bg-emerald-500 rounded-full animate-ping" />
              <span>Slides open in a separate new tab</span>
            </div>

            {/* Click pointer indicator */}
            <div className="absolute left-[38%] top-[25%] size-5 z-40 animate-ping rounded-full border border-emerald-500/40 bg-emerald-500/10 duration-1000" />
            
            {/* The second overlapping page representing "New Browser Window/Tab" */}
            <div className="w-[185px] h-[105px] bg-zinc-950 border border-emerald-500/40 rounded-lg shadow-[0_4px_20px_rgba(16,185,129,0.18)] flex flex-col absolute right-2 bottom-1 translate-x-0 translate-y-0 z-20 scale-100 opacity-100 transition-all duration-500 ease-out transform animate-in slide-in-from-bottom-4 slide-in-from-right-4 mt-2">
              {/* Mini browser top bar of the new window */}
              <div className="h-4 bg-zinc-900 border-b border-zinc-800/80 px-1.5 flex items-center gap-1 justify-between">
                <div className="flex items-center gap-0.5">
                  <span className="size-1 rounded-full bg-red-500/60" />
                  <span className="size-1 rounded-full bg-emerald-500/60 animate-pulse" />
                </div>
                <div className="flex-1 mx-1.5 h-2.5 bg-zinc-950 border border-zinc-850 rounded px-1 text-[5px] text-emerald-400 font-mono flex items-center justify-center truncate">
                  school.edu/print-sheet-tab
                </div>
                <div className="size-1.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
              </div>

              {/* Content of the standalone tab */}
              <div className="flex-1 p-1.5 bg-zinc-950 flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-0.5">
                  <span className="text-[6px] text-zinc-350 font-semibold truncate">Tabulation Report Sheet</span>
                  <span className="text-[5px] text-emerald-400 font-bold bg-emerald-500/10 px-0.5 rounded">Standalone</span>
                </div>

                <div className="flex-1 my-1 border border-dashed border-zinc-800 rounded p-0.5 flex flex-col gap-0.5 bg-zinc-900/40 justify-center">
                  <div className="flex items-center gap-1 justify-center">
                    <span className="text-[12px] animate-bounce">📄</span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[5px] text-zinc-400">Class 10 - Section A</span>
                      <span className="text-[4px] text-zinc-500">Press Ctrl+P to print immediately</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[4px] text-zinc-500">
                  <span>Zoom: 100%</span>
                  <span>Print-Ready Grid</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminSchoolSettings() {
  const { currentTenantId } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workingDays, setWorkingDays] = useState<Set<DayKey>>(
    new Set(DEFAULT_WORKING_DAYS),
  );
  const [defaultMarksheetTemplateId, setDefaultMarksheetTemplateId] = useState<string>("classic");
  const [enableModalTabulationPreview, setEnableModalTabulationPreview] = useState<boolean>(false);
  const [enableModalMarksheetPreview, setEnableModalMarksheetPreview] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialSettings, setInitialSettings] = useState<TenantSettings | null>(
    null,
  );

  const fetchSettings = useCallback(async () => {
    if (!currentTenantId) return;
    setLoading(true);
    try {
      const res = await apiFetch("/api/tenant-settings");
      if (!res.ok) throw new Error();
      const data: TenantSettings = await res.json();
      setInitialSettings(data);

      if (data.workingDays && Array.isArray(data.workingDays)) {
        const validDays = data.workingDays.filter((d: string) =>
          (ALL_DAYS as readonly { key: string }[]).some((day) => day.key === d),
        ) as DayKey[];
        if (validDays.length > 0) {
          setWorkingDays(new Set(validDays));
        }
      }
      if (data.defaultMarksheetTemplateId && typeof data.defaultMarksheetTemplateId === "string") {
        setDefaultMarksheetTemplateId(data.defaultMarksheetTemplateId);
      }
      if (typeof data.enableModalTabulationPreview === "boolean") {
        setEnableModalTabulationPreview(data.enableModalTabulationPreview);
      }
      if (typeof data.enableModalMarksheetPreview === "boolean") {
        setEnableModalMarksheetPreview(data.enableModalMarksheetPreview);
      }
    } catch {
      // Use defaults if fetch fails
      toast.error("Failed to load settings. Using default configuration.");
    } finally {
      setLoading(false);
    }
  }, [currentTenantId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const toggleDay = (dayKey: DayKey) => {
    setWorkingDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayKey)) {
        // Prevent deselecting if it's the last day
        if (next.size <= 1) {
          toast.error("At least one working day must be selected.");
          return prev;
        }
        next.delete(dayKey);
      } else {
        next.add(dayKey);
      }
      return next;
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!currentTenantId) return;
    if (workingDays.size === 0) {
      toast.error("At least one working day must be selected.");
      return;
    }

    setSaving(true);
    try {
      const settings = {
        ...(initialSettings || {}),
        workingDays: Array.from(workingDays),
        defaultMarksheetTemplateId,
        enableModalTabulationPreview,
        enableModalMarksheetPreview,
      };

      const res = await apiFetch("/api/tenant-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save settings");
      }

      setHasChanges(false);
      setInitialSettings((prev) =>
        prev ? { ...prev, workingDays: Array.from(workingDays), defaultMarksheetTemplateId, enableModalTabulationPreview, enableModalMarksheetPreview } : prev,
      );
      toast.success("School settings saved successfully.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save settings",
      );
    } finally {
      setSaving(false);
    }
  };

  const selectedCount = workingDays.size;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-emerald-500" />
        <span className="ml-3 text-zinc-500 dark:text-zinc-400">
          Loading settings...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          School Settings
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Configure your school preferences and template defaults
        </p>
      </div>

      {/* Working Days Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">Working Days</CardTitle>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Select the days your school holds classes and timetable schedules
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {ALL_DAYS.map((day) => {
              const isSelected = workingDays.has(day.key);
              const isLastSelected = isSelected && workingDays.size <= 1;

              return (
                <label
                  key={day.key}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                    ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10"
                        : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/30"
                    }
                    ${isLastSelected && !isSelected ? "opacity-50 pointer-events-none" : ""}
                  `}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleDay(day.key)}
                    disabled={isLastSelected && isSelected}
                  />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {day.label}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground pt-1">
            <span>Quick Select:</span>
            <button
              type="button"
              onClick={() => {
                setWorkingDays(new Set<DayKey>(["monday", "tuesday", "wednesday", "thursday", "friday"]));
                setHasChanges(true);
              }}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              Mon–Fri
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                setWorkingDays(new Set<DayKey>(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]));
                setHasChanges(true);
              }}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              Mon–Sat
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                setWorkingDays(new Set<DayKey>(["sunday", "monday", "tuesday", "wednesday", "thursday"]));
                setHasChanges(true);
              }}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              Sun–Thu
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Marksheet Settings Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-lg">
              📄
            </div>
            <div>
              <CardTitle className="text-lg">Marksheet Template Preference</CardTitle>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Choose the default marksheet template layout for both admin printing and student dashboards
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Column (7 cols): Dropdown settings, button, and Switch toggle */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                <div className="flex-1">
                  <Select 
                    value={defaultMarksheetTemplateId} 
                    onValueChange={(val) => {
                      setDefaultMarksheetTemplateId(val);
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger className="w-full h-10 border-violet-200 dark:border-violet-900/50 bg-background text-xs font-medium">
                      <div className="flex items-center gap-2">
                        <Settings className="size-4 text-violet-500" />
                        <SelectValue placeholder="Choose default marksheet…" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="classic">Classic Academy</SelectItem>
                      <SelectItem value="modern">Modern Minimalist</SelectItem>
                      <SelectItem value="royal">Royal Gold Elite</SelectItem>
                      <SelectItem value="creative">Creative Compact</SelectItem>
                      <SelectItem value="cbse">CBSE Public School</SelectItem>
                      <SelectItem value="icse">ICSE Semester Convent</SelectItem>
                      <SelectItem value="stateboard">State Board Green-Elite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 border-violet-200 dark:border-violet-900/50 hover:bg-violet-50 dark:hover:bg-violet-950/20 text-violet-700 dark:text-violet-400 gap-1.5 font-semibold text-xs shrink-0"
                  onClick={() => handleMarksheetPreview(defaultMarksheetTemplateId)}
                >
                  <Eye className="size-4" />
                  Preview Template
                </Button>
              </div>

              {/* Inline Marksheet Preview Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-lg border border-zinc-150 dark:border-zinc-800/60 w-full">
                <div className="space-y-0.5 pr-4">
                  <Label htmlFor="enableModalMarksheetPreview" className="text-sm font-semibold cursor-pointer text-zinc-800 dark:text-zinc-200">
                    Marksheet Print
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Open marksheet previews in a popover dialog modal instead of a new browser tab.
                  </p>
                </div>
                <Switch
                  id="enableModalMarksheetPreview"
                  checked={enableModalMarksheetPreview}
                  onCheckedChange={(checked) => {
                    setEnableModalMarksheetPreview(checked);
                    setHasChanges(true);
                  }}
                />
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800 text-xs text-muted-foreground flex gap-2">
                <Info className="size-4 text-violet-500 shrink-0" />
                <span>Changing this default will automatically format the report card preview under student login profiles to use this style.</span>
              </div>
            </div>

            {/* Right Column (5 cols): Live preview layout visualizer */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-start pl-0 lg:pl-6 border-t lg:border-t-0 lg:border-l border-zinc-100 dark:border-zinc-800 pt-6 lg:pt-0">
              <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2.5 flex items-center gap-1.5 select-none">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                </span>
                Active Template Layout Preview
              </div>
              <MarksheetTemplatePreviewWidget templateId={defaultMarksheetTemplateId} isEnabled={enableModalMarksheetPreview} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print Sheet Settings Card */}
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
                  onCheckedChange={(checked) => {
                    setEnableModalTabulationPreview(checked);
                    setHasChanges(true);
                  }}
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
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Interactive Preview Demonstration
              </div>
              <PrintSheetModePreview isEnabled={enableModalTabulationPreview} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary and Save - Dashboard Page Level Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-card border border-zinc-100 dark:border-zinc-800/80 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <CheckCircle2
            className={`size-4 ${
              hasChanges ? "text-amber-500" : "text-emerald-500"
            }`}
          />
          {hasChanges ? (
            <span>You have unsaved changes.</span>
          ) : (
            <span>All changes saved.</span>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px]"
        >
          {saving ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="size-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

    </div>
  );
}
