import type { StudentInfo } from "./types";

export interface StudentOverviewTabProps {
  currentStudent: StudentInfo;
  studentDetails: any;
  transportRoute: any;
  canEdit?: boolean;
  onEdit?: (student: StudentInfo) => void;
  onSelectStudent?: (studentId: string) => void;
  editingSection?: string | null;
  setEditingSection?: (section: string | null) => void;
  formatDate: (dateStr: string | null | undefined) => string;
  calculateAge: (dateStr: string | null | undefined) => string;
}

/**
 * Route stops arrive either as a JSON string (persisted) or as an already
 * parsed array. Returns the list of stops for a given route.
 */
export function parseRouteStops(selectedRoute: any) {
  return selectedRoute
    ? (typeof selectedRoute.stops === "string" ? JSON.parse(selectedRoute.stops) : (selectedRoute.stops || []))
    : [];
}
