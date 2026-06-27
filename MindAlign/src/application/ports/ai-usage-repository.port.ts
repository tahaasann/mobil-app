export type AiWeekUsage = {
  count: number;
  bonusCount: number;
};

export interface AiUsageRepository {
  getUsageForWeek(weekStart: string): Promise<AiWeekUsage>;
  incrementForWeek(weekStart: string): Promise<number>;
  addBonusForWeek(weekStart: string): Promise<number>;
}
