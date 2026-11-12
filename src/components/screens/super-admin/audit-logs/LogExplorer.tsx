"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Building2,
  Eraser,
  List,
  ListFilter,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import {
  CATEGORIES,
  categoryAccent,
  categoryColors,
  categoryLabel,
  getActionCategory,
  humanizeAction,
  type ActionTypeCount,
  type LogCategory,
} from "./types";
import {
  QUERY_KEYS,
  QUERY_PLACEHOLDER,
  parse,
  withTerm,
  type LogRow,
  type Term,
} from "./explorer-query";

/*
 * The audit trail as a log explorer: a query field that colours its own syntax, a legend that
 * writes into it, the events newest first in a grid you drive with the arrow keys, and the one
 * you pick open in the column on the right (a drawer, while the screen is narrow).
 */

/** A row's height in px, as the stylesheet draws it; the slide-in animation counts on it. */
const ROW = 36;
const COLS = "grid-cols-[124px_96px_112px_minmax(240px,1fr)_168px]";
const VIEWS = [
  { key: "list", label: "List", icon: List },
  { key: "visualize", label: "Visualize", icon: BarChart3 },
] as const;

type View = (typeof VIEWS)[number]["key"];

interface LogExplorerProps {
  loading: boolean;
  /** The page's events, already narrowed by the query. */
  rows: LogRow[];
  /** Events on the page before the query was applied. */
  pageRows: number;
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  onPageChange: (page: number) => void;
  query: string;
  onQueryChange: (query: string) => void;
  live: boolean;
  onLiveChange: (live: boolean) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  tenantFilter: string;
  onTenantFilterChange: (value: string) => void;
  actionFilter: string;
  onActionFilterChange: (value: string) => void;
  tenants: { id: string; name: string }[];
  actionTypes: ActionTypeCount[];
}

const plural = (n: number) => n.toLocaleString("en-US");

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The query in coloured spans, laid exactly over the input's own text. */
function highlight(query: string, terms: Term[]): ReactNode[] {
  const out: ReactNode[] = [];
  let at = 0;
  terms.forEach((term, index) => {
    if (term.start > at) out.push(query.slice(at, term.start));
    if (term.negative) {
      out.push(
        <span key={index} className="text-red-600 dark:text-red-400">
          {query.slice(term.start, term.end)}
        </span>,
      );
    } else if (term.key) {
      out.push(
        <span key={index}>
          <span className="text-brand">{query.slice(term.start, term.valueStart)}</span>
          <span className="text-foreground">{query.slice(term.valueStart, term.end)}</span>
        </span>,
      );
    } else {
      out.push(
        <span key={index} className="text-foreground">
          {query.slice(term.start, term.end)}
        </span>,
      );
    }
    at = term.end;
  });
  if (at < query.length) out.push(query.slice(at));
  // A trailing space would otherwise collapse; the mirror must be exactly as wide as the input's text.
  out.push("​");
  return out;
}

function CategoryBadge({ category, className }: { category: LogCategory; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
        categoryColors[category],
        className,
      )}
    >
      {category}
    </span>
  );
}

function FieldList({ entries }: { entries: readonly (readonly [string, string])[] }) {
  return (
    <dl className="space-y-1.5">
      {entries.map(([key, value], i) => (
        <div key={`${key}-${i}`} className="flex gap-3 text-xs">
          <dt className="w-[104px] shrink-0 truncate text-muted-foreground" title={key}>
            {key}
          </dt>
          <dd className="min-w-0 flex-1 break-words font-mono text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function LogExplorer({
  loading,
  rows,
  pageRows,
  total,
  page,
  totalPages,
  limit,
  onPageChange,
  query,
  onQueryChange,
  live,
  onLiveChange,
  roleFilter,
  onRoleFilterChange,
  tenantFilter,
  onTenantFilterChange,
  actionFilter,
  onActionFilterChange,
  tenants,
  actionTypes,
}: LogExplorerProps) {
  const [view, setView] = useState<View>("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const input = useRef<HTMLInputElement>(null);
  const mirror = useRef<HTMLSpanElement>(null);
  const body = useRef<HTMLDivElement>(null);

  const terms = useMemo(() => parse(query), [query]);
  const selected = rows.find((row) => row.id === selectedId) ?? null;
  const index = selected ? rows.findIndex((row) => row.id === selected.id) : -1;

  /** Repeats are made to differ, so screen readers announce them again. */
  const announce = useCallback(
    (text: string) => setMessage((now) => (now === text ? `${text} ` : text)),
    [],
  );

  const setQuery = (next: string) => {
    onQueryChange(next);
  };

  // A short while after the query changes, say how many events it leaves.
  const summary = `${plural(rows.length)} of ${plural(pageRows)} events`;
  const latest = useRef(summary);
  useEffect(() => {
    latest.current = summary;
  }, [summary]);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const timer = window.setTimeout(() => announce(latest.current), 700);
    return () => window.clearTimeout(timer);
  }, [query, announce]);

  /* --- Motion: rows slide down as new ones come in at the top ------------------------------ */

  const topId = rows[0]?.id;
  const previousTop = useRef<string | undefined>(topId);
  useLayoutEffect(() => {
    const before = previousTop.current;
    previousTop.current = topId;
    const list = body.current;
    if (!list || before === undefined || topId === undefined || before === topId) return;
    const added = rows.findIndex((row) => row.id === before);
    if (added <= 0) return;
    if (prefersReduced()) return;
    const timing = { duration: 420, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" };
    (list.firstElementChild as HTMLElement | null)?.animate(
      [{ transform: `translateY(${-added * ROW}px)` }, { transform: "none" }],
      timing,
    );
  }, [topId, rows]);

  /* --- The query field --------------------------------------------------------------------- */

  const syncMirror = () => {
    const field = input.current;
    const copy = mirror.current;
    if (field && copy) copy.style.transform = `translateX(${-field.scrollLeft}px)`;
  };
  useLayoutEffect(syncMirror, [query]);

  /* --- Opening, stepping, and the keys that do it ------------------------------------------ */

  const open = (row: LogRow) => {
    setSelectedId(row.id);
    setFocusId(row.id);
  };
  const close = () => {
    const id = selected?.id;
    setSelectedId(null);
    if (id) {
      requestAnimationFrame(() =>
        body.current?.querySelector<HTMLElement>(`[data-id="${id}"]`)?.focus(),
      );
    }
  };
  const step = (by: number) => {
    const next = rows[Math.max(0, index) + by];
    if (!next) return;
    open(next);
    body.current?.querySelector<HTMLElement>(`[data-id="${next.id}"]`)?.scrollIntoView({ block: "nearest" });
  };

  const onRootKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const typing = target.tagName === "INPUT" || target.isContentEditable;
    if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      input.current?.focus();
      input.current?.select();
    } else if (event.key === "Escape") {
      if (selected) close();
    }
  };

  const rowKey = (event: ReactKeyboardEvent<HTMLDivElement>, row: LogRow, at: number) => {
    const moves: Record<string, number> = {
      ArrowDown: at + 1,
      ArrowUp: at - 1,
      Home: 0,
      End: rows.length - 1,
      PageDown: Math.min(rows.length - 1, at + 10),
      PageUp: Math.max(0, at - 10),
    };
    if (event.key in moves) {
      event.preventDefault();
      const target = rows[Math.max(0, Math.min(rows.length - 1, moves[event.key]))];
      if (!target) return;
      setFocusId(target.id);
      body.current?.querySelector<HTMLElement>(`[data-id="${target.id}"]`)?.focus();
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open(row);
    }
  };

  const eventText = (row: LogRow) =>
    [
      `${row.category} · ${row.action} · ${row.time.full}`,
      `tenant: ${row.tenant} (@${row.slug})`,
      `operator: ${row.operator} <${row.email}>`,
      `ip: ${row.ip}`,
      `module: ${row.module}`,
      `details: ${row.log.details || "{}"}`,
    ].join("\n");

  /* --- The legend -------------------------------------------------------------------------- */

  const onLegend = (category: LogCategory) => {
    const on = terms.some((term) => term.key === "category" && !term.negative && term.value.toLowerCase() === category.toLowerCase());
    setQuery(withTerm(query, "category", on ? null : category.toLowerCase()));
  };

  const categoryOf = (action: string) => getActionCategory(action);
  const byCategory = useMemo(() => {
    const sums = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<LogCategory, number>;
    for (const row of rows) sums[row.category] += 1;
    return sums;
  }, [rows]);

  const breakdown = useMemo(() => {
    const sorted = [...actionTypes].sort((a, b) => b.count - a.count);
    const top = sorted.slice(0, 14);
    const busiest = Math.max(1, ...top.map((item) => item.count));
    return { top, busiest, grandTotal: actionTypes.reduce((sum, item) => sum + item.count, 0) };
  }, [actionTypes]);

  const rowFocus =
    focusId && rows.some((row) => row.id === focusId)
      ? focusId
      : selected?.id ?? rows[0]?.id;

  const filterSelects = (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={roleFilter} onValueChange={onRoleFilterChange}>
        <SelectTrigger size="sm" className="w-[124px] bg-card" aria-label="Filter by role">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All roles</SelectItem>
          <SelectItem value="super_admin">Super admin</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="staff">Staff</SelectItem>
        </SelectContent>
      </Select>
      <Select value={tenantFilter} onValueChange={onTenantFilterChange}>
        <SelectTrigger size="sm" className="w-[150px] bg-card" aria-label="Filter by school">
          <SelectValue placeholder="School" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All schools</SelectItem>
          {tenants.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={actionFilter} onValueChange={onActionFilterChange}>
        <SelectTrigger size="sm" className="w-[160px] bg-card" aria-label="Filter by action">
          <SelectValue placeholder="Action" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All actions</SelectItem>
          {actionTypes.map((at) => (
            <SelectItem key={at.action} value={at.action}>
              {humanizeAction(at.action)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div
      className="relative flex overflow-hidden rounded-2xl border border-border bg-card shadow-2xs"
      onKeyDown={onRootKey}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Toolbar. */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2.5">
          <div
            role="radiogroup"
            aria-label="View"
            className="flex items-center gap-0.5 rounded-lg border border-border bg-muted p-0.5"
          >
            {VIEWS.map((item) => {
              const on = item.key === view;
              return (
                <button
                  key={item.key}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setView(item.key)}
                  className={cn(
                    "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors",
                    on
                      ? "bg-card text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <item.icon className="size-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {filterSelects}
            <button
              type="button"
              aria-pressed={live}
              onClick={() => onLiveChange(!live)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors",
                live
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
              title={live ? "Fetching new events every 30 seconds" : "Streaming paused"}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  live ? "animate-pulse bg-emerald-500" : "bg-muted-foreground",
                )}
                aria-hidden="true"
              />
              {live ? "Live" : "Paused"}
            </button>
          </div>
        </div>

        {/* The query. */}
        <div className="border-b border-border px-3 py-2.5">
          <label
            className="flex h-10 items-center gap-2 rounded-lg border border-input bg-background px-3 focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/20"
            htmlFor="audit-query"
          >
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="relative h-full min-w-0 flex-1 overflow-hidden">
              <span
                ref={mirror}
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 flex items-center whitespace-pre font-mono text-[13px]"
              >
                {highlight(query, terms)}
              </span>
              <input
                id="audit-query"
                ref={input}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onScroll={syncMirror}
                onSelect={syncMirror}
                onKeyUp={syncMirror}
                onKeyDown={(event) => {
                  if (event.key === "Escape" && query) {
                    event.stopPropagation();
                    setQuery("");
                  }
                }}
                aria-label="Filter events"
                aria-describedby="audit-query-hint"
                placeholder={QUERY_PLACEHOLDER}
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                className="h-full w-full bg-transparent font-mono text-[13px] text-transparent caret-foreground outline-none placeholder:text-muted-foreground/70"
              />
            </span>
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  input.current?.focus();
                }}
                aria-label="Clear the query"
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            ) : (
              <kbd
                aria-hidden="true"
                className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block"
              >
                /
              </kbd>
            )}
          </label>
          <span id="audit-query-hint" className="sr-only">
            Keys: {QUERY_KEYS.join(", ")}. A minus before a term leaves its events out. Press slash
            to come back here.
          </span>
        </div>

        {/* The legend, writing into the query. */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-3 py-2">
          {CATEGORIES.map((category) => {
            const on = terms.some(
              (term) =>
                term.key === "category" &&
                !term.negative &&
                term.value.toLowerCase() === category.toLowerCase(),
            );
            return (
              <button
                key={category}
                type="button"
                aria-pressed={on}
                onClick={() => onLegend(category)}
                className={cn(
                  "inline-flex h-6 items-center gap-1.5 rounded-full border px-2 text-[11px] font-medium transition-colors",
                  on
                    ? "border-brand/40 bg-brand/10 text-brand"
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                title={`${categoryLabel[category]}: ${byCategory[category]} on this page`}
              >
                <span
                  className={cn("size-1.5 rounded-full", categoryAccent[category])}
                  aria-hidden="true"
                />
                {categoryLabel[category]}
                <span className="font-mono text-[10px] opacity-70">{byCategory[category]}</span>
              </button>
            );
          })}
          <p className="ml-auto text-xs text-muted-foreground">
            {loading ? (
              "Loading…"
            ) : query ? (
              <>
                {plural(rows.length)} of {plural(pageRows)} on this page · {plural(total)} events
              </>
            ) : (
              <>{plural(total)} events · newest first</>
            )}
          </p>
        </div>

        {/* The events, or the breakdown. */}
        {view === "list" ? (
          <div className="overflow-x-auto">
            <div
              role="grid"
              aria-label="Audit events, newest first"
              aria-rowcount={rows.length + 1}
              className="min-w-[860px]"
            >
              <div role="rowgroup">
                <div
                  role="row"
                  aria-rowindex={1}
                  className={cn(
                    "grid items-center gap-3 border-b border-border bg-muted px-4 py-2 text-xs font-medium text-muted-foreground",
                    COLS,
                  )}
                >
                  <span role="columnheader">Time</span>
                  <span role="columnheader">Type</span>
                  <span role="columnheader">Module</span>
                  <span role="columnheader">Event</span>
                  <span role="columnheader">Operator</span>
                </div>
              </div>
              <div ref={body} role="rowgroup">
                <div>
                  {loading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "grid h-9 items-center gap-3 border-b border-border/60 px-4",
                            COLS,
                          )}
                        >
                          <Skeleton className="h-3.5 w-24" />
                          <Skeleton className="h-4 w-14 rounded-md" />
                          <Skeleton className="h-3.5 w-16" />
                          <Skeleton className="h-3.5 w-3/4" />
                          <Skeleton className="h-3.5 w-20" />
                        </div>
                      ))
                    : rows.map((row, at) => {
                        const isSelected = selected?.id === row.id;
                        return (
                          <div
                            key={row.id}
                            role="row"
                            aria-rowindex={at + 2}
                            aria-selected={isSelected}
                            tabIndex={row.id === rowFocus ? 0 : -1}
                            data-id={row.id}
                            onClick={() => open(row)}
                            onFocus={() => setFocusId(row.id)}
                            onKeyDown={(event) => rowKey(event, row, at)}
                            className={cn(
                              "grid h-9 cursor-pointer items-center gap-3 border-b border-border/60 px-4 text-sm outline-none transition-colors last:border-b-0 hover:bg-muted focus-visible:bg-muted",
                              COLS,
                              isSelected && "bg-muted",
                            )}
                          >
                            <span
                              role="gridcell"
                              className="truncate font-mono text-xs text-foreground"
                              title={row.time.full}
                            >
                              <span className="text-muted-foreground">{row.time.day} </span>
                              {row.time.main}
                              <span className="text-muted-foreground/70">{row.time.ms}</span>
                            </span>
                            <span role="gridcell">
                              <CategoryBadge category={row.category} />
                            </span>
                            <span
                              role="gridcell"
                              className="truncate text-muted-foreground"
                              title={row.module}
                            >
                              {row.module}
                            </span>
                            <span role="gridcell" className="truncate">
                              <span className="capitalize">{row.actionText}</span>
                              {row.summary && (
                                <span className="ml-2 font-mono text-xs text-muted-foreground">
                                  · {row.summary}
                                </span>
                              )}
                            </span>
                            <span
                              role="gridcell"
                              className="truncate text-muted-foreground"
                              title={`${row.operator} · ${row.email}`}
                            >
                              {row.operator}
                              <span className="text-muted-foreground/70"> @{row.slug}</span>
                            </span>
                          </div>
                        );
                      })}
                </div>
                {!loading && rows.length === 0 && (
                  <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
                    <SlidersHorizontal className="size-5 text-muted-foreground" aria-hidden="true" />
                    <p className="text-sm text-muted-foreground">
                      {query
                        ? "No events on this page match the query."
                        : "No audit events found for these filters."}
                    </p>
                    {query && (
                      <Button size="sm" variant="outline" onClick={() => setQuery("")}>
                        <Eraser />
                        Clear the query
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <section aria-label="Events by action" className="flex-1 px-4 py-4">
            <p className="text-xs text-muted-foreground">
              {plural(breakdown.grandTotal)} events all time, by action. The filters above pick
              which events are listed, not which are counted here.
            </p>
            <ul className="mt-4 space-y-2">
              {breakdown.top.map((item) => {
                const category = categoryOf(item.action);
                return (
                  <li
                    key={item.action}
                    className="grid grid-cols-[minmax(120px,220px)_1fr_56px] items-center gap-3"
                  >
                    <button
                      type="button"
                      onClick={() => setQuery(withTerm(query, "action", item.action))}
                      className="truncate text-left text-sm capitalize text-foreground hover:text-brand"
                      title={`Show only ${humanizeAction(item.action)}`}
                    >
                      {humanizeAction(item.action)}
                    </button>
                    <span className="h-2 overflow-hidden rounded-full bg-muted">
                      <span
                        className={cn("block h-full rounded-full", categoryAccent[category])}
                        style={{ width: `${(item.count / breakdown.busiest) * 100}%` }}
                      />
                    </span>
                    <span className="text-right font-mono text-xs text-muted-foreground">
                      {plural(item.count)}
                    </span>
                  </li>
                );
              })}
              {breakdown.top.length === 0 && (
                <li className="py-6 text-center text-sm text-muted-foreground">
                  Nothing counted yet.
                </li>
              )}
            </ul>
          </section>
        )}

        {/* Pagination. */}
        <div className="mt-auto border-t border-border px-4 py-2.5">
          <DataTablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={(next) => {
              setSelectedId(null);
              onPageChange(next);
            }}
            summary={`Showing ${(page - 1) * limit + 1} to ${Math.min(page * limit, total)} of ${plural(total)} events`}
          />
        </div>
      </div>

      {/* The event, in its own column from xl up and as a drawer below it. */}
      {selected && (
        <>
          <button
            type="button"
            aria-label="Close the event"
            onClick={close}
            className="fixed inset-0 z-40 bg-black/20 xl:hidden"
          />
          <aside
            aria-label="Event details"
            className="fixed inset-y-0 right-0 z-50 flex w-[min(100%,420px)] animate-in slide-in-from-right-4 flex-col border-l border-border bg-card duration-200 xl:static xl:z-auto xl:w-[400px] xl:animate-none xl:shrink-0 xl:shadow-none"
          >
            <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
              <CategoryBadge category={selected.category} />
              <span className="truncate font-mono text-xs text-muted-foreground">
                {selected.time.full}
              </span>
              <span className="ml-auto flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label="Newer event"
                  disabled={index <= 0}
                  onClick={() => step(-1)}
                >
                  <ArrowUp />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label="Older event"
                  disabled={index < 0 || index >= rows.length - 1}
                  onClick={() => step(1)}
                >
                  <ArrowDown />
                </Button>
                <span className="px-1 font-mono text-[11px] text-muted-foreground">
                  {index < 0 ? "–" : index + 1} / {plural(rows.length)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label="Close the event"
                  onClick={close}
                >
                  <X />
                </Button>
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 border-b border-border px-3 py-2.5">
              {query && (
                <Button size="sm" variant="outline" onClick={() => setQuery("")}>
                  <Eraser />
                  Clear query
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setQuery(withTerm(query, "action", selected.action))}
              >
                <ListFilter />
                Same action
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setQuery(withTerm(query, "tenant", selected.slug))}
              >
                <Building2 />
                Same school
              </Button>
              <CopyButton
                value={eventText(selected)}
                label="Copy event"
                toastSubject="Event"
                variant="outline"
                onSuccess={() => announce("Copied the event")}
              />
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-3">
              <section className="space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground">Event</h3>
                <p className="text-sm">
                  <span className="capitalize">{selected.actionText}</span>
                  {selected.summary && (
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      · {selected.summary}
                    </span>
                  )}
                </p>
                <FieldList
                  entries={[
                    ["time", selected.time.full],
                    ["action", selected.action],
                    ["module", selected.module],
                  ]}
                />
              </section>

              <section className="space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground">Who and where</h3>
                <FieldList
                  entries={[
                    ["operator", selected.operator],
                    ["email", selected.email],
                    ["school", `${selected.tenant} (@${selected.slug})`],
                    ["ip", selected.ip],
                  ]}
                />
              </section>

              <section className="space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground">
                  Payload{" "}
                  <span className="font-mono text-[10px] opacity-70">
                    {selected.fields.length}
                  </span>
                </h3>
                {selected.fields.length > 0 ? (
                  <FieldList
                    entries={selected.fields.map((field) => [field.key, field.value])}
                  />
                ) : (
                  <p className="text-xs text-muted-foreground">This event carries no payload.</p>
                )}
              </section>
            </div>
          </aside>
        </>
      )}

      <p className="sr-only" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
