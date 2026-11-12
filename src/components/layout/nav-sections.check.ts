// Runnable check: `node src/components/layout/nav-sections.check.ts`
// Fails when nav-config gains a tab that no section claims, so the sidebar cannot silently grow a
// "More" group nobody reviewed.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { groupNavItems } from "./nav-sections.ts";

const config = readFileSync(new URL("./nav-config.tsx", import.meta.url), "utf8");
const roles = ["super_admin", "admin", "teacher", "student", "parent", "staff"];
// A role's block runs from its own opener to the next one; its tabs are the 4-space one-liners and
// the 6-space openers, never the 8-space children.
const tabsOf = (role: string) => {
  const start = config.indexOf(`  ${role}: [`);
  const next = roles
    .map((other) => ({ other, at: config.indexOf(`  ${other}: [`) }))
    .filter(({ other, at }) => other !== role && at > start)
    .sort((a, b) => a.at - b.at)[0];
  const block = config.slice(start, next ? next.at : config.length);
  return [...block.matchAll(/^      key: "([^"]+)"|^    \{ key: "([^"]+)"/gm)].map((m) => m[1] ?? m[2]);
};

for (const role of roles) {
  const keys = tabsOf(role);
  assert(keys.length > 0, `${role}: found no tabs — the parser is out of date`);
  const groups = groupNavItems(
    role as never,
    keys.map((key) => ({ key, label: key, icon: null })),
  );
  const stray = groups.find((group) => group.label === "More");
  assert(!stray, `${role}: ungrouped tabs -> ${stray?.items.map((i) => i.key).join(", ")}`);
  const seen = groups.flatMap((group) => group.items.map((i) => i.key));
  assert.equal(seen.length, new Set(seen).size, `${role}: a tab is listed in two sections`);
  assert.deepEqual([...keys].sort(), [...seen].sort(), `${role}: tabs lost or invented`);
}

assert(
  groupNavItems(undefined as never, [{ key: "x", label: "x", icon: null }])[0].items.length === 1,
  "an unknown role still lists everything",
);

console.log("ok — every tab of all six roles has a section, and none is claimed twice");
