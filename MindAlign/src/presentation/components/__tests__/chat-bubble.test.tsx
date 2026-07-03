import { render, screen, userEvent } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../__tests__/utils/render-with-providers';
import { ChatBubble } from '@/presentation/components/chat-bubble';

describe('ChatBubble', () => {
  it('renders user and assistant messages', async () => {
    await renderWithProviders(
      <>
        <ChatBubble role="user">Merhaba</ChatBubble>
        <ChatBubble role="assistant">Yanıt</ChatBubble>
      </>,
      { locale: 'tr' },
    );

    expect(screen.getByText('Merhaba')).toBeOnTheScreen();
    expect(screen.getByText('Yanıt')).toBeOnTheScreen();
  });

  it('shows bookmark and regenerate actions for assistant', async () => {
    const onBookmark = jest.fn();
    const onRegenerate = jest.fn();
    const user = userEvent.setup();

    await renderWithProviders(
      <ChatBubble role="assistant" onBookmark={onBookmark} onRegenerate={onRegenerate}>
        Koç yanıtı
      </ChatBubble>,
      { locale: 'tr' },
    );

    await user.press(screen.getByText('Kaydet'));
    await user.press(screen.getByText('Yeniden üret'));

    expect(onBookmark).toHaveBeenCalled();
    expect(onRegenerate).toHaveBeenCalled();
  });
});
