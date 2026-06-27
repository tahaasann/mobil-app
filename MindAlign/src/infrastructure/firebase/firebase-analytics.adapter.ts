import { getAnalytics, logEvent, setUserProperty } from '@react-native-firebase/analytics';
import { getApp } from '@react-native-firebase/app';

import type { AnalyticsPort } from '@/application/ports/analytics.port';

export class FirebaseAnalyticsAdapter implements AnalyticsPort {
  logEvent(name: string, params?: Record<string, string | number | boolean>): void {
    const analytics = getAnalytics(getApp());
    void logEvent(analytics, name, params);
  }

  setUserProperty(name: string, value: string): void {
    const analytics = getAnalytics(getApp());
    void setUserProperty(analytics, name, value);
  }
}
