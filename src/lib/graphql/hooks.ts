'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// ── Generic GraphQL Hooks ──

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
  return useMutation<T, Error, V>({
    mutationFn: (variables: V) => graphqlMutate<T>(mutation, variables as any),
    ...options,
  })
}

// ── GraphQL Query Helper ──
// Direct fetch to /api/graphql endpoint — no Apollo Client needed.
// Uses HTTP keepalive for connection pooling.
// TanStack Query handles caching, background refetch, deduplication.

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
const GRAPHQL_ENDPOINT = `${API_BASE}/graphql`

async function graphqlQuery<TData>(query: string, variables?: Record<string, unknown>): Promise<TData> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('school_token') : null;
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ query, variables }),
    // Connection pooling: reuse TCP connection
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

async function graphqlMutate<TData>(mutation: string, variables?: Record<string, unknown>): Promise<TData> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('school_token') : null;
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
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

// ── GraphQL Documents ──

const PLATFORM_STATS = `
  query PlatformStats {
    platformStats {
      tenants { total active trial suspended }
      users { total students teachers parents admins }
      classes
      subscriptions { total active }
      revenue { active total }
      planDistribution { plan count }
      recentLogs { id action resource details createdAt tenant { id name } }
      monthlyData { month newTenants newUsers revenue }
      topTenants { id name slug plan status studentCount teacherCount revenue _count { users classes } }
    }
  }
`

const BILLING_DATA = `
  query BillingData {
    billingData {
      totalActiveRevenue
      statusDistribution
      monthlyTrend { month revenue newSubscriptions churned }
      tenantBilling { id name slug plan status totalRevenue activeRevenue activeSubscriptions totalSubscriptions _count { users classes } }
      subscriptions { id planName amount status paymentMethod startDate createdAt tenant { name } parent { user { name email } } }
      planRevenue
      methodRevenue
    }
  }
`

const TENANTS = `
  query Tenants($status: String, $plan: String, $search: String, $page: Int, $limit: Int) {
    tenants(status: $status, plan: $plan, search: $search, page: $page, limit: $limit) {
      tenants { id name slug email phone address website plan status maxStudents maxTeachers maxParents maxClasses startDate endDate createdAt studentCount teacherCount parentCount adminCount activeSubscriptions totalRevenue _count { users classes subscriptions notices events } }
      total page totalPages
    }
  }
`

const USERS = `
  query Users($role: String, $tenantId: String, $search: String, $page: Int, $limit: Int) {
    users(role: $role, tenantId: $tenantId, search: $search, page: $page, limit: $limit) {
      users { id name email role phone isActive createdAt tenant { id name slug } }
      total page totalPages
      roleCounts { role count }
    }
  }
`

const AUDIT_LOGS = `
  query AuditLogs($action: String, $page: Int, $limit: Int) {
    auditLogs(action: $action, page: $page, limit: $limit) {
      logs { id action resource details createdAt tenant { id name } }
      total page totalPages
      actionTypes { action count }
    }
  }
`

const CREATE_TENANT = `
  mutation CreateTenant($data: TenantInput!) {
    createTenant(data: $data) { id name slug plan status }
  }
`

const UPDATE_TENANT = `
  mutation UpdateTenant($id: ID!, $data: TenantUpdateInput!) {
    updateTenant(id: $id, data: $data) { id name slug plan status }
  }
`

const DELETE_TENANT = `
  mutation DeleteTenant($id: ID!) {
    deleteTenant(id: $id)
  }
`

const TOGGLE_TENANT_STATUS = `
  mutation ToggleTenantStatus($id: ID!, $status: String!) {
    toggleTenantStatus(id: $id, status: $status) { id name status }
  }
`

// ── NEW GraphQL Documents ──

const ADMIN_DASHBOARD = `
  query AdminDashboard($tenantId: String!) {
    adminDashboard(tenantId: $tenantId) {
      totalStudents totalTeachers totalClasses totalParents
      totalRevenue pendingFees attendanceRate upcomingEvents
      monthlyAttendance { month rate }
      classDistribution { name students }
      gradeDistribution { grade count }
      recentNotices { id title content authorName priority createdAt targetRole }
      feeByType { type collected pending }
    }
  }
`

const TEACHER_DASHBOARD = `
  query TeacherDashboard($teacherName: String!) {
    teacherDashboard(teacherName: $teacherName) {
      teacherId classes { id name section studentCount }
      subjects { id name code className }
      totalStudents pendingAssignments
      todaySchedule { id day startTime endTime subjectName className }
      todayAttendance { present total }
      recentAssignments { id title subjectName className dueDate submissions totalStudents }
    }
  }
`

const STUDENT_DASHBOARD = `
  query StudentDashboard($studentEmail: String) {
    studentDashboard(studentEmail: $studentEmail) {
      studentId classId attendanceRate avgGrade pendingAssignments
      todaySchedule { id day startTime endTime subjectName className }
      recentGrades { id subjectName examType marks maxMarks grade }
      notices { id title content authorName priority createdAt targetRole }
    }
  }
`

const DASHBOARD_SUMMARY = `
  query DashboardSummary($tenantId: String!) {
    dashboardSummary(tenantId: $tenantId) {
      totalStudents totalTeachers totalClasses totalParents attendanceRate upcomingEvents
    }
  }
`

const DASHBOARD_ATTENDANCE = `
  query DashboardAttendance($tenantId: String!) {
    dashboardAttendance(tenantId: $tenantId) { month rate }
  }
`

const DASHBOARD_ACADEMIC = `
  query DashboardAcademic($tenantId: String!) {
    dashboardAcademic(tenantId: $tenantId) {
      classDistribution { name students }
      gradeDistribution { grade count }
    }
  }
`

const DASHBOARD_FINANCIAL = `
  query DashboardFinancial($tenantId: String!) {
    dashboardFinancial(tenantId: $tenantId) {
      totalRevenue pendingFees
      feeByType { type collected pending }
    }
  }
`

const DASHBOARD_NOTICES = `
  query DashboardNotices($tenantId: String!) {
    dashboardNotices(tenantId: $tenantId) {
      id title content authorName priority createdAt targetRole
    }
  }
`

const PARENT_DASHBOARD = `
  query ParentDashboard($parentName: String!) {
    parentDashboard(parentName: $parentName) {
      children { id name className rollNumber gender dateOfBirth }
      notices { id title content authorName priority createdAt targetRole }
      fees { id studentName type amount status dueDate paidAmount }
      performanceSummary { name attendanceRate avgGrade grade }
    }
  }
`

const TENANT_DETAIL = `
  query TenantDetail($tenantId: String!) {
    tenantDetail(tenantId: $tenantId) {
      tenant { id name slug email phone address website plan status maxStudents maxTeachers maxParents maxClasses startDate endDate createdAt studentCount teacherCount parentCount adminCount activeSubscriptions totalRevenue _count { users classes subscriptions notices events } }
      students { id name email phone rollNumber className gender dateOfBirth status }
      teachers { id name email phone qualification experience status }
      parents { id name email phone occupation status }
      classes { id name section grade capacity studentCount }
      notices { id title content authorName priority createdAt targetRole }
      fees { id studentName type amount status dueDate paidAmount }
      attendance { id studentName date status className }
    }
  }
`

const SUBJECTS = `
  query Subjects($tenantId: String, $page: Int, $limit: Int) {
    subjects(tenantId: $tenantId, page: $page, limit: $limit) {
      subjects { id name code classId teacherId className teacherName }
      total page totalPages
    }
  }
`

const CLASSES = `
  query Classes($tenantId: String, $page: Int, $limit: Int) {
    classes(tenantId: $tenantId, page: $page, limit: $limit) {
      classes { id name section grade capacity studentCount classTeacher }
      total page totalPages
    }
  }
`

const TEACHERS = `
  query Teachers($tenantId: String, $page: Int, $limit: Int) {
    teachers(tenantId: $tenantId, page: $page, limit: $limit) {
      teachers { id name email phone qualification experience status subjects classes joiningDate }
      total page totalPages
    }
  }
`

const STUDENTS = `
  query Students($tenantId: String, $page: Int, $limit: Int) {
    students(tenantId: $tenantId, page: $page, limit: $limit) {
      students { id name email phone rollNumber className gender dateOfBirth status classId parentId parentName admissionDate }
      total page totalPages
    }
  }
`

const PARENTS = `
  query Parents($tenantId: String, $page: Int, $limit: Int) {
    parents(tenantId: $tenantId, page: $page, limit: $limit) {
      parents { 
        id name email phone occupation status 
        children { id name email rollNumber className gender classId } 
        subscription { id planName planId amount period status transactionId startDate endDate autoRenew }
      }
      total page totalPages
    }
  }
`

const SUBSCRIPTIONS = `
  query Subscriptions($tenantId: String, $status: String, $search: String, $page: Int, $limit: Int) {
    subscriptions(tenantId: $tenantId, status: $status, search: $search, page: $page, limit: $limit) {
      subscriptions { 
        id planName planId amount period status transactionId startDate endDate autoRenew
        parent { user { name email } students { user { name } } }
        tenant { name }
      }
      total page totalPages
      stats { activeSubscriptions totalSubscriptions totalRevenue }
    }
  }
`

const NOTICES = `
  query Notices($tenantId: String, $page: Int, $limit: Int) {
    notices(tenantId: $tenantId, page: $page, limit: $limit) {
      notices { id title content authorName priority targetRole createdAt }
      total page totalPages
    }
  }
`

const FEES = `
  query Fees($tenantId: String, $page: Int, $limit: Int) {
    fees(tenantId: $tenantId, page: $page, limit: $limit) {
      fees { id studentName studentId className type amount status dueDate paidAmount }
      total page totalPages
    }
  }
`

const ATTENDANCE = `
  query Attendance($tenantId: String!, $page: Int, $limit: Int) {
    attendance(tenantId: $tenantId, page: $page, limit: $limit) {
      records { id studentName date status className }
      total page totalPages
    }
  }
`

const CUSTOM_ROLES = `
  query CustomRoles($tenantId: String) {
    customRoles(tenantId: $tenantId) {
      id name color permissions createdAt
    }
  }
`

const STAFF = `
  query Staff($tenantId: String, $page: Int, $limit: Int) {
    staff(tenantId: $tenantId, page: $page, limit: $limit) {
      staff { id name email role isActive createdAt customRole { id name permissions createdAt } }
      total page totalPages
    }
  }
`

const CREATE_SUBJECT = `
  mutation CreateSubject($data: SubjectInput!) {
    createSubject(data: $data) { id name code classId teacherId className teacherName }
  }
`

const UPDATE_SUBJECT = `
  mutation UpdateSubject($id: ID!, $data: SubjectInput!) {
    updateSubject(id: $id, data: $data) { id name code classId teacherId className teacherName }
  }
`

const DELETE_SUBJECT = `
  mutation DeleteSubject($id: ID!) {
    deleteSubject(id: $id)
  }
`

const TOGGLE_USER_STATUS = `
  mutation ToggleUserStatus($id: ID!, $isActive: Boolean!) {
    toggleUserStatus(id: $id, isActive: $isActive) { id name isActive }
  }
`

const REQUEST_PASSWORD_RESET = `
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`

const CREATE_USER = `
  mutation CreateUser($data: CreateUserInput!) {
    createUser(data: $data) { id name email role isActive }
  }
`

// ── Query Keys ──
export const queryKeys = {
  platformStats: ['platform', 'stats'] as const,
  billing: ['platform', 'billing'] as const,
  tenants: (filters?: Record<string, unknown>) => ['tenants', filters] as const,
  users: (filters?: Record<string, unknown>) => ['users', filters] as const,
  auditLogs: (filters?: Record<string, unknown>) => ['auditLogs', filters] as const,
  teacherDashboard: (name: string) => ['teacher', 'dashboard', name] as const,
  studentDashboard: (email?: string) => ['student', 'dashboard', email] as const,
  parentDashboard: (name: string) => ['parent', 'dashboard', name] as const,
  tenantDetail: (id: string) => ['tenant', 'detail', id] as const,
  subjects: ['subjects'] as const,
  classes: ['classes'] as const,
  teachers: ['teachers'] as const,
  students: ['students'] as const,
  parents: ['parents'] as const,
  notices: ['notices'] as const,
  fees: ['fees'] as const,
  attendance: ['attendance'] as const,
  staff: ['staff'] as const,
  subscriptions: ['subscriptions'] as const,
  dashboardSummary: (tenantId: string) => ['admin', 'dashboard', 'summary', tenantId] as const,
  dashboardAttendance: (tenantId: string) => ['admin', 'dashboard', 'attendance', tenantId] as const,
  dashboardAcademic: (tenantId: string) => ['admin', 'dashboard', 'academic', tenantId] as const,
  dashboardFinancial: (tenantId: string) => ['admin', 'dashboard', 'financial', tenantId] as const,
  dashboardNotices: (tenantId: string) => ['admin', 'dashboard', 'notices', tenantId] as const,
}

// ── Super Admin Hooks ──

export function usePlatformStats() {
  return useQuery({
    queryKey: queryKeys.platformStats,
    queryFn: () => graphqlQuery<{ platformStats: PlatformStatsData }>(PLATFORM_STATS).then(d => d.platformStats),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Background refresh every 5 mins
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
    staleTime: 5 * 60 * 1000,
  })
}

export function useUsers(filters?: { role?: string; tenantId?: string; search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.users(filters),
    queryFn: () => graphqlQuery<{ users: UsersResponse }>(USERS, filters as Record<string, unknown>).then(d => d.users),
    staleTime: 5 * 60 * 1000,
  })
}

export function useAuditLogs(filters?: { action?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.auditLogs(filters),
    queryFn: () => graphqlQuery<{ auditLogs: AuditLogsResponse }>(AUDIT_LOGS, filters as Record<string, unknown>).then(d => d.auditLogs),
    staleTime: 5 * 60 * 1000,
  })
}

// ── School Admin Hooks ──

export function useSubjects(tenantId?: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: [...queryKeys.subjects, tenantId, page, limit],
    queryFn: () => graphqlQuery<{ subjects: SubjectsResponse }>(SUBJECTS, { tenantId, page, limit }).then(d => d.subjects),
    staleTime: 5 * 60 * 1000,
  })
}

export function useClassesMin(tenantId?: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: [...queryKeys.classes, tenantId, page, limit],
    queryFn: () => graphqlQuery<{ classes: ClassesResponse }>(CLASSES, { tenantId, page, limit }).then(d => d.classes),
    staleTime: 5 * 60 * 1000,
  })
}

export function useTeachersMin(tenantId?: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: [...queryKeys.teachers, tenantId, page, limit],
    queryFn: () => graphqlQuery<{ teachers: TeachersResponse }>(TEACHERS, { tenantId, page, limit }).then(d => d.teachers),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateSubject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => graphqlMutate<{ createSubject: any }>(CREATE_SUBJECT, { data }).then(d => d.createSubject),
    onSuccess: () => {
      toast.success('Subject created successfully')
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects })
    },
    onError: (error) => toast.error('Error creating subject', { description: error.message }),
  })
}

export function useUpdateSubject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => graphqlMutate<{ updateSubject: any }>(UPDATE_SUBJECT, { id, data }).then(d => d.updateSubject),
    onSuccess: () => {
      toast.success('Subject updated successfully')
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects })
    },
    onError: (error) => toast.error('Error updating subject', { description: error.message }),
  })
}

export function useDeleteSubject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => graphqlMutate<{ deleteSubject: boolean }>(DELETE_SUBJECT, { id }),
    onSuccess: () => {
      toast.success('Subject deleted')
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects })
    },
    onError: (error) => toast.error('Error deleting subject', { description: error.message }),
  })
}

export function useDashboardSummary(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.dashboardSummary(tenantId),
    queryFn: () => graphqlQuery<{ dashboardSummary: any }>(DASHBOARD_SUMMARY, { tenantId }).then(d => d.dashboardSummary),
    staleTime: 2 * 60 * 1000,
    enabled: !!tenantId,
  })
}

export function useDashboardAttendance(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.dashboardAttendance(tenantId),
    queryFn: () => graphqlQuery<{ dashboardAttendance: any[] }>(DASHBOARD_ATTENDANCE, { tenantId }).then(d => d.dashboardAttendance),
    staleTime: 5 * 60 * 1000,
    enabled: !!tenantId,
  })
}

export function useDashboardAcademic(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.dashboardAcademic(tenantId),
    queryFn: () => graphqlQuery<{ dashboardAcademic: any }>(DASHBOARD_ACADEMIC, { tenantId }).then(d => d.dashboardAcademic),
    staleTime: 5 * 60 * 1000,
    enabled: !!tenantId,
  })
}

export function useDashboardFinancial(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.dashboardFinancial(tenantId),
    queryFn: () => graphqlQuery<{ dashboardFinancial: any }>(DASHBOARD_FINANCIAL, { tenantId }).then(d => d.dashboardFinancial),
    staleTime: 5 * 60 * 1000,
    enabled: !!tenantId,
  })
}

export function useDashboardNotices(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.dashboardNotices(tenantId),
    queryFn: () => graphqlQuery<{ dashboardNotices: any[] }>(DASHBOARD_NOTICES, { tenantId }).then(d => d.dashboardNotices),
    staleTime: 2 * 60 * 1000,
    enabled: !!tenantId,
  })
}

// ── Teacher Hooks ──

export function useTeacherDashboard(teacherName: string) {
  return useQuery({
    queryKey: queryKeys.teacherDashboard(teacherName),
    queryFn: () => graphqlQuery<{ teacherDashboard: TeacherDashboardData }>(TEACHER_DASHBOARD, { teacherName })
      .then(d => d.teacherDashboard),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000,
    enabled: !!teacherName,
  })
}

// ── Group-Wise Hooks (Replacement for REST endpoints) ──

export function useClasses(tenantId?: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: [...queryKeys.classes, tenantId, page, limit],
    queryFn: async () => {
      const data = await graphqlQuery<{ classes: ClassesResponse }>(CLASSES, { tenantId, page, limit })
      return data.classes
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

export function useTeachers(tenantId?: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: [...queryKeys.teachers, tenantId, page, limit],
    queryFn: async () => {
      const data = await graphqlQuery<{ teachers: TeachersResponse }>(TEACHERS, { tenantId, page, limit })
      return data.teachers
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

export function useStudents(tenantId?: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: [...queryKeys.students, tenantId, page, limit],
    queryFn: async () => {
      const data = await graphqlQuery<{ students: StudentsResponse }>(STUDENTS, { tenantId, page, limit })
      return data.students
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

export function useParents(tenantId?: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: [...queryKeys.parents, tenantId, page, limit],
    queryFn: async () => {
      const data = await graphqlQuery<{ parents: ParentsResponse }>(PARENTS, { tenantId, page, limit })
      return data.parents
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

export function useSubscriptions(vars: { tenantId?: string; status?: string; search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...queryKeys.subscriptions, vars],
    queryFn: async () => {
      const data = await graphqlQuery<{ subscriptions: SubscriptionsResponse }>(SUBSCRIPTIONS, vars)
      return data.subscriptions
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useNotices(tenantId?: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: [...queryKeys.notices, tenantId, page, limit],
    queryFn: async () => {
      const data = await graphqlQuery<{ notices: NoticesResponse }>(NOTICES, { tenantId, page, limit })
      return data.notices
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

export function useFees(tenantId?: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: [...queryKeys.fees, tenantId, page, limit],
    queryFn: async () => {
      const data = await graphqlQuery<{ fees: FeesResponse }>(FEES, { tenantId, page, limit })
      return data.fees
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

export function useAttendance(tenantId?: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: [...queryKeys.attendance, tenantId, page, limit],
    queryFn: async () => {
      const data = await graphqlQuery<{ attendance: AttendanceResponse }>(ATTENDANCE, { tenantId, page, limit })
      return data.attendance
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

export function useStaff(tenantId?: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: [...queryKeys.staff, tenantId, page, limit],
    queryFn: async () => {
      const data = await graphqlQuery<{ staff: StaffResponse }>(STAFF, { tenantId, page, limit })
      return data.staff
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

export function useCustomRoles(tenantId?: string) {
  return useQuery({
    queryKey: ['custom-roles', tenantId],
    queryFn: () => graphqlQuery<{ customRoles: any[] }>(CUSTOM_ROLES, { tenantId }).then(d => d.customRoles),
    staleTime: 10 * 60 * 1000,
    enabled: !!tenantId,
  })
}

// ── Student Hooks ──

export function useStudentDashboard(studentEmail?: string) {
  return useQuery({
    queryKey: queryKeys.studentDashboard(studentEmail),
    queryFn: () => graphqlQuery<{ studentDashboard: StudentDashboardData }>(STUDENT_DASHBOARD, { studentEmail })
      .then(d => d.studentDashboard),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!studentEmail,
  })
}

// ── Parent Hooks ──

export function useParentDashboard(parentName: string) {
  return useQuery({
    queryKey: queryKeys.parentDashboard(parentName),
    queryFn: () => graphqlQuery<{ parentDashboard: ParentDashboardData }>(PARENT_DASHBOARD, { parentName })
      .then(d => d.parentDashboard),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!parentName,
  })
}

// ── Tenant Detail Hook ──

export function useTenantDetail(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.tenantDetail(tenantId),
    queryFn: () => graphqlQuery<{ tenantDetail: TenantDetailData }>(TENANT_DETAIL, { tenantId })
      .then(d => d.tenantDetail),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!tenantId,
  })
}

// ── Mutations ──

export function useCreateTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: TenantInput) => graphqlMutate<{ createTenant: any }>(CREATE_TENANT, { data }).then(d => d.createTenant),
    onSuccess: (newTenant) => {
      toast.success('School created successfully')
      // Manually update the cache for the default view to show the new school immediately
      queryClient.setQueriesData({ queryKey: ['tenants'] }, (old: any) => {
        if (!old) return old
        // If it's a list, prepend. If it's a response object, update tenants array.
        if (Array.isArray(old)) return [newTenant, ...old]
        if (old.tenants) return { ...old, tenants: [newTenant, ...old.tenants], total: (old.total || 0) + 1 }
        return old
      })
      // Trigger full invalidation to ensure data consistency with server
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
      // Update the cache for all tenant queries to reflect the changes instantly
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
      // Optimistically remove from all tenant queries
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

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => graphqlMutate<{ requestPasswordReset: boolean }>(REQUEST_PASSWORD_RESET, { email }).then(d => d.requestPasswordReset),
  })
}

const CHANGE_PASSWORD = `
  mutation ChangePassword($oldPassword: String!, $newPassword: String!) {
    changePassword(oldPassword: $oldPassword, newPassword: $newPassword)
  }
`

export function useChangePassword() {
  return useMutation({
    mutationFn: (vars: { oldPassword: String; newPassword: String }) => 
      graphqlMutate<{ changePassword: boolean }>(CHANGE_PASSWORD, vars as Record<string, unknown>).then(d => d.changePassword),
    onSuccess: () => {
      toast.success('Password changed successfully')
    },
    onError: (error) => {
      toast.error('Failed to change password', { description: error.message })
    }
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

// ── TypeScript Types ──

export interface PlatformStatsData {
  tenants: { total: number; active: number; trial: number; suspended: number }
  users: { total: number; students: number; teachers: number; parents: number; admins: number }
  classes: number
  subscriptions: { total: number; active: number }
  revenue: { active: number; total: number }
  planDistribution: { plan: string; count: number }[]
  recentLogs: { id: string; action: string; resource: string; details: string; createdAt: string; tenant?: { id: string; name: string } | null }[]
  monthlyData: { month: string; newTenants: number; newUsers: number; revenue: number }[]
  topTenants: { id: string; name: string; slug: string; plan: string; status: string; studentCount: number; teacherCount: number; revenue: number; _count: { users: number; classes: number } }[]
}

export interface BillingDataResponse {
  totalActiveRevenue: number
  statusDistribution: Record<string, number>
  monthlyTrend: { month: string; revenue: number; newSubscriptions: number; churned: number }[]
  tenantBilling: { id: string; name: string; slug: string; plan: string; status: string; totalRevenue: number; activeRevenue: number; activeSubscriptions: number; totalSubscriptions: number; _count: { users: number; classes: number } }[]
  subscriptions: { id: string; planName: string; amount: number; status: string; paymentMethod: string; startDate: string; createdAt: string; tenant?: { name: string } | null; parent?: { user: { name: string; email: string } } | null }[]
  planRevenue: Record<string, { count: number; revenue: number }>
  methodRevenue: Record<string, { count: number; revenue: number }>
}

export interface TenantWithStats {
  id: string; name: string; slug: string; email: string | null; phone: string | null
  address: string | null; website: string | null; plan: string; status: string
  maxStudents: number; maxTeachers: number; maxParents: number; maxClasses: number
  startDate: string; endDate: string | null; createdAt: string
  studentCount: number; teacherCount: number; parentCount: number; adminCount: number
  activeSubscriptions: number; totalRevenue: number
  _count: { users: number; classes: number; subscriptions: number; notices: number; events: number }
}

export interface UsersResponse {
  users: { id: string; name: string; email: string; role: string; phone: string | null; isActive: boolean; createdAt: string; tenant: { id: string; name: string; slug: string } | null }[]
  total: number; page: number; totalPages: number
  roleCounts: { role: string; count: number }[]
}

export interface AuditLogsResponse {
  logs: { id: string; action: string; resource: string; details: string; createdAt: string; tenant: { id: string; name: string } | null }[]
  total: number; page: number; totalPages: number
  actionTypes: { action: string; count: number }[]
}

export interface SubscriptionsResponse {
  subscriptions: any[]
  total: number
  page: number
  totalPages: number
  stats: { activeSubscriptions: number; totalSubscriptions: number; totalRevenue: number } | null
}

export interface TenantInput {
  name: string; slug: string; email?: string; phone?: string; address?: string
  website?: string; plan?: string; maxStudents?: number; maxTeachers?: number
  maxParents?: number; maxClasses?: number
}

interface TenantBasic {
  id: string; name: string; slug: string; plan: string; status: string
}

// ── New Role-Based Dashboard Types ──

export interface AdminDashboardData {
  totalStudents: number
  totalTeachers: number
  totalClasses: number
  totalParents: number
  totalRevenue: number
  pendingFees: number
  attendanceRate: number
  upcomingEvents: number
  monthlyAttendance: { month: string; rate: number }[]
  classDistribution: { name: string; students: number }[]
  gradeDistribution: { grade: string; count: number }[]
  recentNotices: { id: string; title: string; content: string; authorName: string; priority: string; createdAt: string; targetRole: string }[]
  feeByType: { type: string; collected: number; pending: number }[]
}

export interface TeacherDashboardData {
  teacherId: string
  classes: { id: string; name: string; section: string; studentCount: number }[]
  subjects: { id: string; name: string; code: string; className: string }[]
  totalStudents: number
  pendingAssignments: number
  todaySchedule: { id: string; day: string; startTime: string; endTime: string; subjectName: string; className: string }[]
  todayAttendance: { present: number; total: number }
  recentAssignments: { id: string; title: string; subjectName: string; className: string; dueDate: string; submissions: number; totalStudents: number }[]
}

export interface StudentDashboardData {
  studentId: string
  classId: string
  attendanceRate: number
  avgGrade: number
  pendingAssignments: number
  todaySchedule: { id: string; day: string; startTime: string; endTime: string; subjectName: string; className: string }[]
  recentGrades: { id: string; subjectName: string; examType: string; marks: number; maxMarks: number; grade: string }[]
  notices: { id: string; title: string; content: string; authorName: string; priority: string; createdAt: string; targetRole: string }[]
}

export interface ParentDashboardData {
  children: { id: string; name: string; className: string; rollNumber: string; gender: string; dateOfBirth: string }[]
  notices: { id: string; title: string; content: string; authorName: string; priority: string; createdAt: string; targetRole: string }[]
  fees: { id: string; studentName: string; type: string; amount: number; status: string; dueDate: string; paidAmount: number }[]
  performanceSummary: { name: string; attendanceRate: number; avgGrade: number; grade: string }[]
}

// ── Tenant Detail Types ──

export interface TenantDetailData {
  tenant: TenantWithStats
  students: {
    id: string; name: string; email: string; phone: string | null
    rollNumber: string; className: string; gender: string; dateOfBirth: string | null
    status: string
  }[]
  teachers: {
    id: string; name: string; email: string; phone: string | null
    qualification: string | null; experience: string | null; status: string
  }[]
  parents: {
    id: string; name: string; email: string; phone: string | null
    occupation: string | null; status: string
  }[]
  classes: {
    id: string; name: string; section: string; grade: string
    capacity: number; studentCount: number
  }[]
  notices: {
    id: string; title: string; content: string; authorName: string
    priority: string; createdAt: string; targetRole: string
  }[]
  fees: {
    id: string; studentName: string; type: string; amount: number
    status: string; dueDate: string; paidAmount: number
  }[]
  attendance: {
    id: string; studentName: string; date: string; status: string; className: string
  }[]
}

export interface TenantsResponse {
  tenants: TenantWithStats[]
  total: number
  page: number
  totalPages: number
}

export interface SubjectsResponse {
  subjects: any[]
  total: number
  page: number
  totalPages: number
}

export interface ClassesResponse {
  classes: any[]
  total: number
  page: number
  totalPages: number
}

export interface TeachersResponse {
  teachers: any[]
  total: number
  page: number
  totalPages: number
}

export interface StudentsResponse {
  students: any[]
  total: number
  page: number
  totalPages: number
}

export interface ParentsResponse {
  parents: any[]
  total: number
  page: number
  totalPages: number
}

export interface NoticesResponse {
  notices: any[]
  total: number
  page: number
  totalPages: number
}

export interface FeesResponse {
  fees: any[]
  total: number
  page: number
  totalPages: number
}

export interface AttendanceResponse {
  records: any[]
  total: number
  page: number
  totalPages: number
}

export interface StaffResponse {
  staff: any[]
  total: number
  page: number
  totalPages: number
}
