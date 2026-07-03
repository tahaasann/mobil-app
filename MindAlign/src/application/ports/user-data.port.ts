export type UserDataSnapshot = {
  exportedAt: string;
  settings: unknown;
  profile: unknown;
  habits: unknown[];
  habitLogs: unknown[];
  habitNotes: unknown[];
  bookmarks: unknown[];
  chatMessages: unknown[];
  aiUsage: unknown[];
};

export type UserDataPort = {
  exportSnapshot(): Promise<UserDataSnapshot>;
  /** Clears user-owned tables; keeps app_settings (theme, language, onboarding flag). */
  clearSessionData(): Promise<void>;
  resetAll(): Promise<void>;
};
