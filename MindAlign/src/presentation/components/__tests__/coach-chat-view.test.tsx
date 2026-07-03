import { render, screen, userEvent, waitFor } from '@testing-library/react-native';

import { CoachChatView } from '@/presentation/components/coach-chat-view';

const mockSendExcuse = jest.fn();
const mockRescue = jest.fn();
const mockGiveUp = jest.fn();
const mockBookmarkAdd = jest.fn();
const mockSaveChatMessage = jest.fn().mockResolvedValue(undefined);
const mockGrantAdBonus = jest.fn().mockResolvedValue('rewarded');
const mockRouterPush = jest.fn();
const mockListChatMessages = jest.fn().mockResolvedValue([]);
const mockListChatMessagesUseCase = { execute: mockListChatMessages };
const mockGetAppSettings = jest.fn().mockResolvedValue({ selectedApproach: 'universal' });
const mockGetUserProfile = jest.fn().mockResolvedValue(null);
const mockOnRescued = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'chat.inputPlaceholder': 'Örn. çok yorgunum…',
        'chat.send': 'Gönder',
        'chat.thinking': 'Düşünüyor…',
        'common.loading': 'Yükleniyor…',
        'chat.bookmarkA11y': 'Koç yanıtını kaydet',
        'chat.regenerateA11y': 'Koç yanıtını yeniden üret',
        'chat.reportA11y': 'Koç yanıtını raporla',
        'quota.upgrade': 'Plus’a geç',
        'quota.watchAd': 'Reklam izle',
        'paywall.upgrade': 'Plus’a geç',
        'paywall.watchAd': 'Reklam izle',
        'paywall.quotaTitle': 'Günlük limit',
        'paywall.quotaSubtitle': 'Daha fazla koç mesajı için Plus.',
        'microTask.rescue': 'Yaptım (kurtar)',
      };
      return map[key] ?? key;
    },
  }),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockRouterPush, back: jest.fn() }),
}));

jest.mock('@/infrastructure/di/app-container', () => ({
  useAppContainer: () => ({
    bookmarkUseCase: { add: mockBookmarkAdd },
    saveChatMessageUseCase: { execute: mockSaveChatMessage },
    listChatMessagesUseCase: mockListChatMessagesUseCase,
    getAppSettingsUseCase: {
      execute: mockGetAppSettings,
    },
    getUserProfileUseCase: { execute: mockGetUserProfile },
    grantRewardedAdBonusUseCase: { execute: mockGrantAdBonus },
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

jest.mock('@/presentation/components/glass-card', () => {
  const { View } = require('react-native');
  return {
    GlassCard: ({ children, testID }: { children: React.ReactNode; testID?: string }) => (
      <View testID={testID}>{children}</View>
    ),
  };
});

describe('CoachChatView', () => {
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
    await render(<CoachChatView habitId="habit-1" habitTitle="Meditasyon" streak={2} />);

    await user.type(await screen.findByTestId('coach-chat-text-input'), 'Bugün yorgunum');
    await user.press(await screen.findByTestId('coach-chat-send'));

    await waitFor(() => {
      expect(mockSendExcuse).toHaveBeenCalledWith(
        expect.objectContaining({ excuse: 'Bugün yorgunum', habitTitle: 'Meditasyon' }),
      );
    });

    expect(await screen.findByText(/2 dakika hazırlık yap/i)).toBeOnTheScreen();
    expect(mockSaveChatMessage).toHaveBeenCalled();
  });

  it('uses icon-only coach message actions', async () => {
    const user = userEvent.setup();
    await render(<CoachChatView habitId="habit-1" habitTitle="Meditasyon" streak={2} />);

    await user.type(await screen.findByTestId('coach-chat-text-input'), 'Bugün yorgunum');
    await user.press(await screen.findByTestId('coach-chat-send'));

    expect(await screen.findByTestId('coach-message-actions')).toBeOnTheScreen();
    expect(screen.getByLabelText('Koç yanıtını kaydet')).toBeOnTheScreen();
    expect(screen.queryByText('Kaydet')).toBeNull();
  });

  it('allows follow-up messages after coach reply', async () => {
    const user = userEvent.setup();
    await render(<CoachChatView habitId="habit-1" habitTitle="Meditasyon" streak={2} />);

    await user.type(await screen.findByTestId('coach-chat-text-input'), 'İlk mesaj');
    await user.press(await screen.findByTestId('coach-chat-send'));
    await screen.findByTestId('coach-message-actions');

    await user.type(await screen.findByTestId('coach-chat-text-input'), 'Devam sorusu');
    await user.press(await screen.findByTestId('coach-chat-send'));

    await waitFor(() => {
      expect(mockSendExcuse).toHaveBeenCalledTimes(2);
    });
  });

  it('restores persisted history on mount', async () => {
    mockListChatMessages.mockResolvedValueOnce([
      {
        id: 'm1',
        habitId: 'habit-1',
        role: 'user',
        content: 'Kayıtlı mesaj',
        createdAt: new Date('2026-06-26'),
        updatedAt: new Date('2026-06-26'),
      },
    ]);

    await render(<CoachChatView habitId="habit-1" habitTitle="Meditasyon" streak={2} />);

    expect(await screen.findByText('Kayıtlı mesaj')).toBeOnTheScreen();
  });

  it('navigates to habit after rescue completion', async () => {
    const user = userEvent.setup();
    await render(<CoachChatView habitId="habit-1" habitTitle="Meditasyon" streak={2} />);

    await user.type(await screen.findByTestId('coach-chat-text-input'), 'Bugün yorgunum');
    await user.press(await screen.findByTestId('coach-chat-send'));
    await user.press(await screen.findByText('Yaptım (kurtar)'));

    await waitFor(() => {
      expect(mockRescue).toHaveBeenCalled();
      expect(mockRouterPush).toHaveBeenCalledWith('/habit/habit-1');
    });
  });

  it('calls onRescued callback when provided', async () => {
    const user = userEvent.setup();
    await render(
      <CoachChatView
        habitId="habit-1"
        habitTitle="Meditasyon"
        streak={2}
        onRescued={mockOnRescued}
      />,
    );

    await user.type(await screen.findByTestId('coach-chat-text-input'), 'Bugün yorgunum');
    await user.press(await screen.findByTestId('coach-chat-send'));
    await user.press(await screen.findByText('Yaptım (kurtar)'));

    await waitFor(() => {
      expect(mockOnRescued).toHaveBeenCalled();
    });
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('shows quota wall when quota is exceeded', async () => {
    mockSendExcuse.mockResolvedValueOnce({
      kind: 'quota_exceeded',
      message: 'Günlük limit doldu.',
    });

    const user = userEvent.setup();
    await render(<CoachChatView habitId="habit-1" habitTitle="Meditasyon" streak={2} />);
    await user.type(await screen.findByTestId('coach-chat-text-input'), 'Limit test');
    await user.press(await screen.findByTestId('coach-chat-send'));

    expect(await screen.findByText(/Günlük limit doldu/i)).toBeOnTheScreen();
  });

  it('navigates to paywall when upgrade is pressed on quota wall', async () => {
    mockSendExcuse.mockResolvedValueOnce({
      kind: 'quota_exceeded',
      message: 'Günlük limit doldu.',
    });

    const user = userEvent.setup();
    await render(<CoachChatView habitId="habit-1" habitTitle="Meditasyon" streak={2} />);
    await user.type(await screen.findByTestId('coach-chat-text-input'), 'Limit test');
    await user.press(await screen.findByTestId('coach-chat-send'));
    await user.press(await screen.findByText(/Plus’a geç/i));

    expect(mockRouterPush).toHaveBeenCalledWith('/paywall?source=quota');
  });
});
