import { buildWeeklyQuotaExceededMessage } from '@/domain/ai/quota-messages';

describe('quota messages (T-245)', () => {
  it('uses remote-config limit in Turkish copy', () => {
    expect(buildWeeklyQuotaExceededMessage('tr', 5)).toContain('5');
  });

  it('uses remote-config limit in English copy', () => {
    expect(buildWeeklyQuotaExceededMessage('en', 5)).toContain('5');
  });
});
