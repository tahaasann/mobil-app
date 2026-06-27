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
