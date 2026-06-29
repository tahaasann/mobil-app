export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  habitId: string | null;
  role: ChatRole;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateChatMessageInput = {
  habitId?: string | null;
  role: ChatRole;
  content: string;
};

function createId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ?? `chat-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

export function createChatMessage(input: CreateChatMessageInput): ChatMessage {
  const now = new Date();
  return {
    id: createId(),
    habitId: input.habitId ?? null,
    role: input.role,
    content: input.content.trim(),
    createdAt: now,
    updatedAt: now,
  };
}

export function chatMessageToSyncPayload(message: ChatMessage): Record<string, unknown> {
  return {
    id: message.id,
    habitId: message.habitId,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
  };
}

export function chatMessageFromSyncPayload(payload: Record<string, unknown>): ChatMessage {
  return {
    id: String(payload.id),
    habitId: payload.habitId ? String(payload.habitId) : null,
    role: payload.role === 'user' ? 'user' : 'assistant',
    content: String(payload.content ?? ''),
    createdAt: new Date(String(payload.createdAt)),
    updatedAt: new Date(String(payload.updatedAt)),
  };
}
