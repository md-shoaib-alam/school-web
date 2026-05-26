"use client";

import { cn } from "@/lib/utils";
import { Skeleton as BoneyardSkeleton } from "boneyard-js/react";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <BoneyardSkeleton
      name="boneyard-card"
      loading={true}
      color="rgba(0,0,0,0.06)"
      darkColor="rgba(255,255,255,0.05)"
      animate="pulse"
    >
      <div
        data-slot="skeleton"
        className={cn("bg-accent animate-pulse rounded-md", className)}
        {...props}
      />
    </BoneyardSkeleton>
  );
}

export { Skeleton };
