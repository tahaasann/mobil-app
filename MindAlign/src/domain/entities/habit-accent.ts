export type HabitAccent = 'neutral' | 'emerald' | 'amber' | 'sky';

const ACCENT_SORT_ORDER: Record<HabitAccent, number> = {
  neutral: 0,
  emerald: 100,
  amber: 200,
  sky: 300,
};

const SORT_ORDER_ACCENT: Record<number, HabitAccent> = {
  0: 'neutral',
  100: 'emerald',
  200: 'amber',
  300: 'sky',
};

export function habitAccentToSortOrder(accent: HabitAccent): number {
  return ACCENT_SORT_ORDER[accent];
}

export function resolveHabitAccentFromSortOrder(sortOrder: number): HabitAccent {
  if (sortOrder >= 300) return 'sky';
  if (sortOrder >= 200) return 'amber';
  if (sortOrder >= 100) return 'emerald';
  return SORT_ORDER_ACCENT[sortOrder] ?? 'neutral';
}

export const HABIT_ACCENT_OPTIONS: HabitAccent[] = ['neutral', 'emerald', 'amber', 'sky'];

export const HABIT_ACCENT_BORDER_CLASS: Record<HabitAccent, string> = {
  neutral: '',
  emerald: 'border-emerald-500/40',
  amber: 'border-amber-500/40',
  sky: 'border-sky-500/40',
};
