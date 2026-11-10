/**
 * Safely formats a JavaScript Date object to YYYY-MM-DD using the user's LOCAL calendar.
 * Avoids .toISOString() timezone shift bugs where local midnight yields the previous UTC day.
 */
export function formatLocalDate(date?: Date): string {
  if (!date) return "";
  return date.toLocaleDateString('en-CA');
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

/**
 * Formats a date string (YYYY-MM-DD) or Date object to dd/mm/yyyy.
 */
export function formatToDdMmYyyy(dateInput?: string | Date | null): string {
  if (!dateInput) return '-';
  if (typeof dateInput === 'string') {
    const parts = dateInput.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      const cleanD = d.split('T')[0]; // in case of ISO string
      return `${cleanD.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
    const d = new Date(dateInput);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return dateInput;
  }
  const day = String(dateInput.getDate()).padStart(2, '0');
  const month = String(dateInput.getMonth() + 1).padStart(2, '0');
  const year = dateInput.getFullYear();
  return `${day}/${month}/${year}`;
}
