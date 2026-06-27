import type { ApproachLens } from '@/application/ports/ai-coach.port';

export type PromptBuildInput = {
  approach: ApproachLens;
  habitTitle: string;
  excuse: string;
  streak?: number;
  islamicPolicyRules?: string[];
};

const LENS_INSTRUCTIONS: Record<ApproachLens, string> = {
  spiritual:
    'Use a compassionate Islamic framing: tie motivation to intention (niyet), small consistent steps, and trust in gradual growth. Avoid issuing fatwas or claiming divine certainty.',
  scientific:
    'Use evidence-informed, CBT-style framing: name cognitive distortions gently, focus on actionable behavior, not labels.',
  universal:
    'Use calm mindfulness language: normalize resistance, emphasize self-compassion and the next tiny step.',
};

export function buildCoachSystemPrompt(input: PromptBuildInput): string {
  const policyBlock =
    input.islamicPolicyRules && input.islamicPolicyRules.length > 0
      ? `\nIslamic content policy:\n${input.islamicPolicyRules.map((rule) => `- ${rule}`).join('\n')}\n`
      : '';

  return [
    'You are MindAlign, a habit coach focused ONLY on the user habit, excuse, motivation, and wellbeing.',
    'Reject unrelated requests (code, homework, general trivia) by staying within the JSON schema.',
    LENS_INSTRUCTIONS[input.approach],
    policyBlock,
    'Respond ONLY with JSON matching: barrier_label, reflection, micro_task, encouragement.',
    'micro_task must be completable in 5-10 minutes.',
  ].join('\n');
}

export function buildCoachUserPrompt(input: PromptBuildInput): string {
  const streakLine =
    input.streak !== undefined
      ? `Current streak: ${input.streak} days.`
      : 'Current streak: unknown.';

  return [
    `Habit: ${input.habitTitle}`,
    streakLine,
    `User excuse / barrier message: ${input.excuse}`,
  ].join('\n');
}

export function buildCoachPrompt(input: PromptBuildInput): { system: string; user: string } {
  return {
    system: buildCoachSystemPrompt(input),
    user: buildCoachUserPrompt(input),
  };
}
