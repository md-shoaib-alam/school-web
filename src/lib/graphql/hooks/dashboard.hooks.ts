import { useQuery } from '@tanstack/react-query'
import { graphqlQuery } from '../core'
import { queryKeys } from '../keys'
import { 
  ADMIN_DASHBOARD, TEACHER_DASHBOARD, STUDENT_DASHBOARD, PARENT_DASHBOARD,
  DASHBOARD_SUMMARY, DASHBOARD_ATTENDANCE, DASHBOARD_ACADEMIC, DASHBOARD_FINANCIAL, DASHBOARD_NOTICES
} from '../queries'
import { 
  AdminDashboardData, TeacherDashboardData, StudentDashboardData, ParentDashboardData
} from '../types'

export function useAdminDashboard(tenantId: string) {
  return useQuery({
    queryKey: ['admin', 'dashboard', tenantId],
    queryFn: () => graphqlQuery<{ adminDashboard: AdminDashboardData }>(ADMIN_DASHBOARD, { tenantId }).then(d => d.adminDashboard),
    staleTime: 60 * 1000,
    enabled: !!tenantId && tenantId.trim().length > 0,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  })
}

export function useDashboardSummary(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.dashboardSummary(tenantId),
    queryFn: () => graphqlQuery<{ dashboardSummary: any }>(DASHBOARD_SUMMARY, { tenantId }).then(d => d.dashboardSummary),
    staleTime: 60 * 1000,
    enabled: !!tenantId,
  })
}

export function useDashboardAttendance(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.dashboardAttendance(tenantId),
    queryFn: () => graphqlQuery<{ dashboardAttendance: any[] }>(DASHBOARD_ATTENDANCE, { tenantId }).then(d => d.dashboardAttendance),
    staleTime: 60 * 1000,
    enabled: !!tenantId,
  })
}

export function useDashboardAcademic(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.dashboardAcademic(tenantId),
    queryFn: () => graphqlQuery<{ dashboardAcademic: any }>(DASHBOARD_ACADEMIC, { tenantId }).then(d => d.dashboardAcademic),
    staleTime: 60 * 1000,
    enabled: !!tenantId,
  })
}

export function useDashboardFinancial(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.dashboardFinancial(tenantId),
    queryFn: () => graphqlQuery<{ dashboardFinancial: any }>(DASHBOARD_FINANCIAL, { tenantId }).then(d => d.dashboardFinancial),
    staleTime: 60 * 1000,
    enabled: !!tenantId,
  })
}

export function useDashboardNotices(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.dashboardNotices(tenantId),
    queryFn: () => graphqlQuery<{ dashboardNotices: any[] }>(DASHBOARD_NOTICES, { tenantId }).then(d => d.dashboardNotices),
    staleTime: 60 * 1000,
    enabled: !!tenantId,
  })
}

export function useTeacherDashboard(teacherName: string) {
  return useQuery({
    queryKey: queryKeys.teacherDashboard(teacherName),
    queryFn: () => graphqlQuery<{ teacherDashboard: TeacherDashboardData }>(TEACHER_DASHBOARD, { teacherName })
      .then(d => d.teacherDashboard),
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    enabled: !!teacherName && teacherName.trim().length > 0,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  })
}

export function useStudentDashboard(studentEmail?: string) {
  return useQuery({
    queryKey: queryKeys.studentDashboard(studentEmail),
    queryFn: () => graphqlQuery<{ studentDashboard: StudentDashboardData }>(STUDENT_DASHBOARD, { studentEmail })
      .then(d => d.studentDashboard),
    staleTime: 0,
    enabled: !!studentEmail && studentEmail.trim().length > 0,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  })
}

export function useParentDashboard(parentName: string) {
  return useQuery({
    queryKey: queryKeys.parentDashboard(parentName),
    queryFn: () => graphqlQuery<{ parentDashboard: ParentDashboardData }>(PARENT_DASHBOARD, { parentName })
      .then(d => d.parentDashboard),
    staleTime: 0, // Always refetch in background for real-time accuracy
    enabled: !!parentName && parentName.trim().length > 0,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  })
}
