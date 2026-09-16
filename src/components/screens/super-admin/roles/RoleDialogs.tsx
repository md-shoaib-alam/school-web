import { useState, useEffect, Fragment } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Search, 
  Loader2, 
  UserPlus, 
  UserMinus, 
  Users,
  CheckCircle2,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  PlatformRoleRecord, 
  AssignedUser, 
  AvailableUser, 
  PLATFORM_MODULES, 
  PERMISSION_ACTIONS, 
  ACTION_LABELS, 
  COLOR_PRESETS,
  getInitials 
} from "./types";

interface RoleDialogsProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  editingRole: PlatformRoleRecord | null;
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  color: string;
  setColor: (v: string) => void;
  permissions: Record<string, string[]>;
  togglePermission: (mod: string, action: string) => void;
  onSave: () => void;
  saving: boolean;

  // Assign Dialog
  assignDialogOpen: boolean;
  setAssignDialogOpen: (open: boolean) => void;
  assigningRole: PlatformRoleRecord | null;
  assignedUsers: AssignedUser[];
  availableUsers: AvailableUser[];
  assignLoading: boolean;
  assignSaving: boolean;
  userSearch: string;
  setUserSearch: (v: string) => void;
  onAssign: (userId: string) => void;
  onUnassign: (userId: string) => void;
}

export function RoleDialogs({
  dialogOpen,
  setDialogOpen,
  editingRole,
  name,
  setName,
  description,
  setDescription,
  color,
  setColor,
  permissions,
  togglePermission,
  onSave,
  saving,

  assignDialogOpen,
  setAssignDialogOpen,
  assigningRole,
  assignedUsers,
  availableUsers,
  assignLoading,
  assignSaving,
  userSearch,
  setUserSearch,
  onAssign,
  onUnassign,
}: RoleDialogsProps) {
  const filteredAvailable = availableUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()),
  );

  return (
    <Fragment>
      {/* Create/Edit Role Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-0 border border-border bg-card shadow-2xl">
          <DialogHeader className="p-5 pb-3 border-b border-border">
            <DialogTitle className="flex items-center gap-2.5 text-base font-semibold text-foreground">
              <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100/80 dark:border-blue-900/40 flex items-center justify-center shrink-0">
                <Shield className="size-4" />
              </div>
              <span>{editingRole ? `Edit "${editingRole.name}"` : "Create New Platform Role"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              {editingRole
                ? "Update platform role details and granular module permissions"
                : "Define a new role with platform-level permissions for staff members"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left Column: Role Name & Description */}
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Role Name *</Label>
                  <Input
                    placeholder="e.g. Senior Moderator"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl h-8.5 text-xs bg-card border-border placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Description</Label>
                  <Textarea
                    placeholder="What can users with this role do?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="rounded-xl text-xs bg-card border-border resize-none placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              
              {/* Right Column: Live Badge Preview & Clean Swatches */}
              <div className="space-y-2.5">
                <div>
                  <Label className="text-xs font-semibold text-foreground">Live Role Preview</Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Real-time preview of badge and color</p>
                </div>

                {/* Preview Box */}
                <div className="p-3 rounded-xl border border-border bg-muted/25 flex items-center gap-3 shadow-2xs">
                  <div
                    className="size-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs transition-colors"
                    style={{ backgroundColor: color }}
                  >
                    <Shield className="size-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-foreground truncate">
                        {name.trim() || "Untitled Role"}
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-muted text-muted-foreground border border-border">
                        {editingRole ? "Custom" : "New"}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40 flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {description.trim() || "Role description will appear here"}
                    </p>
                  </div>
                </div>

                {/* Accent Color Palette */}
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-foreground">Accent Color</span>
                    <span className="text-[11px] font-mono text-muted-foreground uppercase">{color}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap p-2 rounded-xl bg-muted/30 border border-border">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={cn(
                          "size-6 sm:size-6.5 rounded-full transition-all flex items-center justify-center cursor-pointer",
                          color.toLowerCase() === c.toLowerCase()
                            ? "ring-2 ring-offset-2 ring-blue-500 scale-110 shadow-xs"
                            : "hover:scale-105 opacity-85 hover:opacity-100"
                        )}
                        style={{ backgroundColor: c }}
                        onClick={() => setColor(c)}
                        title={c}
                      >
                        {color.toLowerCase() === c.toLowerCase() && (
                          <Check className="size-3 text-white stroke-[3]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  Permission Matrix
                </Label>
                <Badge variant="outline" className="text-[11px] font-semibold">
                  {Object.values(permissions).flat().length} Actions Selected
                </Badge>
              </div>

              <div className="rounded-xl border border-border overflow-hidden shadow-2xs">
                <div className="grid grid-cols-5 bg-muted/60 p-2.5 border-b border-border">
                  <div className="col-span-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Module</div>
                  {PERMISSION_ACTIONS.map((action) => (
                    <div key={action} className="text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {ACTION_LABELS[action]}
                    </div>
                  ))}
                </div>
                <div className="divide-y divide-border max-h-[260px] overflow-y-auto">
                  {PLATFORM_MODULES.map((module) => (
                    <div key={module.key} className="grid grid-cols-5 p-2.5 hover:bg-muted/30 transition-colors items-center">
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                          {module.icon}
                        </div>
                        <span className="text-xs font-medium text-foreground truncate">{module.label}</span>
                      </div>
                      {PERMISSION_ACTIONS.map((action) => (
                        <div key={action} className="flex items-center justify-center">
                          <Checkbox
                            checked={(permissions[module.key] || []).includes(action)}
                            onCheckedChange={() => togglePermission(module.key, action)}
                            className="rounded-md size-4 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 bg-muted/30 border-t border-border flex items-center justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)} 
              disabled={saving} 
              className="rounded-xl px-4 h-8.5 text-xs font-medium border-border"
            >
              Cancel
            </Button>
            <Button
              onClick={onSave}
              disabled={saving}
              className="rounded-xl px-4 h-8.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs min-w-[110px]"
            >
              {saving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : editingRole ? (
                "Update Role"
              ) : (
                "Create Role"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Assignment Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-0 border border-border bg-card shadow-2xl">
          <DialogHeader className="p-5 pb-3 border-b border-border">
            <DialogTitle className="flex items-center gap-2.5 text-base font-semibold text-foreground">
              <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100/80 dark:border-blue-900/40 flex items-center justify-center shrink-0">
                <Users className="size-4" />
              </div>
              <span>Assign Users to &quot;{assigningRole?.name}&quot;</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Select platform administrators or staff to assign or unassign this role.
            </DialogDescription>
          </DialogHeader>

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4.5 min-h-[380px]">
            {/* Left: Available Users */}
            <div className="space-y-3 flex flex-col">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-foreground">Available Users</Label>
                <Badge variant="secondary" className="text-[10px] font-semibold">{filteredAvailable.length} candidates</Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-8 rounded-xl h-8.5 text-xs bg-card border-border"
                />
              </div>

              <div className="flex-1 rounded-xl border border-border overflow-hidden bg-muted/20">
                <div className="h-[280px] overflow-y-auto p-2 space-y-1.5">
                  {assignLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="size-5 animate-spin text-blue-600" />
                    </div>
                  ) : filteredAvailable.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <Search className="size-7 text-muted-foreground/40 mb-1.5" />
                      <p className="text-xs font-medium text-muted-foreground">No users found</p>
                    </div>
                  ) : (
                    filteredAvailable.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 rounded-lg bg-card border border-border hover:border-blue-200 dark:hover:border-blue-800 shadow-2xs transition-all group">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar className="size-7 border border-border">
                            <AvatarFallback className="text-[10px] font-semibold bg-blue-50 text-blue-600">{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate leading-tight">{user.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
                          disabled={assignSaving}
                          onClick={() => onAssign(user.id)}
                        >
                          <UserPlus className="size-3.5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right: Assigned Users */}
            <div className="space-y-3 flex flex-col">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-foreground">Currently Assigned</Label>
                <Badge className="text-[10px] font-semibold bg-blue-600 text-white">{assignedUsers.length} Users</Badge>
              </div>

              <div className="flex-1 rounded-xl border border-blue-100 dark:border-blue-900/50 overflow-hidden bg-blue-50/20 dark:bg-blue-950/10">
                <div className="h-[320px] overflow-y-auto p-2 space-y-1.5">
                  {assignLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="size-5 animate-spin text-blue-600" />
                    </div>
                  ) : assignedUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <Users className="size-7 text-blue-200 dark:text-blue-900 mb-1.5" />
                      <p className="text-xs font-medium text-muted-foreground">No users assigned yet</p>
                    </div>
                  ) : (
                    assignedUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 rounded-lg bg-card border border-border shadow-2xs group">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar className="size-7 border border-border">
                            <AvatarFallback className="text-[10px] font-semibold bg-blue-600 text-white">{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate leading-tight">{user.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                          disabled={assignSaving}
                          onClick={() => onUnassign(user.id)}
                        >
                          <UserMinus className="size-3.5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 bg-muted/30 border-t border-border flex justify-end">
            <Button 
              onClick={() => setAssignDialogOpen(false)} 
              className="rounded-xl px-4 h-8.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              Done Managing Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}
