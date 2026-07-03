export type ApproachLens = 'spiritual' | 'scientific' | 'universal';

export type BarrierResponse = {
  barrier_label: string;
  reflection: string;
  micro_task: string;
  encouragement: string;
};

export type CoachProfileContext = {
  identityGoal?: string | null;
  defaultTone?: 'gentle' | 'direct';
  commonBarrier?: string | null;
};

export type CoachTurn = {
  role: 'user' | 'assistant';
  content: string;
};

export type CoachContext = {
  habitTitle: string;
  excuse: string;
  approach: ApproachLens;
  streak?: number;
  profile?: CoachProfileContext;
  geminiModel?: string;
  geminiLiteModel?: string;
  responseLanguage?: 'en' | 'tr';
  conversationHistory?: CoachTurn[];
};

export type CoachStreamHandler = (partialText: string) => void;

export interface AiCoachPort {
  generateCoachResponse(
    context: CoachContext,
    onPartial?: CoachStreamHandler,
  ): Promise<BarrierResponse>;
}
