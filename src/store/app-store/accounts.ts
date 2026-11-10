import type { AppUser } from './types';
import { STORAGE_KEYS, SESSION_EXPIRY_DAYS } from './utils';
import { setCookie } from '@/lib/cookies';

export const MAX_ACCOUNTS = 5;

const VAULT_KEY = 'schoolsaas_accounts:v1';
const TOKEN_KEY = 'school_token';
const REFRESH_KEY = 'school_refresh_token';
const TENANT_KEYS = {
  id: 'schoolsaas_tenant_id',
  slug: 'schoolsaas_tenant_slug',
  name: 'schoolsaas_tenant_name',
  logo: 'schoolsaas_tenant_logo',
} as const;

export type StoredAccount = {
  user: AppUser;
  token: string;
  refreshToken: string;
  addedAt: number;
};

type Vault = { accounts: StoredAccount[]; activeUserId: string | null };

export type AddResult =
  | { ok: true; account: StoredAccount; replaced: boolean }
  | { ok: false; reason: 'full' | 'invalid' };

/** Where an account's own workspace opens, matching the path the login screen uses. */
export function dashboardHref(user: AppUser): string {
  const target = user.tenantSlug || user.tenantId;
  return target ? `/${target}/dashboard` : '/dashboard';
}

const hasStorage = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined';

const isAccount = (value: any): value is StoredAccount =>
  !!value?.user?.id && typeof value.user.name === 'string' && typeof value.token === 'string' && value.token.length > 0;

function read(): Vault {
  if (!hasStorage()) return { accounts: [], activeUserId: null };
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    if (!raw) return adoptGlobals();
    const parsed = JSON.parse(raw);
    const accounts = (Array.isArray(parsed?.accounts) ? parsed.accounts : []).filter(isAccount);
    if (!accounts.length) return adoptGlobals();
    const wanted = accounts.find((each) => each.user.id === parsed?.activeUserId);
    return { accounts, activeUserId: wanted ? wanted.user.id : (accounts[0]?.user.id ?? null) };
  } catch {
    return { accounts: [], activeUserId: null };
  }
}

/** A session signed in before the vault existed is adopted the first time anything reads it. */
function adoptGlobals(): Vault {
  const adopted = fromGlobals();
  if (!adopted) return { accounts: [], activeUserId: null };
  const seeded = { accounts: [adopted], activeUserId: adopted.user.id };
  write(seeded);
  return seeded;
}

function write(vault: Vault): void {
  if (!hasStorage()) return;
  try {
    localStorage.setItem(
      VAULT_KEY,
      JSON.stringify({ accounts: vault.accounts.slice(0, MAX_ACCOUNTS), activeUserId: vault.activeUserId }),
    );
  } catch {
    /* ignore */
  }
}

/** Mirrors what login.tsx + store.login() persist, so the rest of the app keeps reading one session. */
export function project(account: StoredAccount): void {
  if (!hasStorage()) return;
  localStorage.setItem(TOKEN_KEY, account.token);
  setCookie(TOKEN_KEY, account.token, SESSION_EXPIRY_DAYS);
  if (account.refreshToken) localStorage.setItem(REFRESH_KEY, account.refreshToken);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(account.user));
  // Fresh stamp so refreshPermissions() does not fire /auth/me against a session we just set.
  localStorage.setItem('schoolsaas_profile_cache_time', String(Date.now()));
  localStorage.setItem(TENANT_KEYS.id, account.user.tenantId ?? '');
  localStorage.setItem(TENANT_KEYS.slug, account.user.tenantSlug ?? '');
  localStorage.setItem(TENANT_KEYS.name, account.user.tenantName ?? '');
  localStorage.setItem(TENANT_KEYS.logo, account.user.tenantLogo ?? '');
}

function fromGlobals(): StoredAccount | null {
  if (!hasStorage()) return null;
  const token = localStorage.getItem(TOKEN_KEY);
  const stored = localStorage.getItem(STORAGE_KEYS.USER);
  if (!token || !stored) return null;
  try {
    const parsed = JSON.parse(stored);
    const user = parsed?.state ? parsed.state.currentUser : parsed;
    if (!isAccount({ user, token })) return null;
    return { user, token, refreshToken: localStorage.getItem(REFRESH_KEY) ?? '', addedAt: Date.now() };
  } catch {
    return null;
  }
}

export function listAccounts(): StoredAccount[] {
  return read().accounts;
}

export function countAccounts(): number {
  return read().accounts.length;
}

/** Adoption lives in read(), so every entry point sees a session that predates the vault. */
export function getActiveAccount(): StoredAccount | null {
  const vault = read();
  return vault.accounts.find((each) => each.user.id === vault.activeUserId) ?? null;
}

export function addAccount(
  session: { user: AppUser; token: string; refreshToken?: string },
  options: { activate?: boolean } = {}
): AddResult {
  if (!session?.token || !session?.user?.id) return { ok: false, reason: 'invalid' };
  const vault = read();
  const account: StoredAccount = {
    user: session.user,
    token: session.token,
    refreshToken: session.refreshToken ?? '',
    addedAt: Date.now(),
  };
  const at = vault.accounts.findIndex((each) => each.user.id === account.user.id);
  if (at >= 0) {
    account.addedAt = vault.accounts[at].addedAt;
    vault.accounts[at] = account;
  } else {
    if (vault.accounts.length >= MAX_ACCOUNTS) return { ok: false, reason: 'full' };
    vault.accounts.push(account);
  }
  if (options.activate) vault.activeUserId = account.user.id;
  write(vault);
  if (options.activate) project(account);
  return { ok: true, account, replaced: at >= 0 };
}

export function updateAccountTokens(
  userId: string,
  token: string,
  refreshToken: string
): StoredAccount | null {
  const vault = read();
  const account = vault.accounts.find((each) => each.user.id === userId);
  if (!account) return null;
  account.token = token;
  account.refreshToken = refreshToken;
  write(vault);
  return account;
}

/** Keeps a switched-away account's permissions fresh, so switching back shows what it has now. */
export function updateAccountUser(userId: string, user: AppUser): StoredAccount | null {
  const vault = read();
  const account = vault.accounts.find((each) => each.user.id === userId);
  if (!account) return null;
  account.user = user;
  write(vault);
  return account;
}

/** Entries are appended, so the last one left is the most recently added. */
export function removeAccount(userId: string): { removed: boolean; next: StoredAccount | null } {
  const vault = read();
  const remaining = vault.accounts.filter((each) => each.user.id !== userId);
  if (remaining.length === vault.accounts.length) return { removed: false, next: null };
  const wasActive = vault.activeUserId === userId;
  const next = wasActive ? (remaining[remaining.length - 1] ?? null) : null;
  write({ accounts: remaining, activeUserId: wasActive ? (next?.user.id ?? null) : vault.activeUserId });
  return { removed: true, next };
}

export function setActiveAccount(userId: string): StoredAccount | null {
  const vault = read();
  const account = vault.accounts.find((each) => each.user.id === userId);
  if (!account) return null;
  write({ accounts: vault.accounts, activeUserId: userId });
  project(account);
  return account;
}

export function clearVault(): void {
  if (!hasStorage()) return;
  try {
    localStorage.removeItem(VAULT_KEY);
  } catch {
    /* ignore */
  }
}
