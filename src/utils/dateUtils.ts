/**
 * Local timezone-safe Date parsing utilities.
 * Avoids UTC timezone shifts caused by standard Date constructors on ISO strings.
 */

export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.trim().split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1; // Month index is 0-based
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m, d);
    }
  }
  const fallback = new Date(dateStr);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

/**
 * Strips timezone offsets and returns a safe YYYY-MM-DD local format.
 */
export function formatLocalDateString(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Returns a readable local standard 12-hour time format (HH:MM AM/PM).
 */
export function formatLocalTimeString(d: Date): string {
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 hour is converted to 12
  const strHours = String(hours).padStart(2, '0');
  return `${strHours}:${minutes} ${ampm}`;
}
