"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, UserPlus, Users, Shield } from "lucide-react";
import type { RoleRecord } from "./types";

interface RoleTableProps {
  roles: RoleRecord[];
  onEdit: (role: RoleRecord) => void;
  onAssign: (role: RoleRecord) => void;
  onDelete: (id: string) => void;
}

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch (e) {
    return dateStr;
  }
};

export function RoleTable({ roles, onEdit, onAssign, onDelete }: RoleTableProps) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
          <TableRow>
            <TableHead className="w-[250px]">Role Name</TableHead>
            <TableHead>Staff Assigned</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => {
             let perms = {};
             try {
               perms = typeof role.permissions === 'string' 
                 ? JSON.parse(role.permissions || "{}") 
                 : (role.permissions || {});
             } catch (e) { perms = {}; }
             const permCount = Object.values(perms).flat().length;

             return (
              <TableRow key={role.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div 
                      className="size-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
                      style={{ backgroundColor: role.color }}
                    >
                      {role.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{role.name}</p>
                      {role.description && (
                        <p className="text-[10px] text-zinc-500 line-clamp-1">{role.description}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 gap-2 text-xs hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30"
                    onClick={() => onAssign(role)}
                  >
                    <Users className="size-3.5" />
                    {role.userCount} staff
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                    <Shield className="size-3.5" />
                    {permCount} modules
                  </div>
                </TableCell>
                <TableCell className="text-xs text-zinc-500" suppressHydrationWarning>
                  {formatDate(role.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                      onClick={() => onAssign(role)}
                    >
                      <UserPlus className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                      onClick={() => onEdit(role)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Role</AlertDialogTitle>
                          <AlertDialogDescription className="space-y-3">
                            <p>
                              Are you sure you want to delete &quot;{role.name}&quot;? This action cannot be undone.
                            </p>
                            {role.userCount > 0 && (
                              <span className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-900/50 text-xs flex flex-col gap-1 text-left block">
                                <strong className="font-semibold block">⚠️ Warning</strong>
                                <span>
                                  There are <strong>{role.userCount} staff member(s)</strong> currently assigned to this role. Deleting this role will automatically remove it from them.
                                </span>
                              </span>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => onDelete(role.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
