import { GEMINI_LITE_MODEL, GEMINI_MODEL } from '@/infrastructure/firebase/firebase-ai.constants';

export const ALLOWED_GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'] as const;

export type AllowedGeminiModel = (typeof ALLOWED_GEMINI_MODELS)[number];

export type ResolvedRemoteConfigModels = {
  geminiModel: string;
  geminiLiteModel: string;
};

export function resolveRemoteConfigModels(input: {
  geminiModel: string;
  geminiLiteModel: string;
}): ResolvedRemoteConfigModels {
  const defaults = {
    geminiModel: GEMINI_MODEL,
    geminiLiteModel: GEMINI_LITE_MODEL,
  };

  return {
    geminiModel: isAllowedGeminiModel(input.geminiModel) ? input.geminiModel : defaults.geminiModel,
    geminiLiteModel: isAllowedGeminiModel(input.geminiLiteModel)
      ? input.geminiLiteModel
      : defaults.geminiLiteModel,
  };
}

function isAllowedGeminiModel(value: string): value is AllowedGeminiModel {
  return (ALLOWED_GEMINI_MODELS as readonly string[]).includes(value);
}
