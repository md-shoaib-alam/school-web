"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Baby,
  Briefcase,
  Mail,
  Pencil,
  Phone,
  Trash2,
  Unlink,
} from "lucide-react";
import type { ParentInfo } from "./types";

const AVATAR_COLORS = [
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-emerald-500",
];

interface ParentCardProps {
  parent: ParentInfo;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (parent: ParentInfo) => void;
  onDelete: (id: string) => void;
  onUnlink: (parentId: string, childId: string) => void;
  index: number;
}

export function ParentCard({
  parent,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onUnlink,
  index,
}: ParentCardProps) {
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const initials = parent.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 group bg-white dark:bg-gray-900">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className={`h-12 w-12 rounded-xl ${avatarColor} text-white font-bold shadow-inner`}>
              <AvatarFallback className="bg-transparent">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {parent.name}
              </h3>
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                <Mail className="h-3 w-3" />
                <span className="truncate">{parent.email}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                onClick={() => onEdit(parent)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Parent Account</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete the account for <strong>{parent.name}</strong>?
                      This will remove their access and unbind all linked children.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => onDelete(parent.id)}
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Phone className="h-3 w-3" />
              <span>{parent.phone || "No phone"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Briefcase className="h-3 w-3" />
              <span className="truncate">{parent.occupation || "Not specified"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Baby className="h-3 w-3" /> Linked Children
              </span>
              <Badge variant="outline" className="h-5 text-[10px] px-1.5 font-bold bg-gray-50 dark:bg-gray-800">
                {parent.children.length}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {parent.children.length > 0 ? (
                parent.children.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40 rounded-full pl-2 pr-1 py-0.5 group/child"
                  >
                    <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                      {child.name} ({child.className})
                    </span>
                    {canEdit && (
                      <button
                        onClick={() => onUnlink(parent.id, child.id)}
                        className="p-0.5 rounded-full hover:bg-amber-200 dark:hover:bg-amber-800 text-amber-500 hover:text-amber-700 transition-colors"
                        title="Unlink Child"
                      >
                        <Unlink className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <span className="text-[11px] text-gray-400 italic">No children linked</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
