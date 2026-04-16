import { create } from 'zustand';
import { AppState, AppUser, UserRole } from './types';
import { 
  STORAGE_KEYS, invalidateCache, parseScreenFromPath, parseTenantFromPath, 
  isValidScreen, CACHE_TTL
} from './utils';

function getInitialUser(): { isLoggedIn: boolean; currentUser: AppUser | null } {
  if (typeof window === 'undefined') return { isLoggedIn: false, currentUser: null };
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (stored) {
      const parsed = JSON.parse(stored);
      const userData = parsed.state ? parsed.state.currentUser : parsed;
      if (userData && userData.id) return { isLoggedIn: true, currentUser: userData };
    }
  } catch { /* ignore */ }
  return { isLoggedIn: false, currentUser: null };
}

function getInitialScreen(currentUser: AppUser | null): string {
  if (typeof window === 'undefined') return 'dashboard';
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LAST_SCREEN);
    if (saved && currentUser && isValidScreen(currentUser.role, saved)) return saved;
  } catch { /* ignore */ }
  return parseScreenFromPath(window.location.pathname) || 'dashboard';
}

function getInitialSidebar(): boolean {
  if (typeof window === 'undefined') return false;
  try { return localStorage.getItem(STORAGE_KEYS.SIDEBAR_STATE) === 'true'; } catch { return false; }
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

function buildUrl(tenantId: string | null, tenantSlug: string | null, screen: string): string {
  const identifier = tenantSlug || tenantId;
  if (!identifier) return screen === 'dashboard' ? '/' : `/${screen}`;
  return screen === 'dashboard' ? `/${identifier}` : `/${identifier}/${screen}`;
}

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
    invalidateCache();
    set({
      isLoggedIn: true,
      currentUser: user,
      currentScreen: 'dashboard',
      currentTenantId: user.tenantId || null,
      currentTenantSlug: user.tenantSlug || null,
      currentTenantName: user.tenantName || null,
    });
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
    } catch { /* silent fail */ }
  },

  setCurrentScreen: (screen) => {
    const state = get();
    if (typeof window !== 'undefined') {
      const url = buildUrl(state.currentTenantId, state.currentTenantSlug, screen);
      window.history.pushState({}, '', url);
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

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    const screen = parseScreenFromPath(window.location.pathname);
    useAppStore.setState({ currentScreen: screen, sidebarOpen: false });
  });
}
