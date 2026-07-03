import { useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { CoachTurn } from '@/application/ports/ai-coach.port';
import type { BustExcuseChatResult } from '@/application/use-cases/bust-excuse-chat.use-case';
import { trimConversationHistory } from '@/domain/ai/conversation-history';
import { GENERAL_CHAT_HABIT_ID } from '@/presentation/chat/chat-topic';
import { todayUtc } from '@/domain/utils/date';
import { useAppContainer } from '@/infrastructure/di/app-container';
import { useSubscriptionPorts } from '@/infrastructure/di/subscription-container';
import { ChatBubble } from '@/presentation/components/chat-bubble';
import { CoachMessageActions } from '@/presentation/components/coach-message-actions';
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

function createAssistantMessageId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `msg-${Date.now()}`;
}

function findLastUserMessage(history: CoachTurn[], fallback: string): string {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const turn = history[index];
    if (turn?.role === 'user') {
      return turn.content;
    }
  }

  return fallback;
}

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
    listChatMessagesUseCase,
    getAppSettingsUseCase,
    getUserProfileUseCase,
    grantRewardedAdBonusUseCase,
    requestReviewAfterRescueUseCase,
    reportAiResponseUseCase,
  } = useAppContainer();
  const { adsPort } = useSubscriptionPorts();
  const watchAdEnabled = adsPort.isAvailable();

  const isGeneralTopic = habitId === GENERAL_CHAT_HABIT_ID;
  const { sendExcuse, rescue, giveUp, isLoading, streamingText } = useExcuseChat(habitId);
  const [draft, setDraft] = useState('');
  const [result, setResult] = useState<BustExcuseChatResult | null>(null);
  const [isQuotaActionBusy, setIsQuotaActionBusy] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState('');
  const [history, setHistory] = useState<CoachTurn[]>([]);
  const assistantMessageIdRef = useRef('');
  const listChatMessagesUseCaseRef = useRef(listChatMessagesUseCase);
  listChatMessagesUseCaseRef.current = listChatMessagesUseCase;

  useEffect(() => {
    let cancelled = false;

    void listChatMessagesUseCaseRef.current.execute(habitId).then((messages) => {
      if (!cancelled) {
        setHistory(messages.map((message) => ({ role: message.role, content: message.content })));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [habitId]);

  const coachResponse = useMemo(
    () => (result?.kind === 'coach' ? result.response : null),
    [result],
  );

  const isInputBlocked = result?.kind === 'crisis';

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
        locale: settings?.language === 'en' ? 'en' : 'tr',
        conversationHistory: history,
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
        assistantMessageIdRef.current = createAssistantMessageId();
        await saveChatMessageUseCase.execute({
          habitId,
          role: 'assistant',
          content: next.response.reflection,
        });
        setHistory((current) =>
          trimConversationHistory([
            ...current,
            { role: 'user', content: message },
            { role: 'assistant', content: next.response.reflection },
          ]),
        );
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
      history,
    ],
  );

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed || isLoading || isInputBlocked) {
      return;
    }

    setLastUserMessage(trimmed);
    setDraft('');
    setResult(null);
    await runCoachRequest(trimmed);
  };

  const handleBookmark = async () => {
    if (!coachResponse) {
      return;
    }

    await bookmarkUseCase.add({
      habitId: isGeneralTopic ? null : habitId,
      habitTitle,
      content: coachResponse.reflection,
      barrierLabel: coachResponse.barrier_label,
      microTask: coachResponse.micro_task,
    });
  };

  const handleRegenerate = async () => {
    if (isLoading) {
      return;
    }

    const sourceMessage = findLastUserMessage(history, lastUserMessage);
    if (!sourceMessage) {
      return;
    }

    setResult(null);
    await runCoachRequest(sourceMessage);
  };

  const handleReport = async () => {
    if (!coachResponse) {
      return;
    }

    await reportAiResponseUseCase.execute({
      messageId: assistantMessageIdRef.current,
      habitId: isGeneralTopic ? null : habitId,
      category: 'other',
      contentPreview: coachResponse.reflection,
    });
    Alert.alert(t('chat.report'), t('chat.reportThanks'));
  };

  const handleRescue = async () => {
    if (!coachResponse || isGeneralTopic) {
      return;
    }

    await rescue({
      date: todayUtc(),
      excuseText: findLastUserMessage(history, lastUserMessage),
      barrierLabel: coachResponse.barrier_label,
      rescueTaskText: coachResponse.micro_task,
    });
    await requestReviewAfterRescueUseCase.execute();

    if (onRescued) {
      onRescued();
      return;
    }

    router.push(`/habit/${habitId}` as Href);
  };

  const handleUpgrade = () => {
    router.push('/paywall?source=quota' as Href);
  };

  const handleWatchAd = async () => {
    setIsQuotaActionBusy(true);
    try {
      const adResult = await grantRewardedAdBonusUseCase.execute();
      const sourceMessage = findLastUserMessage(history, lastUserMessage);
      if (adResult === 'rewarded' && sourceMessage) {
        setResult(null);
        await runCoachRequest(sourceMessage);
      }
    } finally {
      setIsQuotaActionBusy(false);
    }
  };

  const handleGiveUp = async () => {
    if (isGeneralTopic) {
      return;
    }

    await giveUp({
      date: todayUtc(),
      excuseText: findLastUserMessage(history, lastUserMessage),
    });
    onGiveUp?.();
  };

  return (
    <View className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="pb-6" testID="coach-chat-scroll">
        {history.map((turn, index) => (
          <ChatBubble key={`${turn.role}-${index}-${turn.content.slice(0, 12)}`} role={turn.role}>
            {turn.content}
          </ChatBubble>
        ))}

        {isLoading ? (
          <ChatBubble role="assistant">{streamingText || t('chat.thinking')}</ChatBubble>
        ) : null}

        {result?.kind === 'coach' ? (
          <>
            <CoachMessageActions
              bookmarkLabel={t('chat.bookmarkA11y')}
              regenerateDisabled={isLoading}
              regenerateLabel={t('chat.regenerateA11y')}
              reportLabel={t('chat.reportA11y')}
              onBookmark={() => void handleBookmark()}
              onRegenerate={() => void handleRegenerate()}
              onReport={() => void handleReport()}
            />
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
              watchAdEnabled={watchAdEnabled}
              onUpgrade={handleUpgrade}
              onWatchAd={() => void handleWatchAd()}
            />
          </>
        ) : null}
      </ScrollView>

      {!isInputBlocked ? (
        <View className="border-t border-gray-200 pt-3 dark:border-gray-700" testID="coach-chat-input">
          <TextInput
            accessibilityLabel={t('chat.inputPlaceholder')}
            className="mb-3 rounded-xl border border-gray-300 bg-white px-4 py-3 text-base dark:border-gray-600 dark:bg-surface-dark dark:text-foreground-dark"
            editable={!isLoading}
            multiline
            placeholder={t('chat.inputPlaceholder')}
            testID="coach-chat-text-input"
            value={draft}
            onChangeText={setDraft}
          />
          <Pressable
            accessibilityRole="button"
            className={`rounded-xl px-4 py-3 ${isLoading ? 'bg-gray-400' : 'bg-emerald-600'}`}
            disabled={isLoading}
            testID="coach-chat-send"
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
