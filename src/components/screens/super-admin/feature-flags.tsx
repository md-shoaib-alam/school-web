"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Blocks, Star, Crown } from "lucide-react";
import { toast } from "sonner";

// Sub-components
import { FlagHeader } from "./feature-flags/FlagHeader";
import { FlagSummary } from "./feature-flags/FlagSummary";
import { CategoryPanel } from "./feature-flags/CategoryPanel";

// Types
import { FeatureFlag, initialFlags } from "./feature-flags/types";

export function SuperAdminFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("super-admin-feature-flags");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Restore React element icon references matching initialFlags
          return parsed.map((flag: any) => {
            const initial = initialFlags.find(f => f.id === flag.id);
            return {
              ...flag,
              icon: initial?.icon || Blocks
            };
          });
        } catch (e) {
          console.error("Failed to parse saved flags", e);
        }
      }
    }
    return initialFlags;
  });

  // Persisted state updater helper
  const saveFlags = (updatedFlags: FeatureFlag[]) => {
    setFlags(updatedFlags);
    if (typeof window !== "undefined") {
      const clean = updatedFlags.map(({ id, name, description, enabled, rolloutPercentage, targetedPlans, category, notes }) => ({
        id, name, description, enabled, rolloutPercentage, targetedPlans, category, notes
      }));
      localStorage.setItem("super-admin-feature-flags", JSON.stringify(clean));
    }
  };

  const handleToggle = (id: string) => {
    const updated = flags.map((f) => {
      if (f.id !== id) return f;
      const enabled = !f.enabled;
      return {
        ...f,
        enabled,
        rolloutPercentage: enabled
          ? f.rolloutPercentage === 0
            ? 10
            : f.rolloutPercentage
          : 0,
      };
    });
    saveFlags(updated);
  };

  const handleRolloutChange = (id: string, value: number) => {
    const updated = flags.map((f) => (f.id === id ? { ...f, rolloutPercentage: value } : f));
    saveFlags(updated);
  };

  const handleBulkEnable = (category: string) => {
    const updated = flags.map((f) =>
      f.category === category
        ? {
            ...f,
            enabled: true,
            rolloutPercentage: f.rolloutPercentage || 100,
          }
        : f,
    );
    saveFlags(updated);
  };

  const handleBulkDisable = (category: string) => {
    const updated = flags.map((f) =>
      f.category === category
        ? { ...f, enabled: false, rolloutPercentage: 0 }
        : f,
    );
    saveFlags(updated);
  };

  const handleAddFlag = (flag: FeatureFlag) => {
    const updated = [...flags, flag];
    saveFlags(updated);
  };

  const handleNotesChange = (id: string, text: string) => {
    const updated = flags.map(f => f.id === id ? { ...f, notes: text } : f);
    saveFlags(updated);
    toast.success("Plan entitlement notes updated!");
  };

  const getFlagsByCategory = (cat: string) =>
    flags.filter((f) => f.category === cat);

  const totalEnabled = flags.filter((f) => f.enabled).length;
  const totalCount = flags.length;

  return (
    <div className="space-y-6 pb-12">
      <FlagHeader onAddFlag={handleAddFlag} />

      <FlagSummary totalCount={totalCount} totalEnabled={totalEnabled} />

      <Tabs defaultValue="starter" className="w-full">
        <TabsList className="h-10 w-full sm:w-auto bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
          <TabsTrigger value="starter" className="flex-1 sm:flex-none gap-2 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-blue-650 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-xs font-semibold text-xs transition-all">
            <Blocks className="size-3.5" />
            Starter
            <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] text-[9px] px-1.5 rounded bg-blue-100/50 text-blue-700 border-none">
              {getFlagsByCategory("starter").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="standard" className="flex-1 sm:flex-none gap-2 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-emerald-650 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-xs font-semibold text-xs transition-all">
            <Star className="size-3.5" />
            Standard
            <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] text-[9px] px-1.5 rounded bg-emerald-100/50 text-emerald-700 border-none">
              {getFlagsByCategory("standard").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="premium" className="flex-1 sm:flex-none gap-2 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-amber-650 dark:data-[state=active]:text-amber-400 data-[state=active]:shadow-xs font-semibold text-xs transition-all">
            <Crown className="size-3.5" />
            Premium
            <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] text-[9px] px-1.5 rounded bg-amber-100/50 text-amber-700 border-none">
              {getFlagsByCategory("premium").length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="starter">
            <CategoryPanel
              flags={getFlagsByCategory("starter")}
              category="starter"
              onToggle={handleToggle}
              onRolloutChange={handleRolloutChange}
              onBulkEnable={handleBulkEnable}
              onBulkDisable={handleBulkDisable}
              onNotesChange={handleNotesChange}
            />
          </TabsContent>

          <TabsContent value="standard">
            <CategoryPanel
              flags={getFlagsByCategory("standard")}
              category="standard"
              onToggle={handleToggle}
              onRolloutChange={handleRolloutChange}
              onBulkEnable={handleBulkEnable}
              onBulkDisable={handleBulkDisable}
              onNotesChange={handleNotesChange}
            />
          </TabsContent>

          <TabsContent value="premium">
            <CategoryPanel
              flags={getFlagsByCategory("premium")}
              category="premium"
              onToggle={handleToggle}
              onRolloutChange={handleRolloutChange}
              onBulkEnable={handleBulkEnable}
              onBulkDisable={handleBulkDisable}
              onNotesChange={handleNotesChange}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
