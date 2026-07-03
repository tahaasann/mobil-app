export type GeminiSafetySetting = {
  category: string;
  threshold: string;
};

export const PRODUCTION_GEMINI_SAFETY_SETTINGS: GeminiSafetySetting[] = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
];

export function getProductionGeminiSafetySettings(): GeminiSafetySetting[] {
  return PRODUCTION_GEMINI_SAFETY_SETTINGS.map((setting) => ({ ...setting }));
}
