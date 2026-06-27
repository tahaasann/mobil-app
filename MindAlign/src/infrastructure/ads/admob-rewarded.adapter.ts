import { AdEventType, AdsConsent, RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';
import mobileAds from 'react-native-google-mobile-ads';

import type { AdsPort, RewardedAdResult } from '@/application/ports/ads.port';

const REWARDED_AD_UNIT_ID = process.env.EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID ?? 'ca-app-pub-3940256099942544/5224354917';

export class AdMobRewardedAdapter implements AdsPort {
  private rewardedAd: RewardedAd | null = null;

  async requestConsent(): Promise<void> {
    await mobileAds().initialize();

    const consentInfo = await AdsConsent.requestInfoUpdate();
    if (consentInfo.isConsentFormAvailable) {
      await AdsConsent.showForm();
    }
  }

  private getRewardedAd(): RewardedAd {
    if (!this.rewardedAd) {
      this.rewardedAd = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID, {
        requestNonPersonalizedAdsOnly: false,
      });
    }

    return this.rewardedAd;
  }

  async isRewardedReady(): Promise<boolean> {
    const ad = this.getRewardedAd();
    await ad.load();
    return ad.loaded;
  }

  async showRewardedAd(): Promise<RewardedAdResult> {
    const ad = this.getRewardedAd();
    if (!ad.loaded) {
      await ad.load();
    }

    if (!ad.loaded) {
      return 'failed';
    }

    return new Promise((resolve) => {
      let rewarded = false;

      const unsubscribeEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        rewarded = true;
      });

      const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
        unsubscribeEarned();
        unsubscribeClosed();
        this.rewardedAd = null;
        resolve(rewarded ? 'rewarded' : 'dismissed');
      });

      ad.show().catch(() => {
        unsubscribeEarned();
        unsubscribeClosed();
        resolve('failed');
      });
    });
  }
}
