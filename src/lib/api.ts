/**
 * Centralized API client — all requests go to ElysiaJS backend.
 *
 * Usage:
 *   import { api } from '@/lib/api'
 *   const data = await api.get('/students')
 *   const data = await api.post('/students', body)
 *   const data = await api.put('/students', body)
 *   const data = await api.del('/students?id=xxx')
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('school_token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  const tenantId = typeof window !== 'undefined' ? localStorage.getItem('schoolsaas_tenant_id') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
  };
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    const error = new Error(body?.error || body?.message || `API Error ${res.status}`);
    (error as any).status = res.status;
    (error as any).body = body;
    throw error;
  }
  return res.json();
}

export const api = {
  get: async <T = any>(path: string): Promise<T> => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'GET',
      headers: authHeaders(),
      keepalive: true,
    });
    return handleResponse(res);
  },

  post: async <T = any>(path: string, body?: unknown): Promise<T> => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: authHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      keepalive: true,
    });
    return handleResponse(res);
  },

  put: async <T = any>(path: string, body?: unknown): Promise<T> => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      keepalive: true,
    });
    return handleResponse(res);
  },

  patch: async <T = any>(path: string, body?: unknown): Promise<T> => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      keepalive: true,
    });
    return handleResponse(res);
  },

  del: async <T = any>(path: string): Promise<T> => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: authHeaders(),
      keepalive: true,
    });
    return handleResponse(res);
  },

  /** Raw fetch for FormData uploads etc. */
  raw: async (path: string, init: RequestInit): Promise<any> => {
    const token = getToken();
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers || {}),
      },
    });
    return handleResponse(res);
  },
};

/** Login via Elysia — returns token + user data */
export async function loginWithElysia(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

/**
 * Drop-in replacement for fetch("/api/...").
 * Auto-prepends Elysia base URL and adds Bearer token.
 *
 * Migration:
 *   BEFORE: fetch("/api/students", { method: "POST", ... })
 *   AFTER:  apiFetch("/api/students", { method: "POST", ... })
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  // Strip leading /api to normalize — the API_BASE already has /api
  const cleanPath = path.startsWith('/api') ? path.slice(4) : path;
  const token = getToken();
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  // Preserve Content-Type if set by caller, otherwise add JSON
  if (init?.headers) {
    const initHeaders = init.headers as Record<string, string>;
    Object.assign(headers, initHeaders);
  } else if (init?.body && typeof init.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }
  return fetch(`${API_BASE}${cleanPath}`, {
    ...init,
    headers,
  });
}

/** Exported base URL for any files that need it */
export { API_BASE };
