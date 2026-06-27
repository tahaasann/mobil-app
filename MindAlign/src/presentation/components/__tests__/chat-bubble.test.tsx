import { fireEvent, render, screen } from '@testing-library/react-native';

import { ChatBubble } from '@/presentation/components/chat-bubble';

describe('ChatBubble', () => {
  it('renders user and assistant messages', async () => {
    await render(
      <>
        <ChatBubble role="user">Merhaba</ChatBubble>
        <ChatBubble role="assistant">Yanıt</ChatBubble>
      </>,
    );

    expect(screen.getByText('Merhaba')).toBeOnTheScreen();
    expect(screen.getByText('Yanıt')).toBeOnTheScreen();
  });

  it('shows bookmark and regenerate actions for assistant', async () => {
    const onBookmark = jest.fn();
    const onRegenerate = jest.fn();

    await render(
      <ChatBubble role="assistant" onBookmark={onBookmark} onRegenerate={onRegenerate}>
        Koç yanıtı
      </ChatBubble>,
    );

    fireEvent.press(screen.getByText('Kaydet'));
    fireEvent.press(screen.getByText('Yeniden üret'));

    expect(onBookmark).toHaveBeenCalled();
    expect(onRegenerate).toHaveBeenCalled();
  });
});
