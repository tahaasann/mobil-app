export type AnalyticsEventParams = Record<string, string | number | boolean>;

export type AnalyticsPort = {
  logEvent(name: string, params?: AnalyticsEventParams): void;
  setUserProperty(name: string, value: string): void;
};
