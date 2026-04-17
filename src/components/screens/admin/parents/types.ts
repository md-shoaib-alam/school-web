export interface ChildInfo {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  className: string;
  classId: string;
  gender: string;
  dateOfBirth?: string;
}

export interface ParentInfo {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  occupation?: string;
  children: ChildInfo[];
}

export interface StudentInfo {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  classId: string;
}

export interface ParentFormData {
  name: string;
  email: string;
  phone: string;
  occupation: string;
  password?: string;
}
