export function formatDateUtc(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getLastNDates(referenceDate: string, count: number): string[] {
  const dates: string[] = [];
  const base = new Date(`${referenceDate}T00:00:00.000Z`);

  for (let index = count - 1; index >= 0; index -= 1) {
    const value = new Date(base);
    value.setUTCDate(base.getUTCDate() - index);
    dates.push(value.toISOString().slice(0, 10));
  }

  return dates;
}

export function todayUtc(): string {
  return formatDateUtc(new Date());
}
