"use client";

import { useState, useMemo } from "react";
import { 
  UserCheck, 
  Search, 
  Shield, 
  Layers, 
  Users, 
  MoreVertical, 
  Pencil, 
  UserPlus, 
  Trash2, 
  Headphones, 
  FileText, 
  FileCode2, 
  Eye,
  ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlatformRoleRecord, isSystemRole } from "./types";
import { cn } from "@/lib/utils";

interface RoleGridProps {
  roles: PlatformRoleRecord[];
  onEdit: (role: PlatformRoleRecord) => void;
  onDelete: (id: string) => void;
  onAssignUsers: (role: PlatformRoleRecord) => void;
  isMobileTab?: boolean;
}

function getRoleIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("support")) return <Headphones className="size-4 sm:size-4.5 stroke-[2.2]" />;
  if (lower.includes("bill")) return <FileText className="size-4 sm:size-4.5 stroke-[2.2]" />;
  if (lower.includes("moderator") || lower.includes("content")) return <FileCode2 className="size-4 sm:size-4.5 stroke-[2.2]" />;
  if (lower.includes("secur")) return <Shield className="size-4 sm:size-4.5 stroke-[2.2]" />;
  if (lower.includes("read") || lower.includes("view")) return <Eye className="size-4 sm:size-4.5 stroke-[2.2]" />;
  return <Shield className="size-4 sm:size-4.5 stroke-[2.2]" />;
}

function getRoleIconBoxStyle(name: string, customColor?: string) {
  const lower = name.toLowerCase();
  if (lower.includes("support")) return "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border-blue-100 dark:border-blue-900/40";
  if (lower.includes("bill")) return "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-100 dark:border-amber-900/40";
  if (lower.includes("moderator") || lower.includes("content")) return "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border-purple-100 dark:border-purple-900/40";
  if (lower.includes("secur")) return "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-rose-100 dark:border-rose-900/40";
  if (lower.includes("read") || lower.includes("view")) return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40";
  
  if (customColor) {
    return "border-border text-white shadow-2xs";
  }
  return "bg-muted text-muted-foreground border-border";
}

export function RoleGrid({ roles, onEdit, onDelete, onAssignUsers, isMobileTab = false }: RoleGridProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "custom" | "system">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [roleToDelete, setRoleToDelete] = useState<PlatformRoleRecord | null>(null);

  // Counts
  const counts = useMemo(() => {
    let system = 0;
    let custom = 0;
    roles.forEach((r) => {
      if (isSystemRole(r)) system++;
      else custom++;
    });
    return { all: roles.length, system, custom };
  }, [roles]);

  // Filtered & Sorted roles
  const filteredRoles = useMemo(() => {
    return roles
      .filter((r) => {
        // Tab filter
        const isSys = isSystemRole(r);
        if (filter === "custom" && isSys) return false;
        if (filter === "system" && !isSys) return false;

        // Search query
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [roles, filter, search, sortBy]);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-2xs overflow-hidden p-3.5 sm:p-5">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-border mb-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100/80 dark:border-blue-900/40 shrink-0">
            <UserCheck className="size-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground leading-tight">
              Your Roles
            </h3>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
              View, edit, and manage permissions
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-52">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles..."
            className="h-8.5 text-xs pl-8 rounded-xl bg-card border-border focus:bg-card placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Filter Tabs & Sort Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-0.5 bg-muted/70 rounded-xl border border-border/50">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
              filter === "all"
                ? "bg-card text-foreground font-semibold shadow-2xs border border-border/40"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            All ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setFilter("custom")}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
              filter === "custom"
                ? "bg-card text-foreground font-semibold shadow-2xs border border-border/40"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Custom ({counts.custom})
          </button>
          <button
            type="button"
            onClick={() => setFilter("system")}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
              filter === "system"
                ? "bg-card text-foreground font-semibold shadow-2xs border border-border/40"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            System ({counts.system})
          </button>
        </div>

        {/* Sort Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-xl border border-border bg-card shadow-2xs cursor-pointer h-8"
            >
              <ArrowUpDown className="size-3 text-muted-foreground" />
              <span>
                {sortBy === "newest" ? "Newest" : sortBy === "oldest" ? "Oldest" : "A-Z"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 rounded-xl text-xs">
            <DropdownMenuItem onClick={() => setSortBy("newest")}>Newest First</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("oldest")}>Oldest First</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("name")}>Alphabetical</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Role List */}
      <div className="space-y-2">
        {filteredRoles.length === 0 ? (
          <div className="py-8 text-center rounded-xl border border-dashed border-border">
            <Shield className="size-7 text-muted-foreground/40 mx-auto mb-1.5" />
            <p className="font-semibold text-xs text-foreground">No roles found</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {search ? "Try adjusting your search query" : "No roles in this category"}
            </p>
          </div>
        ) : (
          filteredRoles.map((role) => {
            const perms = JSON.parse(role.permissions || "{}");
            const permCount = Object.values(perms).flat().length;
            const moduleCount = Object.keys(perms).filter(
              (k) => (perms[k] || []).length > 0,
            ).length;
            const userCount = role._count?.users ?? 0;
            const isSys = isSystemRole(role);

            return (
              <div
                key={role.id}
                className="group flex flex-col md:flex-row md:items-center justify-between rounded-xl border border-border bg-card hover:border-border hover:bg-muted/40 transition-all gap-2.5 p-2.5 sm:p-3"
              >
                {/* Left: Icon + Name + Badges */}
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div
                    className={cn(
                      "size-8.5 sm:size-9 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs",
                      getRoleIconBoxStyle(role.name, role.color)
                    )}
                    style={
                      !getRoleIconBoxStyle(role.name).includes("bg-")
                        ? { backgroundColor: role.color }
                        : undefined
                    }
                  >
                    {getRoleIcon(role.name)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-semibold text-xs text-foreground truncate">
                        {role.name}
                      </h4>
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-md bg-muted text-muted-foreground border border-border">
                        {isSys ? "System" : "Custom"}
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40 flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Active</span>
                      </span>
                    </div>

                    {role.description && (
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {role.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Metadata + Action Menu */}
                <div className="flex items-center justify-between md:justify-end gap-2.5 sm:gap-3.5 shrink-0 pt-1.5 md:pt-0 border-t md:border-t-0 border-border">
                  {/* Metadata chips */}
                  <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground font-medium">
                    <span className="flex items-center gap-1" title="Permissions Count">
                      <Shield className="size-3 text-muted-foreground/70" />
                      <span>{permCount} Perms</span>
                    </span>
                    <span className="flex items-center gap-1" title="Modules Count">
                      <Layers className="size-3 text-muted-foreground/70" />
                      <span>{moduleCount} Mods</span>
                    </span>
                    <span className="flex items-center gap-1" title="Assigned Users">
                      <Users className="size-3 text-muted-foreground/70" />
                      <span>{userCount} {userCount === 1 ? "User" : "Users"}</span>
                    </span>
                  </div>

                  {/* 3-dots Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                      >
                        <MoreVertical className="size-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 rounded-xl text-xs">
                      <DropdownMenuItem onClick={() => onEdit(role)} className="gap-2 cursor-pointer">
                        <Pencil className="size-3.5 text-blue-500" />
                        <span>Edit Role</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAssignUsers(role)} className="gap-2 cursor-pointer">
                        <UserPlus className="size-3.5 text-emerald-500" />
                        <span>Assign Users ({userCount})</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setRoleToDelete(role)}
                        className="gap-2 text-red-600 dark:text-red-400 focus:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Delete Role</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Role Confirmation Dialog */}
      <AlertDialog open={!!roleToDelete} onOpenChange={(open) => !open && setRoleToDelete(null)}>
        <AlertDialogContent className="rounded-2xl border border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold text-foreground">Delete Platform Role</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete &quot;
              <span className="font-semibold text-foreground">{roleToDelete?.name}</span>&quot;?
              {(roleToDelete?._count?.users ?? 0) > 0 ? (
                `\n\n⚠️ ${roleToDelete?._count?.users} user(s) are currently assigned to this role. You must unassign them before deleting.`
              ) : (
                "\n\nThis action cannot be undone and will remove all associated permissions."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl h-8.5 text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-8.5 text-xs font-semibold"
              onClick={() => {
                if (roleToDelete) {
                  onDelete(roleToDelete.id);
                  setRoleToDelete(null);
                }
              }}
            >
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
