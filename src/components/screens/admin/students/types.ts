export interface StudentInfo {
  id: string;
  name: string;
  email: string;
  username?: string;
  phone: string | null;
  classId: string;
  className: string;
  rollNumber: string;
  gender: string;
  dateOfBirth: string | null;
  parentName?: string;
  transport?: {
    id: string;
    routeId: string;
    pickupPoint: string | null;
    status: string;
    startDate: string;
  } | null;
  siblings?: {
    id: string;
    name: string;
    className: string;
  }[];
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
  username?: string;
  phone: string;
  rollNumber: string;
  classId: string;
  gender: string;
  dateOfBirth: string;
  password?: string;
  transportEnabled?: boolean;
  routeId?: string;
  pickupPoint?: string;
  newPickupPointFee?: number;
}
