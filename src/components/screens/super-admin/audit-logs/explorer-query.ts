// The explorer's own view of an audit event: what a line is made of, and what the query matches.

import {
  getActionCategory,
  humanizeAction,
  type AuditLog,
  type LogCategory,
} from "./types";

export const QUERY_KEYS = [
  "category",
  "action",
  "module",
  "tenant",
  "operator",
  "ip",
] as const;
export type QueryKey = (typeof QUERY_KEYS)[number];

export const QUERY_PLACEHOLDER = "category:delete tenant:demo -operator:riya";

export interface Term {
  /** Undefined for free text. */
  key?: QueryKey;
  value: string;
  negative: boolean;
  /** Offsets into the raw query, so the highlighter can colour exactly this slice. */
  start: number;
  end: number;
  valueStart: number;
}

export interface Field {
  key: string;
  value: string;
}

export interface TimeParts {
  /** "11 Nov" — dimmed in the row, since the list is newest first. */
  day: string;
  /** "14:03:27" */
  main: string;
  /** ".482" */
  ms: string;
  full: string;
}

export interface LogRow {
  id: string;
  log: AuditLog;
  category: LogCategory;
  action: string;
  actionText: string;
  module: string;
  tenant: string;
  slug: string;
  operator: string;
  email: string;
  ip: string;
  /** The first two payload fields, as `key=value`, so a line reads like a log message. */
  summary: string;
  fields: Field[];
  /** Raw payload when it isn't JSON, else null. */
  raw: string | null;
  time: TimeParts;
  haystack: string;
}

function toDate(value: string): Date | null {
  if (!value) return null;
  const num = Number(value);
  const date = !Number.isNaN(num) && value.length > 10 ? new Date(num) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function timePartsOf(value: string): TimeParts {
  const date = toDate(value);
  if (!date) return { day: "–", main: "--:--:--", ms: "", full: "Unknown time" };
  return {
    day: date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
    main: date.toLocaleTimeString("en-GB", { hour12: false }),
    ms: `.${String(date.getMilliseconds()).padStart(3, "0")}`,
    full: date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };
}

function short(value: string): string {
  return value.length > 160 ? `${value.slice(0, 160)}…` : value;
}

function flatten(value: unknown, prefix: string, out: Field[], depth: number) {
  if (out.length >= 40 || depth > 4) return;
  if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      flatten(child, prefix ? `${prefix}.${key}` : key, out, depth + 1);
    }
    return;
  }
  out.push({
    key: prefix || "value",
    value: short(value === null || value === undefined ? "–" : String(value)),
  });
}

export function rowOf(log: AuditLog): LogRow {
  let payload: unknown = null;
  let raw: string | null = null;
  const details = log.details ?? "";
  try {
    payload = JSON.parse(details);
  } catch {
    raw = details || null;
  }
  const fields: Field[] = [];
  if (payload !== null && typeof payload === "object") {
    flatten(payload, "", fields, 0);
  } else if (raw) {
    fields.push({ key: "details", value: short(raw) });
  }

  const moduleName = log.resource || "system";
  const operator = log.user?.name || (log.tenant ? `${log.tenant.name} (system)` : "Platform engine");
  const email = log.user?.email || log.tenant?.email || "–";
  const ip = log.ipAddress || "internal";
  const tenant = log.tenant?.name || "Platform";
  const slug = log.tenant?.slug || "sysroot";
  const summary = fields
    .slice(0, 2)
    .map((field) => `${field.key}=${field.value}`)
    .join(" ");
  const actionText = humanizeAction(log.action);
  const category = getActionCategory(log.action);

  return {
    id: log.id,
    log,
    category,
    action: log.action,
    actionText,
    module: moduleName,
    tenant,
    slug,
    operator,
    email,
    ip,
    summary,
    fields,
    raw,
    time: timePartsOf(log.createdAt),
    haystack: [actionText, log.action, moduleName, tenant, slug, operator, email, ip, summary]
      .join(" ")
      .toLowerCase(),
  };
}

/* --- The query ---------------------------------------------------------------------------- */

const KEYS: readonly string[] = QUERY_KEYS;

export function parse(query: string): Term[] {
  const terms: Term[] = [];
  const found = query.matchAll(/\S+/g);
  for (const match of found) {
    const at = match.index ?? 0;
    const end = at + match[0].length;
    let start = at;
    let negative = false;
    if (match[0].startsWith("-")) {
      negative = true;
      start += 1;
    }
    const body = query.slice(start, end);
    const colon = body.indexOf(":");
    const key = colon > 0 ? (body.slice(0, colon).toLowerCase() as QueryKey) : undefined;
    const known = !!key && KEYS.includes(key);
    let valueStart = known ? start + colon + 1 : start;
    let value = known ? body.slice(colon + 1) : body;
    if (value.startsWith('"')) {
      valueStart += 1;
      value = value.slice(1);
      if (value.endsWith('"')) {
        value = value.slice(0, -1);
      }
    }
    terms.push({
      key: known ? key : undefined,
      value,
      negative,
      start,
      end,
      valueStart,
    });
  }
  return terms;
}

function fieldOf(term: Term, row: LogRow): string {
  switch (term.key) {
    case "category":
      return row.category.toLowerCase();
    case "action":
      return `${row.action} ${row.actionText}`.toLowerCase();
    case "module":
      return row.module.toLowerCase();
    case "tenant":
      return `${row.tenant} ${row.slug}`.toLowerCase();
    case "operator":
      return `${row.operator} ${row.email}`.toLowerCase();
    case "ip":
      return row.ip.toLowerCase();
    default:
      return row.haystack;
  }
}

export function rowPasses(terms: Term[], row: LogRow): boolean {
  return terms.every((term) => {
    if (!term.value) return true;
    const hit = fieldOf(term, row).includes(term.value.toLowerCase());
    return term.negative ? !hit : hit;
  });
}

/** The query with this key's term replaced by `value`, or removed when it is null. */
export function withTerm(query: string, key: QueryKey, value: string | null): string {
  const kept = parse(query)
    .filter((term) => term.key !== key)
    .map((term) => query.slice(term.start, term.end));
  if (value) kept.push(/\s/.test(value) ? `${key}:"${value}"` : `${key}:${value}`);
  return kept.join(" ");
}
