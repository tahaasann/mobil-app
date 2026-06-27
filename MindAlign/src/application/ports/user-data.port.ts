export type UserDataSnapshot = {
  exportedAt: string;
  settings: unknown;
  profile: unknown;
  habits: unknown[];
  habitLogs: unknown[];
  bookmarks: unknown[];
  chatMessages: unknown[];
  aiUsage: unknown[];
};

export type UserDataPort = {
  exportSnapshot(): Promise<UserDataSnapshot>;
  resetAll(): Promise<void>;
};
