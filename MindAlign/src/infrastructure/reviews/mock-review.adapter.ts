import type { ReviewPort } from '@/application/ports/review.port';

export class MockReviewAdapter implements ReviewPort {
  requested = false;

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async requestReview(): Promise<void> {
    this.requested = true;
  }
}
