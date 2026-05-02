import { create } from 'zustand';
import { AppState, AppUser, UserRole } from './types';
import { 
  STORAGE_KEYS, invalidateCache, parseScreenFromPath, parseTenantFromPath, 
  isValidScreen, CACHE_TTL
} from './utils';
import { getCookie } from '@/lib/cookies';

function getInitialUser(): { isLoggedIn: boolean; currentUser: AppUser | null } {
  if (typeof window === 'undefined') return { isLoggedIn: false, currentUser: null };
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    const token = getCookie('school_token');
    
    // Security: Only consider logged in if BOTH localStorage user and cookie token exist
    if (stored && token) {
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

function getInitialTenantInfo(): { id: string | null; slug: string | null; name: string | null; logo: string | null } {
  if (typeof window === 'undefined') return { id: null, slug: null, name: null, logo: null };
  try {
    return {
      id: localStorage.getItem('schoolsaas_tenant_id'),
      slug: localStorage.getItem('schoolsaas_tenant_slug'),
      name: localStorage.getItem('schoolsaas_tenant_name'),
      logo: localStorage.getItem('schoolsaas_tenant_logo'),
    };
  } catch { return { id: null, slug: null, name: null, logo: null }; }
}

function buildUrl(tenantId: string | null, tenantSlug: string | null, screen: string): string {
  const identifier = tenantSlug || tenantId;
  if (!identifier) return `/${screen}`;
  return screen === 'dashboard' ? `/${identifier}` : `/${identifier}/${screen}`;
}

const initialUser = getInitialUser();

export const useAppStore = create<AppState>((set, get) => ({
  ...initialUser,
  currentScreen: getInitialScreen(initialUser.currentUser),
  currentSubScreen: null,
  sidebarOpen: getInitialSidebar(),
  currentTenantId: (typeof window !== 'undefined' ? parseTenantFromPath(window.location.pathname) : null) || getInitialTenantInfo().id || initialUser.currentUser?.tenantId || null,
  currentTenantSlug: getInitialTenantInfo().slug || initialUser.currentUser?.tenantSlug || null,
  currentTenantName: getInitialTenantInfo().name || initialUser.currentUser?.tenantName || null,
  currentTenantLogo: getInitialTenantInfo().logo || null,

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
      currentTenantLogo: user.tenantLogo || null,
    });
    get().refreshPermissions();
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.LAST_SCREEN);
        localStorage.removeItem('school_token');
        localStorage.removeItem('schoolsaas_tenant_id');
        localStorage.removeItem('schoolsaas_tenant_slug');
        localStorage.removeItem('schoolsaas_tenant_name');
        localStorage.removeItem('schoolsaas_tenant_logo');
        localStorage.removeItem('schoolsaas_sidebar_state');
        sessionStorage.clear();
      } catch { /* ignore */ }
    }
    invalidateCache();
    if (typeof window !== 'undefined') {
      try {
        // Clear all cookies
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        }
      } catch { /* ignore */ }
    }
    set({
      isLoggedIn: false,
      currentUser: null,
      currentScreen: 'dashboard',
      sidebarOpen: false,
      currentTenantId: null,
      currentTenantSlug: null,
      currentTenantName: null,
      currentTenantLogo: null,
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
          tenantLogo: userData.tenantLogo,
          customRole: userData.customRole || null,
          platformRole: userData.platformRole || null,
        };
        set({ currentUser: updatedUser });
        
        // Sync logo if available in user data but missing in tenant state
        if (userData.tenantLogo && !get().currentTenantLogo) {
          get().setCurrentTenant(
            userData.tenantId, 
            userData.tenantName, 
            userData.tenantSlug, 
            userData.tenantLogo
          );
        }

        if (typeof window !== 'undefined') {

          try { localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser)); } catch { /* ignore */ }
        }
      }
    } catch { /* silent fail */ }
  },

  setCurrentScreen: (screen) => {
    if (typeof window !== 'undefined') {
      try { localStorage.setItem(STORAGE_KEYS.LAST_SCREEN, screen); } catch { /* ignore */ }
    }
    set({ currentScreen: screen, currentSubScreen: null }); // Reset sub-screen when changing main screen
  },

  setCurrentSubScreen: (subScreen) => {
    set({ currentSubScreen: subScreen });
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

  setCurrentTenant: async (id, name, slug, logo) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('schoolsaas_tenant_id', id || '');
        localStorage.setItem('schoolsaas_tenant_name', name || '');
        localStorage.setItem('schoolsaas_tenant_slug', slug || '');
        
        // --- Aggressive Logo Caching Logic ---
        const CACHE_KEY = `schoolsaas_logo_cache_${id}`;
        const cachedStr = localStorage.getItem(CACHE_KEY);
        const now = Date.now();
        const EIGHT_HOURS = 8 * 60 * 60 * 1000; // ~3 times a day max

        let finalLogo = logo;

        if (logo) {
          if (cachedStr) {
            const cached = JSON.parse(cachedStr);
            // If same URL and not expired, use cached data
            if (cached.url === logo && (now - cached.timestamp < EIGHT_HOURS)) {
              finalLogo = cached.data;
            } else {
              // Expired or new URL: Fetch and convert to base64
              try {
                const response = await fetch(logo);
                const blob = await response.blob();
                const reader = new FileReader();
                const base64Data = await new Promise<string>((resolve) => {
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.readAsDataURL(blob);
                });
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                  url: logo,
                  data: base64Data,
                  timestamp: now
                }));
                finalLogo = base64Data;
              } catch (e) {
                console.warn("Failed to cache logo:", e);
                // Fallback to URL
              }
            }
          } else {
            // First time: Fetch and cache
            try {
              const response = await fetch(logo);
              const blob = await response.blob();
              const reader = new FileReader();
              const base64Data = await new Promise<string>((resolve) => {
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
              });
              localStorage.setItem(CACHE_KEY, JSON.stringify({
                url: logo,
                data: base64Data,
                timestamp: now
              }));
              finalLogo = base64Data;
            } catch (e) {
              console.warn("Failed to cache logo:", e);
            }
          }
        }
        
        localStorage.setItem('schoolsaas_tenant_logo', finalLogo || '');
        set({ currentTenantId: id, currentTenantName: name, currentTenantSlug: slug, currentTenantLogo: finalLogo });
      } catch { /* ignore */ }
    } else {
      set({ currentTenantId: id, currentTenantName: name, currentTenantSlug: slug, currentTenantLogo: logo });
    }
  },


}));

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    const screen = parseScreenFromPath(window.location.pathname);
    useAppStore.setState({ currentScreen: screen, sidebarOpen: false });
  });
}
