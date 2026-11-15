export interface ChildInfo {
  id: string;
  name: string;
  email?: string;
  username?: string;
  rollNumber?: string;
  className?: string;
  classId?: string;
  gender?: string;
  dateOfBirth?: string;
}

export interface ParentInfo {
  id: string;
  userId: string;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  alternatePhone?: string;
  occupation?: string;
  address?: string;
  gender?: string;
  dateOfBirth?: string;
  children: ChildInfo[];
}

export interface StudentInfo {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  classId: string;
  parentId?: string | null;
  parentName?: string | null;
  email?: string;
  gender?: string;
}

export const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
