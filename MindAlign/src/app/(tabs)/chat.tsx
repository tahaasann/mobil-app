import { useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { buildGeneralChatTopic, GENERAL_CHAT_HABIT_ID, type ChatTopic } from '@/presentation/chat/chat-topic';
import { ChatSessionHeader } from '@/presentation/components/chat-session-header';
import { ChatTopicPicker } from '@/presentation/components/chat-topic-picker';
import { CoachChatView } from '@/presentation/components/coach-chat-view';
import { useAppContainer } from '@/infrastructure/di/app-container';
import { useHabits } from '@/presentation/hooks/use-habits';

export default function ChatTabScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { clearChatThreadUseCase } = useAppContainer();
  const { habits } = useHabits();
  const defaultTopic = useMemo(() => buildGeneralChatTopic(t('chat.generalTopic')), [t]);
  const [topic, setTopic] = useState<ChatTopic>(defaultTopic);
  const [sessionEpoch, setSessionEpoch] = useState(0);

  const sessionKey = `${topic.habitId}:${sessionEpoch}`;

  const handleTopicChange = (next: ChatTopic) => {
    setTopic(next);
  };

  const handleClose = () => {
    router.push('/(tabs)/' as Href);
  };

  const handleNewChat = async () => {
    await clearChatThreadUseCase.execute(topic.habitId);
    setSessionEpoch((current) => current + 1);
  };

  const handleRescued = () => {
    if (topic.habitId === GENERAL_CHAT_HABIT_ID) {
      return;
    }

    router.push(`/habit/${topic.habitId}` as Href);
  };

  return (
    <View className="flex-1 bg-ivory dark:bg-charcoal">
      <SafeAreaView className="flex-1 px-4 py-4" edges={['top', 'left', 'right']}>
        <Text className="mb-1 text-2xl font-semibold text-foreground dark:text-foreground-dark">
          {t('chat.title')}
        </Text>
        <Text className="mb-4 text-sm text-muted dark:text-muted-dark">{t('chat.subtitle')}</Text>

        <ChatSessionHeader
          closeLabel={t('chat.closeA11y')}
          newChatLabel={t('chat.newChat')}
          onClose={handleClose}
          onNewChat={() => void handleNewChat()}
        />

        <ChatTopicPicker habits={habits} topic={topic} onChange={handleTopicChange} />

        <View className="min-h-0 flex-1">
          <CoachChatView
            key={sessionKey}
            habitId={topic.habitId}
            habitTitle={topic.title}
            streak={topic.streak}
            onRescued={handleRescued}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
