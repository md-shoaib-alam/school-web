import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ToggleRight, ToggleLeft } from "lucide-react";
import { FeatureFlag, planBadgeColors } from "./types";

interface FlagCardProps {
  flag: FeatureFlag;
  onToggle: (id: string) => void;
  onRolloutChange: (id: string, value: number) => void;
}

export function FlagCard({
  flag,
  onToggle,
  onRolloutChange,
}: FlagCardProps) {
  const IconComp = flag.icon;

  return (
    <Card
      className={`relative overflow-hidden border-2 transition-all duration-300 rounded-3xl group ${
        flag.enabled
          ? "border-emerald-500/20 bg-white dark:bg-zinc-800 shadow-lg shadow-emerald-500/5"
          : "border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50"
      }`}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <div
              className={`size-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 ${
                flag.enabled
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none rotate-0"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rotate-12"
              }`}
            >
              <IconComp className="size-6" />
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate uppercase tracking-widest">
                {flag.name}
              </h3>
              <p className="text-[11px] font-bold text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                {flag.description}
              </p>
            </div>
          </div>
          <Switch
            checked={flag.enabled}
            onCheckedChange={() => onToggle(flag.id)}
            className="data-[state=checked]:bg-emerald-500 scale-110"
          />
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-5">
          <Badge
            variant="outline"
            className={`text-[9px] font-black uppercase tracking-widest px-2.5 h-6 border-transparent transition-colors ${
              flag.enabled
                ? "bg-emerald-50 text-emerald-700"
                : "bg-zinc-100 text-zinc-500"
            }`}
          >
            {flag.enabled ? (
              <>
                <ToggleRight className="size-3 mr-1.5" /> Live
              </>
            ) : (
              <>
                <ToggleLeft className="size-3 mr-1.5" /> Off
              </>
            )}
          </Badge>
          {flag.targetedPlans.map((plan) => (
            <Badge
              key={plan}
              variant="outline"
              className={`text-[9px] font-black uppercase tracking-widest px-2.5 h-6 border-transparent ${planBadgeColors[plan] || planBadgeColors["All"]}`}
            >
              {plan}
            </Badge>
          ))}
        </div>

        {/* Rollout Controls */}
        <div className="mt-6 space-y-3 p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 border-2 border-transparent group-hover:border-emerald-500/10 transition-all">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phased Rollout</Label>
            <span
              className={`text-xs font-black tabular-nums ${
                flag.enabled
                  ? "text-emerald-600"
                  : "text-zinc-400"
              }`}
            >
              {flag.rolloutPercentage}%
            </span>
          </div>
          <Slider
            value={[flag.rolloutPercentage]}
            onValueChange={([v]) => onRolloutChange(flag.id, v)}
            disabled={!flag.enabled}
            max={100}
            step={5}
            className={`w-full ${flag.enabled ? "[&_[data-slot=slider-range]]:bg-emerald-500" : ""}`}
          />
          <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
            <span>None</span>
            <span>Global</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
