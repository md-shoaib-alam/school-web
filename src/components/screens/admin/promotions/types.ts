export interface PromotionRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  rollNumber: string;
  fromClassId: string;
  fromClassName: string;
  fromClassGrade: string;
  toClassId: string;
  toClassName: string;
  toClassGrade: string;
  academicYear: string;
  status: string;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClassOption {
  id: string;
  name: string;
  section: string;
  grade: string;
  capacity: number;
  studentCount: number;
  classTeacher: string;
}

export interface StudentOption {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  classId: string;
}

export interface PromotionFormData {
  studentId: string;
  fromClassId: string;
  toClassId: string;
  academicYear: string;
  remarks: string;
}

export const emptyForm: PromotionFormData = {
  studentId: "",
  fromClassId: "",
  toClassId: "",
  academicYear: "",
  remarks: "",
};
