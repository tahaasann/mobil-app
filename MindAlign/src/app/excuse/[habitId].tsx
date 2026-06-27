import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { BustExcuseChatResult } from '@/application/use-cases/bust-excuse-chat.use-case';
import { todayUtc } from '@/domain/utils/date';
import { ChatBubble } from '@/presentation/components/chat-bubble';
import { MicroTaskCard } from '@/presentation/components/microtask-card';
import { useExcuseChat } from '@/presentation/hooks/use-excuse-chat';
import { speakCoachText } from '@/presentation/utils/speech';

export default function ExcuseChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ habitId: string; title?: string; streak?: string }>();
  const habitId = params.habitId ?? '';
  const habitTitle = params.title ?? 'Alışkanlık';
  const streak = params.streak ? Number(params.streak) : undefined;

  const { sendExcuse, rescue, giveUp, isLoading, streamingText } = useExcuseChat(habitId);
  const [excuse, setExcuse] = useState('');
  const [result, setResult] = useState<BustExcuseChatResult | null>(null);
  const [submittedExcuse, setSubmittedExcuse] = useState('');

  const coachResponse = useMemo(
    () => (result?.kind === 'coach' ? result.response : null),
    [result],
  );

  const handleSend = async () => {
    const trimmed = excuse.trim();
    if (!trimmed || isLoading) return;

    setSubmittedExcuse(trimmed);
    setExcuse('');
    const next = await sendExcuse({ excuse: trimmed, habitTitle, streak });
    setResult(next);

    if (next.kind === 'coach') {
      const spoken = `${next.response.reflection} ${next.response.encouragement}`;
      void speakCoachText(spoken);
    }
  };

  const handleRescue = async () => {
    if (!coachResponse) return;
    await rescue({
      date: todayUtc(),
      excuseText: submittedExcuse,
      barrierLabel: coachResponse.barrier_label,
      rescueTaskText: coachResponse.micro_task,
    });
    router.back();
  };

  const handleGiveUp = async () => {
    await giveUp({ date: todayUtc(), excuseText: submittedExcuse });
    router.back();
  };

  return (
    <View className="flex-1 bg-ivory dark:bg-charcoal">
      <SafeAreaView className="flex-1 px-4 py-4">
        <Text className="mb-1 text-xl font-semibold text-foreground dark:text-foreground-dark">
          {habitTitle}
        </Text>
        <Text className="mb-4 text-sm text-muted dark:text-muted-dark">
          Bahane veya takıldığın noktayı yaz; koç mikro-görev önerecek.
        </Text>

        <ScrollView className="flex-1" contentContainerClassName="pb-6">
          {submittedExcuse ? <ChatBubble role="user">{submittedExcuse}</ChatBubble> : null}

          {isLoading ? (
            <ChatBubble role="assistant">{streamingText || 'Düşünüyorum…'}</ChatBubble>
          ) : null}

          {result?.kind === 'coach' ? (
            <>
              <ChatBubble role="assistant">{result.response.reflection}</ChatBubble>
              <MicroTaskCard
                barrierLabel={result.response.barrier_label}
                microTask={result.response.micro_task}
                encouragement={result.response.encouragement}
                onComplete={() => void handleRescue()}
                onGiveUp={() => void handleGiveUp()}
              />
            </>
          ) : null}

          {result?.kind === 'crisis' ? (
            <ChatBubble role="assistant">
              {result.message}
              {'\n\n'}
              {result.resources.join('\n')}
            </ChatBubble>
          ) : null}

          {result?.kind === 'off_topic' || result?.kind === 'quota_exceeded' ? (
            <ChatBubble role="assistant">{result.message}</ChatBubble>
          ) : null}
        </ScrollView>

        {!coachResponse ? (
          <View className="border-t border-gray-200 pt-3 dark:border-gray-700">
            <TextInput
              className="mb-3 rounded-xl border border-gray-300 bg-white px-4 py-3 text-base dark:border-gray-600 dark:bg-surface-dark dark:text-foreground-dark"
              editable={!isLoading}
              multiline
              placeholder="Örn. çok yorgunum, sonra yaparım…"
              value={excuse}
              onChangeText={setExcuse}
            />
            <Text
              accessibilityRole="button"
              className={`rounded-xl px-4 py-3 text-center text-base font-semibold text-white ${
                isLoading ? 'bg-gray-400' : 'bg-emerald-600'
              }`}
              onPress={() => void handleSend()}
            >
              {isLoading ? 'Gönderiliyor…' : 'Gönder'}
            </Text>
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}
