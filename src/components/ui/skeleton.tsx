"use client";

import { cn } from "@/lib/utils";

/**
 * Skeleton - renders a shimmering placeholder block.
 * Sweep shimmer via .skeleton-shimmer; static under .perf-low (low-end devices).
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-muted skeleton-shimmer rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
