import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import type { BustExcuseChatResult } from '@/application/use-cases/bust-excuse-chat.use-case';
import { todayUtc } from '@/domain/utils/date';
import { useAppContainer } from '@/infrastructure/di/app-container';
import { ChatBubble } from '@/presentation/components/chat-bubble';
import { MicroTaskCard } from '@/presentation/components/microtask-card';
import { useExcuseChat } from '@/presentation/hooks/use-excuse-chat';
import { speakCoachText } from '@/presentation/utils/speech';
import { QuotaWall } from '@/presentation/components/quota-wall';

export default function ExcuseChatScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { bookmarkUseCase, saveChatMessageUseCase, getAppSettingsUseCase, getUserProfileUseCase, grantRewardedAdBonusUseCase } =
    useAppContainer();
  const params = useLocalSearchParams<{ habitId: string; title?: string; streak?: string }>();
  const habitId = params.habitId ?? '';
  const habitTitle = params.title ?? 'Alışkanlık';
  const streak = params.streak ? Number(params.streak) : undefined;

  const { sendExcuse, rescue, giveUp, isLoading, streamingText } = useExcuseChat(habitId);
  const [excuse, setExcuse] = useState('');
  const [result, setResult] = useState<BustExcuseChatResult | null>(null);
  const [isQuotaActionBusy, setIsQuotaActionBusy] = useState(false);
  const [submittedExcuse, setSubmittedExcuse] = useState('');

  const coachResponse = useMemo(
    () => (result?.kind === 'coach' ? result.response : null),
    [result],
  );

  const runCoachRequest = useCallback(
    async (message: string) => {
      const settings = await getAppSettingsUseCase.execute();
      const profile = await getUserProfileUseCase.execute();

      await saveChatMessageUseCase.execute({
        habitId,
        role: 'user',
        content: message,
      });

      const next = await sendExcuse({
        excuse: message,
        habitTitle,
        streak,
        approach: settings?.selectedApproach,
        profile: profile
          ? {
              identityGoal: profile.identityGoal,
              defaultTone: profile.defaultTone,
              commonBarrier: profile.commonBarrier,
            }
          : undefined,
      });

      setResult(next);

      if (next.kind === 'coach') {
        await saveChatMessageUseCase.execute({
          habitId,
          role: 'assistant',
          content: next.response.reflection,
        });
        const spoken = `${next.response.reflection} ${next.response.encouragement}`;
        void speakCoachText(spoken);
      }

      return next;
    },
    [
      getAppSettingsUseCase,
      getUserProfileUseCase,
      saveChatMessageUseCase,
      sendExcuse,
      habitId,
      habitTitle,
      streak,
    ],
  );

  const handleSend = async () => {
    const trimmed = excuse.trim();
    if (!trimmed || isLoading) return;

    setSubmittedExcuse(trimmed);
    setExcuse('');
    await runCoachRequest(trimmed);
  };

  const handleBookmark = async () => {
    if (!coachResponse) return;
    await bookmarkUseCase.add({
      habitId,
      habitTitle,
      content: coachResponse.reflection,
      barrierLabel: coachResponse.barrier_label,
      microTask: coachResponse.micro_task,
    });
  };

  const handleRegenerate = async () => {
    if (!submittedExcuse || isLoading) return;
    setResult(null);
    await runCoachRequest(submittedExcuse);
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

  const handleUpgrade = () => {
    router.push('/paywall?source=quota' as Href);
  };

  const handleWatchAd = async () => {
    setIsQuotaActionBusy(true);
    try {
      const result = await grantRewardedAdBonusUseCase.execute();
      if (result === 'rewarded' && submittedExcuse) {
        setResult(null);
        await runCoachRequest(submittedExcuse);
      }
    } finally {
      setIsQuotaActionBusy(false);
    }
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
              <ChatBubble
                role="assistant"
                onBookmark={() => void handleBookmark()}
                onRegenerate={() => void handleRegenerate()}
              >
                {result.response.reflection}
              </ChatBubble>
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

          {result?.kind === 'off_topic' ? (
            <ChatBubble role="assistant">{result.message}</ChatBubble>
          ) : null}

          {result?.kind === 'quota_exceeded' ? (
            <>
              <ChatBubble role="assistant">{result.message}</ChatBubble>
              <QuotaWall
                isBusy={isQuotaActionBusy}
                onUpgrade={handleUpgrade}
                onWatchAd={() => void handleWatchAd()}
              />
            </>
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
              {isLoading ? t('common.loading') : 'Gönder'}
            </Text>
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}
