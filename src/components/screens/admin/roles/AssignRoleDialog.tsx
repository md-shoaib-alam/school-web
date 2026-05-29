"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Search, UserMinus, UserPlus, Users, X } from "lucide-react";
import type { RoleRecord, UserRecord } from "./types";

interface AssignRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeRole: RoleRecord | null;
  loading: boolean;
  assignedUsers: UserRecord[];
  filteredAvailable: UserRecord[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  assigningLoading: string | null;
  onAssignChange: (userId: string, targetRoleId: string | null) => void;
}

export function AssignRoleDialog({
  open,
  onOpenChange,
  activeRole,
  loading,
  assignedUsers,
  filteredAvailable,
  searchQuery,
  setSearchQuery,
  assigningLoading,
  onAssignChange,
}: AssignRoleDialogProps) {
  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-5 text-blue-600" />
            Manage Staff: {activeRole?.name}
          </DialogTitle>
          <DialogDescription>
            Assign or remove this role from teachers and staff members
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-emerald-500" />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
              {/* Assigned Users */}
              <div>
                <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                  <Users className="size-4 text-emerald-500" />
                  Assigned Staff ({assignedUsers.length})
                </h4>
                {assignedUsers.length === 0 ? (
                  <p className="text-sm text-zinc-400 dark:text-zinc-500 py-4 text-center bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                    No staff assigned yet. Add from the list below.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {assignedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50"
                      >
                        <Avatar className="size-8">
                          <AvatarFallback
                            className="text-white text-xs font-bold"
                            style={{ backgroundColor: activeRole?.color }}
                          >
                            {getInitial(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                            {user.email}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[10px] capitalize shrink-0"
                        >
                          {user.role}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 shrink-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                          onClick={() => onAssignChange(user.id, null)}
                          disabled={assigningLoading === user.id}
                        >
                          {assigningLoading === user.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <UserMinus className="size-3.5" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Available Users */}
              <div>
                <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                  <UserPlus className="size-4 text-blue-500" />
                  Available to Assign ({filteredAvailable.length})
                </h4>
                {/* Search */}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 dark:text-zinc-500" />
                  <Input
                    placeholder="Search teachers & staff..."
                    className="pl-9 h-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                <ScrollArea className="max-h-[250px]">
                  {filteredAvailable.length === 0 ? (
                    <p className="text-sm text-zinc-400 dark:text-zinc-500 py-4 text-center">
                      {searchQuery
                        ? "No users found matching your search."
                        : "All users already have a role assigned."}
                    </p>
                  ) : (
                    <div className="space-y-1.5 pb-2">
                      {filteredAvailable.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800"
                        >
                          <Avatar className="size-7">
                            <AvatarFallback className="bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-bold shrink-0">
                              {getInitial(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-zinc-800 dark:text-zinc-200 truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                              {user.email}
                            </p>
                          </div>
                          {user.customRole && (
                            <Badge
                              variant="outline"
                              className="text-[10px] shrink-0 hidden sm:inline-flex"
                              style={{
                                borderColor: user.customRole.color + "40",
                                color: user.customRole.color,
                              }}
                            >
                              {user.customRole.name}
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 shrink-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30"
                            onClick={() => onAssignChange(user.id, activeRole!.id)}
                            disabled={assigningLoading === user.id}
                          >
                            {assigningLoading === user.id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <UserPlus className="size-3.5" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
