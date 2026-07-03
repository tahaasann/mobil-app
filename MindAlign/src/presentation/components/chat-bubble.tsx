import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type ChatBubbleProps = {
  role: 'user' | 'assistant';
  children: ReactNode;
  onBookmark?: () => void;
  onRegenerate?: () => void;
  onReport?: () => void;
  reportLabel?: string;
};

export function ChatBubble({
  role,
  children,
  onBookmark,
  onRegenerate,
  onReport,
  reportLabel,
}: ChatBubbleProps) {
  const { t } = useTranslation();
  const isUser = role === 'user';
  const resolvedReportLabel = reportLabel ?? t('chat.report');

  return (
    <View
      className={`mb-3 max-w-[90%] rounded-2xl px-4 py-3 ${
        isUser ? 'self-end bg-emerald-600' : 'self-start bg-white/90 dark:bg-surface-dark'
      }`}
    >
      <Text
        className={`text-sm leading-5 ${isUser ? 'text-white' : 'text-foreground dark:text-foreground-dark'}`}
      >
        {children}
      </Text>

      {!isUser && (onBookmark || onRegenerate || onReport) ? (
        <View className="mt-2 flex-row gap-4">
          {onBookmark ? (
            <Pressable accessibilityRole="button" onPress={onBookmark}>
              <Text className="text-xs font-semibold text-emerald-700">{t('chat.bookmark')}</Text>
            </Pressable>
          ) : null}
          {onRegenerate ? (
            <Pressable accessibilityRole="button" onPress={onRegenerate}>
              <Text className="text-xs font-semibold text-emerald-700">{t('chat.regenerate')}</Text>
            </Pressable>
          ) : null}
          {onReport ? (
            <Pressable accessibilityRole="button" onPress={onReport}>
              <Text className="text-xs font-semibold text-red-600">{resolvedReportLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
