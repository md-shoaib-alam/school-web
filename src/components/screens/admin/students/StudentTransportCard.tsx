"use client";

import {
  Bus,
  Pencil,
  ChevronUp,
  ChevronDown,
  Check,
  Plus,
  Info,
  MapPin,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StudentTransportCardProps {
  editing: boolean;
  collapsed: boolean;
  saving: boolean;
  canEdit?: boolean;
  transport: any;
  transportRoute: any;
  routes: any[];
  routeStops: any[];
  transportEnabled: boolean;
  routeId: string;
  pickupPoint: string;
  onTransportEnabledChange: (value: boolean) => void;
  onRouteChange: (routeId: string) => void;
  onPickupPointChange: (value: string) => void;
  onEditSection: (section: string) => void;
  onToggleCollapse: (section: string) => void;
  onCancel: () => void;
  onSave: (sectionName?: string) => void;
  onAddTransport: () => void;
}

export function StudentTransportCard({
  editing,
  collapsed,
  saving,
  canEdit,
  transport,
  transportRoute,
  routes,
  routeStops,
  transportEnabled,
  routeId,
  pickupPoint,
  onTransportEnabledChange,
  onRouteChange,
  onPickupPointChange,
  onEditSection,
  onToggleCollapse,
  onCancel,
  onSave,
  onAddTransport,
}: StudentTransportCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all">
      {/* ────────────────────────────────────────────────────────── */}
      {/* CARD 5: Transport Details                                   */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100 dark:border-zinc-800/60">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm sm:text-base">
          <Bus className="size-4 text-emerald-600" />
          Transport Details
        </div>

        <div className="flex items-center gap-2">
          {editing ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onCancel}
                disabled={saving}
                className="h-8 px-3 text-xs rounded-lg font-medium text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => onSave("Transport Details")}
                disabled={saving}
                className="h-8 px-3 text-xs rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
              >
                {saving ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3.5" />}
                Save
              </Button>
            </div>
          ) : (
            canEdit && (
              <button
                onClick={() => onEditSection("transport")}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <Pencil className="size-3" />
                Edit
              </button>
            )
          )}
          <button
            onClick={() => onToggleCollapse("transport")}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
            aria-label="Toggle section"
          >
            {collapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        editing ? (
          /* EDIT FORM */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <Switch
                  checked={transportEnabled}
                  onCheckedChange={(checked) => onTransportEnabledChange(checked)}
                />
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">Use Transport Service</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">Enable if this student uses school transport</p>
                </div>
              </div>

              {!transportEnabled && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-xs border border-emerald-200/60 dark:border-emerald-900/60">
                  <Info className="size-4 text-emerald-600 shrink-0" />
                  Transport details will be available after enabling this option.
                </div>
              )}
            </div>

            {transportEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 animate-in fade-in-50 duration-200">
                {/* Select Route */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Assigned Route <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={routeId}
                    onValueChange={(val) => onRouteChange(val)}
                  >
                    <SelectTrigger className="h-9 text-xs rounded-xl bg-slate-50/50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700">
                      <SelectValue placeholder="Select Route" />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.map((r: any) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name} (₹{r.fee || 0})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Pickup Point */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Pickup Point <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={pickupPoint}
                    onValueChange={(val) => onPickupPointChange(val)}
                    disabled={!routeId}
                  >
                    <SelectTrigger className="h-9 text-xs rounded-xl bg-slate-50/50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700">
                      <SelectValue placeholder={routeId ? "Choose pickup point" : "Select a route first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {routeStops.map((stop: any, idx: number) => (
                        <SelectItem key={idx} value={stop.name}>
                          {stop.name} {stop.fee ? `(₹${stop.fee})` : ""}
                        </SelectItem>
                      ))}
                      {routeStops.length === 0 && (
                        <SelectItem value="Main Gate">Main Gate</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* VIEW MODE */
          transport ? (
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/20 space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Bus className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Service Status</p>
                  <p className="text-sm font-bold capitalize">Active Subscription</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
                <div>
                  <p className="text-slate-400 dark:text-zinc-500 font-medium uppercase text-[10px] tracking-wide">Assigned Route</p>
                  <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">
                    {transportRoute ? transportRoute.name : "Assigned"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 dark:text-zinc-500 font-medium uppercase text-[10px] tracking-wide">Pickup Point</p>
                  <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5 flex items-center gap-1">
                    <MapPin className="size-3 text-emerald-600" />
                    {transport.pickupPoint || "–"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-800">
              <div className="flex items-center gap-3.5">
                <div className="size-10 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 flex items-center justify-center text-slate-400 shrink-0 shadow-sm">
                  <Bus className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-zinc-200 text-sm">No transport details added</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">This student is not assigned to any transport route.</p>
                </div>
              </div>
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddTransport}
                  className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-800 dark:text-emerald-400 font-semibold gap-1.5 rounded-lg shrink-0"
                >
                  <Plus className="size-4" />
                  Add Transport
                </Button>
              )}
            </div>
          )
        )
      )}
    </div>
  );
}
