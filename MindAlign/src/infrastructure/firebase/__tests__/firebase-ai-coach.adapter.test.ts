import { FirebaseAiCoachAdapter } from '@/infrastructure/firebase/firebase-ai-coach.adapter';

describe('FirebaseAiCoachAdapter', () => {
  it('returns parsed structured coach response', async () => {
    const adapter = new FirebaseAiCoachAdapter();
    const response = await adapter.generateCoachResponse({
      habitTitle: 'Meditasyon',
      excuse: 'Yorgunum',
      approach: 'universal',
    });

    expect(response.barrier_label).toBe('Yorgunluk');
    expect(response.micro_task).toBeTruthy();
  });

  it('streams partial text when handler provided', async () => {
    const adapter = new FirebaseAiCoachAdapter();
    const partials: string[] = [];

    await adapter.generateCoachResponse(
      {
        habitTitle: 'Koşu',
        excuse: 'Hava soğuk',
        approach: 'scientific',
      },
      (text) => partials.push(text),
    );

    expect(partials.length).toBeGreaterThan(0);
  });
});
