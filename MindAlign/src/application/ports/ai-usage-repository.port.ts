export interface AiUsageRepository {
  getCountForWeek(weekStart: string): Promise<number>;
  incrementForWeek(weekStart: string): Promise<number>;
}
