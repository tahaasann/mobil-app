import { render, screen, userEvent, waitFor } from '@testing-library/react-native';

import type { DashboardHabit } from '@/application/use-cases/get-dashboard.use-case';
import { createHabit } from '@/domain/entities/habit';
import { buildGeneralChatTopic } from '@/presentation/chat/chat-topic';
import { ChatTopicPicker } from '@/presentation/components/chat-topic-picker';
import { I18nProvider } from '@/presentation/i18n/i18n-provider';

const habits: DashboardHabit[] = [
  {
    habit: createHabit({ title: 'Meditasyon' }),
    streak: 3,
    days: [],
  },
];

async function renderPicker(onChange = jest.fn()) {
  const topic = buildGeneralChatTopic('Genel konuşma');

  await render(
    <I18nProvider locale="tr">
      <ChatTopicPicker habits={habits} topic={topic} onChange={onChange} />
    </I18nProvider>,
  );

  return { onChange, topic };
}

describe('ChatTopicPicker', () => {
  it('shows the selected topic', async () => {
    await renderPicker();
    expect(screen.getByText('Genel konuşma')).toBeOnTheScreen();
  });

  it('selects a habit topic from the picker', async () => {
    const { onChange } = await renderPicker();
    const user = userEvent.setup();

    await user.press(screen.getByLabelText('Konu seç'));

    await waitFor(() => {
      expect(screen.getByText('Meditasyon')).toBeOnTheScreen();
    });

    await user.press(screen.getByText('Meditasyon'));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Meditasyon',
        streak: 3,
      }),
    );
  });
});
