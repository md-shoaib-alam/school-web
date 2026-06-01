import { Blocks } from "lucide-react";
import { NewFlagDialog } from "./NewFlagDialog";
import { FeatureFlag } from "./types";

interface FlagHeaderProps {
  onAddFlag: (flag: FeatureFlag) => void;
}

export function FlagHeader({ onAddFlag }: FlagHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
          <div className="size-10 rounded-md bg-teal-50 dark:bg-teal-950/20 flex items-center justify-center border border-teal-100 dark:border-teal-900/50">
            <Blocks className="size-5.5 text-teal-600 dark:text-teal-400" />
          </div>
          Feature Orchestration
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 leading-relaxed">
          Control global feature rollouts and plan-based access across platform tenants.
        </p>
      </div>
      <NewFlagDialog onAdd={onAddFlag} />
    </div>
  );
}

