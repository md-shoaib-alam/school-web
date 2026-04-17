"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Addon } from "./types";

interface AddonCardProps {
  addon: Addon;
  isAdded: boolean;
  isLoading: boolean;
  onAdd: (addon: Addon) => void;
}

export function AddonCard({ addon, isAdded, isLoading, onAdd }: AddonCardProps) {
  return (
    <Card className="rounded-xl border-gray-200 dark:border-gray-700 hover:border-amber-200 dark:hover:border-amber-800 hover:shadow-md transition-all">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            {addon.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                {addon.name}
              </h4>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                ₹{addon.price}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {addon.description}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {addon.features.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-full px-2 py-0.5"
                >
                  {f}
                </span>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className={`w-full mt-4 rounded-lg text-xs ${
                isAdded
                  ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                  : "border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30"
              }`}
              onClick={() => onAdd(addon)}
              disabled={isAdded || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : isAdded ? (
                <CheckCircle2 className="h-3 w-3 mr-1" />
              ) : null}
              {isAdded ? "Added" : "Add to Plan"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
