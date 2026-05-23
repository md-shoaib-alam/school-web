import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Info, Eye } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { handleMarksheetPreview } from "./marksheet-preview";
import { MarksheetTemplatePreviewWidget } from "./marksheet-preview-widget";

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
                  onValueChange={onTemplateChange}
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
                onCheckedChange={onToggleMarksheetPreview}
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
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-violet-500"></span>
              </span>
              Active Template Layout Preview
            </div>
            <MarksheetTemplatePreviewWidget templateId={defaultMarksheetTemplateId} isEnabled={enableModalMarksheetPreview} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
