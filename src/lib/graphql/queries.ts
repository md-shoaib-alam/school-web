export const PLATFORM_STATS = `
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

export const BILLING_DATA = `
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

export const TENANTS = `
  query Tenants($status: String, $plan: String, $search: String, $page: Int, $limit: Int) {
    tenants(status: $status, plan: $plan, search: $search, page: $page, limit: $limit) {
      tenants { id name slug email phone address website plan status maxStudents maxTeachers maxParents maxClasses startDate endDate createdAt studentCount teacherCount parentCount adminCount activeSubscriptions totalRevenue _count { users classes subscriptions notices events } }
      total page totalPages
    }
  }
`

export const USERS = `
  query Users($role: String, $tenantId: String, $search: String, $page: Int, $limit: Int) {
    users(role: $role, tenantId: $tenantId, search: $search, page: $page, limit: $limit) {
      users { id name email role phone isActive createdAt tenant { id name slug } }
      total page totalPages
      roleCounts { role count }
    }
  }
`

export const AUDIT_LOGS = `
  query AuditLogs($action: String, $page: Int, $limit: Int) {
    auditLogs(action: $action, page: $page, limit: $limit) {
      logs { id action resource details createdAt tenant { id name } }
      total page totalPages
      actionTypes { action count }
    }
  }
`

export const CREATE_TENANT = `
  mutation CreateTenant($data: TenantInput!) {
    createTenant(data: $data) { id name slug plan status }
  }
`

export const UPDATE_TENANT = `
  mutation UpdateTenant($id: ID!, $data: TenantUpdateInput!) {
    updateTenant(id: $id, data: $data) { id name slug plan status }
  }
`

export const DELETE_TENANT = `
  mutation DeleteTenant($id: ID!) {
    deleteTenant(id: $id)
  }
`

export const TOGGLE_TENANT_STATUS = `
  mutation ToggleTenantStatus($id: ID!, $status: String!) {
    toggleTenantStatus(id: $id, status: $status) { id name status }
  }
`

export const ADMIN_DASHBOARD = `
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

export const TEACHER_DASHBOARD = `
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

export const STUDENT_DASHBOARD = `
  query StudentDashboard($studentEmail: String) {
    studentDashboard(studentEmail: $studentEmail) {
      studentId classId attendanceRate avgGrade pendingAssignments
      todaySchedule { id day startTime endTime subjectName className }
      recentGrades { id subjectName examType marks maxMarks grade }
      notices { id title content authorName priority createdAt targetRole }
    }
  }
`

export const DASHBOARD_SUMMARY = `
  query DashboardSummary($tenantId: String!) {
    dashboardSummary(tenantId: $tenantId) {
      totalStudents totalTeachers totalClasses totalParents attendanceRate upcomingEvents
    }
  }
`

export const DASHBOARD_ATTENDANCE = `
  query DashboardAttendance($tenantId: String!) {
    dashboardAttendance(tenantId: $tenantId) { month rate }
  }
`

export const DASHBOARD_ACADEMIC = `
  query DashboardAcademic($tenantId: String!) {
    dashboardAcademic(tenantId: $tenantId) {
      classDistribution { name students }
      gradeDistribution { grade count }
    }
  }
`

export const DASHBOARD_FINANCIAL = `
  query DashboardFinancial($tenantId: String!) {
    dashboardFinancial(tenantId: $tenantId) {
      totalRevenue pendingFees
      feeByType { type collected pending }
    }
  }
`

export const DASHBOARD_NOTICES = `
  query DashboardNotices($tenantId: String!) {
    dashboardNotices(tenantId: $tenantId) {
      id title content authorName priority createdAt targetRole
    }
  }
`

export const PARENT_DASHBOARD = `
  query ParentDashboard($parentName: String!) {
    parentDashboard(parentName: $parentName) {
      children { id name className rollNumber gender dateOfBirth }
      notices { id title content authorName priority createdAt targetRole }
      fees { id studentName type amount status dueDate paidAmount }
      performanceSummary { name attendanceRate avgGrade grade }
    }
  }
`

export const TENANT_DETAIL = `
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

export const SUBJECTS = `
  query Subjects($tenantId: String, $page: Int, $limit: Int) {
    subjects(tenantId: $tenantId, page: $page, limit: $limit) {
      subjects { id name code classId teacherId className teacherName }
      total page totalPages
    }
  }
`

export const CLASSES = `
  query Classes($tenantId: String, $page: Int, $limit: Int) {
    classes(tenantId: $tenantId, page: $page, limit: $limit) {
      classes { id name section grade capacity studentCount classTeacher }
      total page totalPages
    }
  }
`

export const TEACHERS = `
  query Teachers($tenantId: String, $page: Int, $limit: Int) {
    teachers(tenantId: $tenantId, page: $page, limit: $limit) {
      teachers { id name email phone qualification experience status subjects classes joiningDate }
      total page totalPages
    }
  }
`

export const STUDENTS = `
  query Students($tenantId: String, $page: Int, $limit: Int) {
    students(tenantId: $tenantId, page: $page, limit: $limit) {
      students { id name email phone rollNumber className gender dateOfBirth status classId parentId parentName admissionDate }
      total page totalPages
    }
  }
`

export const PARENTS = `
  query Parents($tenantId: String, $page: Int, $limit: Int) {
    parents(tenantId: $tenantId, page: $page, limit: $limit) {
      parents { 
        id userId name email phone occupation status 
        children { id name email rollNumber className gender classId } 
        subscription { id planName planId amount period status transactionId startDate endDate autoRenew }
      }
      total page totalPages
    }
  }
`

export const SUBSCRIPTIONS = `
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

export const NOTICES = `
  query Notices($tenantId: String, $page: Int, $limit: Int) {
    notices(tenantId: $tenantId, page: $page, limit: $limit) {
      notices { id title content authorName priority targetRole createdAt }
      total page totalPages
    }
  }
`

export const FEES = `
  query Fees($tenantId: String, $page: Int, $limit: Int) {
    fees(tenantId: $tenantId, page: $page, limit: $limit) {
      fees { id studentName studentId className type amount status dueDate paidAmount }
      total page totalPages
    }
  }
`

export const ATTENDANCE = `
  query Attendance($tenantId: String!, $page: Int, $limit: Int) {
    attendance(tenantId: $tenantId, page: $page, limit: $limit) {
      records { id studentName date status className }
      total page totalPages
    }
  }
`

export const CUSTOM_ROLES = `
  query CustomRoles($tenantId: String) {
    customRoles(tenantId: $tenantId) {
      id name color permissions createdAt
    }
  }
`

export const STAFF = `
  query GetStaff($tenantId: String, $role: String, $page: Int, $limit: Int) {
    staff(tenantId: $tenantId, role: $role, page: $page, limit: $limit) {
      staff {
        id name email phone address role isActive 
        customRole { id name color }
        createdAt
      }
      total page totalPages
    }
  }
`

export const CREATE_SUBJECT = `
  mutation CreateSubject($data: SubjectInput!) {
    createSubject(data: $data) { id name code classId teacherId className teacherName }
  }
`

export const UPDATE_SUBJECT = `
  mutation UpdateSubject($id: ID!, $data: SubjectInput!) {
    updateSubject(id: $id, data: $data) { id name code classId teacherId className teacherName }
  }
`

export const DELETE_SUBJECT = `
  mutation DeleteSubject($id: ID!) {
    deleteSubject(id: $id)
  }
`

export const TOGGLE_USER_STATUS = `
  mutation ToggleUserStatus($id: ID!, $isActive: Boolean!) {
    toggleUserStatus(id: $id, isActive: $isActive) { id name isActive }
  }
`

export const REQUEST_PASSWORD_RESET = `
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`

export const CREATE_USER = `
  mutation CreateUser($data: CreateUserInput!) {
    createUser(data: $data) { id name email role isActive }
  }
`

export const CHANGE_PASSWORD = `
  mutation ChangePassword($oldPassword: String!, $newPassword: String!) {
    changePassword(oldPassword: $oldPassword, newPassword: $newPassword)
  }
`

export const CREATE_CUSTOM_ROLE = `
  mutation CreateCustomRole($tenantId: String, $name: String!, $description: String, $color: String!, $permissions: JSON!) {
    createCustomRole(tenantId: $tenantId, name: $name, description: $description, color: $color, permissions: $permissions) { id name color permissions createdAt }
  }
`

export const UPDATE_CUSTOM_ROLE = `
  mutation UpdateCustomRole($id: ID!, $name: String, $description: String, $color: String, $permissions: JSON) {
    updateCustomRole(id: $id, name: $name, description: $description, color: $color, permissions: $permissions) { id name color permissions createdAt }
  }
`

export const DELETE_CUSTOM_ROLE = `
  mutation DeleteCustomRole($id: ID!) {
    deleteCustomRole(id: $id)
  }
`

export const ASSIGN_ROLE_TO_USER = `
  mutation AssignRoleToUser($userId: String!, $roleId: String, $tenantId: String) {
    assignRoleToUser(userId: $userId, roleId: $roleId, tenantId: $tenantId)
  }
`
