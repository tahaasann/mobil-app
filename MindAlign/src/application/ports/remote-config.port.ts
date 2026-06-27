export type RemoteConfigValues = {
  freeWeeklyQuota: number;
  premiumWeeklyQuota: number;
  geminiModel: string;
};

export type RemoteConfigPort = {
  configure(): Promise<void>;
  fetchAndActivate(): Promise<void>;
  getValues(): Promise<RemoteConfigValues>;
};
