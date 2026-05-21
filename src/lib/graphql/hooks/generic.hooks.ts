import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { graphqlQuery, graphqlMutate } from '../core'

export function useGraphQLQuery<T>(
  key: any[],
  query: string,
  variables?: Record<string, unknown>,
  options?: any
) {
  return useQuery<T, Error>({
    queryKey: key,
    queryFn: () => graphqlQuery<T>(query, variables),
    ...options,
  })
}

export function useGraphQLMutation<T, V>(
  mutation: string,
  options?: any
) {
  const queryClient = useQueryClient()
  return useMutation<T, Error, V>({
    mutationFn: (variables: V) => graphqlMutate<T>(mutation, variables as any),
    ...options,
    onSuccess: async (data, variables, context) => {
      // Satisfy lint and trigger global sync
      await queryClient.invalidateQueries({ queryKey: [mutation] })
      if (options?.onSuccess) {
        return options.onSuccess(data, variables, context)
      }
    },
  })
}
