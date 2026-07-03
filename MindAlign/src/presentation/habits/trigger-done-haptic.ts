import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export async function triggerDoneHaptic(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Haptics unavailable on simulator or unsupported devices.
  }
}
