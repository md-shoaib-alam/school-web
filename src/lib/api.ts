/**
 * Centralized API client : all requests go to ElysiaJS backend.
 * Includes silent token refresh with request queuing and automatic retry.
 */

import { env } from './env';
import { triggerGlobalRefresh } from './query-client';

const API_BASE = typeof window !== 'undefined' ? '/api/proxy' : env.NEXT_PUBLIC_API_URL;

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('school_token');
}

function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('school_token', token);
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('school_refresh_token');
}

function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('school_refresh_token', token);
}

function getTenantId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('schoolsaas_tenant_id');
}

function buildHeaders(isFormData: boolean = false): Record<string, string> {
  const token = getToken();
  const tenantId = getTenantId();
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
  };
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

// ── Refresh token logic with queue ──

let isRefreshing = false;
let refreshFailed = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

function processQueue(error: Error | null, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    throw new Error('Refresh failed');
  }

  const data = await res.json();

  // Store the new tokens
  setToken(data.token);
  setRefreshToken(data.refreshToken);

  // Also update cookie so the cookie guard still works
  if (typeof document !== 'undefined') {
    const d = new Date();
    d.setTime(d.getTime() + 30 * 24 * 60 * 60 * 1000);
    document.cookie = `school_token=${data.token};expires=${d.toUTCString()};path=/;SameSite=Lax`;
  }

  return data.token;
}

function forceLogout() {
  if (typeof window === 'undefined') return;
  localStorage.clear();
  sessionStorage.clear();
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const [name] = cookie.split('=');
    document.cookie = name.trim() + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
  }
  window.location.href = '/';
}

/**
 * Central request function. On 401 it will:
 *  1. Queue if a refresh is already in progress
 *  2. Otherwise attempt one refresh, then RETRY the original request once
 *  3. On refresh failure, force logout
 *
 * The `attempt` param prevents infinite retry loops (max 2 attempts).
 */
async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: { params?: Record<string, any> },
  attempt: number = 0
): Promise<T> {
  let url = `${API_BASE}${path}`;
  if (options?.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const isFormData = body instanceof FormData;
  const res = await fetch(url, {
    method,
    headers: buildHeaders(isFormData),
    body: isFormData ? (body as FormData) : (body ? JSON.stringify(body) : undefined),
    keepalive: true,
  });

  // ── 401 → silent refresh + retry ──
  if (res.status === 401 && attempt < 2) {
    // If refresh already failed recently, hard logout
    if (refreshFailed) {
      forceLogout();
      throw new Error('Session expired');
    }

    // If a refresh is in progress, wait for it, then retry
    if (isRefreshing) {
      try {
        await new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        // Token was refreshed — retry the original request with the new token
        return request<T>(method, path, body, options, attempt + 1);
      } catch {
        forceLogout();
        throw new Error('Session expired');
      }
    }

    // Start a refresh
    isRefreshing = true;
    try {
      await refreshAccessToken();
      isRefreshing = false;
      refreshFailed = false;
      processQueue(null, getToken());
      // Retry the original request with the new token
      return request<T>(method, path, body, options, attempt + 1);
    } catch (refreshError) {
      isRefreshing = false;
      refreshFailed = true;
      processQueue(
        refreshError instanceof Error ? refreshError : new Error('Refresh failed')
      );
      forceLogout();
      throw new Error('Session expired');
    }
  }

  // ── Other errors ──
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: res.statusText }));
    const error = new Error(errorBody?.error || errorBody?.message || `API Error ${res.status}`);
    (error as any).status = res.status;
    (error as any).body = errorBody;
    throw error;
  }

  return res.json();
}

// ── Public API ──

export const api = {
  get: async <T = any>(path: string, options?: { params?: Record<string, any> }): Promise<T> => {
    return request<T>('GET', path, undefined, options);
  },

  post: async <T = any>(path: string, body?: unknown): Promise<T> => {
    const result = await request<T>('POST', path, body);
    triggerGlobalRefresh(path);
    return result;
  },

  put: async <T = any>(path: string, body?: unknown): Promise<T> => {
    const result = await request<T>('PUT', path, body);
    triggerGlobalRefresh(path);
    return result;
  },

  patch: async <T = any>(path: string, body?: unknown): Promise<T> => {
    const result = await request<T>('PATCH', path, body);
    triggerGlobalRefresh(path);
    return result;
  },

  del: async <T = any>(path: string): Promise<T> => {
    const result = await request<T>('DELETE', path);
    triggerGlobalRefresh(path);
    return result;
  },

  /** Raw fetch for FormData uploads etc. */
  raw: async (path: string, init: RequestInit): Promise<any> => {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        ...(init.headers || {}),
      },
    });
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({ error: res.statusText }));
      const error = new Error(errorBody?.error || errorBody?.message || `API Error ${res.status}`);
      (error as any).status = res.status;
      (error as any).body = errorBody;
      throw error;
    }
    const result = await res.json();
    if (init.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(init.method.toUpperCase())) {
      triggerGlobalRefresh(path);
    }
    return result;
  },
};

/** Login via Elysia : returns token + user data */
export async function loginWithElysia(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    const error = new Error(body?.error || body?.message || `API Error ${res.status}`);
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
}

/**
 * Logout: call server to invalidate tokens, then clear local storage.
 */
export async function logoutWithElysia(): Promise<void> {
  const token = getToken();
  const refreshToken = getRefreshToken();
  if (token) {
    // Fire-and-forget: tell the server to revoke tokens
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ refreshToken: refreshToken || undefined }),
      });
    } catch {
      // Ignore errors — we'll clear local state regardless
    }
  }
}

/**
 * Drop-in replacement for fetch("/api/...").
 * NOTE: This lower-level helper does NOT auto-refresh. If you need refresh
 * behavior, use `api.get/post/...` instead.
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  let cleanPath = path.startsWith('/api') ? path.slice(4) : path;
  if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;

  const normalizedBase = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  const url = `${normalizedBase}${cleanPath}`;

  const token = getToken();
  const tenantId = getTenantId();
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
  };

  if (init?.headers) {
    const initHeaders = init.headers as Record<string, string>;
    Object.assign(headers, initHeaders);
  } else if (init?.body && typeof init.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(url, {
    ...init,
    headers,
  }).then(async (res) => {
    if (res.ok && init?.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(init.method.toUpperCase())) {
      triggerGlobalRefresh(path);
    }
    return res;
  }).catch(err => {
    console.error(`Fetch failed for ${url}:`, err);
    throw err;
  });
}

// Re-export helpers for use in login screen
export { setToken, setRefreshToken, getToken, getRefreshToken };

export { API_BASE };
