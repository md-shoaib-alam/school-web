'use client'

// Core utilities
export { API_BASE, GRAPHQL_ENDPOINT, graphqlQuery, graphqlMutate } from './core'

// Query Strings
export * from './queries'

// Types
export * from './types'

// Selection Keys
export { queryKeys } from './keys'

// Generic Hooks
export { useGraphQLQuery, useGraphQLMutation } from './hooks/generic.hooks'

// Platform Hooks
export { 
  usePlatformStats, useBillingData, useTenants, useUsers, useAuditLogs, 
  useSubscriptions, useTenantDetail, useCreateTenant, useUpdateTenant, 
  useDeleteTenant, useToggleTenantStatus, useToggleUserStatus, useCreateUser 
} from './hooks/platform.hooks'

// Academic Hooks
export { 
  useSubjects, useClassesMin, useTeachersMin, useClasses, useTeachers, 
  useStudents, useParents, useNotices, useFees, useAttendance, useStaff, 
  useCustomRoles, useCreateSubject, useUpdateSubject, useDeleteSubject,
  useCreateCustomRole, useUpdateCustomRole, useDeleteCustomRole, useAssignRoleToUser
} from './hooks/academic.hooks'

// Dashboard Hooks
export { 
  useAdminDashboard, useDashboardSummary, useDashboardAttendance, 
  useDashboardAcademic, useDashboardFinancial, useDashboardNotices, 
  useTeacherDashboard, useStudentDashboard, useParentDashboard 
} from './hooks/dashboard.hooks'

// Auth Hooks
export { useRequestPasswordReset, useChangePassword } from './hooks/auth.hooks'
