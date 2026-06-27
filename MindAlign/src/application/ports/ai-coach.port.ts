export type ApproachLens = 'spiritual' | 'scientific' | 'universal';

export type BarrierResponse = {
  barrier_label: string;
  reflection: string;
  micro_task: string;
  encouragement: string;
};

export type CoachContext = {
  habitTitle: string;
  excuse: string;
  approach: ApproachLens;
  streak?: number;
};

export type CoachStreamHandler = (partialText: string) => void;

export interface AiCoachPort {
  generateCoachResponse(
    context: CoachContext,
    onPartial?: CoachStreamHandler,
  ): Promise<BarrierResponse>;
}
