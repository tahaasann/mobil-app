export type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

export type BreathingPattern = {
  inhaleMs: number;
  holdMs: number;
  exhaleMs: number;
  restMs: number;
};

export const DEFAULT_BREATHING_PATTERN: BreathingPattern = {
  inhaleMs: 4000,
  holdMs: 2000,
  exhaleMs: 4000,
  restMs: 2000,
};

const PHASE_ORDER: BreathingPhase[] = ['inhale', 'hold', 'exhale', 'rest'];

export type BreathingPhaseState = {
  phase: BreathingPhase;
  phaseElapsedMs: number;
  phaseDurationMs: number;
  cycleIndex: number;
};

function phaseDuration(pattern: BreathingPattern, phase: BreathingPhase): number {
  switch (phase) {
    case 'inhale':
      return pattern.inhaleMs;
    case 'hold':
      return pattern.holdMs;
    case 'exhale':
      return pattern.exhaleMs;
    case 'rest':
      return pattern.restMs;
  }
}

export function getCycleDurationMs(pattern: BreathingPattern): number {
  return pattern.inhaleMs + pattern.holdMs + pattern.exhaleMs + pattern.restMs;
}

export function getBreathingPhaseAt(
  elapsedMs: number,
  pattern: BreathingPattern = DEFAULT_BREATHING_PATTERN,
): BreathingPhaseState {
  const cycleDuration = getCycleDurationMs(pattern);
  const normalized = ((elapsedMs % cycleDuration) + cycleDuration) % cycleDuration;
  const cycleIndex = Math.floor(elapsedMs / cycleDuration);

  let offset = 0;
  for (const phase of PHASE_ORDER) {
    const duration = phaseDuration(pattern, phase);
    if (normalized < offset + duration) {
      return {
        phase,
        phaseElapsedMs: normalized - offset,
        phaseDurationMs: duration,
        cycleIndex,
      };
    }
    offset += duration;
  }

  return {
    phase: 'rest',
    phaseElapsedMs: 0,
    phaseDurationMs: pattern.restMs,
    cycleIndex,
  };
}
