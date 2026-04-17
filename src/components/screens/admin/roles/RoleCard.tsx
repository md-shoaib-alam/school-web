"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Pencil, Shield, Trash2, UserPlus, Users } from "lucide-react";
import { ACTION_LABELS, PERMISSION_MODULES } from "./constants";
import type { RoleRecord } from "./types";

interface RoleCardProps {
  role: RoleRecord;
  onEdit: (role: RoleRecord) => void;
  onAssign: (role: RoleRecord) => void;
  onDelete: (id: string) => void;
}

export function RoleCard({ role, onEdit, onAssign, onDelete }: RoleCardProps) {
  let perms = {};
  if (typeof role.permissions === "string") {
    try {
      if (role.permissions !== "[object Object]") {
        perms = JSON.parse(role.permissions || "{}");
      }
    } catch (e) {
      console.error("Malformed permissions JSON:", e);
    }
  } else {
    perms = role.permissions || {};
  }
  const permCount = Object.values(perms).flat().length;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold"
              style={{ backgroundColor: role.color }}
            >
              {role.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-base">{role.name}</CardTitle>
              {role.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                  {role.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30"
              onClick={() => onAssign(role)}
              title="Assign staff"
            >
              <UserPlus className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/30"
              onClick={() => onEdit(role)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Role</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete &quot;{role.name}&quot;?{" "}
                    {role.userCount > 0
                      ? `${role.userCount} staff member(s) will lose this role.`
                      : "This action cannot be undone."}
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
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <button
            onClick={() => onAssign(role)}
            className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            <Users className="h-3 w-3" />
            <span>{role.userCount} staff</span>
          </button>
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>{permCount} permissions</span>
          </div>
        </div>
        {permCount > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {Object.entries(perms).map(
              ([mod, actions]) =>
                Array.isArray(actions) &&
                (actions as string[]).map((action: string) => (
                  <Badge
                    key={`${mod}-${action}`}
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                    style={{
                      borderColor: role.color + "40",
                      backgroundColor: role.color + "10",
                      color: role.color,
                    }}
                  >
                    {PERMISSION_MODULES.find((m) => m.key === mod)?.label} ·{" "}
                    {ACTION_LABELS[action]}
                  </Badge>
                )),
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
