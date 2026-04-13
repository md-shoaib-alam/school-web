'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Settings, Info, Save, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/store/use-app-store';

const ALL_DAYS = [
  { key: 'monday', label: 'Monday', short: 'Mon', icon: '📅' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue', icon: '📝' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed', icon: '📚' },
  { key: 'thursday', label: 'Thursday', short: 'Thu', icon: '✏️' },
  { key: 'friday', label: 'Friday', short: 'Fri', icon: '🎉' },
  { key: 'saturday', label: 'Saturday', short: 'Sat', icon: '📖' },
  { key: 'sunday', label: 'Sunday', short: 'Sun', icon: '🏫' },
] as const;

type DayKey = (typeof ALL_DAYS)[number]['key'];

const DEFAULT_WORKING_DAYS: DayKey[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
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
    new Set(DEFAULT_WORKING_DAYS)
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [initialSettings, setInitialSettings] = useState<TenantSettings | null>(
    null
  );

  const fetchSettings = useCallback(async () => {
    if (!currentTenantId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/tenant-settings');
      if (!res.ok) throw new Error();
      const data: TenantSettings = await res.json();
      setInitialSettings(data);

      if (data.workingDays && Array.isArray(data.workingDays)) {
        const validDays = data.workingDays.filter((d: string) =>
          (ALL_DAYS as readonly { key: string }[]).some(
            (day) => day.key === d
          )
        ) as DayKey[];
        if (validDays.length > 0) {
          setWorkingDays(new Set(validDays));
        }
      }
    } catch {
      // Use defaults if fetch fails
      toast.error('Failed to load settings. Using default configuration.');
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
          toast.error('At least one working day must be selected.');
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
      toast.error('At least one working day must be selected.');
      return;
    }

    setSaving(true);
    try {
      const settings = {
        ...(initialSettings || {}),
        workingDays: Array.from(workingDays),
      };

      const res = await fetch('/api/tenant-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save settings');
      }

      setHasChanges(false);
      setInitialSettings((prev) =>
        prev ? { ...prev, workingDays: Array.from(workingDays) } : prev
      );
      toast.success('School settings saved successfully.');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to save settings'
      );
    } finally {
      setSaving(false);
    }
  };

  const selectedCount = workingDays.size;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="ml-3 text-gray-500 dark:text-gray-400">
          Loading settings...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Settings className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              School Settings
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Configure your school&apos;s working days and preferences
            </p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                About Working Days
              </p>
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                Working days determine which days appear in the timetable.
                Schools in different regions may have different weekly schedules.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Working Days Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-lg">
                🗓️
              </div>
              <div>
                <CardTitle className="text-lg">Working Days</CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Select the days your school holds classes
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400"
            >
              {selectedCount} day{selectedCount !== 1 ? 's' : ''} selected
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Day Selection Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {ALL_DAYS.map((day) => {
              const isSelected = workingDays.has(day.key);
              const isLastSelected =
                isSelected && workingDays.size <= 1;

              return (
                <div
                  key={day.key}
                  className={`
                    relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                    ${
                      isSelected
                        ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }
                    ${isLastSelected ? 'opacity-100' : ''}
                    ${!isSelected && isLastSelected ? 'opacity-50 pointer-events-none' : ''}
                  `}
                  onClick={() => toggleDay(day.key)}
                >
                  {/* Checkbox */}
                  <div className="absolute top-2 right-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleDay(day.key)}
                      disabled={isLastSelected && isSelected}
                      className={isSelected ? 'data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600' : ''}
                    />
                  </div>

                  {/* Day Icon */}
                  <span className="text-2xl mt-1">{day.icon}</span>

                  {/* Day Label */}
                  <div className="text-center">
                    <p
                      className={`text-sm font-semibold leading-tight ${
                        isSelected
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {day.label}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${
                        isSelected
                          ? 'text-emerald-500 dark:text-emerald-500'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {day.short}
                    </p>
                  </div>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2">
                      <div className="h-1 w-8 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Common Schedules Hint */}
          <div className="mt-5 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Common Schedules
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setWorkingDays(
                    new Set(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as DayKey[])
                  );
                  setHasChanges(true);
                }}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:border-emerald-700 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer"
              >
                Mon–Fri (Standard)
              </button>
              <button
                type="button"
                onClick={() => {
                  setWorkingDays(
                    new Set(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as DayKey[])
                  );
                  setHasChanges(true);
                }}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:border-emerald-700 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer"
              >
                Mon–Sat (6-day week)
              </button>
              <button
                type="button"
                onClick={() => {
                  setWorkingDays(
                    new Set(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'] as DayKey[])
                  );
                  setHasChanges(true);
                }}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:border-emerald-700 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer"
              >
                Sun–Thu (Middle East)
              </button>
            </div>
          </div>

          <Separator className="my-5" />

          {/* Summary and Save */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <CheckCircle2
                className={`h-4 w-4 ${
                  hasChanges
                    ? 'text-amber-500'
                    : 'text-emerald-500'
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
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
