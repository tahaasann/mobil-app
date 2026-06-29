import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  buildGeneralChatTopic,
  buildHabitChatTopic,
  type ChatTopic,
} from '@/presentation/chat/chat-topic';
import type { DashboardHabit } from '@/application/use-cases/get-dashboard.use-case';

type ChatTopicPickerProps = {
  habits: DashboardHabit[];
  topic: ChatTopic;
  onChange: (topic: ChatTopic) => void;
};

export function ChatTopicPicker({ habits, topic, onChange }: ChatTopicPickerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const options = useMemo(() => {
    const general = buildGeneralChatTopic(t('chat.generalTopic'));
    const habitOptions = habits.map((item) =>
      buildHabitChatTopic(item.habit.id, item.habit.title, item.streak),
    );
    return [general, ...habitOptions];
  }, [habits, t]);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('chat.topicPicker')}
        className="mb-4 flex-row items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-3 dark:border-gray-600 dark:bg-surface-dark"
        onPress={() => setOpen(true)}
      >
        <Text className="text-base font-medium text-foreground dark:text-foreground-dark">
          {topic.title}
        </Text>
        <Text className="text-sm text-accent">▼</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View className="flex-1">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            className="absolute inset-0 bg-black/40"
            onPress={() => setOpen(false)}
          />
          <View className="mt-24 mx-4 rounded-2xl bg-white p-2 dark:bg-charcoal">
            <Text className="px-3 py-2 text-sm font-semibold text-muted dark:text-muted-dark">
              {t('chat.topicPicker')}
            </Text>
            <ScrollView className="max-h-80">
              {options.map((option) => {
                const selected = option.habitId === topic.habitId;
                return (
                  <Pressable
                    key={option.habitId}
                    accessibilityRole="button"
                    className={`rounded-xl px-3 py-3 ${selected ? 'bg-emerald-50 dark:bg-emerald-950' : ''}`}
                    onPress={() => {
                      onChange(option);
                      setOpen(false);
                    }}
                  >
                    <Text
                      className={`text-base ${selected ? 'font-semibold text-emerald-700 dark:text-emerald-300' : 'text-foreground dark:text-foreground-dark'}`}
                    >
                      {option.title}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
