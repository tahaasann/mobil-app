import { Pressable, Text, View } from 'react-native';

type ChatSessionHeaderProps = {
  closeLabel: string;
  newChatLabel: string;
  onClose: () => void;
  onNewChat: () => void;
};

export function ChatSessionHeader({
  closeLabel,
  newChatLabel,
  onClose,
  onNewChat,
}: ChatSessionHeaderProps) {
  return (
    <View className="mb-3 flex-row items-center justify-between" testID="chat-session-header">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={closeLabel}
        className="h-10 w-10 items-center justify-center rounded-full bg-white/60 dark:bg-black/30"
        testID="chat-session-close"
        onPress={onClose}
      >
        <Text accessibilityElementsHidden importantForAccessibility="no" className="text-xl">
          ✕
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={newChatLabel}
        className="rounded-full bg-accent px-4 py-2"
        testID="chat-session-new"
        onPress={onNewChat}
      >
        <Text className="text-sm font-semibold text-white">{newChatLabel}</Text>
      </Pressable>
    </View>
  );
}
