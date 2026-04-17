"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
  Mail,
  Phone,
  Briefcase,
  Baby,
  Plus,
  Pencil,
  Link2,
  Trash2,
  GraduationCap,
  Unlink,
} from "lucide-react";
import { ParentInfo, getAvatarColor, getInitials } from "./types";

interface ParentCardProps {
  parent: ParentInfo;
  linking: boolean;
  onEdit: (parent: ParentInfo) => void;
  onDelete: (id: string) => void;
  onLinkOpen: (parent: ParentInfo) => void;
  onUnlinkChild: (parentId: string, childId: string) => void;
}

export function ParentCard({
  parent,
  linking,
  onEdit,
  onDelete,
  onLinkOpen,
  onUnlinkChild,
}: ParentCardProps) {
  return (
    <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        {/* Parent Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11">
              <AvatarFallback
                className={`${getAvatarColor(parent.name)} text-white text-sm font-semibold`}
              >
                {getInitials(parent.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {parent.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Mail className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {parent.email}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
              onClick={() => onEdit(parent)}
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
              onClick={() => onLinkOpen(parent)}
              title="Link Child"
            >
              <Link2 className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Parent</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {parent.name}? Their
                    children will be unlinked but not deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(parent.id)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Parent Details */}
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
          {parent.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" /> {parent.phone}
            </span>
          )}
          {parent.occupation && (
            <span className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" /> {parent.occupation}
            </span>
          )}
        </div>

        {/* Children */}
        <Separator className="mb-3" />
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Baby className="h-3 w-3" /> Children ({parent.children.length})
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-2"
              onClick={() => onLinkOpen(parent)}
            >
              <Plus className="h-3 w-3 mr-1" /> Link Child
            </Button>
          </div>

          {parent.children.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <GraduationCap className="h-8 w-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-xs text-gray-400 dark:text-gray-500">
                No children linked yet
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 h-7 text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                onClick={() => onLinkOpen(parent)}
              >
                <Link2 className="h-3 w-3 mr-1" /> Link a Child
              </Button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {parent.children.map((child) => (
                <div
                  key={child.id}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-7 w-7 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {child.gender === "male" ? "👦" : "👧"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                        {child.name}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">
                        {child.className} • Roll {child.rollNumber}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 shrink-0"
                    onClick={() => onUnlinkChild(parent.id, child.id)}
                    disabled={linking}
                    title="Unlink"
                  >
                    <Unlink className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
