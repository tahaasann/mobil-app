import { render, screen, userEvent, waitFor } from '@testing-library/react-native';

import ExcuseChatScreen from '@/app/excuse/[habitId]';

const mockSendExcuse = jest.fn();
const mockRescue = jest.fn();
const mockGiveUp = jest.fn();

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
  useRouter: () => ({ back: jest.fn() }),
  useLocalSearchParams: () => ({ habitId: 'habit-1', title: 'Meditasyon', streak: '2' }),
}));

describe('ExcuseChatScreen', () => {
  beforeEach(() => {
    mockSendExcuse.mockReset();
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

    await user.type(screen.getByPlaceholderText(/çok yorgunum/i), 'Bugün yorgunum');
    await user.press(screen.getByText('Gönder'));

    await waitFor(() => {
      expect(mockSendExcuse).toHaveBeenCalled();
    });

    expect(await screen.findByText(/2 dakika hazırlık yap/i)).toBeOnTheScreen();
  });
});
