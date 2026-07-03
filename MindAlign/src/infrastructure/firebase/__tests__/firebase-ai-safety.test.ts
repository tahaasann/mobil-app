import { getGenerativeModel } from '@react-native-firebase/ai';

import { FirebaseAiCoachAdapter } from '@/infrastructure/firebase/firebase-ai-coach.adapter';

describe('FirebaseAiCoachAdapter production safety (T-212)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passes safetySettings to getGenerativeModel in production profile', async () => {
    const adapter = new FirebaseAiCoachAdapter();
    await adapter.generateCoachResponse({
      habitTitle: 'Meditasyon',
      excuse: 'Yorgunum',
      approach: 'universal',
    });

    expect(getGenerativeModel).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        safetySettings: expect.arrayContaining([
          expect.objectContaining({
            category: expect.stringMatching(/HARM_CATEGORY_/),
            threshold: expect.stringMatching(/BLOCK_/),
          }),
        ]),
      }),
    );
  });
});
