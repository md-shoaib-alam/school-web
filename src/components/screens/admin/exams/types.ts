export interface ExamRecord {
  id: string;
  name: string;
  subjectName: string;
  className: string;
  classSection: string;
  classId: string;
  subjectId: string;
  examType: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  totalMarks: number;
  passingMarks: number;
}

export interface ExamFormData {
  classId: string;
  subjectId: string;
  name: string;
  examType: string;
  date: string;
  startTime: string;
  endTime: string;
  totalMarks: string;
  passingMarks: string;
}

export interface StudentResultRow {
  studentId: string;
  studentName: string;
  rollNumber: string;
  marksObtained: string;
  remarks: string;
  status: 'pass' | 'fail' | 'pending';
}

export interface ClassOption {
  id: string;
  name: string;
  section: string;
  grade: string;
}

export interface SubjectOption {
  id: string;
  name: string;
  code: string;
  classId: string;
}

export interface StudentOption {
  id: string;
  name: string;
  rollNumber: string;
}
