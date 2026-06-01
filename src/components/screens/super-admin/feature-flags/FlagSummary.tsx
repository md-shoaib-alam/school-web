import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Blocks } from "lucide-react";

interface FlagSummaryProps {
  totalCount: number;
  totalEnabled: number;
}

export function FlagSummary({ totalCount, totalEnabled }: FlagSummaryProps) {
  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 shadow-xs bg-white dark:bg-zinc-900 overflow-hidden rounded-lg">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
              <Check className="size-4.5" />
            </div>
            <div className="text-left">
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-450 leading-none">
                {totalEnabled}
              </p>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-1">Live Flags</p>
            </div>
          </div>
          
          <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />
          
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-md bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 flex items-center justify-center border border-zinc-200 dark:border-zinc-800/60">
              <X className="size-4.5" />
            </div>
            <div className="text-left">
              <p className="text-lg font-bold text-zinc-650 dark:text-zinc-300 leading-none">
                {totalCount - totalEnabled}
              </p>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-1">Inactive</p>
            </div>
          </div>
          
          <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />
          
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-md bg-teal-55/60 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-100 dark:border-teal-900/50">
              <Blocks className="size-4.5" />
            </div>
            <div className="text-left">
              <p className="text-lg font-bold text-teal-600 dark:text-teal-400 leading-none">
                {totalCount}
              </p>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-1">Total Logic</p>
            </div>
          </div>

          <div className="flex-1" />
          
          <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-1.5 rounded-lg border border-zinc-150 dark:border-zinc-850">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <div className="size-2 rounded-full bg-emerald-500" />
              Active
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <div className="size-2 rounded-full bg-zinc-300 dark:bg-zinc-650" />
              Off
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
