import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

/**
 * Generic GraphQL query hook for school-web
 */
export async function graphqlQuery<TData>(query: string, variables?: Record<string, unknown>): Promise<TData> {
  try {
    const response = await apiFetch('/api/graphql', {
      method: 'POST',
      body: JSON.stringify({
        query,
        variables,
      }),
    });
    
    const body = await response.json();
    
    if (body.errors) {
      throw new Error(body.errors[0]?.message || 'GraphQL error');
    }
    
    return body.data as TData;
  } catch (error: any) {
    console.error('GraphQL Query Error:', error);
    throw error;
  }
}

// ── GraphQL Documents ──

export const CLASSES_QUERY = `
  query Classes($tenantId: String) {
    classes(tenantId: $tenantId) {
      classes {
        id
        name
        section
        grade
      }
    }
  }
`;

export const STUDENTS_QUERY = `
  query Students($tenantId: String, $classId: String) {
    students(tenantId: $tenantId, classId: $classId) {
      students {
        id
        user {
          name
        }
      }
    }
  }
`;

// ── Hooks ──

export function useGraphQLClasses(tenantId?: string) {
  return useQuery({
    queryKey: ['graphql', 'classes', tenantId],
    queryFn: () => graphqlQuery<{ classes: { classes: any[] } }>(CLASSES_QUERY, { tenantId })
      .then(d => d.classes.classes),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGraphQLStudents(tenantId?: string, classId?: string) {
  return useQuery({
    queryKey: ['graphql', 'students', tenantId, classId],
    queryFn: () => graphqlQuery<{ students: { students: any[] } }>(STUDENTS_QUERY, { tenantId, classId })
      .then(d => d.students.students),
    enabled: !!classId,
    staleTime: 2 * 60 * 1000,
  });
}
