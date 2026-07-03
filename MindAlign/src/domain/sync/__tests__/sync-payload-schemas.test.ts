import {
  SyncPayloadValidationError,
  validateSyncPayload,
  validateSyncRecordSize,
} from '@/domain/sync/sync-payload-schemas';

describe('sync payload schemas (T-236/T-237)', () => {
  it('rejects oversize chat content', () => {
    expect(() =>
      validateSyncPayload('chat_messages', {
        id: 'm1',
        habitId: 'h1',
        role: 'user',
        content: 'x'.repeat(5_000),
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
    ).toThrow(SyncPayloadValidationError);
  });

  it('rejects invalid chat roles', () => {
    expect(() =>
      validateSyncPayload('chat_messages', {
        id: 'm1',
        habitId: 'h1',
        role: 'system',
        content: 'hello',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
    ).toThrow(SyncPayloadValidationError);
  });

  it('accepts valid bookmark payloads', () => {
    const payload = validateSyncPayload('bookmarks', {
      id: 'b1',
      habitId: 'h1',
      habitTitle: 'Walk',
      content: 'Saved tip',
      barrierLabel: null,
      microTask: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(payload.id).toBe('b1');
  });

  it('rejects oversized serialized payloads', () => {
    expect(() =>
      validateSyncRecordSize('bookmarks', {
        blob: 'x'.repeat(9_000),
      }),
    ).toThrow(SyncPayloadValidationError);
  });
});
