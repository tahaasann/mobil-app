export type ReviewPort = {
  isAvailable(): Promise<boolean>;
  requestReview(): Promise<void>;
};
