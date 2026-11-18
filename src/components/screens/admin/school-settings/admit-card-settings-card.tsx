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
          <div className="size-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
            <IdCard className="size-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Admit Card Preference</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted rounded-lg border border-border gap-3">
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
      </CardContent>
    </Card>
  );
}
