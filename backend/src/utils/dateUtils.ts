/**
 * Normalizes any date string or Date object to UTC midnight (YYYY-MM-DDT00:00:00.000Z)
 * to ensure exact, timezone-agnostic matching with MySQL `@db.Date` fields.
 */
export const parseDateOnly = (input?: string | Date | null): Date => {
  if (!input) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return new Date(`${y}-${m}-${d}T00:00:00.000Z`);
  }
  if (typeof input === 'string') {
    const ymd = input.includes('T') ? input.split('T')[0] : input.slice(0, 10);
    return new Date(`${ymd}T00:00:00.000Z`);
  }
  const y = input.getFullYear();
  const m = String(input.getMonth() + 1).padStart(2, '0');
  const d = String(input.getDate()).padStart(2, '0');
  return new Date(`${y}-${m}-${d}T00:00:00.000Z`);
};

export const formatDateOnly = (date: Date): string => {
  return date.toISOString().split('T')[0];
};
