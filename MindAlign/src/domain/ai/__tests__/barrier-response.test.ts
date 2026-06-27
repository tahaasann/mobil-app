import {
  barrierResponseSchema,
  parseBarrierResponse,
  parseBarrierResponseJson,
} from '@/domain/ai/barrier-response';

describe('barrierResponseSchema', () => {
  it('accepts valid coach payload', () => {
    const parsed = parseBarrierResponse({
      barrier_label: 'Yorgunluk',
      reflection: 'Yorgun hissetmen normal.',
      micro_task: '2 dakika hazırlık yap.',
      encouragement: 'Küçük adım yeterli.',
    });

    expect(parsed.barrier_label).toBe('Yorgunluk');
  });

  it('rejects empty micro_task', () => {
    expect(() =>
      barrierResponseSchema.parse({
        barrier_label: 'X',
        reflection: 'Y',
        micro_task: '',
        encouragement: 'Z',
      }),
    ).toThrow();
  });

  it('parses JSON text', () => {
    const parsed = parseBarrierResponseJson(
      JSON.stringify({
        barrier_label: 'Erteleme',
        reflection: 'Erteleme bir bariyer.',
        micro_task: '1 dakika başla.',
        encouragement: 'Devam et.',
      }),
    );

    expect(parsed.micro_task).toBe('1 dakika başla.');
  });
});
