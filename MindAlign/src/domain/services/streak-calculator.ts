export type StreakLogEntry = {
  date: string;
  status: 'success' | 'rescued' | 'failed';
};

function subtractDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() - days);
  return value.toISOString().slice(0, 10);
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
