"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Pencil, Trash2 } from "lucide-react";
import { LazyMotion, domMax, m, AnimatePresence } from "framer-motion";

const premiumLayoutTransition = {
  type: "spring",
  stiffness: 280,
  damping: 28,
  mass: 0.7
} as const;

interface SubjectsGridViewProps {
  filtered: any[];
  /** First paint only: items arrive with a staggered fade instead of the view-switch travel. */
  enter?: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (s: any) => void;
  onDelete: (s: any) => void;
}

export function SubjectsGridView({
  filtered,
  enter,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: SubjectsGridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      <LazyMotion features={domMax}>
        <AnimatePresence mode="popLayout">
          {filtered.map((subject, index) => (
            <m.div
              key={subject.id}
              id={`subject-item-${subject.id}`}
              layoutId={`subject-${subject.id}`}
              initial={enter ? { y: 6 } : undefined}
              animate={{ y: 0 }}
              transition={enter ? { ...premiumLayoutTransition, delay: Math.min(index, 10) * 0.03 } : premiumLayoutTransition}
              className="group"
            >
              <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all duration-300 group-hover:ring-1 group-hover:ring-emerald-500/30">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                      <BookOpen className="size-5" />
                    </div>
                    <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                          onClick={() => onEdit(subject)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                          onClick={() => onDelete(subject)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground truncate">
                      {subject.name}
                    </h3>
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                      {subject.code}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t  space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Class</span>
                      <Badge variant="secondary" className="text-[10px] px-2 py-0">
                        {subject.className}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Teacher</span>
                      {subject.teacherName && subject.teacherName !== "Not Assigned" ? (
                        <div className="flex items-center gap-1.5">
                          <div className="size-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center text-[8px] font-bold">
                            {subject.teacherName.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                          </div>
                          <span className="text-xs font-medium text-foreground max-w-[100px] truncate">
                            {subject.teacherName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-amber-500 font-medium italic">Unassigned</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Status</span>
                      {subject.teacherName && subject.teacherName !== "Not Assigned" ? (
                        <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[10px]">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 text-[10px]">
                          Unassigned
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </m.div>
          ))}
        </AnimatePresence>
      </LazyMotion>
    </div>
  );
}
