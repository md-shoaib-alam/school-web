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
}

export function CategoryPanel({
  flags,
  category,
  onToggle,
  onRolloutChange,
  onBulkEnable,
  onBulkDisable,
}: CategoryPanelProps) {
  const CategoryIcon = categoryIcons[category] || Blocks;
  const colorClass = categoryColors[category] || "text-gray-600 bg-gray-50 dark:bg-gray-900";
  const enabledCount = flags.filter((f) => f.enabled).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Category Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border-2 border-transparent">
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-inner ${colorClass}`}>
            <CategoryIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-black capitalize tracking-tight">{category} Capabilities</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">
              <span className="text-emerald-600">{enabledCount}</span> Active / {flags.length} Registered
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none h-9 text-[10px] font-black uppercase tracking-widest gap-2 text-emerald-600 border-2 border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200"
            onClick={() => onBulkEnable(category)}
          >
            <Power className="h-3 w-3" />
            Bulk Enable
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none h-9 text-[10px] font-black uppercase tracking-widest gap-2 text-red-600 border-2 border-red-100 hover:bg-red-50 hover:border-red-200"
            onClick={() => onBulkDisable(category)}
          >
            <PowerOff className="h-3 w-3" />
            Bulk Off
          </Button>
        </div>
      </div>

      {/* Grid */}
      {flags.length === 0 ? (
        <Card className="border-4 border-dashed border-gray-100 dark:border-gray-900 bg-transparent">
          <CardContent className="p-16 text-center">
            <div className="h-16 w-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Blocks className="h-8 w-8 text-muted-foreground/20" />
            </div>
            <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">No Flags Registered</p>
            <p className="text-xs font-bold text-muted-foreground/60 mt-1">Configure this category from the orchestration header.</p>
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
