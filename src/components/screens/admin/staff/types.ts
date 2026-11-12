export interface CustomRole {
  id: string;
  name: string;
  color: string;
  permissions?: Record<string, unknown>;
  userCount?: number;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  address: string | null;
  avatar?: string | null;
  isActive: boolean;
  customRole: Pick<CustomRole, "id" | "name" | "color"> | null;
  createdAt: string;
  staffId?: string | null;
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

export interface StaffFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  customRoleId: string;
  isActive: boolean;
  employeeId: string;
  department: string;
  designation: string;
  employmentType: string;
  joiningDate: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  maritalStatus: string;
  nationality: string;
  religion: string;
  alternatePhone: string;
  panNumber: string;
  aadhaarNumber: string;
  pfEnabled: boolean;
  esiEnabled: boolean;
  ptEnabled: boolean;
  avatar: string;
}

export const emptyFormData: StaffFormData = {
  name: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  customRoleId: "",
  isActive: true,
  employeeId: "",
  department: "",
  designation: "",
  employmentType: "full-time",
  joiningDate: "",
  dateOfBirth: "",
  gender: "",
  bloodGroup: "",
  maritalStatus: "",
  nationality: "",
  religion: "",
  alternatePhone: "",
  panNumber: "",
  aadhaarNumber: "",
  pfEnabled: false,
  esiEnabled: false,
  ptEnabled: false,
  avatar: "",
};
