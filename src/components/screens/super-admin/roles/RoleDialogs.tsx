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
  X, 
  Loader2, 
  UserPlus, 
  UserMinus, 
  Users,
  CheckCircle2
} from "lucide-react";
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 border-none shadow-2xl">
          <DialogHeader className="p-6 pb-2 bg-gradient-to-br from-teal-50 to-white dark:from-gray-900 dark:to-gray-800">
            <DialogTitle className="flex items-center gap-3 text-xl font-black">
              <div className="h-10 w-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-200 dark:shadow-none">
                <Shield className="h-5 w-5" />
              </div>
              {editingRole ? `Edit "${editingRole.name}"` : "Create New Platform Role"}
            </DialogTitle>
            <DialogDescription className="text-xs font-medium">
              {editingRole
                ? "Update platform role details and granular module permissions"
                : "Define a new role with platform-level permissions for staff members"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Role Name *</Label>
                  <Input
                    placeholder="e.g. Senior Moderator"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Description</Label>
                  <Textarea
                    placeholder="What can users with this role do?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="rounded-xl resize-none"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Brand Color</Label>
                <div className="grid grid-cols-5 gap-2.5 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      className="w-full aspect-square rounded-full border-4 transition-all hover:scale-110 flex items-center justify-center"
                      style={{
                        backgroundColor: c,
                        borderColor: color === c ? 'white' : 'transparent',
                        boxShadow: color === c ? `0 0 12px ${c}80` : 'none'
                      }}
                      onClick={() => setColor(c)}
                    >
                      {color === c && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </button>
                  ))}
                </div>
                <div className="p-4 rounded-xl border border-teal-100 dark:border-teal-900 bg-teal-50/50 dark:bg-teal-900/20 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg shadow-sm" style={{ backgroundColor: color }} />
                  <div className="text-xs font-bold text-teal-800 dark:text-teal-300">
                    Role Preview Color
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Permission Matrix
                </Label>
                <Badge variant="outline" className="text-[10px] font-bold">
                  {Object.values(permissions).flat().length} Actions Selected
                </Badge>
              </div>
              
              <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="grid grid-cols-5 bg-gray-50/80 dark:bg-gray-900 p-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="col-span-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Module</div>
                  {PERMISSION_ACTIONS.map((action) => (
                    <div key={action} className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {ACTION_LABELS[action]}
                    </div>
                  ))}
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {PLATFORM_MODULES.map((module) => (
                    <div key={module.key} className="grid grid-cols-5 p-3 hover:bg-gray-50/30 dark:hover:bg-gray-900/20 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-muted-foreground">
                          {module.icon}
                        </div>
                        <span className="text-xs font-bold">{module.label}</span>
                      </div>
                      {PERMISSION_ACTIONS.map((action) => (
                        <div key={action} className="flex items-center justify-center">
                          <Checkbox
                            checked={(permissions[module.key] || []).includes(action)}
                            onCheckedChange={() => togglePermission(module.key, action)}
                            className="rounded-md h-5 w-5 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-gray-50/80 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={saving} className="rounded-xl px-6 h-11 font-bold">
              Cancel
            </Button>
            <Button
              onClick={onSave}
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8 h-11 font-black shadow-lg shadow-teal-100 dark:shadow-none min-w-[140px]"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
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
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 border-none shadow-2xl">
          <DialogHeader className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <DialogTitle className="flex items-center gap-3 text-xl font-black">
              <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center text-white">
                <Users className="h-5 w-5" />
              </div>
              Assign Users to &quot;{assigningRole?.name}&quot;
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
            {/* Left: Available Users */}
            <div className="space-y-4 flex flex-col">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Available Users</Label>
                <Badge variant="secondary" className="text-[10px] font-bold">{filteredAvailable.length} candidates</Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-10 rounded-xl h-10 text-sm"
                />
              </div>

              <div className="flex-1 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden bg-gray-50/50 dark:bg-gray-900/20">
                <div className="h-[300px] overflow-y-auto p-2 custom-scrollbar space-y-2">
                  {assignLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
                    </div>
                  ) : filteredAvailable.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <Search className="h-8 w-8 text-gray-300 mb-2" />
                      <p className="text-xs font-bold text-muted-foreground">No users found</p>
                    </div>
                  ) : (
                    filteredAvailable.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-gray-800 border border-transparent hover:border-teal-200 shadow-sm transition-all group">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-700 shadow-sm">
                            <AvatarFallback className="text-[10px] font-bold bg-teal-50 text-teal-600">{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-xs font-black truncate leading-tight">{user.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 rounded-lg text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={assignSaving}
                          onClick={() => onAssign(user.id)}
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right: Assigned Users */}
            <div className="space-y-4 flex flex-col">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Currently Assigned</Label>
                <Badge className="text-[10px] font-bold bg-teal-600">{assignedUsers.length} Users</Badge>
              </div>

              <div className="flex-1 rounded-2xl border border-teal-100 dark:border-teal-900 overflow-hidden bg-teal-50/20 dark:bg-teal-900/10">
                <div className="h-[352px] overflow-y-auto p-2 custom-scrollbar space-y-2">
                  {assignLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
                    </div>
                  ) : assignedUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <Users className="h-8 w-8 text-teal-200 mb-2" />
                      <p className="text-xs font-bold text-teal-600/60">No users assigned yet</p>
                    </div>
                  ) : (
                    assignedUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-gray-800 border border-teal-100 dark:border-teal-900/50 shadow-sm group">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border-2 border-teal-100 dark:border-teal-900 shadow-sm">
                            <AvatarFallback className="text-[10px] font-bold bg-teal-600 text-white">{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-xs font-black truncate leading-tight">{user.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={assignSaving}
                          onClick={() => onUnassign(user.id)}
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-gray-50/80 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
            <Button onClick={() => setAssignDialogOpen(false)} className="rounded-xl px-8 h-11 font-black bg-gray-900 dark:bg-gray-800 text-white hover:bg-black transition-all">
              Done Managing Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}
