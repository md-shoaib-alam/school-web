"use client";

/**
 * FullPageSkeleton - shown while the app shell / dynamic chunks are loading.
 * Uses pure CSS animate-pulse. No boneyard-js/react used here.
 */
/**
 * FullPageSkeleton - the whole shell, for when nothing of it is on screen yet: before hydration,
 * during maintenance, or before a session resolves. Once the shell is up, a screen that is still
 * loading uses ScreenSkeleton instead, or this would draw a second sidebar inside the page.
 *
 * ScreenSkeleton - the same content shapes, without the header or the sidebar beside it.
 *
 * Both use pure CSS animate-pulse. No boneyard-js/react used here.
 */
export function FullPageSkeleton() {
  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-background">
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* The sidebar stands beside the header, as it does in the real shell. */}
        <SidebarSkeleton />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top header bar — the real header sits on bg-sidebar, not on the page background. */}
          <header className="h-16 flex items-center gap-3 px-4 lg:px-6 border-b border-border bg-sidebar shrink-0">
            <ShimmerBox className="size-8 rounded-lg" />
            <ShimmerBox className="h-5 w-36 rounded-md" />
            <div className="flex-1" />
            <ShimmerBox className="size-8 rounded-full" />
            <ShimmerBox className="size-8 rounded-full" />
            <ShimmerBox className="size-8 rounded-full" />
          </header>

          <main className="flex-1 overflow-hidden p-4 lg:p-6">
            <ScreenSkeleton />
          </main>
        </div>
      </div>
    </div>
  );
}

/** Just the page area, for a screen loading inside a shell that is already on screen. */
export function ScreenSkeleton() {
  // No height or padding of its own: the shell's `main` already scrolls and pads the screen.
  return <ContentSkeleton />;
}

/** Sidebar column: brand block, the list of tabs, and the footer cards. */
function SidebarSkeleton() {
  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-border bg-sidebar overflow-hidden">
      <div className="h-16 px-5 flex items-center gap-3 border-b border-border shrink-0">
        <ShimmerBox className="size-10 rounded-xl" />
        <div className="space-y-1.5">
          <ShimmerBox className="h-4 w-28 rounded" />
          <ShimmerBox className="h-3 w-20 rounded" />
        </div>
      </div>

      <div className="flex-1 p-3 space-y-1 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-10 px-3 flex items-center gap-3 rounded-xl">
            <ShimmerBox className="size-5 rounded" />
            <ShimmerBox className="h-4 rounded" style={{ width: `${52 + ((i * 13) % 36)}px` }} />
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-border shrink-0 space-y-3">
        <ShimmerBox className="h-[76px] rounded-2xl" />
        <div className="flex items-center gap-3 p-1.5">
          <ShimmerBox className="size-9 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <ShimmerBox className="h-3.5 w-24 rounded" />
            <ShimmerBox className="h-3 w-32 rounded" />
          </div>
        </div>
      </div>
    </aside>
  );
}

/** Shimmer block - building block for all skeleton shapes */
function ShimmerBox({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={[
        "bg-muted animate-pulse rounded-md shrink-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    />
  );
}

/** Content area skeleton - generic header + stats + table */
function ContentSkeleton() {
  return (
    <div className="space-y-5">
      {/* Top bar: search + action buttons */}
      <div className="flex items-center justify-between gap-3">
        <ShimmerBox className="h-9 w-52 rounded-lg" />
        <div className="flex gap-2">
          <ShimmerBox className="h-9 w-28 rounded-lg" />
          <ShimmerBox className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Stats cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <ShimmerBox key={i} className="h-20 sm:h-24 rounded-xl" />
        ))}
      </div>

      {/* Table block */}
      <div className="rounded-2xl border border-border overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-4 px-5 py-3 border-b border-border bg-muted/30">
          {[10, 36, 20, 20, 16].map((w, i) => (
            <ShimmerBox
              key={i}
              className={`h-4 rounded ${i === 4 ? "ml-auto" : ""}`}
              style={{ width: `${w}%` } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Table rows */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-5 py-3.5 border-b border-border last:border-none"
          >
            <ShimmerBox className="h-4 w-8 rounded" />
            <div className="flex items-center gap-3 flex-1">
              <ShimmerBox className="size-8 rounded-full" />
              <ShimmerBox className="h-4 w-32 rounded" />
            </div>
            <ShimmerBox className="h-6 w-16 rounded-full hidden md:block" />
            <ShimmerBox className="h-4 w-12 rounded hidden sm:block" />
            <ShimmerBox className="h-4 w-24 rounded hidden lg:block" />
            <div className="flex gap-2 ml-auto">
              <ShimmerBox className="size-8 rounded-md" />
              <ShimmerBox className="size-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
