import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CoachChatView } from '@/presentation/components/coach-chat-view';

export default function ExcuseChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ habitId: string; title?: string; streak?: string }>();
  const habitId = params.habitId ?? '';
  const habitTitle = params.title ?? 'Alışkanlık';
  const streak = params.streak ? Number(params.streak) : undefined;

  return (
    <View className="flex-1 bg-ivory dark:bg-charcoal">
      <SafeAreaView className="flex-1 px-4 py-4">
        <Text className="mb-1 text-xl font-semibold text-foreground dark:text-foreground-dark">
          {habitTitle}
        </Text>
        <Text className="mb-4 text-sm text-muted dark:text-muted-dark">
          Bahane veya takıldığın noktayı yaz; koç mikro-görev önerecek.
        </Text>

        <CoachChatView
          habitId={habitId}
          habitTitle={habitTitle}
          streak={streak}
          onRescued={() => router.push(`/habit/${habitId}` as Href)}
          onGiveUp={() => router.back()}
        />
      </SafeAreaView>
    </View>
  );
}
