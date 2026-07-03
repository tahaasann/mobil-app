export type RewardedAdResult = 'rewarded' | 'dismissed' | 'failed' | 'unavailable';

export type AdsPort = {
  isAvailable(): boolean;
  requestConsent(): Promise<void>;
  isRewardedReady(): Promise<boolean>;
  showRewardedAd(): Promise<RewardedAdResult>;
};
