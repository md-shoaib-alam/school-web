"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, Pencil, Trash2 } from "lucide-react";
import { LazyMotion, domMax, m, AnimatePresence } from "framer-motion";
import type { ClassInfo } from "@/types";

/** "Teacher 16" -> "T16", "Anita Rao" -> "AR", null -> "–" */
function teacherInitials(name?: string | null) {
  if (!name) return "–";
  const num = name.match(/\d+/)?.[0];
  if (num) return `T${num}`;
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const premiumLayoutTransition = {
  type: "spring",
  stiffness: 280,
  damping: 28,
  mass: 0.7
} as const;

interface ClassesGridViewProps {
  classes: ClassInfo[];
  /** First paint only: items arrive with a staggered fade instead of the view-switch travel. */
  enter?: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onViewStudents: (cls: ClassInfo) => void;
  onEdit: (cls: ClassInfo) => void;
  onDelete: (cls: ClassInfo) => void;
  getProgressColor: (percentage: number) => string;
}

export function ClassesGridView({
  classes,
  enter,
  canEdit,
  canDelete,
  onViewStudents,
  onEdit,
  onDelete,
  getProgressColor,
}: ClassesGridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-3.5 sm:gap-4">
      <LazyMotion features={domMax}>
        <AnimatePresence mode="popLayout">
          {classes.map((cls, index) => {
            const percentage = cls.capacity > 0 ? Math.round((cls.studentCount / cls.capacity) * 100) : 0;

            return (
              <m.div
                key={cls.id}
                id={`class-item-${cls.id}`}
                layoutId={`class-${cls.id}`}
                className="h-full"
                initial={enter ? { y: 6 } : undefined}
                animate={{ y: 0 }}
                transition={enter ? { ...premiumLayoutTransition, delay: Math.min(index, 10) * 0.03 } : premiumLayoutTransition}
              >
                <Card className="h-full rounded-[20px] border border-border bg-card shadow-sm py-0">
                  <CardContent className="flex flex-col gap-3.5 p-4 sm:p-5">
                    {/* Class name + section pill */}
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-base font-semibold tracking-[-0.01em] text-foreground">{cls.name}</h3>
                      <span className="shrink-0 rounded-full border border-border bg-muted px-2.5 py-0.5 sm:px-3 sm:py-1 text-xs font-semibold text-muted-foreground">
                        {cls.section.toLowerCase().startsWith("section") ? cls.section : `Section ${cls.section}`}
                      </span>
                    </div>

                    {/* Class teacher */}
                    <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
                      <span className="flex size-8 sm:size-[34px] flex-none items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                        {teacherInitials(cls.classTeacher)}
                      </span>
                      <span className={`truncate ${cls.classTeacher ? "" : "font-medium text-muted-foreground"}`}>
                        {cls.classTeacher || "Unassigned"}
                      </span>
                    </div>

                    {/* Occupancy */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium text-muted-foreground">
                        <span>
                          <b className="font-semibold text-foreground">{cls.studentCount}/{cls.capacity}</b> Students
                        </span>
                        <b className={`font-semibold ${percentage >= 90 ? "text-red-500" : "text-emerald-500"}`}>{percentage}%</b>
                      </div>
                      <Progress
                        value={percentage}
                        aria-label={`${cls.name} Section ${cls.section} occupancy`}
                        className={`h-1.5 rounded-full bg-muted ${getProgressColor(percentage)}`}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <Button
                        variant="outline"
                        className="mr-1 h-9 flex-1 gap-1.5 whitespace-nowrap rounded-xl border-emerald-500/40 bg-emerald-500/[0.07] text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-500 shadow-none hover:bg-emerald-500/15 hover:text-emerald-700 dark:hover:text-emerald-400"
                        onClick={() => onViewStudents(cls)}
                      >
                        <Users className="size-4" aria-hidden />
                        View Students
                      </Button>
                      <div className="ml-auto flex items-center gap-1">
                        {canEdit && (
                          <button
                            type="button"
                            aria-label={`Edit ${cls.name} Section ${cls.section}`}
                            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
                            onClick={() => onEdit(cls)}
                          >
                            <Pencil className="size-4" aria-hidden />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            aria-label={`Delete ${cls.name} Section ${cls.section}`}
                            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-red-400"
                            onClick={() => onDelete(cls)}
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </m.div>
            );
          })}
        </AnimatePresence>
      </LazyMotion>
    </div>
  );
}
