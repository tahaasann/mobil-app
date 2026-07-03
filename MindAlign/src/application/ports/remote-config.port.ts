export type RemoteConfigValues = {
  freeWeeklyQuota: number;
  premiumWeeklyQuota: number;
  geminiModel: string;
  geminiLiteModel: string;
  aiEnabled: boolean;
  serverAiQuotaEnabled: boolean;
};

export type RemoteConfigPort = {
  configure(): Promise<void>;
  fetchAndActivate(): Promise<void>;
  getValues(): Promise<RemoteConfigValues>;
};
