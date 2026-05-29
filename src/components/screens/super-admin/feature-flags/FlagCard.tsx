import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ToggleRight, ToggleLeft, ClipboardList, Edit, Save } from "lucide-react";
import { FeatureFlag, planBadgeColors } from "./types";

interface FlagCardProps {
  flag: FeatureFlag;
  onToggle: (id: string) => void;
  onRolloutChange: (id: string, value: number) => void;
  onNotesChange?: (id: string, notes: string) => void;
}

export function FlagCard({
  flag,
  onToggle,
  onRolloutChange,
  onNotesChange,
}: FlagCardProps) {
  const IconComp = flag.icon;

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [localNotes, setLocalNotes] = useState(flag.notes || "");

  useEffect(() => {
    setLocalNotes(flag.notes || "");
  }, [flag.notes]);

  return (
    <Card
      className={`relative overflow-hidden border transition-colors rounded-lg bg-white dark:bg-zinc-900 shadow-xs ${
        flag.enabled
          ? "border-emerald-500/40 dark:border-emerald-500/30"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={`size-10 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                flag.enabled
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-250 dark:border-emerald-800"
                  : "bg-zinc-50 dark:bg-zinc-950 text-zinc-400 border-zinc-200 dark:border-zinc-850"
              }`}
            >
              <IconComp className="size-5" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5 text-left">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {flag.name}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                {flag.description}
              </p>
            </div>
          </div>
          <Switch
            checked={flag.enabled}
            onCheckedChange={() => onToggle(flag.id)}
            className="data-[state=checked]:bg-emerald-500 scale-100"
          />
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <Badge
            variant="outline"
            className={`text-[10px] font-medium px-2 py-0.5 rounded-md border transition-colors ${
              flag.enabled
                ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                : "bg-zinc-100 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
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
              className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${planBadgeColors[plan] || planBadgeColors["All"]}`}
            >
              {plan}
            </Badge>
          ))}
        </div>

        {/* Rollout Controls */}
        <div className="mt-5 space-y-2.5 p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Phased Rollout</Label>
            <span
              className={`text-xs font-bold tabular-nums ${
                flag.enabled
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-400 dark:text-zinc-650"
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
          <div className="flex items-center justify-between text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
            <span>None</span>
            <span>Global</span>
          </div>
        </div>

        {/* Custom Notes / Plan Details */}
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-550 dark:text-zinc-400 flex items-center gap-1.5">
              <ClipboardList className="size-3.5 text-zinc-400" /> Plan Notes &amp; Entitlements
            </span>
            <button 
              onClick={() => {
                if (isEditingNotes) {
                  onNotesChange?.(flag.id, localNotes);
                }
                setIsEditingNotes(!isEditingNotes);
              }}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              {isEditingNotes ? (
                <>
                  <Save className="size-2.5 mr-1" /> Save
                </>
              ) : (
                <>
                  <Edit className="size-2.5 mr-1" /> Edit
                </>
              )}
            </button>
          </div>
          {isEditingNotes ? (
            <textarea
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              placeholder="e.g. Starter Pack: Includes AI grading up to 10 essays/month. Standard: 50 essays."
              className="w-full mt-2 p-2.5 text-xs rounded-lg bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-teal-500/20 focus:border-teal-500 font-medium leading-relaxed min-h-[65px] resize-none"
            />
          ) : (
            <p className="text-xs mt-2 font-normal text-zinc-655 dark:text-zinc-400 leading-relaxed italic bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-150 dark:border-zinc-850 text-left">
              {flag.notes || "No notes set yet. Click Edit to define custom limits (e.g. what's included in starter packs)."}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

