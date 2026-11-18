import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Eye, Award } from "lucide-react";
import { handleMarksheetPreview } from "./marksheet-preview";
import { StatusToggle } from "./status-toggle";

interface MarksheetSettingsCardProps {
  defaultMarksheetTemplateId: string;
  enableModalMarksheetPreview: boolean;
  onTemplateChange: (val: string) => void;
  onToggleMarksheetPreview: (checked: boolean) => void;
}

export function MarksheetSettingsCard({
  defaultMarksheetTemplateId,
  enableModalMarksheetPreview,
  onTemplateChange,
  onToggleMarksheetPreview,
}: MarksheetSettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
            <Award className="size-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Marksheet Template Preference</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
              <div className="flex-1">
                <Select
                  value={defaultMarksheetTemplateId}
                  onValueChange={onTemplateChange}
                >
                  <SelectTrigger aria-label="Default marksheet template"
                    className="w-full h-10 border-border bg-card text-xs font-medium">
                    <div className="flex items-center gap-2">
                      <Settings className="size-4 text-muted-foreground" />
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
                className="h-10 border-border bg-card hover:bg-muted text-foreground gap-1.5 font-semibold text-xs shrink-0"
                onClick={() => handleMarksheetPreview(defaultMarksheetTemplateId)}
              >
                <Eye className="size-4" />
                Preview Template
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted rounded-lg border border-border gap-3">
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-foreground">
                  Marksheet Preview Mode
                </h4>
                <p className="text-xs text-muted-foreground">
                  Show previews in a popup modal
                </p>
              </div>
              
              <StatusToggle 
                enabled={enableModalMarksheetPreview} 
                onToggle={onToggleMarksheetPreview} 
              />
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
