import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Blocks } from "lucide-react";

interface FlagSummaryProps {
  totalCount: number;
  totalEnabled: number;
}

export function FlagSummary({ totalCount, totalEnabled }: FlagSummaryProps) {
  return (
    <Card className="border-none shadow-sm bg-white dark:bg-zinc-800 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3 group">
            <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <Check className="size-5" />
            </div>
            <div>
              <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 leading-none">
                {totalEnabled}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Live Flags</p>
            </div>
          </div>
          
          <div className="h-10 w-px bg-zinc-100 dark:bg-zinc-700" />
          
          <div className="flex items-center gap-3 group">
            <div className="size-10 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <X className="size-5" />
            </div>
            <div>
              <p className="text-lg font-black text-red-700 dark:text-red-400 leading-none">
                {totalCount - totalEnabled}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Inactive</p>
            </div>
          </div>
          
          <div className="h-10 w-px bg-zinc-100 dark:bg-zinc-700" />
          
          <div className="flex items-center gap-3 group">
            <div className="size-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <Blocks className="size-5" />
            </div>
            <div>
              <p className="text-lg font-black text-teal-700 dark:text-teal-400 leading-none">
                {totalCount}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Total Logic</p>
            </div>
          </div>

          <div className="flex-1" />
          
          <div className="flex items-center gap-4 bg-zinc-50/50 dark:bg-zinc-900/50 px-4 py-2 rounded-xl">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              Active
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <div className="size-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
              Off
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
