"use client";

import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Shield } from "lucide-react";
import {
  COLOR_PRESETS,
  PERMISSION_MODULES,
  PERMISSION_ACTIONS,
  ACTION_LABELS,
} from "./constants";
import type { RoleRecord } from "./types";

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRole: RoleRecord | null;
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  color: string;
  setColor: (v: string) => void;
  permissions: Record<string, string[]>;
  setPermissions: (v: any) => void;
  saving: boolean;
  onSave: () => void;
}

export function RoleDialog({
  open,
  onOpenChange,
  editingRole,
  name,
  setName,
  description,
  setDescription,
  color,
  setColor,
  permissions,
  setPermissions,
  saving,
  onSave,
}: RoleDialogProps) {
  const togglePermission = (module: string, action: string) => {
    const current = permissions[module] || [];
    const updated = current.includes(action)
      ? current.filter((a) => a !== action)
      : [...current, action];
    setPermissions({ ...permissions, [module]: updated });
  };

  const totalPermissions = Object.values(permissions).flat().length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            {editingRole ? `Edit "${editingRole.name}"` : "Create New Role"}
          </DialogTitle>
          <DialogDescription>
            {editingRole
              ? "Update role details and permissions"
              : "Define a new role with specific permissions"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label>Role Name *</Label>
            <Input
              placeholder="e.g. Finance Manager"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Brief description of this role..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? c : "transparent",
                  }}
                  onClick={() => setColor(c)}
                >
                  {color === c && <span className="text-white text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Permissions</Label>
              <Badge variant="outline" className="text-xs">
                {totalPermissions} granted
              </Badge>
            </div>

            <div className="grid grid-cols-[1fr_repeat(4,_minmax(0,_1fr))] gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden border dark:border-gray-700">
              <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
                Module
              </div>
              {PERMISSION_ACTIONS.map((action) => (
                <div
                  key={action}
                  className="bg-gray-100 dark:bg-gray-800 px-2 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 text-center"
                >
                  {ACTION_LABELS[action]}
                </div>
              ))}

              {PERMISSION_MODULES.map((mod, idx) => (
                <Fragment key={mod.key}>
                  <div
                    className={`flex items-center gap-2 px-3 py-2.5 text-sm ${idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-900/50"}`}
                  >
                    <span className="mr-1">{mod.icon}</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {mod.label}
                    </span>
                  </div>
                  {PERMISSION_ACTIONS.map((action) => (
                    <div
                      key={action}
                      className={`flex items-center justify-center py-2.5 ${idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-900/50"}`}
                    >
                      <Checkbox
                        checked={(permissions[mod.key] || []).includes(action)}
                        onCheckedChange={() => togglePermission(mod.key, action)}
                      />
                    </div>
                  ))}
                </Fragment>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  const all: Record<string, string[]> = {};
                  PERMISSION_MODULES.forEach((m) => {
                    all[m.key] = ["view", "create", "edit", "delete"];
                  });
                  setPermissions(all);
                }}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  const viewOnly: Record<string, string[]> = {};
                  PERMISSION_MODULES.forEach((m) => {
                    viewOnly[m.key] = ["view"];
                  });
                  setPermissions(viewOnly);
                }}
              >
                View Only
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setPermissions({})}
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={saving || !name.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {editingRole ? "Update Role" : "Create Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
