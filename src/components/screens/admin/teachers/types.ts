export interface TeacherInfo {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  qualification?: string;
  experience?: string;
  status?: string;
  subjects?: string[];
  classes?: string[];
  joiningDate?: string;
  teacherId?: string;
  employeeId?: string | null;
  address?: string;
  avatar?: string | null;
  role?: string;
  department?: string | null;
  designation?: string | null;
  employmentType?: string | null;
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

export interface TeacherDocumentInfo {
  id: string;
  teacherId: string;
  name: string;
  category: string;
  fileUrl: string;
  size: number;
  status: string;
  verifiedAt: string | null;
  createdAt: string;
}
