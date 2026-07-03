import { resolveRemoteConfigModels } from '@/domain/ai/remote-config-policy';

describe('resolveRemoteConfigModels', () => {
  it('keeps allowed gemini models', () => {
    expect(
      resolveRemoteConfigModels({
        geminiModel: 'gemini-2.5-flash',
        geminiLiteModel: 'gemini-2.5-flash-lite',
      }),
    ).toEqual({
      geminiModel: 'gemini-2.5-flash',
      geminiLiteModel: 'gemini-2.5-flash-lite',
    });
  });

  it('falls back to safe defaults for unknown models', () => {
    expect(
      resolveRemoteConfigModels({
        geminiModel: 'gemini-pro',
        geminiLiteModel: 'unknown-model',
      }),
    ).toEqual({
      geminiModel: 'gemini-2.5-flash',
      geminiLiteModel: 'gemini-2.5-flash-lite',
    });
  });
});
