jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('@react-native-firebase/app', () => ({
  getApp: jest.fn(() => ({ name: '[DEFAULT]' })),
}));

jest.mock('@react-native-firebase/app-check', () => ({
  ReactNativeFirebaseAppCheckProvider: jest.fn().mockImplementation(() => ({
    configure: jest.fn(),
  })),
  initializeAppCheck: jest.fn(async () => ({})),
  getToken: jest.fn(async () => ({ token: 'mock-app-check-token' })),
}));

jest.mock('@react-native-firebase/ai', () => ({
  Schema: {
    object: (config: unknown) => config,
    string: () => 'string',
    array: (config: unknown) => config,
    number: () => 'number',
  },
  getAI: jest.fn(() => ({})),
  getGenerativeModel: jest.fn(() => ({
    generateContent: jest.fn(async () => ({
      response: {
        text: () =>
          JSON.stringify({
            barrier_label: 'Yorgunluk',
            reflection: 'Mock reflection',
            micro_task: 'Mock task',
            encouragement: 'Mock encouragement',
          }),
      },
    })),
    generateContentStream: jest.fn(async () => ({
      stream: {
        [Symbol.asyncIterator]: () => ({
          next: jest
            .fn()
            .mockResolvedValueOnce({ done: false, value: { text: () => 'Mock stream' } })
            .mockResolvedValueOnce({ done: true, value: undefined }),
        }),
      },
      response: Promise.resolve({
        text: () =>
          JSON.stringify({
            barrier_label: 'Yorgunluk',
            reflection: 'Mock reflection',
            micro_task: 'Mock task',
            encouragement: 'Mock encouragement',
          }),
      }),
    })),
  })),
}));

jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
}));

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en' }],
}));

jest.mock('nativewind', () => ({
  useColorScheme: () => ({
    setColorScheme: jest.fn(),
    toggleColorScheme: jest.fn(),
    colorScheme: 'light',
  }),
}));

jest.mock('expo-blur', () => {
  const { View } = require('react-native');
  return { BlurView: View };
});

jest.mock('expo-glass-effect', () => {
  const { View } = require('react-native');
  return {
    GlassView: View,
    isLiquidGlassAvailable: () => false,
    isGlassEffectAPIAvailable: () => false,
  };
});

jest.mock('@react-native-firebase/auth', () => {
  const listeners = new Set<(mockUser: unknown) => void>();
  const authInstance = {
    currentUser: null,
  };

  return {
    getAuth: jest.fn(() => authInstance),
    signInAnonymously: jest.fn(async () => ({
      user: { uid: 'mock-guest', email: null, isAnonymous: true, displayName: null },
    })),
    signInWithEmailAndPassword: jest.fn(async () => ({
      user: {
        uid: 'mock-user',
        email: 'coach@example.com',
        isAnonymous: false,
        displayName: null,
      },
    })),
    signOut: jest.fn(async () => {
      authInstance.currentUser = null;
      listeners.forEach((listener) => listener(null));
    }),
    onAuthStateChanged: jest.fn((_auth, callback) => {
      listeners.add(callback);
      callback(authInstance.currentUser);
      return () => listeners.delete(callback);
    }),
  };
});

jest.mock('@react-native-firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(async () => undefined),
  getDocs: jest.fn(async () => ({ docs: [] })),
  query: jest.fn(),
  where: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true })),
  setNotificationChannelAsync: jest.fn(async () => undefined),
  scheduleNotificationAsync: jest.fn(async () => 'mock-notification-id'),
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
  cancelAllScheduledNotificationsAsync: jest.fn(async () => undefined),
  getAllScheduledNotificationsAsync: jest.fn(async () => []),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  getLastNotificationResponseAsync: jest.fn(async () => null),
  AndroidImportance: { DEFAULT: 3 },
  SchedulableTriggerInputTypes: { DAILY: 'daily' },
}));
