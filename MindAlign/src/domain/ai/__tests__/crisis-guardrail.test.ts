import { buildCrisisSupportResponse, detectCrisis } from '@/domain/ai/crisis-guardrail';

describe('crisis guardrail', () => {
  it('detects crisis phrases', () => {
    expect(detectCrisis('kendime zarar vermeyi düşünüyorum')).toBe(true);
    expect(detectCrisis('canıma kıymak istiyorum')).toBe(true);
  });

  it('returns resources without coaching content', () => {
    const response = buildCrisisSupportResponse();
    expect(response.kind).toBe('crisis');
    expect(response.resources.length).toBeGreaterThan(0);
    expect(response.message).toMatch(/MindAlign bir tedavi/i);
  });
});
