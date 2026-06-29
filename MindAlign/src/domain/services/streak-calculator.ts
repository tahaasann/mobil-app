export type StreakLogEntry = {
  date: string;
  status: 'success' | 'rescued' | 'failed';
};

function subtractDays(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) {
    return date;
  }
  const value = new Date(year, month - 1, day);
  value.setDate(value.getDate() - days);
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function calculateStreak(logs: StreakLogEntry[], referenceDate: string): number {
  const byDate = new Map(logs.map((log) => [log.date, log.status]));
  let streak = 0;
  let offset = 0;

  while (true) {
    const date = subtractDays(referenceDate, offset);
    const status = byDate.get(date);

    if (!status) {
      break;
    }

    if (status === 'failed') {
      break;
    }

    streak += 1;
    offset += 1;
  }

  return streak;
}
