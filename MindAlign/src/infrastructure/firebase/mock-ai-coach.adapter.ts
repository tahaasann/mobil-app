import type {
  AiCoachPort,
  CoachContext,
  CoachStreamHandler,
} from '@/application/ports/ai-coach.port';
import type { ParsedBarrierResponse } from '@/domain/ai/barrier-response';

const MOCK_RESPONSE: ParsedBarrierResponse = {
  barrier_label: 'Yorgunluk',
  reflection: 'Yorgun hissetmen gerçek bir bariyer; bu, değersiz olduğun anlamına gelmez.',
  micro_task: '2 dakika boyunca sadece hazırlık yap: matı ser, abdest al veya kitabını aç.',
  encouragement: 'Küçük adım bile zinciri koruman için yeterli olabilir.',
};

export class MockAiCoachAdapter implements AiCoachPort {
  async generateCoachResponse(
    _context: CoachContext,
    onPartial?: CoachStreamHandler,
  ): Promise<ParsedBarrierResponse> {
    if (onPartial) {
      onPartial(MOCK_RESPONSE.reflection);
    }
    return MOCK_RESPONSE;
  }
}
