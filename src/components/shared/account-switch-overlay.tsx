'use client';

import { useEffect, useMemo, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { useIsFetching } from '@tanstack/react-query';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FullPageSkeleton } from '@/components/ui/full-page-skeleton';
import { roleColors, roleLabels } from '@/components/layout/nav-config';
import {
  clearAccountSwitch,
  parseAccountSwitch,
  readAccountSwitchRaw,
  useAppStore,
  type AccountSwitchSignal,
} from '@/store/use-app-store';
import { cn } from '@/lib/utils';

/*
 * The layer an account switch plays on the page it lands on.
 *
 * switchTo() writes a signal into sessionStorage and reloads. This reads it back and draws the
 * incoming shell twice over, in the same shapes the app already uses while it boots: first as
 * dashed blueprints on a dotted grid, then swept into the familiar shimmer by a scan line. When
 * the real screen is ready underneath the layer fades to it, so the load reads as one drawing
 * resolving rather than one skeleton replacing another.
 */

/** Ms the print head takes to draw the blueprints top to bottom; they then hold until the load is done. */
const BUILD = 2000;
/** Ms the scan line takes to cross the screen, and the blueprints to fade into the shell. */
const SWEEP = 700;
/** Ms the finished shell is held on screen before the layer fades to it. */
const HOLD = 600;
/** Ms the layer takes to fade away once the sweep and the hold are over. */
const SETTLE = 240;
/**
 * Ms the blueprints are held for a load that never settles, counted from this layer mounting.
 * Kept above BUILD so the drawing always finishes before the sweep is forced.
 */
const MAX_HOLD = 5000;

const initialsOf = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const emptySubscribe = () => () => {};

/** The signal never changes while this page lives — it is written by the page that left. */
function useAccountSwitchSignal(): AccountSwitchSignal | null {
  const raw = useSyncExternalStore(emptySubscribe, readAccountSwitchRaw, () => null);
  return useMemo(() => parseAccountSwitch(raw), [raw]);
}

function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (notify) => {
      const query = window.matchMedia('(prefers-reduced-motion: reduce)');
      query.addEventListener('change', notify);
      return () => query.removeEventListener('change', notify);
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false,
  );
}

export function AccountSwitchOverlay({ ready }: { ready: boolean }) {
  const { currentUser } = useAppStore();
  const signal = useAccountSwitchSignal();
  const reduced = useReducedMotion();
  const fetching = useIsFetching();
  // The shell is up and no query is in flight: the moment the sweep is saved for.
  const settled = ready && fetching === 0;
  // The blueprints are on screen, waiting out the load.
  const [built, setBuilt] = useState(false);
  // The gate opened and the scan line is crossing.
  const [sweeping, setSweeping] = useState(false);
  // The sweep and the beat on the finished shell are over.
  const [swept, setSwept] = useState(false);
  // MAX_HOLD passed with the app still loading, so the sweep plays anyway.
  const [capped, setCapped] = useState(false);
  // The layer has faded and is off the screen.
  const [dismissed, setDismissed] = useState(false);

  // The session we landed on is not the one that asked to be landed on: a back/forward or a
  // sign-out in between, so there is nothing to hand over.
  const wrongAccount = !!signal && !!currentUser && currentUser.id !== signal.to;
  const leaving = swept;

  useEffect(() => {
    if (!signal || wrongAccount || dismissed) return;
    const timers = [
      window.setTimeout(() => setBuilt(true), reduced ? 0 : BUILD),
      window.setTimeout(() => setCapped(true), MAX_HOLD),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [signal, wrongAccount, dismissed, reduced]);

  // The animation is held back until everything has loaded, so what the reader sees last is the
  // whole sweep landing on the real screen rather than a half-played one fading out early.
  useEffect(() => {
    if (sweeping || !built || !(settled || capped)) return;
    const timer = window.setTimeout(() => setSweeping(true), 0);
    return () => window.clearTimeout(timer);
  }, [sweeping, built, settled, capped]);

  useEffect(() => {
    if (!sweeping || swept) return;
    const timer = window.setTimeout(() => setSwept(true), reduced ? 0 : SWEEP + HOLD);
    return () => window.clearTimeout(timer);
  }, [sweeping, swept, reduced]);

  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => {
      clearAccountSwitch();
      setDismissed(true);
    }, reduced ? 0 : SETTLE);
    return () => window.clearTimeout(timer);
  }, [leaving, reduced]);

  useEffect(() => {
    if (wrongAccount) clearAccountSwitch();
  }, [wrongAccount]);

  if (!signal || wrongAccount || dismissed) return null;

  const fade = { transitionDuration: reduced ? '0ms' : `${SWEEP}ms` };

  // The identity lives in the shell's own header row, in both copies, so there is exactly one
  // rule under it and nothing is painted over the drawn sheet from outside its geometry.
  const identity = (
    <>
      <Avatar className="size-9 shrink-0">
        <AvatarFallback className={cn('text-[11px] font-bold text-white', roleColors[signal.role])}>
          {initialsOf(signal.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">Switching to {signal.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {roleLabels[signal.role]}
          {signal.tenantName ? ` · ${signal.tenantName}` : ''}
        </p>
      </div>
      <p className="ml-auto shrink-0 text-xs text-muted-foreground">{sweeping ? 'Opening' : 'Loading'}</p>
    </>
  );

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={!leaving}
      className={cn(
        'fixed inset-0 z-[100] overflow-hidden bg-background transition-opacity ease-spring',
        leaving ? 'opacity-0' : 'opacity-100',
      )}
      style={{ transitionDuration: reduced ? '0ms' : `${SETTLE}ms` }}
    >
      {/* The shell the app is already showing while it boots, so nothing new appears when this
          layer steps aside. The blueprint copy is laid over it and swept away. */}
      <div className="absolute inset-0 transition-opacity ease-spring" style={{ opacity: sweeping ? 1 : 0, ...fade }}>
        <FullPageSkeleton header={identity} />
      </div>
      <div
        className="blueprint-grid blueprint-draw absolute inset-0 transition-opacity ease-spring"
        style={{ opacity: sweeping ? 0 : 1, ...fade, '--print-ms': `${BUILD}ms` } as CSSProperties}
      >
        <FullPageSkeleton blueprint header={identity} />
        {/* The print head. Everything below it is masked off until it passes, so the sidebar, the
            stat cards and the table are all drawn by the same travelling line. */}
        {!built && !reduced && <span className="account-switch-head" />}
        {sweeping && !reduced && <span className="account-switch-scan" />}
      </div>
    </div>
  );
}
