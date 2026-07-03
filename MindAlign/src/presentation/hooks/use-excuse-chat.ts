import { useCallback, useState } from 'react';

import type {
  ApproachLens,
  CoachProfileContext,
  CoachTurn,
} from '@/application/ports/ai-coach.port';
import type { BustExcuseChatResult } from '@/application/use-cases/bust-excuse-chat.use-case';
import type { CrisisLocale } from '@/domain/ai/crisis-guardrail';
import { trimConversationHistory } from '@/domain/ai/conversation-history';
import { useAppContainer } from '@/infrastructure/di/app-container';

type SendExcuseInput = {
  excuse: string;
  habitTitle: string;
  streak?: number;
  approach?: ApproachLens;
  profile?: CoachProfileContext;
  locale?: CrisisLocale;
  conversationHistory?: CoachTurn[];
};

export function useExcuseChat(habitId: string) {
  const { bustExcuseChatUseCase, rescueStreakUseCase, failStreakUseCase } = useAppContainer();
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');

  const sendExcuse = useCallback(
    async (input: SendExcuseInput): Promise<BustExcuseChatResult> => {
      setIsLoading(true);
      setStreamingText('');
      try {
        return await bustExcuseChatUseCase.execute({
          habitTitle: input.habitTitle,
          excuse: input.excuse,
          streak: input.streak,
          approach: input.approach ?? 'universal',
          profile: input.profile,
          locale: input.locale,
          conversationHistory: trimConversationHistory(input.conversationHistory ?? []),
          onPartial: setStreamingText,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [bustExcuseChatUseCase],
  );

  const rescue = useCallback(
    async (input: {
      date: string;
      excuseText?: string;
      barrierLabel?: string;
      rescueTaskText?: string;
    }) => {
      await rescueStreakUseCase.execute({
        habitId,
        ...input,
      });
    },
    [habitId, rescueStreakUseCase],
  );

  const giveUp = useCallback(
    async (input: { date: string; excuseText?: string }) => {
      await failStreakUseCase.execute({
        habitId,
        ...input,
      });
    },
    [habitId, failStreakUseCase],
  );

  return { sendExcuse, rescue, giveUp, isLoading, streamingText };
}
