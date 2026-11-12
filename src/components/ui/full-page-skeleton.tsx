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
 *
 * `blueprint` draws the same geometry as a wireframe - dashed outlines instead of shimmer - which
 * is the state the account-switch overlay sweeps away. Keeping it one component is what stops the
 * two from drifting apart.
 */
export function FullPageSkeleton({
  blueprint = false,
  header,
}: {
  blueprint?: boolean;
  /** Real content for the header row, in place of its placeholder blocks. */
  header?: React.ReactNode;
}) {
  return (
    <div className="h-dvh w-screen flex flex-col overflow-hidden bg-zinc-200/60 dark:bg-black p-1.5 sm:p-2 lg:p-2.5">
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden rounded-2xl lg:rounded-3xl border border-border/80 shadow-xs bg-sidebar">
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* The sidebar stands beside the header, as it does in the real shell. */}
          <SidebarSkeleton blueprint={blueprint} />

          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* One rule under the header: dashed brand while drawn, the shell's grey once solid. */}
            <header className={`h-14 sm:h-16 flex items-center gap-3 px-4 lg:px-6 border-b shrink-0 bg-sidebar ${blueprint ? "border-dashed border-brand/70" : "border-border"}`}>
              {header ?? (
                <>
                  <ShimmerBox blueprint={blueprint} className="size-8 rounded-lg" />
                  <ShimmerBox blueprint={blueprint} className="h-5 w-36 rounded-md" />
                  <div className="flex-1" />
                  <ShimmerBox blueprint={blueprint} className="size-8 rounded-full" />
                  <ShimmerBox blueprint={blueprint} className="size-8 rounded-full" />
                  <ShimmerBox blueprint={blueprint} className="size-8 rounded-full" />
                </>
              )}
            </header>

            <main className="flex-1 overflow-hidden p-4 lg:p-6 bg-background">
              <ScreenSkeleton blueprint={blueprint} />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Just the page area, for a screen loading inside a shell that is already on screen. */
export function ScreenSkeleton({ blueprint = false }: { blueprint?: boolean }) {
  // No height or padding of its own: the shell's `main` already scrolls and pads the screen.
  return <ContentSkeleton blueprint={blueprint} />;
}

/** Sidebar column: brand block, the list of tabs, and the footer cards. */
function SidebarSkeleton({ blueprint }: { blueprint: boolean }) {
  return (
    <aside className={`hidden lg:flex w-72 shrink-0 flex-col border-r overflow-hidden bg-background ${blueprint ? "border-dashed border-brand/70" : "border-border"}`}>
      <div className={`h-16 px-5 flex items-center gap-3 border-b shrink-0 ${blueprint ? "border-dashed border-brand/70" : "border-border"}`}>
        <ShimmerBox blueprint={blueprint} className="size-10 rounded-xl" />
        <ShimmerBox blueprint={blueprint} className="h-4 w-28 rounded" />
      </div>

      <div className="flex-1 p-3 space-y-1 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-10 px-3 flex items-center gap-3 rounded-xl">
            <ShimmerBox blueprint={blueprint} className="size-5 rounded" />
            <ShimmerBox
              blueprint={blueprint}
              className="h-4 rounded"
              style={{ width: `${52 + ((i * 13) % 36)}px` }}
            />
          </div>
        ))}
      </div>

      <div className={`p-3 border-t shrink-0 space-y-3 ${blueprint ? "border-dashed border-brand/70" : "border-border"}`}>
        <ShimmerBox blueprint={blueprint} className="h-[76px] rounded-2xl" />
        <div className="flex items-center gap-3 p-1.5">
          <ShimmerBox blueprint={blueprint} className="size-9 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <ShimmerBox blueprint={blueprint} className="h-3.5 w-24 rounded" />
            <ShimmerBox blueprint={blueprint} className="h-3 w-32 rounded" />
          </div>
        </div>
      </div>
    </aside>
  );
}

/** Shimmer block - building block for all skeleton shapes, or its dashed twin in blueprint mode. */
function ShimmerBox({
  className,
  style,
  blueprint,
}: {
  className?: string;
  style?: React.CSSProperties;
  blueprint?: boolean;
}) {
  return (
    <div
      className={[
        blueprint ? "blueprint-box" : "bg-muted animate-pulse rounded-md",
        "shrink-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    />
  );
}

/** Content area skeleton - generic header + stats + table */
function ContentSkeleton({ blueprint }: { blueprint: boolean }) {
  return (
    <div className="space-y-5">
      {/* Top bar: search + action buttons */}
      <div className="flex items-center justify-between gap-3">
        <ShimmerBox blueprint={blueprint} className="h-9 w-52 rounded-lg" />
        <div className="flex gap-2">
          <ShimmerBox blueprint={blueprint} className="h-9 w-28 rounded-lg" />
          <ShimmerBox blueprint={blueprint} className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Stats cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <ShimmerBox key={i} blueprint={blueprint} className="h-20 sm:h-24 rounded-xl" />
        ))}
      </div>

      {/* Table block */}
      <div className="rounded-2xl border border-border overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-4 px-5 py-3 border-b border-border bg-muted/30">
          {[10, 36, 20, 20, 16].map((w, i) => (
            <ShimmerBox
              key={i}
              blueprint={blueprint}
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
            <ShimmerBox blueprint={blueprint} className="h-4 w-8 rounded" />
            <div className="flex items-center gap-3 flex-1">
              <ShimmerBox blueprint={blueprint} className="size-8 rounded-full" />
              <ShimmerBox blueprint={blueprint} className="h-4 w-32 rounded" />
            </div>
            <ShimmerBox blueprint={blueprint} className="h-6 w-16 rounded-full hidden md:block" />
            <ShimmerBox blueprint={blueprint} className="h-4 w-12 rounded hidden sm:block" />
            <ShimmerBox blueprint={blueprint} className="h-4 w-24 rounded hidden lg:block" />
            <div className="flex gap-2 ml-auto">
              <ShimmerBox blueprint={blueprint} className="size-8 rounded-md" />
              <ShimmerBox blueprint={blueprint} className="size-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
