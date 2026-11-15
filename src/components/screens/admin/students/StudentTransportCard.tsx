"use client";

import { Bus, Plus, Info, MapPin } from "lucide-react";
import { ProfileSection } from "@/components/ui/profile-section";
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
  dimmed?: boolean;
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
  dimmed,
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
    <ProfileSection
      icon={Bus}
      title="Transport Details"
      editing={editing}
      collapsed={collapsed}
      saving={saving}
      canEdit={canEdit}
      dimmed={dimmed}
      onEdit={() => onEditSection("transport")}
      onCancel={onCancel}
      onSave={() => onSave("Transport Details")}
      onToggleCollapse={() => onToggleCollapse("transport")}
      view={
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
                <p data-fade className="text-muted-foreground font-medium uppercase text-[10px] tracking-wide">Assigned Route</p>
                <p data-travel="route" className="font-semibold text-foreground mt-0.5">
                  {transportRoute ? transportRoute.name : "Assigned"}
                </p>
              </div>
              <div>
                <p data-fade className="text-muted-foreground font-medium uppercase text-[10px] tracking-wide">Pickup Point</p>
                <p data-travel="pickup" className="font-semibold text-foreground mt-0.5 flex items-center gap-1">
                  <MapPin className="size-3 text-emerald-600" />
                  {transport.pickupPoint || "–"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-muted border ">
            <div className="flex items-center gap-3.5">
              <div className="size-10 rounded-xl bg-white border  flex items-center justify-center text-muted-foreground shrink-0 shadow-sm">
                <Bus className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">No transport details added</p>
                <p className="text-xs text-muted-foreground">This student is not assigned to any transport route.</p>
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
      }
      form={
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted border ">
            <div className="flex items-center gap-3">
              <Switch
                checked={transportEnabled}
                onCheckedChange={(checked) => onTransportEnabledChange(checked)}
              />
              <div>
                <p className="text-xs font-semibold text-foreground">Use Transport Service</p>
                <p className="text-[11px] text-muted-foreground">Enable if this student uses school transport</p>
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
                <Label data-fade className="text-xs font-semibold text-foreground">
                  Assigned Route <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={routeId}
                  onValueChange={(val) => onRouteChange(val)}
                >
                  <SelectTrigger data-travel="route" className="h-9 text-xs rounded-xl bg-muted ">
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
                <Label data-fade className="text-xs font-semibold text-foreground">
                  Pickup Point <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={pickupPoint}
                  onValueChange={(val) => onPickupPointChange(val)}
                  disabled={!routeId}
                >
                  <SelectTrigger data-travel="pickup" className="h-9 text-xs rounded-xl bg-muted ">
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
      }
    />
  );
}
