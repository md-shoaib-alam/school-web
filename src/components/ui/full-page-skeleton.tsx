"use client";

/**
 * FullPageSkeleton — shown while the app shell / dynamic chunks are loading.
 * Mimics the real layout: collapsed sidebar + top header + content area.
 * Uses pure CSS animation so it works without boneyard bones being registered.
 */
export function FullPageSkeleton() {
  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-background">
      {/* ── Main row: sidebar + content ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar skeleton (collapsed = 72px wide on desktop, hidden on mobile) */}
        <aside className="hidden lg:flex flex-col w-[72px] border-r border-border bg-sidebar shrink-0">
          {/* Logo area */}
          <div className="h-16 flex items-center justify-center border-b border-border px-3">
            <ShimmerBox className="size-9 rounded-xl" />
          </div>

          {/* Nav items */}
          <div className="flex-1 flex flex-col items-center gap-2 py-4 px-3">
            {[...Array(7)].map((_, i) => (
              <ShimmerBox key={i} className="w-10 h-10 rounded-xl" />
            ))}
          </div>

          {/* Footer avatar */}
          <div className="p-3 border-t border-border flex items-center justify-center">
            <ShimmerBox className="size-9 rounded-full" />
          </div>
        </aside>

        {/* Content area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top header */}
          <header className="h-16 flex items-center gap-3 px-4 lg:px-6 border-b border-border shrink-0">
            {/* Mobile hamburger */}
            <ShimmerBox className="size-8 rounded-lg lg:hidden" />
            {/* Page title */}
            <ShimmerBox className="h-5 w-32 rounded-md" />
            {/* Spacer */}
            <div className="flex-1" />
            {/* Right side buttons */}
            <ShimmerBox className="size-8 rounded-full" />
            <ShimmerBox className="size-8 rounded-full" />
            <ShimmerBox className="size-8 rounded-full" />
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-hidden p-4 lg:p-6">
            <ContentSkeleton />
          </main>
        </div>
      </div>
    </div>
  );
}

/** Generic shimmer box – the building block for all skeleton shapes */
function ShimmerBox({ className }: { className?: string }) {
  return (
    <div
      className={[
        "bg-muted animate-pulse rounded-md shrink-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

/** Content area skeleton – generic table + cards layout */
function ContentSkeleton() {
  return (
    <div className="space-y-5 h-full">
      {/* Top bar (search + action button) */}
      <div className="flex items-center justify-between gap-3">
        <ShimmerBox className="h-9 w-52 rounded-lg" />
        <div className="flex gap-2">
          <ShimmerBox className="h-9 w-28 rounded-lg" />
          <ShimmerBox className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <ShimmerBox key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      {/* Table / card block */}
      <div className="rounded-xl border border-border overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-4 px-5 py-3 border-b border-border bg-muted/30">
          {[...Array(5)].map((_, i) => (
            <ShimmerBox
              key={i}
              className={`h-4 rounded ${i === 0 ? "w-8" : i === 1 ? "w-36" : i === 4 ? "w-16 ml-auto" : "w-20"}`}
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
