"use client";

import { LazyMotion, domMax, m, AnimatePresence } from "framer-motion";
import { TeacherCard } from "./TeacherCard";
import type { TeacherInfo } from "./types";

const premiumLayoutTransition = {
  type: "spring",
  stiffness: 280,
  damping: 28,
  mass: 0.7
} as const;

interface TeachersGridViewProps {
  teachers: TeacherInfo[];
  /** First paint only: items arrive with a staggered fade instead of the view-switch travel. */
  enter?: boolean;
  canEdit: boolean;
  canDelete: boolean;
  deletingId: string | null;
  setDeletingId: (id: string | null) => void;
  onEdit: (t: TeacherInfo) => void;
  onDelete: (id: string) => void;
  onView: (t: TeacherInfo) => void;
}

export function TeachersGridView({
  teachers,
  enter,
  canEdit,
  canDelete,
  deletingId,
  setDeletingId,
  onEdit,
  onDelete,
  onView,
}: TeachersGridViewProps) {
  return (
    <LazyMotion features={domMax}>
      <m.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {teachers.map((teacher, index) => (
            <m.div 
              key={teacher.id}
              id={`teacher-item-${teacher.id}`}
              layoutId={`teacher-${teacher.id}`}
              initial={enter ? { y: 6 } : undefined}
              animate={{ y: 0 }}
              transition={enter ? { ...premiumLayoutTransition, delay: Math.min(index, 10) * 0.03 } : premiumLayoutTransition}
            >
              <TeacherCard
                teacher={teacher}
                canEdit={canEdit}
                canDelete={canDelete}
                deletingId={deletingId}
                setDeletingId={setDeletingId}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
              />
            </m.div>
          ))}
        </AnimatePresence>
      </m.div>
    </LazyMotion>
  );
}
