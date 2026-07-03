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

describe('crisis resources (T-204 verified numbers)', () => {
  it('includes 112 for immediate emergency in Turkey', () => {
    const response = buildCrisisSupportResponse();
    const resourcesText = response.resources.join('\n');
    expect(resourcesText).toMatch(/\b112\b/);
  });

  it('does not mix ALO 182 with MHRS or present MHRS as a crisis hotline', () => {
    const response = buildCrisisSupportResponse();
    const resourcesText = response.resources.join('\n');

    expect(resourcesText).not.toMatch(/MHRS/i);
    expect(resourcesText).not.toMatch(/rANDevu/i);
  });

  it('labels ALO 182 as child/youth line, not general psychiatric emergency', () => {
    const response = buildCrisisSupportResponse();
    const aloLine = response.resources.find((line) => line.includes('182'));

    expect(aloLine).toBeDefined();
    expect(aloLine).toMatch(/ALO 182|Alo 182/i);
    expect(aloLine).toMatch(/çocuk|genç|child|youth/i);
    expect(aloLine).not.toMatch(/MHRS|randevu|psikolojik acil/i);
  });
});

describe('crisis message locale (T-206)', () => {
  it('returns English crisis copy when locale is en', () => {
    const response = buildCrisisSupportResponse('en');

    expect(response.message).toMatch(/crisis line|not a crisis line/i);
    expect(response.message).not.toMatch(/MindAlign bir tedavi/i);
    expect(response.resources.join('\n')).toMatch(/112/);
    expect(response.resources.join('\n')).toMatch(/ALO 182|Child and Youth/i);
  });

  it('returns Turkish crisis copy when locale is tr', () => {
    const response = buildCrisisSupportResponse('tr');

    expect(response.message).toMatch(/MindAlign bir tedavi/i);
    expect(response.resources.join('\n')).toMatch(/ALO 182/i);
  });
});
