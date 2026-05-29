import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Blocks, Power, PowerOff } from "lucide-react";
import { FlagCard } from "./FlagCard";
import { FeatureFlag, categoryIcons, categoryColors } from "./types";

interface CategoryPanelProps {
  flags: FeatureFlag[];
  category: string;
  onToggle: (id: string) => void;
  onRolloutChange: (id: string, value: number) => void;
  onBulkEnable: (category: string) => void;
  onBulkDisable: (category: string) => void;
  onNotesChange?: (id: string, notes: string) => void;
}

export function CategoryPanel({
  flags,
  category,
  onToggle,
  onRolloutChange,
  onBulkEnable,
  onBulkDisable,
  onNotesChange,
}: CategoryPanelProps) {
  const CategoryIcon = categoryIcons[category] || Blocks;
  const colorClass = categoryColors[category] || "text-zinc-600 bg-zinc-50 dark:bg-zinc-900";
  const enabledCount = flags.filter((f) => f.enabled).length;

  return (
    <div className="space-y-6">
      {/* Category Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-xs border border-zinc-200 dark:border-zinc-800 text-left">
        <div className="flex items-center gap-3">
          <div className={`size-10 rounded-md flex items-center justify-center border border-zinc-200 dark:border-zinc-800 ${colorClass}`}>
            <CategoryIcon className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold capitalize text-zinc-900 dark:text-zinc-100">{category} Capabilities</h3>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
              <span className="text-emerald-600 font-bold">{enabledCount}</span> Active / {flags.length} Registered
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none h-8 text-xs font-semibold gap-1.5 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 bg-white dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
            onClick={() => onBulkEnable(category)}
          >
            <Power className="size-3" />
            Bulk Enable
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none h-8 text-xs font-semibold gap-1.5 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/80 bg-white dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-950/20"
            onClick={() => onBulkDisable(category)}
          >
            <PowerOff className="size-3" />
            Bulk Off
          </Button>
        </div>
      </div>

      {/* Grid */}
      {flags.length === 0 ? (
        <Card className="border border-dashed border-zinc-200 dark:border-zinc-800 bg-transparent rounded-lg">
          <CardContent className="p-16 text-center">
            <div className="size-12 bg-zinc-50 dark:bg-zinc-950 rounded-full flex items-center justify-center mx-auto mb-3 border border-zinc-200 dark:border-zinc-800">
              <Blocks className="size-6 text-zinc-400" />
            </div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-150">No Flags Registered</p>
            <p className="text-xs text-zinc-500 mt-1">Configure this category from the orchestration header.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {flags.map((flag) => (
            <FlagCard
              key={flag.id}
              flag={flag}
              onToggle={onToggle}
              onRolloutChange={onRolloutChange}
              onNotesChange={onNotesChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

