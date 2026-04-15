'use client'

// Apollo Client is not used in this project.
// The GraphQL hooks in hooks.ts use direct fetch to /api/graphql with TanStack Query
// for caching, deduplication, and background refetching.
//
// This approach was chosen because:
// 1. No extra client-side bundle size from @apollo/client
// 2. TanStack Query is already used for REST API caching
// 3. Simpler mental model — one caching layer for all data fetching
// 4. GraphQL Yoga on the server handles schema, resolvers, and execution

export const GRAPHQL_ENABLED = true
