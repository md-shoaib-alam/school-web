import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely formats a JavaScript Date object to YYYY-MM-DD using the user's LOCAL calendar.
 * Avoids .toISOString() timezone shift bugs where local midnight yields the previous UTC day.
 */
export function formatLocalDate(date?: Date): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Safely parses a YYYY-MM-DD database string into a local JavaScript Date object.
 * Avoids `new Date("YYYY-MM-DD")` defaults which generate UTC dates and cause rendering offset errors.
 */
export function parseLocalDate(dateStr?: string): Date | undefined {
  if (!dateStr) return undefined;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return undefined;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  if (isNaN(year) || isNaN(month) || isNaN(day)) return undefined;
  return new Date(year, month, day);
}

