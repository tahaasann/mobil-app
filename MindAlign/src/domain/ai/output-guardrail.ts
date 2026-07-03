import type { ParsedBarrierResponse } from '@/domain/ai/barrier-response';
import { detectCrisis } from '@/domain/ai/crisis-guardrail';

export type OutputGuardrailReason = 'crisis' | 'off_topic';

export type OutputGuardrailResult = { safe: true } | { safe: false; reason: OutputGuardrailReason };

const OFF_TOPIC_OUTPUT_PATTERNS = [
  /\b(python|javascript|typescript|html|css)\b/i,
  /\b(def main|import os|console\.log)\b/i,
  /\b(homework assignment|write code for me)\b/i,
  /\b(ödev|kod yaz|python kodu)\b/i,
];

function combineCoachOutput(response: ParsedBarrierResponse): string {
  return [
    response.barrier_label,
    response.reflection,
    response.micro_task,
    response.encouragement,
  ].join('\n');
}

export function scanCoachOutput(response: ParsedBarrierResponse): OutputGuardrailResult {
  const combined = combineCoachOutput(response);

  if (detectCrisis(combined)) {
    return { safe: false, reason: 'crisis' };
  }

  if (OFF_TOPIC_OUTPUT_PATTERNS.some((pattern) => pattern.test(combined))) {
    return { safe: false, reason: 'off_topic' };
  }

  return { safe: true };
}
