"use client";

import { apiFetch } from "@/lib/api";
import { useState, useEffect, useCallback } from "react";
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

export function AdminSchoolSettings() {
  const { currentTenantId } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workingDays, setWorkingDays] = useState<Set<DayKey>>(
    new Set(DEFAULT_WORKING_DAYS),
  );
  const [defaultMarksheetTemplateId, setDefaultMarksheetTemplateId] = useState<string>("classic");
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
        prev ? { ...prev, workingDays: Array.from(workingDays), defaultMarksheetTemplateId } : prev,
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
        <CardContent className="pt-0 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-lg">
            <div className="flex-1">
              <Select 
                value={defaultMarksheetTemplateId} 
                onValueChange={(val) => {
                  setDefaultMarksheetTemplateId(val);
                  setHasChanges(true);
                }}
              >
                <SelectTrigger className="w-full h-10 border-violet-200 dark:border-violet-900/50 bg-background">
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
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800 text-xs text-muted-foreground flex gap-2">
            <Info className="size-4 text-violet-500 shrink-0" />
            <span>Changing this default will automatically format the report card preview under student login profiles to use this style.</span>
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
