import * as StoreReview from 'expo-store-review';

import type { ReviewPort } from '@/application/ports/review.port';

export class ExpoStoreReviewAdapter implements ReviewPort {
  async isAvailable(): Promise<boolean> {
    return StoreReview.isAvailableAsync();
  }

  async requestReview(): Promise<void> {
    if (await StoreReview.isAvailableAsync()) {
      await StoreReview.requestReview();
    }
  }
}
