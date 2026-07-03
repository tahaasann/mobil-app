import { ReportAiResponseUseCase } from '@/application/use-cases/report-ai-response.use-case';
import type { AiReportPort } from '@/application/ports/ai-report.port';
import type { AnalyticsPort } from '@/application/ports/analytics.port';

describe('ReportAiResponseUseCase (T-210)', () => {
  it('stores report with category and message id', async () => {
    const aiReportPort: AiReportPort = {
      submitReport: jest.fn(async () => undefined),
    };
    const analyticsPort: AnalyticsPort = {
      logEvent: jest.fn(),
      setUserProperty: jest.fn(),
    };

    const useCase = new ReportAiResponseUseCase(aiReportPort, analyticsPort);

    await useCase.execute({
      messageId: 'msg-123',
      habitId: 'habit-1',
      category: 'harmful',
      contentPreview: 'Unsafe coaching text',
    });

    expect(aiReportPort.submitReport).toHaveBeenCalledWith({
      messageId: 'msg-123',
      habitId: 'habit-1',
      category: 'harmful',
      contentPreview: 'Unsafe coaching text',
    });
    expect(analyticsPort.logEvent).toHaveBeenCalledWith(
      'ai_response_reported',
      expect.objectContaining({ category: 'harmful', message_id: 'msg-123' }),
    );
  });
});
