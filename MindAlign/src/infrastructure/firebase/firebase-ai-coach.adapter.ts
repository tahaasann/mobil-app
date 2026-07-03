import { getApp } from '@react-native-firebase/app';
import { Schema, getAI, getGenerativeModel } from '@react-native-firebase/ai';

import type {
  AiCoachPort,
  CoachContext,
  CoachStreamHandler,
} from '@/application/ports/ai-coach.port';
import { parseBarrierResponseJson } from '@/domain/ai/barrier-response';
import { getIslamicPolicyRules } from '@/domain/ai/islamic-content-policy';
import { buildCoachPrompt } from '@/domain/ai/prompt-builder';

import { GEMINI_MODEL, MAX_OUTPUT_TOKENS } from '@/infrastructure/firebase/firebase-ai.constants';
import { getProductionGeminiSafetySettings } from '@/infrastructure/firebase/firebase-ai-safety.constants';

const barrierSchema = Schema.object({
  properties: {
    barrier_label: Schema.string(),
    reflection: Schema.string(),
    micro_task: Schema.string(),
    encouragement: Schema.string(),
  },
});

export class FirebaseAiCoachAdapter implements AiCoachPort {
  async generateCoachResponse(
    context: CoachContext,
    onPartial?: CoachStreamHandler,
  ): Promise<ReturnType<typeof parseBarrierResponseJson>> {
    const app = getApp();
    const ai = getAI(app);
    const prompt = buildCoachPrompt({
      approach: context.approach,
      habitTitle: context.habitTitle,
      excuse: context.excuse,
      streak: context.streak,
      profile: context.profile,
      islamicPolicyRules: getIslamicPolicyRules(context.approach === 'spiritual'),
      responseLanguage: context.responseLanguage,
      conversationHistory: context.conversationHistory,
    });

    const modelName = context.geminiModel?.trim() || GEMINI_MODEL;

    const model = getGenerativeModel(ai, {
      model: modelName,
      systemInstruction: prompt.system,
      safetySettings: getProductionGeminiSafetySettings(),
      generationConfig: {
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        responseMimeType: 'application/json',
        responseSchema: barrierSchema,
      },
    });

    if (onPartial) {
      const streamResult = await model.generateContentStream(prompt.user);
      let aggregated = '';
      for await (const chunk of streamResult.stream) {
        aggregated += chunk.text();
        onPartial(aggregated);
      }
      const response = await streamResult.response;
      return parseBarrierResponseJson(response.text());
    }

    const result = await model.generateContent(prompt.user);
    return parseBarrierResponseJson(result.response.text());
  }
}
