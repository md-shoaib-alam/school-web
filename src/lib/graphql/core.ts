export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
export const GRAPHQL_ENDPOINT = `${API_BASE}/graphql`

export async function graphqlQuery<TData>(query: string, variables?: Record<string, unknown>): Promise<TData> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('school_token') : null;
  const tenantId = typeof window !== 'undefined' ? localStorage.getItem('schoolsaas_tenant_id') : null;
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
    console.error('GraphQL Query Error:', { query, variables, status: res.status, errorBody });
    throw new Error(`GraphQL error: ${res.status}`);
  }
  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0]?.message || 'GraphQL error')
  return json.data as TData
}

export async function graphqlMutate<TData>(mutation: string, variables?: Record<string, unknown>): Promise<TData> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('school_token') : null;
  const tenantId = typeof window !== 'undefined' ? localStorage.getItem('schoolsaas_tenant_id') : null;
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
    console.error('GraphQL Mutation Error:', { mutation, variables, status: res.status, errorBody });
    throw new Error(`GraphQL error: ${res.status}`);
  }
  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0]?.message || 'GraphQL error')
  return json.data as TData
}
