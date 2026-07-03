import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { triggerDoneHaptic } from '@/presentation/habits/trigger-done-haptic';

describe('triggerDoneHaptic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fires success notification haptic on native platforms', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });

    await triggerDoneHaptic();

    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
  });

  it('skips haptics on web', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });

    await triggerDoneHaptic();

    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
  });
});
