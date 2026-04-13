import { buildSchema, GraphQLSchema } from 'graphql'
import { resolvers } from './resolvers'

// ── Type Definitions ─────────────────────────────────────────────────────────

const typeDefs = `#graphql
  scalar DateTime
  scalar JSON

  # ── Platform Overview ────────────────────────────────────────────────────

  type PlatformStats {
    tenants: TenantCounts!
    users: UserCounts!
    classes: Int!
    subscriptions: SubscriptionCounts!
    revenue: RevenueStats!
    planDistribution: [PlanCount!]!
    recentLogs: [AuditLog!]!
    monthlyData: [MonthlyDataPoint!]!
    topTenants: [TopTenant!]!
  }

  type TenantCounts {
    total: Int!
    active: Int!
    trial: Int!
    suspended: Int!
  }

  type UserCounts {
    total: Int!
    students: Int!
    teachers: Int!
    parents: Int!
    admins: Int!
  }

  type SubscriptionCounts {
    total: Int!
    active: Int!
  }

  type RevenueStats {
    active: Float!
    total: Float!
  }

  type PlanCount {
    plan: String!
    count: Int!
  }

  type MonthlyDataPoint {
    month: String!
    newTenants: Int!
    newUsers: Int!
    revenue: Float!
  }

  # ── Billing ──────────────────────────────────────────────────────────────

  type BillingData {
    subscriptions: [Subscription!]!
    tenantBilling: [TenantBilling!]!
    planRevenue: JSON!
    methodRevenue: JSON!
    monthlyTrend: [BillingTrend!]!
    statusDistribution: JSON!
    totalActiveRevenue: Float!
  }

  type BillingTrend {
    month: String!
    revenue: Float!
    newSubscriptions: Int!
    churned: Int!
  }

  type TenantBilling {
    id: String!
    name: String!
    slug: String!
    logo: String
    email: String
    phone: String
    address: String
    website: String
    plan: String!
    status: String!
    maxStudents: Int!
    maxTeachers: Int!
    maxParents: Int!
    maxClasses: Int!
    settings: String
    startDate: String!
    endDate: String
    createdAt: String!
    updatedAt: String!
    totalRevenue: Float!
    activeRevenue: Float!
    activeSubscriptions: Int!
    totalSubscriptions: Int!
    _count: TenantCountInfo!
  }

  # ── Core Models ──────────────────────────────────────────────────────────

  type Tenant {
    id: String!
    name: String!
    slug: String!
    logo: String
    email: String
    phone: String
    address: String
    website: String
    plan: String!
    status: String!
    maxStudents: Int!
    maxTeachers: Int!
    maxParents: Int!
    maxClasses: Int!
    settings: String
    startDate: String!
    endDate: String
    createdAt: String!
    updatedAt: String!
    studentCount: Int
    teacherCount: Int
    parentCount: Int
    adminCount: Int
    activeSubscriptions: Int
    totalRevenue: Float
    _count: TenantCountInfo
  }

  type TenantCountInfo {
    users: Int!
    classes: Int!
    subscriptions: Int!
    notices: Int!
    events: Int!
  }

  type TopTenant {
    id: String!
    name: String!
    slug: String!
    logo: String
    email: String
    phone: String
    address: String
    website: String
    plan: String!
    status: String!
    maxStudents: Int!
    maxTeachers: Int!
    maxParents: Int!
    maxClasses: Int!
    settings: String
    startDate: String!
    endDate: String
    createdAt: String!
    updatedAt: String!
    studentCount: Int!
    teacherCount: Int!
    revenue: Float!
    _count: TenantCountInfo!
  }

  type User {
    id: String!
    name: String!
    email: String!
    role: String!
    phone: String
    address: String
    avatar: String
    isActive: Boolean!
    tenantId: String
    createdAt: String!
    tenant: Tenant
  }

  type AuditLog {
    id: String!
    tenantId: String
    userId: String
    action: String!
    resource: String!
    details: String!
    ipAddress: String
    createdAt: String!
    tenant: Tenant
  }

  type Subscription {
    id: String!
    tenantId: String!
    parentId: String!
    planName: String!
    planId: String!
    amount: Float!
    period: String!
    status: String!
    paymentMethod: String!
    transactionId: String
    startDate: String!
    endDate: String
    autoRenew: Boolean!
    addons: String
    createdAt: String!
    updatedAt: String!
    tenant: Tenant
    parent: SubscriptionParent
  }

  type SubscriptionParent {
    user: SubscriptionParentUser!
  }

  type SubscriptionParentUser {
    name: String!
    email: String!
  }

  # ── Admin Dashboard ──────────────────────────────────────────────────────

  type AdminDashboard {
    totalStudents: Int!
    totalTeachers: Int!
    totalClasses: Int!
    totalParents: Int!
    totalRevenue: Float!
    pendingFees: Float!
    attendanceRate: Float!
    upcomingEvents: Int!
    monthlyAttendance: [AttendanceRate!]!
    classDistribution: [ClassDist!]!
    gradeDistribution: [GradeDist!]!
    recentNotices: [NoticeInfo!]!
    feeByType: [FeeBreakdown!]!
  }

  type AttendanceRate {
    month: String!
    rate: Float!
  }

  type ClassDist {
    name: String!
    students: Int!
  }

  type GradeDist {
    grade: String!
    count: Int!
  }

  type NoticeInfo {
    id: String!
    title: String!
    content: String!
    authorName: String!
    priority: String!
    createdAt: String
    targetRole: String!
  }

  type FeeBreakdown {
    type: String!
    collected: Float!
    pending: Float!
  }

  # ── Teacher Dashboard ────────────────────────────────────────────────────

  type TeacherDashboard {
    teacherId: String!
    classes: [TeacherClass!]!
    subjects: [TeacherSubject!]!
    totalStudents: Int!
    pendingAssignments: Int!
    todaySchedule: [ScheduleEntry!]!
    todayAttendance: AttendanceToday!
    recentAssignments: [RecentAssignment!]!
  }

  type TeacherClass {
    id: String!
    name: String!
    section: String!
    studentCount: Int!
  }

  type TeacherSubject {
    id: String!
    name: String!
    code: String!
    className: String!
  }

  type ScheduleEntry {
    id: String!
    day: String!
    startTime: String!
    endTime: String!
    subjectName: String!
    className: String!
  }

  type AttendanceToday {
    present: Int!
    total: Int!
  }

  type RecentAssignment {
    id: String!
    title: String!
    subjectName: String!
    className: String!
    dueDate: String!
    submissions: Int!
    totalStudents: Int!
  }

  # ── Student Dashboard ────────────────────────────────────────────────────

  type StudentDashboard {
    studentId: String!
    classId: String!
    attendanceRate: Float!
    avgGrade: Float!
    pendingAssignments: Int!
    todaySchedule: [ScheduleEntry!]!
    recentGrades: [RecentGrade!]!
    notices: [NoticeInfo!]!
  }

  type RecentGrade {
    id: String!
    subjectName: String!
    examType: String!
    marks: Float!
    maxMarks: Float!
    grade: String
  }

  # ── Parent Dashboard ─────────────────────────────────────────────────────

  type ParentDashboard {
    children: [ParentChild!]!
    notices: [NoticeInfo!]!
    fees: [ParentFee!]!
    performanceSummary: [ChildPerformance!]!
  }

  type ParentChild {
    id: String!
    name: String!
    className: String!
    rollNumber: String!
    gender: String!
    dateOfBirth: String
  }

  type ParentFee {
    id: String!
    studentName: String!
    type: String!
    amount: Float!
    status: String!
    dueDate: String!
    paidAmount: Float!
  }

  type ChildPerformance {
    name: String!
    attendanceRate: Float!
    avgGrade: Float!
    grade: String!
  }

  # ── Tenant Detail ───────────────────────────────────────────────────────

  type TenantDetail {
    tenant: Tenant!
    students: [TenantStudent!]!
    teachers: [TenantTeacher!]!
    parents: [TenantParent!]!
    classes: [TenantClass!]!
    notices: [NoticeInfo!]!
    fees: [TenantFee!]!
    attendance: [TenantAttendance!]!
  }

  type TenantStudent {
    id: String!
    name: String!
    email: String!
    phone: String
    rollNumber: String!
    className: String!
    gender: String!
    dateOfBirth: String
    status: String!
    classId: String
    parentId: String
    parentName: String
    admissionDate: String
  }

  type TenantTeacher {
    id: String!
    name: String!
    email: String!
    phone: String
    qualification: String
    experience: String
    status: String!
    subjects: [String!]
    classes: [String!]
    joiningDate: String
  }

  type TenantParent {
    id: String!
    name: String!
    email: String!
    phone: String
    occupation: String
    status: String!
    children: [TenantStudent!]
  }

  type TenantClass {
    id: String!
    name: String!
    section: String!
    grade: String!
    capacity: Int!
    studentCount: Int!
    classTeacher: String
  }

  type TenantFee {
    id: String!
    studentName: String!
    type: String!
    amount: Float!
    status: String!
    dueDate: String!
    paidAmount: Float!
  }

  type TenantAttendance {
    id: String!
    studentName: String!
    date: String!
    status: String!
    className: String!
  }

  # ── Users Pagination ─────────────────────────────────────────────────────

  type UsersResponse {
    users: [User!]!
    total: Int!
    page: Int!
    totalPages: Int!
    roleCounts: [RoleCount!]!
  }

  type RoleCount {
    role: String!
    count: Int!
  }

  # ── Audit Logs Pagination ────────────────────────────────────────────────

  type AuditLogsResponse {
    logs: [AuditLog!]!
    total: Int!
    page: Int!
    totalPages: Int!
    actionTypes: [ActionCount!]!
  }

  type ActionCount {
    action: String!
    count: Int!
  }

  # ── Tenants Query Response ───────────────────────────────────────────────

  type TenantsResponse {
    tenants: [Tenant!]!
  }

  # ── Tenant Mutation Basic ────────────────────────────────────────────────

  type TenantBasic {
    id: String!
    name: String!
    slug: String!
    plan: String!
    status: String!
  }

  # ── Inputs ───────────────────────────────────────────────────────────────

  input TenantInput {
    name: String!
    slug: String!
    email: String
    phone: String
    address: String
    website: String
    logo: String
    plan: String
    status: String
    maxStudents: Int
    maxTeachers: Int
    maxParents: Int
    maxClasses: Int
  }

  input TenantUpdateInput {
    name: String
    slug: String
    email: String
    phone: String
    address: String
    website: String
    plan: String
    status: String
    maxStudents: Int
    maxTeachers: Int
    maxParents: Int
    maxClasses: Int
  }

  type Subject {
    id: String!
    name: String!
    code: String!
    classId: String!
    teacherId: String
    className: String
    teacherName: String
  }

  type SubjectResponse {
    subjects: [Subject!]!
    total: Int!
  }

  input SubjectInput {
    name: String!
    code: String!
    classId: String!
    teacherId: String
  }

  # ── Root Types ───────────────────────────────────────────────────────────

  type Query {
    """Platform-wide statistics (Super Admin)"""
    platformStats: PlatformStats!

    """Billing and subscription data (Super Admin)"""
    billingData: BillingData!

    """List tenants with optional filters"""
    tenants(status: String, plan: String, search: String): TenantsResponse!

    """List users with pagination and filters"""
    users(role: String, tenantId: String, search: String, page: Int, limit: Int): UsersResponse!

    """Audit log entries with pagination"""
    auditLogs(action: String, page: Int, limit: Int): AuditLogsResponse!

    """School admin dashboard data"""
    adminDashboard(tenantId: String): AdminDashboard!

    """Teacher dashboard data"""
    teacherDashboard(teacherName: String): TeacherDashboard!

    """Student dashboard data"""
    studentDashboard(studentEmail: String): StudentDashboard!

    """Parent dashboard data"""
    parentDashboard(parentName: String): ParentDashboard!

    """Detailed tenant data including all related records"""
    tenantDetail(tenantId: String!): TenantDetail!

    """List subjects for a school"""
    subjects: [Subject!]!

    """List classes for selection"""
    classes: [TenantClass!]!

    """List teachers for selection"""
    teachers: [TenantTeacher!]!

    """List students"""
    students: [TenantStudent!]!

    """List parents"""
    parents: [TenantParent!]!

    """List notices"""
    notices: [NoticeInfo!]!

    """List fees"""
    fees: [TenantFee!]!

    """List attendance"""
    attendance: [TenantAttendance!]!
  }

  input CreateUserInput {
    name: String!
    email: String!
    phone: String
    password: String!
    role: String!
    tenantId: String
  }

  type Mutation {
    """Create a new user"""
    createUser(data: CreateUserInput!): User!

    """Create a new tenant"""
    createTenant(data: TenantInput!): Tenant!

    """Update an existing tenant"""
    updateTenant(id: ID!, data: TenantUpdateInput!): Tenant!

    """Delete a tenant and all related data"""
    deleteTenant(id: ID!): Boolean!

    """Toggle tenant active/suspended status"""
    toggleTenantStatus(id: ID!, status: String!): TenantBasic!

    """Create a subject"""
    createSubject(data: SubjectInput!): Subject!

    """Update a subject"""
    updateSubject(id: ID!, data: SubjectInput!): Subject!

    """Delete a subject"""
    deleteSubject(id: ID!): Boolean!

    """Toggle user active/inactive status"""
    toggleUserStatus(id: ID!, isActive: Boolean!): User!

    """Request a password reset link (checks if email exists)"""
    requestPasswordReset(email: String!): Boolean!
  }
`

// ── Build Schema ─────────────────────────────────────────────────────────────

// Build schema from SDL
const schema = buildSchema(typeDefs, { assumeValid: true }) as GraphQLSchema & {
  _resolversAttached?: boolean
}

// Attach resolvers directly using native graphql API (no @graphql-tools overhead)
if (!schema._resolversAttached) {
  const queryType = schema.getQueryType()
  const mutationType = schema.getMutationType()

  if (queryType) {
    const queryFields = queryType.getFields()
    for (const [key, resolver] of Object.entries(resolvers.Query || {})) {
      if (typeof resolver === 'function' && queryFields[key]) {
        queryFields[key].resolve = resolver as any
      }
    }
  }

  if (mutationType) {
    const mutationFields = mutationType.getFields()
    for (const [key, resolver] of Object.entries(resolvers.Mutation || {})) {
      if (typeof resolver === 'function' && mutationFields[key]) {
        mutationFields[key].resolve = resolver as any
      }
    }
  }

  schema._resolversAttached = true
}

export { schema }
