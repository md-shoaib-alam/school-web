export async function fetchGraphQL<T>(query: string, variables?: Record<string, any>): Promise<T> {
  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const body = await response.json();

  if (!response.ok || body.errors) {
    const error = body.errors?.[0]?.message || 'GraphQL Request Failed';
    throw new Error(error);
  }

  return body.data;
}
