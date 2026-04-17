export interface SubjectInfo {
  id: string;
  name: string;
  code: string;
  className: string;
  teacherName?: string;
  classId: string;
  teacherId: string;
}

export interface ClassMin {
  id: string;
  name: string;
  section: string;
}

export interface TeacherMin {
  id: string;
  name: string;
}

export interface SubjectFormData {
  name: string;
  code: string;
  classId: string;
  teacherId: string;
}
