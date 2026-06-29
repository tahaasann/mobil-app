import {
  buildGeneralChatTopic,
  buildHabitChatTopic,
  GENERAL_CHAT_HABIT_ID,
} from '@/presentation/chat/chat-topic';

describe('chat-topic', () => {
  it('buildGeneralChatTopic uses general habit id', () => {
    expect(buildGeneralChatTopic('Genel konuşma')).toEqual({
      habitId: GENERAL_CHAT_HABIT_ID,
      title: 'Genel konuşma',
    });
  });

  it('buildHabitChatTopic carries habit metadata', () => {
    expect(buildHabitChatTopic('habit-1', 'Meditasyon', 4)).toEqual({
      habitId: 'habit-1',
      title: 'Meditasyon',
      streak: 4,
    });
  });
});
