export interface FeeRecord {
  id: string;
  studentId: string;
  student: {
    id: string;
    name: string;
    class: {
      name: string;
      section: string;
    } | null;
  };
  amount: number;
  paidAmount: number;
  type: string;
  status: string;
  dueDate: string;
  paidDate?: string | null;
  transactionId?: string | null;
  remark?: string | null;
  createdAt: string;
}

export interface FeeFormData {
  studentId: string;
  amount: string;
  type: string;
  status: string;
  dueDate: string;
  paidAmount: string;
  paidDate: string;
  remark: string;
}

export interface StudentOption {
  id: string;
  name: string;
  classId: string | null;
}

export interface ClassOption {
  id: string;
  name: string;
  section: string;
}
