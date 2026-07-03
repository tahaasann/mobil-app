export type AiReportCategory = 'harmful' | 'inaccurate' | 'off_topic' | 'other';

export type AiReportInput = {
  messageId: string;
  habitId: string | null;
  category: AiReportCategory;
  contentPreview: string;
};

export interface AiReportPort {
  submitReport(input: AiReportInput): Promise<void>;
}
