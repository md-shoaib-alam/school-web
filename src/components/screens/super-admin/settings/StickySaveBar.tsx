import { Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StickySaveBarProps {
  onSave: () => void;
}

export function StickySaveBar({ onSave }: StickySaveBarProps) {
  return (
    <div className="sticky bottom-4 z-10">
      <Card className="shadow-lg border-teal-200 dark:border-teal-700 bg-white dark:bg-gray-900">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground font-medium">
            <span className="hidden sm:inline">
              Changes are saved locally. Click save to apply settings to the platform.
            </span>
            <span className="sm:hidden uppercase tracking-wider text-[10px]">Save settings</span>
          </div>
          <Button
            onClick={onSave}
            className="bg-teal-600 hover:bg-teal-700 text-white gap-2 rounded-xl shadow-md shadow-teal-100 dark:shadow-none"
          >
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
