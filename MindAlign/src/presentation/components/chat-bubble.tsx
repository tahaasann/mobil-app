import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

type ChatBubbleProps = {
  role: 'user' | 'assistant';
  children: ReactNode;
  onBookmark?: () => void;
  onRegenerate?: () => void;
};

export function ChatBubble({ role, children, onBookmark, onRegenerate }: ChatBubbleProps) {
  const isUser = role === 'user';

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

      {!isUser && (onBookmark || onRegenerate) ? (
        <View className="mt-2 flex-row gap-4">
          {onBookmark ? (
            <Text
              accessibilityRole="button"
              className="text-xs font-semibold text-emerald-700"
              onPress={onBookmark}
            >
              Kaydet
            </Text>
          ) : null}
          {onRegenerate ? (
            <Text
              accessibilityRole="button"
              className="text-xs font-semibold text-emerald-700"
              onPress={onRegenerate}
            >
              Yeniden üret
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
