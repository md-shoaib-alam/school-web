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

const ROLE_TEMPLATES = [
  {
    name: "Finance Manager",
    description: "Full control over fees, collections, student payments, and expenses.",
    color: "#f59e0b",
    permissions: {
      fees: ["view", "create", "edit", "delete"],
      expenses: ["view", "create", "edit", "delete"],
      students: ["view"],
      parents: ["view"],
      classes: ["view"],
      reports: ["view", "create"]
    }
  },
  {
    name: "Academic Coordinator",
    description: "Academic lead managing classes, subjects, exams, grades, and timetables.",
    color: "#10b981",
    permissions: {
      classes: ["view", "create", "edit", "delete"],
      subjects: ["view", "create", "edit", "delete"],
      exams: ["view", "create", "edit", "delete"],
      grades: ["view", "create", "edit", "delete"],
      certificates: ["view", "create", "edit", "delete"],
      timetable: ["view", "create", "edit", "delete"],
      promotions: ["view", "create", "edit", "delete"],
      notices: ["view", "create", "edit", "delete"]
    }
  },
  {
    name: "Registrar / Admin Staff",
    description: "Manages student and parent admissions, attendance logs, and leaves.",
    color: "#3b82f6",
    permissions: {
      students: ["view", "create", "edit", "delete"],
      parents: ["view", "create", "edit", "delete"],
      attendance: ["view", "create", "edit", "delete"],
      tickets: ["view", "create", "edit", "delete"],
      leaves: ["view", "create", "edit", "delete"],
      classes: ["view"]
    }
  },
  {
    name: "Receptionist / Office Clerk",
    description: "Handles parent inquiries, notices, calendar events, and support tickets.",
    color: "#06b6d4",
    permissions: {
      notices: ["view", "create", "edit", "delete"],
      calendar: ["view", "create", "edit", "delete"],
      tickets: ["view", "create", "edit", "delete"],
      parents: ["view"],
      students: ["view"]
    }
  }
];

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
            <Shield className="size-5 text-emerald-600" />
            {editingRole ? `Edit "${editingRole.name}"` : "Create New Role"}
          </DialogTitle>
          <DialogDescription>
            {editingRole
              ? "Update role details and permissions"
              : "Define a new role with specific permissions"}
          </DialogDescription>
        </DialogHeader>

        {!editingRole && (
          <div className="space-y-2 mb-2 bg-zinc-50 dark:bg-zinc-800/40 p-3 sm:p-4 rounded-xl border border-zinc-200 dark:border-zinc-700/50">
            <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">
              Quick Role Templates
            </Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ROLE_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.name}
                  type="button"
                  onClick={() => {
                    setName(tmpl.name);
                    setDescription(tmpl.description);
                    setColor(tmpl.color);
                    setPermissions(tmpl.permissions);
                  }}
                  className="flex flex-col items-start text-left p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700/50 hover:border-emerald-500/40 hover:bg-emerald-500/5 bg-white dark:bg-zinc-900 transition-all group"
                >
                  <span className="text-xs font-bold truncate w-full group-hover:text-emerald-500 transition-colors">
                    {tmpl.name}
                  </span>
                  <span className="text-[9px] text-zinc-500 line-clamp-2 mt-1 leading-snug">
                    {tmpl.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

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
                  type="button"
                  className="size-8 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
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

            <div className="grid grid-cols-[1fr_repeat(4,_minmax(0,_1fr))] gap-px bg-zinc-200 dark:bg-zinc-700 rounded-lg overflow-hidden border dark:border-zinc-700">
              <div className="bg-zinc-100 dark:bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Module
              </div>
              {PERMISSION_ACTIONS.map((action) => (
                <div
                  key={action}
                  className="bg-zinc-100 dark:bg-zinc-800 p-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 text-center"
                >
                  {ACTION_LABELS[action]}
                </div>
              ))}

              {PERMISSION_MODULES.map((mod, idx) => (
                <Fragment key={mod.key}>
                  <div
                    className={`flex items-center gap-2 px-3 py-2.5 text-sm ${idx % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-zinc-50 dark:bg-zinc-900/50"}`}
                  >
                    <span className="mr-1">{mod.icon}</span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {mod.label}
                    </span>
                  </div>
                  {PERMISSION_ACTIONS.map((action) => (
                    <div
                      key={action}
                      className={`flex items-center justify-center py-2.5 ${idx % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-zinc-50 dark:bg-zinc-900/50"}`}
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
            {saving && <Loader2 className="size-4 mr-2 animate-spin" />}
            {editingRole ? "Update Role" : "Create Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
