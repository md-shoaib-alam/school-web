import { Blocks } from "lucide-react";
import { NewFlagDialog } from "./NewFlagDialog";
import { FeatureFlag } from "./types";

interface FlagHeaderProps {
  onAddFlag: (flag: FeatureFlag) => void;
}

export function FlagHeader({ onAddFlag }: FlagHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
            <Blocks className="h-6 w-6 text-teal-600 dark:text-teal-400" />
          </div>
          Feature Orchestration
        </h1>
        <p className="text-muted-foreground text-sm font-bold mt-1">
          Control global feature rollouts and plan-based access across platform tenants
        </p>
      </div>
      <NewFlagDialog onAdd={onAddFlag} />
    </div>
  );
}
