export type RewardedAdResult = 'rewarded' | 'dismissed' | 'failed';

export type AdsPort = {
  requestConsent(): Promise<void>;
  isRewardedReady(): Promise<boolean>;
  showRewardedAd(): Promise<RewardedAdResult>;
};
