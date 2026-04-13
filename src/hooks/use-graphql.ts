import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { fetchGraphQL } from '@/lib/graphql/client';

export function useGraphQLQuery<T>(
  key: any[],
  query: string,
  variables?: Record<string, any>,
  options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T, Error>({
    queryKey: key,
    queryFn: () => fetchGraphQL<T>(query, variables),
    ...options,
  });
}

export function useGraphQLMutation<T, V>(
  mutation: string,
  options?: UseMutationOptions<T, Error, V>
) {
  return useMutation<T, Error, V>({
    mutationFn: (variables: V) => fetchGraphQL<T>(mutation, variables as any),
    ...options,
  });
}
