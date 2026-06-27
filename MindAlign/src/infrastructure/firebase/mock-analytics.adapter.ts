import type { AnalyticsPort } from '@/application/ports/analytics.port';

export class MockAnalyticsAdapter implements AnalyticsPort {
  events: Array<{ name: string; params?: Record<string, string | number | boolean> }> = [];

  logEvent(name: string, params?: Record<string, string | number | boolean>): void {
    this.events.push({ name, params });
  }

  setUserProperty(_name: string, _value: string): void {}
}
