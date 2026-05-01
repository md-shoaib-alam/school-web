/**
 * Centralized API client — all requests go to ElysiaJS backend.
 */

import { triggerGlobalRefresh } from './query-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('school_token');
}

function authHeaders(isFormData: boolean = false): Record<string, string> {
  const token = getToken();
  const tenantId = typeof window !== 'undefined' ? localStorage.getItem('schoolsaas_tenant_id') : null;
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
  };
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
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
    const isFormData = body instanceof FormData;
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: authHeaders(isFormData),
      body: isFormData ? (body as FormData) : (body ? JSON.stringify(body) : undefined),
      keepalive: true,
    });
    const result = await handleResponse(res);
    triggerGlobalRefresh(path); // Intelligent refresh
    return result;
  },

  put: async <T = any>(path: string, body?: unknown): Promise<T> => {
    const isFormData = body instanceof FormData;
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: authHeaders(isFormData),
      body: isFormData ? (body as FormData) : (body ? JSON.stringify(body) : undefined),
      keepalive: true,
    });
    const result = await handleResponse(res);
    triggerGlobalRefresh(path); // Intelligent refresh
    return result;
  },


  patch: async <T = any>(path: string, body?: unknown): Promise<T> => {
    const isFormData = body instanceof FormData;
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PATCH',
      headers: authHeaders(isFormData),
      body: isFormData ? (body as FormData) : (body ? JSON.stringify(body) : undefined),
      keepalive: true,
    });
    const result = await handleResponse(res);
    triggerGlobalRefresh(path); // Intelligent refresh
    return result;
  },


  del: async <T = any>(path: string): Promise<T> => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: authHeaders(),
      keepalive: true,
    });
    const result = await handleResponse(res);
    triggerGlobalRefresh(path); // Intelligent refresh
    return result;
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
    const result = await handleResponse(res);
    if (init.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(init.method.toUpperCase())) {
      triggerGlobalRefresh(path);
    }
    return result;
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
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  let cleanPath = path.startsWith('/api') ? path.slice(4) : path;
  if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
  
  const normalizedBase = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  const url = `${normalizedBase}${cleanPath}`;

  const token = getToken();
  const tenantId = typeof window !== 'undefined' ? localStorage.getItem('schoolsaas_tenant_id') : null;
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
      triggerGlobalRefresh(path); // Intelligent refresh
    }
    return res;
  }).catch(err => {
    console.error(`Fetch failed for ${url}:`, err);
    throw err;
  });
}

export { API_BASE };
