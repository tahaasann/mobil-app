import { BustExcuseChatUseCase } from '@/application/use-cases/bust-excuse-chat.use-case';
import type { AiCoachPort } from '@/application/ports/ai-coach.port';
import type { AiUsageRepository } from '@/application/ports/ai-usage-repository.port';

describe('BustExcuseChatUseCase', () => {
  const coachResponse = {
    barrier_label: 'Erteleme',
    reflection: 'Erteleme bir koruma mekanizması olabilir.',
    micro_task: '1 dakika başla.',
    encouragement: 'Devam edebilirsin.',
  };

  let aiCoach: AiCoachPort;
  let aiUsageRepository: AiUsageRepository;
  let useCase: BustExcuseChatUseCase;

  let mockGenerateCoachResponse: jest.Mock;
  let mockGetCountForWeek: jest.Mock;
  let mockIncrementForWeek: jest.Mock;

  beforeEach(() => {
    mockGenerateCoachResponse = jest.fn(async () => coachResponse);
    mockGetCountForWeek = jest.fn(async () => 0);
    mockIncrementForWeek = jest.fn(async () => 1);

    aiCoach = { generateCoachResponse: mockGenerateCoachResponse };
    aiUsageRepository = {
      getCountForWeek: mockGetCountForWeek,
      incrementForWeek: mockIncrementForWeek,
    };
    useCase = new BustExcuseChatUseCase(aiCoach, aiUsageRepository);
  });

  it('returns coach response for on-topic excuse', async () => {
    const result = await useCase.execute({
      habitTitle: 'Meditasyon',
      excuse: 'Bugün çok yorgunum',
      approach: 'universal',
    });

    expect(result.kind).toBe('coach');
    if (result.kind === 'coach') {
      expect(result.response.micro_task).toBe('1 dakika başla.');
    }
    expect(mockIncrementForWeek).toHaveBeenCalled();
  });

  it('blocks off-topic requests without calling AI', async () => {
    const result = await useCase.execute({
      habitTitle: 'Meditasyon',
      excuse: 'bana python kodu yaz',
      approach: 'universal',
    });

    expect(result.kind).toBe('off_topic');
    expect(mockGenerateCoachResponse).not.toHaveBeenCalled();
  });

  it('returns quota exceeded when weekly limit reached', async () => {
    mockGetCountForWeek.mockResolvedValue(3);

    const result = await useCase.execute({
      habitTitle: 'Meditasyon',
      excuse: 'Yorgunum',
      approach: 'universal',
    });

    expect(result.kind).toBe('quota_exceeded');
    expect(mockGenerateCoachResponse).not.toHaveBeenCalled();
  });
});
