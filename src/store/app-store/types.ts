export type UserRole = 'super_admin' | 'admin' | 'teacher' | 'student' | 'parent' | 'staff';

export interface CustomRoleInfo {
  id: string;
  name: string;
  color: string;
  permissions: Record<string, string[]>;
}

export interface PlatformRoleInfo {
  id: string;
  name: string;
  color: string;
  permissions: Record<string, string[]>;
}

export interface TeacherProfileInfo {
  id: string;
  employeeId?: string | null;
  qualification?: string | null;
  experience?: string | null;
  joiningDate?: string | null;
  department?: string | null;
  designation?: string | null;
  employmentType?: string | null;
  status?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  bloodGroup?: string | null;
  maritalStatus?: string | null;
  nationality?: string | null;
  religion?: string | null;
  alternatePhone?: string | null;
  panNumber?: string | null;
  aadhaarNumber?: string | null;
  pfEnabled?: boolean;
  esiEnabled?: boolean;
  ptEnabled?: boolean;
}

export interface StaffProfileInfo {
  id: string;
  employeeId?: string | null;
  joiningDate?: string | null;
  department?: string | null;
  designation?: string | null;
  employmentType?: string | null;
  status?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  bloodGroup?: string | null;
  maritalStatus?: string | null;
  nationality?: string | null;
  religion?: string | null;
  alternatePhone?: string | null;
  panNumber?: string | null;
  aadhaarNumber?: string | null;
  pfEnabled?: boolean;
  esiEnabled?: boolean;
  ptEnabled?: boolean;
}

export interface StudentProfileInfo {
  id: string;
  rollNumber?: string | null;
  classId?: string | null;
  className?: string | null;
  academicYear?: string | null;
  admissionDate?: string | null;
  status?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  bloodGroup?: string | null;
  maritalStatus?: string | null;
  nationality?: string | null;
  religion?: string | null;
  category?: string | null;
  alternatePhone?: string | null;
  aadhaarNumber?: string | null;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  tenantId?: string;
  tenantSlug?: string;
  tenantName?: string;
  tenantLogo?: string | null;
  phone?: string;
  address?: string;

  customRole?: CustomRoleInfo | null;
  platformRole?: PlatformRoleInfo | null;
  teacherProfile?: TeacherProfileInfo | null;
  staffProfile?: StaffProfileInfo | null;
  studentProfile?: StudentProfileInfo | null;
  currentSession?: string | null;
}

export interface SessionTokens {
  token: string;
  refreshToken?: string;
}

export interface AppState {
  isLoggedIn: boolean;
  currentUser: AppUser | null;
  login: (user: AppUser, session: SessionTokens) => boolean;
  /** Drops the active account and returns where to go next, or null when none is left. */
  logout: () => string | null;
  refreshPermissions: () => Promise<void>;

  currentScreen: string;
  setCurrentScreen: (screen: string) => void;

  currentSubScreen: string | null;
  setCurrentSubScreen: (subScreen: string | null) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  currentTenantId: string | null;
  currentTenantSlug: string | null;
  currentTenantName: string | null;
  currentTenantLogo: string | null;
  setCurrentTenant: (id: string, name: string, slug: string, logo?: string | null) => Promise<void>;

}

