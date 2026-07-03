import { MockAnalyticsAdapter } from '@/infrastructure/firebase/mock-analytics.adapter';
import { MockCrashReportingAdapter } from '@/infrastructure/firebase/mock-crash-reporting.adapter';

describe('mock platform adapters', () => {
  it('records analytics events', () => {
    const analytics = new MockAnalyticsAdapter();

    analytics.logEvent('app_open', { source: 'test' });
    analytics.setUserProperty('locale', 'tr');

    expect(analytics.events).toEqual([{ name: 'app_open', params: { source: 'test' } }]);
  });

  it('records crash logs and errors', () => {
    const crash = new MockCrashReportingAdapter();
    const error = new Error('boom');

    crash.log('startup');
    crash.recordError(error, { screen: 'home' });

    expect(crash.logs).toEqual(['startup']);
    expect(crash.errors).toEqual([error]);
  });
});
