export interface StudentInfo {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  classId: string;
  className: string;
  rollNumber: string;
  gender: string;
  dateOfBirth: string | null;
  parentName?: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  section: string;
  grade: string;
}

export interface StudentFormData {
  name: string;
  email: string;
  phone: string;
  rollNumber: string;
  classId: string;
  gender: string;
  dateOfBirth: string;
  password?: string;
}
