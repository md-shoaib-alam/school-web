"use client";

import { ParentCard } from "./ParentCard";
import { LazyMotion, domMax, m } from "framer-motion";
import type { ParentInfo } from "./types";

const premiumLayoutTransition = {
  type: "spring",
  stiffness: 280,
  damping: 28,
  mass: 0.7
} as const;

interface ParentsGridViewProps {
  parents: ParentInfo[];
  /** First paint only: items arrive with a staggered fade instead of the view-switch travel. */
  enter?: boolean;
  linking: boolean;
  onEdit: (p: ParentInfo) => void;
  onDelete: (id: string) => void;
  onLinkOpen: (p: ParentInfo) => void;
  onUnlinkChild: (parentId: string, studentId: string) => void;
  onView: (p: ParentInfo) => void;
}

export function ParentsGridView({
  parents,
  enter,
  linking,
  onEdit,
  onDelete,
  onLinkOpen,
  onUnlinkChild,
  onView,
}: ParentsGridViewProps) {
  return (
    <LazyMotion features={domMax}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {parents.map((parent, index) => (
          <m.div
            key={parent.id}
            id={`parent-item-${parent.id}`}
            layoutId={`parent-${parent.id}`}
            initial={enter ? { opacity: 0, y: 8 } : undefined}
            animate={enter ? { opacity: 1, y: 0 } : undefined}
            transition={enter ? { ...premiumLayoutTransition, delay: Math.min(index, 10) * 0.03 } : premiumLayoutTransition}
          >
            <ParentCard
              parent={parent}
              linking={linking}
              onEdit={onEdit}
              onDelete={onDelete}
              onLinkOpen={onLinkOpen}
              onUnlinkChild={onUnlinkChild}
              onView={onView}
            />
          </m.div>
        ))}
      </div>
    </LazyMotion>
  );
}
