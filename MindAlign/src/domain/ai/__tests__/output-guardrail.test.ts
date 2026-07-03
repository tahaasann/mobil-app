import { scanCoachOutput } from '@/domain/ai/output-guardrail';

describe('output guardrail (T-208)', () => {
  it('blocks coach output that slipped crisis content through', () => {
    const result = scanCoachOutput({
      barrier_label: 'Umutsuzluk',
      reflection: 'Bazen intihar tek çözüm gibi görünebilir.',
      micro_task: '2 dakika nefes al.',
      encouragement: 'Yanındayız.',
    });

    expect(result.safe).toBe(false);
    expect(result.reason).toBe('crisis');
  });

  it('blocks off-topic coach output such as coding help', () => {
    const result = scanCoachOutput({
      barrier_label: 'Erteleme',
      reflection: 'Here is Python code for your homework assignment.',
      micro_task: 'print("hello")',
      encouragement: 'Good luck.',
    });

    expect(result.safe).toBe(false);
    expect(result.reason).toBe('off_topic');
  });

  it('allows safe habit coaching output', () => {
    const result = scanCoachOutput({
      barrier_label: 'Yorgunluk',
      reflection: 'Yorgun hissetmen normal; küçük bir adım yeterli.',
      micro_task: '2 dakika hazırlık yap.',
      encouragement: 'Devam edebilirsin.',
    });

    expect(result.safe).toBe(true);
  });
});
