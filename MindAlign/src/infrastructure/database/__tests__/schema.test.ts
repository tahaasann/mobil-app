import { aiUsage, appSettings, habitLogs, userProfile } from '@/infrastructure/database/schema';

describe('habits schema', () => {
  it('defines habits table columns', () => {
    expect(habitLogs.habitId.name).toBe('habit_id');
    expect(habitLogs.excuseText.name).toBe('excuse_text');
    expect(habitLogs.barrierLabel.name).toBe('barrier_label');
    expect(habitLogs.rescueTaskText.name).toBe('rescue_task_text');
  });

  it('defines ai_usage weekly quota table', () => {
    expect(aiUsage.weekStart.name).toBe('week_start');
    expect(aiUsage.count.name).toBe('count');
  });

  it('defines onboarding settings and profile tables', () => {
    expect(appSettings.selectedApproach.name).toBe('selected_approach');
    expect(appSettings.onboardingCompleted.name).toBe('onboarding_completed');
    expect(userProfile.defaultTone.name).toBe('default_tone');
    expect(userProfile.commonBarrier.name).toBe('common_barrier');
  });
});
