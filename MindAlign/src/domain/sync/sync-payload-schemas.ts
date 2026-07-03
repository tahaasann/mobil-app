import { z } from 'zod';

import type { SyncEntityType } from '@/application/ports/sync.port';

const ISO_DATE = z.string().datetime({ offset: true }).or(z.string().datetime());

const bookmarkSyncPayloadSchema = z
  .object({
    id: z.string().min(1).max(128),
    habitId: z.string().max(128).nullable(),
    habitTitle: z.string().max(200).nullable(),
    content: z.string().min(1).max(4_000),
    barrierLabel: z.string().max(500).nullable(),
    microTask: z.string().max(1_000).nullable(),
    createdAt: ISO_DATE,
    updatedAt: ISO_DATE,
    deleted: z.boolean().optional(),
  })
  .strict();

const chatMessageSyncPayloadSchema = z
  .object({
    id: z.string().min(1).max(128),
    habitId: z.string().max(128).nullable(),
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1).max(4_000),
    createdAt: ISO_DATE,
    updatedAt: ISO_DATE,
    deleted: z.boolean().optional(),
  })
  .strict();

const SCHEMAS: Record<SyncEntityType, z.ZodType<Record<string, unknown>>> = {
  bookmarks: bookmarkSyncPayloadSchema,
  chat_messages: chatMessageSyncPayloadSchema,
};

export class SyncPayloadValidationError extends Error {
  constructor(
    readonly entity: SyncEntityType,
    readonly issues: string[],
  ) {
    super(`Invalid ${entity} sync payload: ${issues.join('; ')}`);
    this.name = 'SyncPayloadValidationError';
  }
}

export function validateSyncPayload(
  entity: SyncEntityType,
  payload: Record<string, unknown>,
): Record<string, unknown> {
  const parsed = SCHEMAS[entity].safeParse(payload);
  if (!parsed.success) {
    throw new SyncPayloadValidationError(
      entity,
      parsed.error.issues.map((issue) => issue.message),
    );
  }
  return parsed.data;
}

export function validateSyncRecordSize(
  entity: SyncEntityType,
  payload: Record<string, unknown>,
  maxBytes = 8_192,
): void {
  const size = JSON.stringify(payload).length;
  if (size > maxBytes) {
    throw new SyncPayloadValidationError(entity, [`payload exceeds ${maxBytes} bytes`]);
  }
}
