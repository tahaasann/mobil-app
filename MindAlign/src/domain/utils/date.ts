function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/** Calendar date in the user's local timezone (YYYY-MM-DD). */
export function formatDateLocal(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function getLastNDates(referenceDate: string, count: number): string[] {
  const [year, month, day] = referenceDate.split('-').map(Number);
  if (!year || !month || !day) {
    return [];
  }
  const base = new Date(year, month - 1, day);
  const dates: string[] = [];

  for (let index = count - 1; index >= 0; index -= 1) {
    const value = new Date(base);
    value.setDate(base.getDate() - index);
    dates.push(formatDateLocal(value));
  }

  return dates;
}

export function todayLocal(): string {
  return formatDateLocal(new Date());
}

/** @deprecated Use todayLocal() — kept for gradual migration. */
export function todayUtc(): string {
  return todayLocal();
}

/** @deprecated Use formatDateLocal(). */
export function formatDateUtc(date: Date): string {
  return formatDateLocal(date);
}
