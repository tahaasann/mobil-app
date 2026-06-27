import { z } from 'zod';

export const barrierResponseSchema = z.object({
  barrier_label: z.string().trim().min(1).max(120),
  reflection: z.string().trim().min(1).max(800),
  micro_task: z.string().trim().min(1).max(400),
  encouragement: z.string().trim().min(1).max(300),
});

export type ParsedBarrierResponse = z.infer<typeof barrierResponseSchema>;

export function parseBarrierResponse(raw: unknown): ParsedBarrierResponse {
  return barrierResponseSchema.parse(raw);
}

export function parseBarrierResponseJson(text: string): ParsedBarrierResponse {
  const parsed: unknown = JSON.parse(text);
  return parseBarrierResponse(parsed);
}
