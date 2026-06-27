import { classifyExcuseText } from '@/domain/ai/preclassifier';

describe('preclassifier', () => {
  it('flags crisis language', () => {
    expect(classifyExcuseText('intihar etmek istiyorum')).toBe('crisis');
  });

  it('flags off-topic coding requests', () => {
    expect(classifyExcuseText('bana python kodu yaz')).toBe('off_topic');
  });

  it('accepts habit-related excuses', () => {
    expect(classifyExcuseText('Bugün çok yorgunum, sonra yaparım')).toBe('on_topic');
  });
});
