import { getApp } from '@react-native-firebase/app';
import { Schema, getAI, getGenerativeModel } from '@react-native-firebase/ai';

import type {
  AiCoachPort,
  CoachContext,
  CoachStreamHandler,
} from '@/application/ports/ai-coach.port';
import { parseBarrierResponseJson } from '@/domain/ai/barrier-response';
import { getIslamicPolicyRules } from '@/domain/ai/islamic-content-policy';
import { MAX_PRECLASSIFIER_INPUT_LENGTH, classifyExcuseText } from '@/domain/ai/preclassifier';
import { buildCoachPrompt } from '@/domain/ai/prompt-builder';

import {
  GEMINI_LITE_MODEL,
  GEMINI_MODEL,
  MAX_OUTPUT_TOKENS,
} from '@/infrastructure/firebase/firebase-ai.constants';

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
    });

    const model = getGenerativeModel(ai, {
      model: GEMINI_MODEL,
      systemInstruction: prompt.system,
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

export class FirebasePreclassifierAdapter {
  async classify(text: string): Promise<ReturnType<typeof classifyExcuseText>> {
    const heuristic = classifyExcuseText(text);
    if (heuristic !== 'on_topic') {
      return heuristic;
    }

    const app = getApp();
    const ai = getAI(app);
    const model = getGenerativeModel(ai, {
      model: GEMINI_LITE_MODEL,
      generationConfig: {
        maxOutputTokens: 16,
        responseMimeType: 'application/json',
        responseSchema: Schema.object({
          properties: {
            label: Schema.string(),
          },
        }),
      },
    });

    const boundedText = text.trim().slice(0, MAX_PRECLASSIFIER_INPUT_LENGTH);
    const result = await model.generateContent(
      `Classify this message for a habit-coaching app as on_topic, off_topic, or crisis. Message: ${JSON.stringify(boundedText)}`,
    );

    try {
      const parsed = JSON.parse(result.response.text()) as { label?: string };
      const label = parsed.label?.toLowerCase();
      if (label === 'crisis' || label === 'off_topic' || label === 'on_topic') {
        return label;
      }
    } catch {
      // fall through to heuristic
    }

    return heuristic;
  }
}
