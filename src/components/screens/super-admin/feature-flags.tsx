"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Blocks, Crown, Gem, FlaskConical } from "lucide-react";

// Sub-components
import { FlagHeader } from "./feature-flags/FlagHeader";
import { FlagSummary } from "./feature-flags/FlagSummary";
import { CategoryPanel } from "./feature-flags/CategoryPanel";

// Types
import { FeatureFlag, initialFlags } from "./feature-flags/types";

export function SuperAdminFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>(initialFlags);

  const handleToggle = (id: string) => {
    setFlags((prev) =>
      prev.map((f) => {
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
      }),
    );
  };

  const handleRolloutChange = (id: string, value: number) => {
    setFlags((prev) =>
      prev.map((f) => (f.id === id ? { ...f, rolloutPercentage: value } : f)),
    );
  };

  const handleBulkEnable = (category: string) => {
    setFlags((prev) =>
      prev.map((f) =>
        f.category === category
          ? {
              ...f,
              enabled: true,
              rolloutPercentage: f.rolloutPercentage || 100,
            }
          : f,
      ),
    );
  };

  const handleBulkDisable = (category: string) => {
    setFlags((prev) =>
      prev.map((f) =>
        f.category === category
          ? { ...f, enabled: false, rolloutPercentage: 0 }
          : f,
      ),
    );
  };

  const handleAddFlag = (flag: FeatureFlag) => {
    setFlags((prev) => [...prev, flag]);
  };

  const getFlagsByCategory = (cat: string) =>
    flags.filter((f) => f.category === cat);

  const totalEnabled = flags.filter((f) => f.enabled).length;
  const totalCount = flags.length;

  return (
    <div className="space-y-6 pb-12">
      <FlagHeader onAddFlag={handleAddFlag} />

      <FlagSummary totalCount={totalCount} totalEnabled={totalEnabled} />

      <Tabs defaultValue="core" className="w-full">
        <TabsList className="h-12 w-full sm:w-auto bg-white dark:bg-gray-800 rounded-2xl p-1 shadow-sm border-2 border-transparent">
          <TabsTrigger value="core" className="flex-1 sm:flex-none gap-2 rounded-xl data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 font-black text-[10px] uppercase tracking-widest transition-all">
            <Blocks className="h-3.5 w-3.5" />
            Core
            <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] text-[8px] font-black px-1.5 rounded-lg border-none bg-teal-100/50 text-teal-700">
              {getFlagsByCategory("core").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="premium" className="flex-1 sm:flex-none gap-2 rounded-xl data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 font-black text-[10px] uppercase tracking-widest transition-all">
            <Crown className="h-3.5 w-3.5" />
            Premium
            <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] text-[8px] font-black px-1.5 rounded-lg border-none bg-amber-100/50 text-amber-700">
              {getFlagsByCategory("premium").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="enterprise" className="flex-1 sm:flex-none gap-2 rounded-xl data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 font-black text-[10px] uppercase tracking-widest transition-all">
            <Gem className="h-3.5 w-3.5" />
            Enterprise
            <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] text-[8px] font-black px-1.5 rounded-lg border-none bg-purple-100/50 text-purple-700">
              {getFlagsByCategory("enterprise").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="beta" className="flex-1 sm:flex-none gap-2 rounded-xl data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 font-black text-[10px] uppercase tracking-widest transition-all">
            <FlaskConical className="h-3.5 w-3.5" />
            Beta
            <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] text-[8px] font-black px-1.5 rounded-lg border-none bg-teal-100/50 text-teal-700">
              {getFlagsByCategory("beta").length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="core">
            <CategoryPanel
              flags={getFlagsByCategory("core")}
              category="core"
              onToggle={handleToggle}
              onRolloutChange={handleRolloutChange}
              onBulkEnable={handleBulkEnable}
              onBulkDisable={handleBulkDisable}
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
            />
          </TabsContent>

          <TabsContent value="enterprise">
            <CategoryPanel
              flags={getFlagsByCategory("enterprise")}
              category="enterprise"
              onToggle={handleToggle}
              onRolloutChange={handleRolloutChange}
              onBulkEnable={handleBulkEnable}
              onBulkDisable={handleBulkDisable}
            />
          </TabsContent>

          <TabsContent value="beta">
            <CategoryPanel
              flags={getFlagsByCategory("beta")}
              category="beta"
              onToggle={handleToggle}
              onRolloutChange={handleRolloutChange}
              onBulkEnable={handleBulkEnable}
              onBulkDisable={handleBulkDisable}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
