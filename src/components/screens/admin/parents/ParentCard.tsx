"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Briefcase,
  Link2,
  Mail,
  Pencil,
  Phone,
  Trash2,
  Unlink,
} from "lucide-react";
import { ParentInfo } from "./types";

interface ParentCardProps {
  parent: ParentInfo;
  linking: boolean;
  onEdit: (parent: ParentInfo) => void;
  onDelete: (id: string) => void;
  onLinkOpen: (parent: ParentInfo) => void;
  onUnlinkChild: (parentId: string, childId: string) => void;
  onView: (parent: ParentInfo) => void;
}

/** "Parent 11" -> "P11", "Student 107" -> "S107", "Anita Rao" -> "AR" */
function initials(name: string, prefix?: string) {
  const num = name.match(/\d+/)?.[0];
  if (num && prefix) return `${prefix}${num}`;
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ChildRow({
  child,
  linking,
  onUnlink,
}: {
  child: ParentInfo["children"][number];
  linking: boolean;
  onUnlink: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] bg-muted py-2.5 pl-3 pr-2.5">
      <span className="flex size-[38px] flex-none items-center justify-center rounded-full bg-violet-100 dark:bg-violet-950 text-xs font-bold text-violet-600 dark:text-violet-400">
        {initials(child.name, "S")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{child.name}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {child.className} · Roll {child.rollNumber}
        </p>
      </div>
      <button
        type="button"
        aria-label={`Unlink ${child.name}`}
        disabled={linking}
        onClick={(e) => {
          e.stopPropagation();
          onUnlink();
        }}
        className="flex size-[34px] flex-none items-center justify-center rounded-[9px] text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:opacity-50"
      >
        <Unlink className="size-[18px]" aria-hidden />
      </button>
    </div>
  );
}

export function ParentCard({
  parent,
  linking,
  onEdit,
  onDelete,
  onLinkOpen,
  onUnlinkChild,
  onView,
}: ParentCardProps) {
  return (
    <Card
      className="h-full rounded-3xl border border-border bg-card shadow-sm cursor-pointer"
      onClick={() => onView(parent)}
    >
      <CardContent className="flex flex-col gap-[18px] p-[22px]">
        {/* Header */}
        <div className="flex items-center gap-3.5">
          <Avatar className="size-[54px] shrink-0 border border-border">
            {parent.avatar && <AvatarImage src={parent.avatar} alt={parent.name} className="object-cover" />}
            <AvatarFallback className="bg-muted text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {initials(parent.name, "P")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold tracking-[-0.01em] text-foreground">
              {parent.name}
            </h3>
            <p className="mt-1 flex items-center gap-[7px] text-xs text-muted-foreground">
              <Mail className="size-[15px] flex-none" aria-hidden />
              <span className="truncate">{parent.email}</span>
            </p>
          </div>
          <div className="flex flex-none gap-0.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              aria-label={`Edit ${parent.name}`}
              onClick={() => onEdit(parent)}
              className="flex size-[34px] items-center justify-center rounded-[9px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Pencil className="size-[18px]" aria-hidden />
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  aria-label={`Delete ${parent.name}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex size-[34px] items-center justify-center rounded-[9px] text-red-400 transition-colors hover:bg-red-500/10"
                >
                  <Trash2 className="size-[18px]" aria-hidden />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
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

        {/* Occupation / phone pills */}
        {(parent.occupation || parent.phone) && (
          <div className="flex flex-wrap gap-2">
            {parent.occupation && (
              <span className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                <Briefcase className="size-[15px]" aria-hidden />
                {parent.occupation}
              </span>
            )}
            {parent.phone && (
              <span className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                <Phone className="size-[15px]" aria-hidden />
                {parent.phone}
              </span>
            )}
          </div>
        )}

        <div className="-mx-[22px] h-px bg-border" />

        {/* Children header + Link Child */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Children <b className="font-bold text-emerald-600 dark:text-emerald-400">{parent.children.length}</b>
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLinkOpen(parent);
            }}
            className="flex h-[34px] items-center gap-[7px] rounded-[10px] border border-emerald-500/30 bg-emerald-500/10 px-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400 transition-colors hover:bg-emerald-500/20"
          >
            <Link2 className="size-[15px]" aria-hidden />
            Link Child
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          {parent.children.length === 0 ? (
            <p
              className="rounded-[14px] border-[1.5px] border-dashed border-border p-[18px] text-center text-xs text-muted-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              No children linked yet
            </p>
          ) : (
            parent.children.map((child) => (
              <ChildRow
                key={child.id}
                child={child}
                linking={linking}
                onUnlink={() => onUnlinkChild(parent.id, child.id)}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
