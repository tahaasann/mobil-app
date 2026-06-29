import { useRouter, type Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { BustExcuseChatResult } from '@/application/use-cases/bust-excuse-chat.use-case';
import { GENERAL_CHAT_HABIT_ID } from '@/presentation/chat/chat-topic';
import { todayUtc } from '@/domain/utils/date';
import { useAppContainer } from '@/infrastructure/di/app-container';
import { ChatBubble } from '@/presentation/components/chat-bubble';
import { MicroTaskCard } from '@/presentation/components/microtask-card';
import { useExcuseChat } from '@/presentation/hooks/use-excuse-chat';
import { QuotaWall } from '@/presentation/components/quota-wall';

type CoachChatViewProps = {
  habitId: string;
  habitTitle: string;
  streak?: number;
  onRescued?: () => void;
  onGiveUp?: () => void;
};

export function CoachChatView({
  habitId,
  habitTitle,
  streak,
  onRescued,
  onGiveUp,
}: CoachChatViewProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    bookmarkUseCase,
    saveChatMessageUseCase,
    getAppSettingsUseCase,
    getUserProfileUseCase,
    grantRewardedAdBonusUseCase,
    requestReviewAfterRescueUseCase,
  } = useAppContainer();

  const isGeneralTopic = habitId === GENERAL_CHAT_HABIT_ID;
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
        streak: isGeneralTopic ? undefined : streak,
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
      isGeneralTopic,
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
      habitId: isGeneralTopic ? null : habitId,
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
    if (!coachResponse || isGeneralTopic) return;
    await rescue({
      date: todayUtc(),
      excuseText: submittedExcuse,
      barrierLabel: coachResponse.barrier_label,
      rescueTaskText: coachResponse.micro_task,
    });
    await requestReviewAfterRescueUseCase.execute();
    onRescued?.();
  };

  const handleUpgrade = () => {
    router.push('/paywall?source=quota' as Href);
  };

  const handleWatchAd = async () => {
    setIsQuotaActionBusy(true);
    try {
      const adResult = await grantRewardedAdBonusUseCase.execute();
      if (adResult === 'rewarded' && submittedExcuse) {
        setResult(null);
        await runCoachRequest(submittedExcuse);
      }
    } finally {
      setIsQuotaActionBusy(false);
    }
  };

  const handleGiveUp = async () => {
    if (isGeneralTopic) return;
    await giveUp({ date: todayUtc(), excuseText: submittedExcuse });
    onGiveUp?.();
  };

  return (
    <View className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="pb-6">
        {submittedExcuse ? <ChatBubble role="user">{submittedExcuse}</ChatBubble> : null}

        {isLoading ? (
          <ChatBubble role="assistant">{streamingText || t('chat.thinking')}</ChatBubble>
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
            {isGeneralTopic ? (
              <View className="mt-3 rounded-xl bg-surface p-4 dark:bg-surface-dark">
                <Text className="text-sm font-semibold text-foreground dark:text-foreground-dark">
                  {result.response.barrier_label}
                </Text>
                <Text className="mt-2 text-sm text-muted dark:text-muted-dark">
                  {result.response.micro_task}
                </Text>
                <Text className="mt-2 text-sm text-accent">{result.response.encouragement}</Text>
              </View>
            ) : (
              <MicroTaskCard
                barrierLabel={result.response.barrier_label}
                microTask={result.response.micro_task}
                encouragement={result.response.encouragement}
                onComplete={() => void handleRescue()}
                onGiveUp={() => void handleGiveUp()}
              />
            )}
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
            placeholder={t('chat.inputPlaceholder')}
            value={excuse}
            onChangeText={setExcuse}
          />
          <Pressable
            accessibilityRole="button"
            className={`rounded-xl px-4 py-3 ${isLoading ? 'bg-gray-400' : 'bg-emerald-600'}`}
            disabled={isLoading}
            onPress={() => void handleSend()}
          >
            <Text className="text-center text-base font-semibold text-white">
              {isLoading ? t('common.loading') : t('chat.send')}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
