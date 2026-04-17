export interface TeacherInfo {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  qualification: string | null;
  experience: string | null;
  subjects?: string[];
  classes?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface TeacherFormData {
  name: string;
  email: string;
  phone: string;
  qualification: string;
  experience: string;
  password?: string;
}
