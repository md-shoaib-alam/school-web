// scratch/check-rotation-owner.ts — proves a token rotation belongs to the account that started it.
// Run from school-web: bun scratch/check-rotation-owner.ts

class LS {
  m = new Map<string, string>();
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, String(v)); }
  removeItem(k: string) { this.m.delete(k); }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  get length() { return this.m.size; }
  clear() { this.m.clear(); }
}
Object.defineProperty(globalThis, 'window', { value: {}, configurable: true });
Object.defineProperty(globalThis, 'localStorage', { value: new LS(), configurable: true });

const accounts = await import('@/store/app-store/accounts');
const { persistRotation, adoptConcurrentRotation } = await import('@/lib/api');
const ls = globalThis.localStorage as unknown as LS;

accounts.addAccount({ user: { id: 'ua', name: 'Ada', role: 'admin' } as any, token: 'tA', refreshToken: 'rA' }, { activate: true });
accounts.addAccount({ user: { id: 'ub', name: 'Bo', role: 'admin' } as any, token: 'tB', refreshToken: 'rB' }, { activate: true });

let failures = 0;
const assert = (label: string, cond: boolean) => {
  if (!cond) { console.error('FAIL:', label); failures++; } else { console.log('ok:', label); }
};
const slot = (id: string) => accounts.listAccounts().find((a) => a.user.id === id)!;

// C: globals now hold account B's pair (a switch, not a rotation) — an 'ua' waiter must NOT adopt it.
// Old code adopted here and sent B's token to A's session.
assert('switch-changed globals are not adopted', (await adoptConcurrentRotation('ua', 'rA', 500)) === null);

// A: a rotation of the inactive owner lands only in its own vault slot.
persistRotation('tA2', 'rA2', 'ua');
assert('inactive owner slot updated', slot('ua').refreshToken === 'rA2' && slot('ua').token === 'tA2');
assert('globals untouched by other account rotation', ls.getItem('school_refresh_token') === 'rB' && ls.getItem('school_token') === 'tB');

// D: the owner's own rotation is adopted even though the globals never moved.
assert('owner rotation adopted', (await adoptConcurrentRotation('ua', 'rA', 1000)) === 'tA2');

// B: a rotation of the active owner mirrors into the globals as before.
persistRotation('tB2', 'rB2', 'ub');
assert('active rotation mirrors globals', ls.getItem('school_token') === 'tB2' && ls.getItem('school_refresh_token') === 'rB2');

process.exit(failures ? 1 : 0);
