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
      <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-5">
        {parents.map((parent, index) => (
          <m.div
            key={parent.id}
            id={`parent-item-${parent.id}`}
            layoutId={`parent-${parent.id}`}
            className="h-full"
            initial={enter ? { y: 6 } : undefined}
            animate={{ y: 0 }}
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
