import type { AnalyticsPort } from '@/application/ports/analytics.port';
import type { AiReportInput, AiReportPort } from '@/application/ports/ai-report.port';

export class ReportAiResponseUseCase {
  constructor(
    private readonly aiReportPort: AiReportPort,
    private readonly analyticsPort: AnalyticsPort,
  ) {}

  async execute(input: AiReportInput): Promise<void> {
    await this.aiReportPort.submitReport(input);
    this.analyticsPort.logEvent('ai_response_reported', {
      category: input.category,
      message_id: input.messageId,
      habit_id: input.habitId ?? 'general',
    });
  }
}
