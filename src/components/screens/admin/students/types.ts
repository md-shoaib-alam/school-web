export interface StudentInfo {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  classId: string | null;
  className?: string;
  section?: string;
  rollNumber: string | null;
  admissionNumber: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  bloodGroup: string | null;
  address: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  guardianEmail: string | null;
  guardianRelation: string | null;
  isActive: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  class: {
    id: string;
    name: string;
    section: string;
    grade: number;
  } | null;
}

export interface ClassInfo {
  id: string;
  name: string;
  section: string;
  grade: number;
}

export interface StudentFormData {
  name: string;
  email: string;
  phone: string;
  classId: string;
  rollNumber: string;
  admissionNumber: string;
  gender: string;
  dateOfBirth: string;
  bloodGroup: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelation: string;
  password?: string;
}
