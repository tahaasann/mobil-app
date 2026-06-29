export const GENERAL_CHAT_HABIT_ID = 'general';

export type ChatTopic = {
  habitId: string;
  title: string;
  streak?: number;
};

export function buildGeneralChatTopic(label: string): ChatTopic {
  return { habitId: GENERAL_CHAT_HABIT_ID, title: label };
}

export function buildHabitChatTopic(habitId: string, title: string, streak?: number): ChatTopic {
  return { habitId, title, streak };
}
