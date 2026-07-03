import { render, screen, userEvent, waitFor } from '@testing-library/react-native';

import ExcuseChatScreen from '@/app/excuse/[habitId]';

const mockSendExcuse = jest.fn();
const mockRescue = jest.fn();
const mockGiveUp = jest.fn();
const mockRouterPush = jest.fn();
const mockRouterBack = jest.fn();
const mockListChatMessages = jest.fn().mockResolvedValue([]);
const mockListChatMessagesUseCase = { execute: mockListChatMessages };

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'chat.inputPlaceholder': 'Örn. çok yorgunum…',
        'chat.send': 'Gönder',
        'chat.bookmarkA11y': 'Koç yanıtını kaydet',
        'chat.regenerateA11y': 'Koç yanıtını yeniden üret',
        'chat.reportA11y': 'Koç yanıtını raporla',
        'microTask.rescue': 'Yaptım (kurtar)',
        'microTask.giveUp': 'Vazgeç',
      };
      return map[key] ?? key;
    },
  }),
}));

jest.mock('@/infrastructure/di/app-container', () => ({
  useAppContainer: () => ({
    bookmarkUseCase: { add: jest.fn() },
    saveChatMessageUseCase: { execute: jest.fn().mockResolvedValue(undefined) },
    listChatMessagesUseCase: mockListChatMessagesUseCase,
    getAppSettingsUseCase: {
      execute: jest.fn().mockResolvedValue({ selectedApproach: 'universal' }),
    },
    getUserProfileUseCase: { execute: jest.fn().mockResolvedValue(null) },
    grantRewardedAdBonusUseCase: { execute: jest.fn().mockResolvedValue('rewarded') },
    requestReviewAfterRescueUseCase: { execute: jest.fn().mockResolvedValue('skipped') },
    reportAiResponseUseCase: { execute: jest.fn().mockResolvedValue(undefined) },
  }),
}));

jest.mock('@/infrastructure/di/subscription-container', () => ({
  useSubscriptionPorts: () => ({
    adsPort: { isAvailable: () => false },
  }),
}));

jest.mock('@/presentation/hooks/use-excuse-chat', () => ({
  useExcuseChat: () => ({
    sendExcuse: mockSendExcuse,
    rescue: mockRescue,
    giveUp: mockGiveUp,
    isLoading: false,
    streamingText: '',
  }),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockRouterBack, push: mockRouterPush }),
  useLocalSearchParams: () => ({ habitId: 'habit-1', title: 'Meditasyon', streak: '2' }),
}));

describe('ExcuseChatScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockListChatMessages.mockResolvedValue([]);
    mockSendExcuse.mockResolvedValue({
      kind: 'coach',
      response: {
        barrier_label: 'Yorgunluk',
        reflection: 'Yorgun hissetmen normal.',
        micro_task: '2 dakika hazırlık yap.',
        encouragement: 'Devam edebilirsin.',
      },
    });
  });

  it('submits excuse and shows micro task card', async () => {
    const user = userEvent.setup();
    await render(<ExcuseChatScreen />);

    await user.type(await screen.findByTestId('coach-chat-text-input'), 'Bugün yorgunum');
    await user.press(await screen.findByTestId('coach-chat-send'));

    await waitFor(() => {
      expect(mockSendExcuse).toHaveBeenCalled();
    });

    expect(await screen.findByText(/2 dakika hazırlık yap/i)).toBeOnTheScreen();
  });

  it('navigates to habit detail after rescue', async () => {
    const user = userEvent.setup();
    await render(<ExcuseChatScreen />);

    await user.type(await screen.findByTestId('coach-chat-text-input'), 'Bugün yorgunum');
    await user.press(await screen.findByTestId('coach-chat-send'));
    await user.press(await screen.findByText('Yaptım (kurtar)'));

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/habit/habit-1');
    });
  });
});
