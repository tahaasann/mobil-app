import {
  DEFAULT_BREATHING_PATTERN,
  getBreathingPhaseAt,
  getCycleDurationMs,
} from '@/domain/breathing/breathing-cycle';

describe('breathing cycle', () => {
  it('starts with inhale phase', () => {
    expect(getBreathingPhaseAt(0).phase).toBe('inhale');
  });

  it('transitions to hold after inhale duration', () => {
    expect(getBreathingPhaseAt(DEFAULT_BREATHING_PATTERN.inhaleMs).phase).toBe('hold');
  });

  it('loops back to inhale after a full cycle', () => {
    const cycle = getCycleDurationMs(DEFAULT_BREATHING_PATTERN);
    expect(getBreathingPhaseAt(cycle).phase).toBe('inhale');
    expect(getBreathingPhaseAt(cycle).cycleIndex).toBe(1);
  });

  it('reports phase progress within bounds', () => {
    const state = getBreathingPhaseAt(1000);
    expect(state.phaseElapsedMs).toBe(1000);
    expect(state.phaseDurationMs).toBe(DEFAULT_BREATHING_PATTERN.inhaleMs);
  });
});
