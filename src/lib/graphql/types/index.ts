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

export interface TenantBasic {
  id: string; name: string; slug: string; plan: string; status: string
}

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

export interface StaffAttendanceRecord {
  id: string
  staffName: string
  role: string
  date: string
  status: string
  checkIn?: string
  checkOut?: string
  remarks?: string
}

export interface StaffAttendanceResponse {
  records: StaffAttendanceRecord[]
  total: number
  page: number
  totalPages: number
}
