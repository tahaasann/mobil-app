import type { AiReportInput, AiReportPort } from '@/application/ports/ai-report.port';

export class MockAiReportAdapter implements AiReportPort {
  readonly reports: AiReportInput[] = [];

  async submitReport(input: AiReportInput): Promise<void> {
    this.reports.push(input);
  }
}
