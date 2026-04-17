import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { goeyToast as toast } from 'goey-toast'
import { graphqlQuery, graphqlMutate } from '../core'
import { queryKeys } from '../keys'
import { api } from '@/lib/api'
import { 
  PLATFORM_STATS, BILLING_DATA, TENANTS, USERS, AUDIT_LOGS, 
  CREATE_TENANT, UPDATE_TENANT, DELETE_TENANT, TOGGLE_TENANT_STATUS, SUBSCRIPTIONS,
  TOGGLE_USER_STATUS, CREATE_USER, TENANT_DETAIL
} from '../queries'
import { 
  PlatformStatsData, BillingDataResponse, TenantsResponse, UsersResponse, 
  AuditLogsResponse, TenantInput, TenantBasic, SubscriptionsResponse, TenantDetailData
} from '../types'

export function useTenantResolution(slug?: string) {
  return useQuery({
    queryKey: ['tenant-resolution', slug],
    queryFn: () => api.get(`/tenants/resolve/${slug}`),
    enabled: !!slug && !['dashboard', 'tenants', 'billing', 'users', 'audit-logs', 'platform-analytics', 'settings', 'subscriptions'].includes(slug),
    staleTime: Infinity,
  })
}

export function usePlatformStats() {
  return useQuery({
    queryKey: queryKeys.platformStats,
    queryFn: () => graphqlQuery<{ platformStats: PlatformStatsData }>(PLATFORM_STATS).then(d => d.platformStats),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

export function useBillingData() {
  return useQuery({
    queryKey: queryKeys.billing,
    queryFn: () => graphqlQuery<{ billingData: BillingDataResponse }>(BILLING_DATA).then(d => d.billingData),
    staleTime: 30 * 1000,
  })
}

export function useTenants(filters?: { status?: string; plan?: string; search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.tenants(filters),
    queryFn: () => graphqlQuery<{ tenants: TenantsResponse }>(TENANTS, filters as Record<string, unknown>).then(d => d.tenants),
    staleTime: 60 * 1000,
  })
}

export function useUsers(filters?: { role?: string; tenantId?: string; search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.users(filters),
    queryFn: () => graphqlQuery<{ users: UsersResponse }>(USERS, filters as Record<string, unknown>).then(d => d.users),
    staleTime: 60 * 1000,
  })
}

export function useAuditLogs(filters?: { action?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.auditLogs(filters),
    queryFn: () => graphqlQuery<{ auditLogs: AuditLogsResponse }>(AUDIT_LOGS, filters as Record<string, unknown>).then(d => d.auditLogs),
    staleTime: 60 * 1000,
  })
}

export function useSubscriptions(vars: { tenantId?: string; status?: string; search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...queryKeys.subscriptions, vars],
    queryFn: async () => {
      const data = await graphqlQuery<{ subscriptions: SubscriptionsResponse }>(SUBSCRIPTIONS, vars)
      return data.subscriptions
    },
    staleTime: 60 * 1000,
  })
}

export function useTenantDetail(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.tenantDetail(tenantId),
    queryFn: () => graphqlQuery<{ tenantDetail: TenantDetailData }>(TENANT_DETAIL, { tenantId })
      .then(d => d.tenantDetail),
    staleTime: 60 * 1000,
    enabled: !!tenantId,
  })
}

export function useCreateTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: TenantInput) => graphqlMutate<{ createTenant: any }>(CREATE_TENANT, { data }).then(d => d.createTenant),
    onSuccess: (newTenant) => {
      toast.success('School created successfully')
      queryClient.setQueriesData({ queryKey: ['tenants'] }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) return [newTenant, ...old]
        if (old.tenants) return { ...old, tenants: [newTenant, ...old.tenants], total: (old.total || 0) + 1 }
        return old
      })
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      queryClient.invalidateQueries({ queryKey: ['platform', 'stats'] })
    },
    onError: (error) => {
      toast.error('Failed to create tenant', { description: error.message })
    },
  })
}

export function useUpdateTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => graphqlMutate<{ updateTenant: TenantBasic }>(UPDATE_TENANT, { id, data }).then(d => d.updateTenant),
    onSuccess: (updatedTenant) => {
      toast.success('School updated successfully')
      queryClient.setQueriesData({ queryKey: ['tenants'] }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) return old.map((t: any) => t.id === updatedTenant.id ? { ...t, ...updatedTenant } : t)
        if (old.tenants) return { 
          ...old, 
          tenants: old.tenants.map((t: any) => t.id === updatedTenant.id ? { ...t, ...updatedTenant } : t) 
        }
        return old
      })
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
    },
    onError: (error) => {
      toast.error('Failed to update tenant', { description: error.message })
    },
  })
}

export function useDeleteTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => graphqlMutate<{ deleteTenant: boolean }>(DELETE_TENANT, { id }).then(d => d.deleteTenant),
    onSuccess: (_, deletedId) => {
      toast.success('School deleted successfully')
      queryClient.setQueriesData({ queryKey: ['tenants'] }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) return old.filter((t: any) => t.id !== deletedId)
        if (old.tenants) return { ...old, tenants: old.tenants.filter((t: any) => t.id !== deletedId), total: Math.max(0, (old.total || 0) - 1) }
        return old
      })
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      queryClient.invalidateQueries({ queryKey: ['platform', 'stats'] })
    },
    onError: (error) => {
      toast.error('Failed to delete tenant', { description: error.message })
    },
  })
}

export function useToggleTenantStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => graphqlMutate<{ toggleTenantStatus: TenantBasic }>(TOGGLE_TENANT_STATUS, { id, status }).then(d => d.toggleTenantStatus),
    onSuccess: () => {
      toast.success('Tenant status updated')
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
    },
    onError: (error) => {
      toast.error('Failed to update status', { description: error.message })
    },
  })
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => graphqlMutate<{ toggleUserStatus: any }>(TOGGLE_USER_STATUS, { id, isActive }).then(d => d.toggleUserStatus),
    onSuccess: (data) => {
      toast.success(`User ${data.isActive ? 'enabled' : 'disabled'} successfully`)
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      toast.error('Failed to update user status', { description: error.message })
    },
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => graphqlMutate<{ createUser: any }>(CREATE_USER, { data }).then(d => d.createUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
