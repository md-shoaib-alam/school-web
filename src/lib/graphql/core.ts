import { env } from '../env';
const API_BASE = env.NEXT_PUBLIC_API_URL;
const GRAPHQL_ENDPOINT = `${API_BASE}/graphql`

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('school_token');
}

function getStoredTenantId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('schoolsaas_tenant_id');
}

export async function graphqlQuery<TData>(query: string, variables?: Record<string, unknown>): Promise<TData> {
  const token = getStoredToken();
  const tenantId = getStoredTenantId();
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(tenantId ? { 'x-tenant-id': tenantId } : {})
    },
    body: JSON.stringify({ query, variables }),
    keepalive: true,
  })
  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`[GraphQL Query Error] Status: ${res.status}`, { 
      query: query.substring(0, 100) + '...', 
      variables, 
      errorBody 
    });
    throw new Error(`GraphQL error: ${res.status}`);
  }
  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0]?.message || 'GraphQL error')
  return json.data as TData
}

export async function graphqlMutate<TData>(mutation: string, variables?: Record<string, unknown>): Promise<TData> {
  const token = getStoredToken();
  const tenantId = getStoredTenantId();
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(tenantId ? { 'x-tenant-id': tenantId } : {})
    },
    body: JSON.stringify({ query: mutation, variables }),
    keepalive: true,
  })
  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`[GraphQL Mutation Error] Status: ${res.status}`, { 
      mutation: mutation.substring(0, 100) + '...', 
      variables, 
      errorBody 
    });
    throw new Error(`GraphQL error: ${res.status}`);
  }
  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0]?.message || 'GraphQL error')
  return json.data as TData
}
