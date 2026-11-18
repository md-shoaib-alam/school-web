"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/use-app-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type AttendanceSettings = { mode: "daily" | "period"; periodCount: number; teacherClassScope: "assigned" | "all" };

export function AttendanceSettingsCard() {
  const tenantId = useAppStore(state => state.currentTenantId);
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<AttendanceSettings | null>(null);
  const { data, isPending, error } = useQuery({
    queryKey: ["attendance-settings", tenantId],
    queryFn: () => api.get<AttendanceSettings>("/period-attendance/settings"),
    enabled: !!tenantId,
  });
  const value = draft ?? data;
  const save = useMutation({
    mutationFn: (settings: AttendanceSettings) => api.put<AttendanceSettings>("/period-attendance/settings", settings),
    onSuccess: (settings) => {
      queryClient.setQueryData(["attendance-settings", tenantId], settings);
      queryClient.invalidateQueries({ queryKey: ["attendance-slots", tenantId] });
      setDraft(null);
      toast.success("Attendance settings saved.");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to save attendance settings"),
  });
  const hasChanges = value && data && (value.mode !== data.mode || value.periodCount !== data.periodCount || value.teacherClassScope !== data.teacherClassScope);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student attendance</CardTitle>
        <CardDescription>Choose one attendance mode for every class in this school.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPending ? <p role="status" className="text-sm text-muted-foreground">Loading attendance settings…</p> : error ? (
          <p role="alert" className="text-sm text-destructive">Could not load attendance settings. Reload the page to retry.</p>
        ) : value && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="attendance-mode">Attendance mode</Label>
                <Select value={value.mode} disabled={save.isPending} onValueChange={(mode: AttendanceSettings["mode"]) => setDraft({ ...value, mode })}>
                  <SelectTrigger id="attendance-mode"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Once daily</SelectItem>
                    <SelectItem value="period">Period-wise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {value.mode === "period" && (
                <div className="space-y-2">
                  <Label htmlFor="attendance-period-count">Periods per day</Label>
                  <Input id="attendance-period-count" type="number" min={1} max={20} step={1} value={Number.isNaN(value.periodCount) ? "" : value.periodCount} disabled={save.isPending}
                    onChange={event => setDraft({ ...value, periodCount: event.target.valueAsNumber })} />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="attendance-teacher-class-scope">Teachers can take attendance for</Label>
                <Select value={value.teacherClassScope} disabled={save.isPending} onValueChange={(teacherClassScope: AttendanceSettings["teacherClassScope"]) => setDraft({ ...value, teacherClassScope })}>
                  <SelectTrigger id="attendance-teacher-class-scope"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assigned">Only assigned classes</SelectItem>
                    <SelectItem value="all">Any class in this school</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {value.mode === "daily" ? "Attendance works once per day, just as before." : "Teachers mark each numbered period. Timetable lessons supply subject and time labels when available; breaks are excluded. Period 1 supplies the daily summary in reports and parent screens."}
            </p>
            {value.mode === "period" && <p className="text-sm text-muted-foreground">Use the web attendance screen for period marking. Existing mobile versions only display the daily summary.</p>}
            <Button onClick={() => save.mutate(value)} disabled={!hasChanges || save.isPending || !Number.isInteger(value.periodCount) || value.periodCount < 1 || value.periodCount > 20}>
              {save.isPending ? "Saving…" : "Save attendance settings"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
