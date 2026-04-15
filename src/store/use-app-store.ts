import { create } from 'zustand';

export type UserRole = 'super_admin' | 'admin' | 'teacher' | 'student' | 'parent' | 'staff';

export interface CustomRoleInfo {
  id: string;
  name: string;
  color: string;
  permissions: Record<string, string[]>;
}

export interface PlatformRoleInfo {
  id: string;
  name: string;
  color: string;
  permissions: Record<string, string[]>;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  tenantId?: string;
  tenantSlug?: string;
  tenantName?: string;
  customRole?: CustomRoleInfo | null;
  platformRole?: PlatformRoleInfo | null;
}

// ── Storage Keys ──
const STORAGE_KEYS = {
  // localStorage: Persistent across sessions
  USER: 'schoolsaas_user',          // User session
  THEME: 'schoolsaas-theme',         // Theme preference (handled by next-themes)
  LAST_SCREEN: 'schoolsaas_last_screen', // Last visited screen

  // sessionStorage: Current session only
  SIDEBAR_STATE: 'schoolsaas_sidebar',  // Sidebar open/closed state
  SEARCH_QUERIES: 'schoolsaas_searches', // Recent search queries
} as const;

// ── Cache TTL for API data (stored in memory + sessionStorage) ──
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ── In-memory API cache ──
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const apiCache = new Map<string, CacheEntry<unknown>>();

// ── API Cache helpers ──
export function getCached<T>(key: string): T | null {
  const entry = apiCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    apiCache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCached<T>(key: string, data: T): void {
  apiCache.set(key, { data, timestamp: Date.now() });
  // Using LocalStorage for 'save more' persistence
  try {
    localStorage.setItem(`schoolsaas_cache_${key}`, JSON.stringify(data));
    localStorage.setItem(`schoolsaas_cache_ts_${key}`, String(Date.now()));
  } catch { /* ignore quota */ }
}

export function invalidateCache(key?: string): void {
  if (key) {
    apiCache.delete(key);
    try { localStorage.removeItem(`schoolsaas_cache_${key}`); localStorage.removeItem(`schoolsaas_cache_ts_${key}`); } catch { /* ignore */ }
  } else {
    apiCache.clear();
    try {
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith('schoolsaas_cache_')) localStorage.removeItem(k);
      });
    } catch { /* ignore */ }
  }
}

// Restore cache from localStorage on init
if (typeof window !== 'undefined') {
  try {
    // If user refreshes the browser manually, we invalidate the API cache 
    // to give them fresh data as requested.
    const navEntries = performance.getEntriesByType('navigation');
    const isReload = navEntries.length > 0 && (navEntries[0] as PerformanceNavigationTiming).type === 'reload';
    
    if (isReload) {
      invalidateCache();
    } else {
      // Normal mount (first visit or back button) -> restore cache
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith('schoolsaas_cache_') && !k.endsWith('_ts_')) {
          const tsKey = k.replace('schoolsaas_cache_', 'schoolsaas_cache_ts_');
          const ts = Number(localStorage.getItem(tsKey));
          const raw = localStorage.getItem(k);
          if (ts && raw && Date.now() - ts < CACHE_TTL) {
            const dataKey = k.replace('schoolsaas_cache_', '');
            apiCache.set(dataKey, { data: JSON.parse(raw), timestamp: ts });
          }
        }
      });
    }
  } catch { /* ignore */ }
}

// ── App State ──
interface AppState {
  isLoggedIn: boolean;
  currentUser: AppUser | null;
  login: (user: AppUser) => void;
  logout: () => void;
  refreshPermissions: () => Promise<void>;

  currentScreen: string;
  setCurrentScreen: (screen: string) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  currentTenantId: string | null;
  currentTenantSlug: string | null;
  currentTenantName: string | null;
  setCurrentTenant: (id: string, name: string, slug: string) => void;
}

// ── Initial state helpers ──
function getInitialUser(): { isLoggedIn: boolean; currentUser: AppUser | null } {
  if (typeof window === 'undefined') return { isLoggedIn: false, currentUser: null };
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Handle both plain objects and Zustand-wrapped persist objects
      const userData = parsed.state ? parsed.state.currentUser : parsed;
      if (userData && userData.id) {
        return { isLoggedIn: true, currentUser: userData };
      }
    }
  } catch { /* ignore */ }
  return { isLoggedIn: false, currentUser: null };
}

function getInitialScreen(currentUser: AppUser | null): string {
  if (typeof window === 'undefined') return 'dashboard';
  // Try to restore from localStorage first
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LAST_SCREEN);
    if (saved) {
      if (currentUser && isValidScreen(currentUser.role, saved)) {
        return saved;
      }
    }
  } catch { /* ignore */ }
  const pathname = window.location.pathname;
  return parseScreenFromPath(pathname) || 'dashboard';
}

function getInitialSidebar(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR_STATE);
    return saved === 'true';
  } catch { /* ignore */ }
  return false;
}

function getInitialTenantInfo(): { id: string | null; slug: string | null; name: string | null } {
  if (typeof window === 'undefined') return { id: null, slug: null, name: null };
  try {
    return {
      id: localStorage.getItem('schoolsaas_tenant_id'),
      slug: localStorage.getItem('schoolsaas_tenant_slug'),
      name: localStorage.getItem('schoolsaas_tenant_name'),
    };
  } catch { return { id: null, slug: null, name: null }; }
}

// ── URL parsing ──
function parseScreenFromPath(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length >= 2) return parts[1] || 'dashboard';
  if (parts.length === 1) return parts[0];
  return 'dashboard';
}

function parseTenantFromPath(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return null;
  // If the first part is a reserved platform keyword, it's not a tenant ID
  const reserved = ['login', 'api', 'admin', 'super-admin'];
  if (reserved.includes(parts[0])) return null;
  return parts[0];
}

const validScreens: Record<UserRole, string[]> = {
  super_admin: ['dashboard', 'tenants', 'billing', 'users', 'audit-logs', 'platform-analytics', 'feature-flags', 'roles', 'staff', 'settings', 'manage-admins'],
  admin: ['dashboard', 'students', 'teachers', 'parents', 'classes', 'subjects', 'attendance', 'fees', 'notices', 'timetable', 'calendar', 'reports', 'subscriptions', 'roles', 'staff', 'tickets', 'school-settings'],
  teacher: ['dashboard', 'my-classes', 'take-attendance', 'grade-management', 'assignments', 'timetable', 'notices', 'calendar', 'tickets'],
  student: ['dashboard', 'my-classes', 'my-grades', 'my-attendance', 'assignments', 'timetable', 'notices', 'fees', 'calendar', 'tickets'],
  parent: ['dashboard', 'children', 'grades', 'attendance', 'fees', 'notices', 'timetable', 'subscription', 'calendar', 'tickets'],
  staff: ['dashboard', 'students', 'teachers', 'attendance', 'fees', 'grades', 'notices', 'timetable', 'calendar', 'classes', 'subjects', 'reports', 'tickets'],
};

function isValidScreen(role: UserRole, screen: string): boolean {
  return validScreens[role]?.includes(screen) ?? false;
}

function buildUrl(tenantId: string | null, screen: string): string {
  const state = useAppStore.getState();
  const identifier = state.currentTenantSlug || tenantId;
  if (!identifier) return screen === 'dashboard' ? '/' : `/${screen}`;
  return screen === 'dashboard' ? `/${identifier}` : `/${identifier}/${screen}`;
}

// ── Store ──
const initialUser = getInitialUser();

export const useAppStore = create<AppState>((set, get) => ({
  ...initialUser,
  currentScreen: getInitialScreen(initialUser.currentUser),
  sidebarOpen: getInitialSidebar(),
  currentTenantId: (typeof window !== 'undefined' ? parseTenantFromPath(window.location.pathname) : null) || getInitialTenantInfo().id || initialUser.currentUser?.tenantId || null,
  currentTenantSlug: getInitialTenantInfo().slug || initialUser.currentUser?.tenantSlug || null,
  currentTenantName: getInitialTenantInfo().name || initialUser.currentUser?.tenantName || null,

  login: (user) => {
    if (typeof window !== 'undefined') {
      try { localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)); } catch { /* ignore */ }
    }
    // Invalidate API cache on login (fresh data for potentially different user context)
    invalidateCache();
    set({
      isLoggedIn: true,
      currentUser: user,
      currentScreen: 'dashboard',
      currentTenantId: user.tenantId || null,
      currentTenantSlug: user.tenantSlug || null,
      currentTenantName: user.tenantName || null,
    });
    // Fetch fresh data from DB (permissions, platformRole, etc.)
    get().refreshPermissions();
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.LAST_SCREEN);
        localStorage.removeItem('school_token');
      } catch { /* ignore */ }
    }
    invalidateCache();
    set({
      isLoggedIn: false,
      currentUser: null,
      currentScreen: 'dashboard',
      sidebarOpen: false,
      currentTenantId: null,
      currentTenantSlug: null,
      currentTenantName: null,
    });
  },

  refreshPermissions: async () => {
    const state = get();
    if (!state.isLoggedIn || !state.currentUser) return;
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const token = typeof window !== 'undefined' ? localStorage.getItem('school_token') : null;
      const res = await fetch(`${apiBase}/auth/me?userId=${encodeURIComponent(state.currentUser.id)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const userData = await res.json();
        const updatedUser: AppUser = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role as UserRole,
          avatar: userData.avatar,
          tenantId: userData.tenantId,
          tenantSlug: userData.tenantSlug,
          tenantName: userData.tenantName,
          customRole: userData.customRole || null,
          platformRole: userData.platformRole || null,
        };
        set({ currentUser: updatedUser });
        if (typeof window !== 'undefined') {
          try { localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser)); } catch { /* ignore */ }
        }
      }
    } catch { /* silent fail - use cached permissions */ }
  },

  setCurrentScreen: (screen) => {
    const state = get();
    if (typeof window !== 'undefined') {
      const url = buildUrl(state.currentTenantId, screen);
      window.history.pushState({}, '', url);
      // Persist last screen to localStorage
      try { localStorage.setItem(STORAGE_KEYS.LAST_SCREEN, screen); } catch { /* ignore */ }
    }
    set({ currentScreen: screen });
  },

  setSidebarOpen: (open) => {
    if (typeof window !== 'undefined') {
      try { localStorage.setItem(STORAGE_KEYS.SIDEBAR_STATE, String(open)); } catch { /* ignore */ }
    }
    set({ sidebarOpen: open });
  },

  toggleSidebar: () => {
    const current = get().sidebarOpen;
    if (typeof window !== 'undefined') {
      try { localStorage.setItem(STORAGE_KEYS.SIDEBAR_STATE, String(!current)); } catch { /* ignore */ }
    }
    set({ sidebarOpen: !current });
  },

  setCurrentTenant: (id, name, slug) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('schoolsaas_tenant_id', id || '');
        localStorage.setItem('schoolsaas_tenant_name', name || '');
        localStorage.setItem('schoolsaas_tenant_slug', slug || '');
      } catch { /* ignore */ }
    }
    set({ currentTenantId: id, currentTenantName: name, currentTenantSlug: slug });
  },
}));

// ── Browser back/forward listener ──
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    const pathname = window.location.pathname;
    const screen = parseScreenFromPath(pathname);
    useAppStore.setState({
      currentScreen: screen,
      sidebarOpen: false,
    });
  });
}
