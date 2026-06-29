import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { buildGeneralChatTopic, type ChatTopic } from '@/presentation/chat/chat-topic';
import { ChatTopicPicker } from '@/presentation/components/chat-topic-picker';
import { CoachChatView } from '@/presentation/components/coach-chat-view';
import { useHabits } from '@/presentation/hooks/use-habits';

export default function ChatTabScreen() {
  const { t } = useTranslation();
  const { habits } = useHabits();
  const defaultTopic = useMemo(() => buildGeneralChatTopic(t('chat.generalTopic')), [t]);
  const [topic, setTopic] = useState<ChatTopic>(defaultTopic);
  const [sessionKey, setSessionKey] = useState(defaultTopic.habitId);

  const handleTopicChange = (next: ChatTopic) => {
    setTopic(next);
    setSessionKey(next.habitId);
  };

  return (
    <View className="flex-1 bg-ivory dark:bg-charcoal">
      <SafeAreaView className="flex-1 px-4 py-4" edges={['top', 'left', 'right']}>
        <Text className="mb-1 text-2xl font-semibold text-foreground dark:text-foreground-dark">
          {t('chat.title')}
        </Text>
        <Text className="mb-4 text-sm text-muted dark:text-muted-dark">{t('chat.subtitle')}</Text>

        <ChatTopicPicker habits={habits} topic={topic} onChange={handleTopicChange} />

        <View className="min-h-0 flex-1">
          <CoachChatView
            key={sessionKey}
            habitId={topic.habitId}
            habitTitle={topic.title}
            streak={topic.streak}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
