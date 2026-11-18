import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusToggle } from "./status-toggle";
import { Printer } from "lucide-react";

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
          <div className="size-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Printer className="size-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Print Sheet Preference</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted rounded-lg border border-border gap-3">
          <div className="space-y-0.5">
            <h4 className="text-sm font-semibold text-foreground">
              Print Sheet Mode
            </h4>
            <p className="text-xs text-muted-foreground">
              Open print sheets in a popup modal
            </p>
          </div>
          <StatusToggle
            enabled={enableModalTabulationPreview}
            onToggle={onToggleTabulationPreview}
          />
        </div>
      </CardContent>
    </Card>
  );
}
