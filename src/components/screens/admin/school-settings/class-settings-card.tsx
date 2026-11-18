import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { School } from "lucide-react";
import { StatusToggle } from "./status-toggle";

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
          <div className="size-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <School className="size-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Class Creation Mode</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted rounded-lg border border-border gap-3">
          <div className="space-y-0.5">
            <h4 className="text-sm font-semibold text-foreground">
              Separate Class Level Selection
            </h4>
            <p className="text-xs text-muted-foreground">
              Choose to set the class level manually when creating classes
            </p>
          </div>
          <StatusToggle
            enabled={enableGradeSelection}
            onToggle={onToggleGradeSelection}
          />
        </div>
      </CardContent>
    </Card>
  );
}
