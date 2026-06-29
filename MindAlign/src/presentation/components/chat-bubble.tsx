import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

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
            <Pressable accessibilityRole="button" onPress={onBookmark}>
              <Text className="text-xs font-semibold text-emerald-700">Kaydet</Text>
            </Pressable>
          ) : null}
          {onRegenerate ? (
            <Pressable accessibilityRole="button" onPress={onRegenerate}>
              <Text className="text-xs font-semibold text-emerald-700">Yeniden üret</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
