import { Pressable, Text, View } from 'react-native';

type CoachMessageActionsProps = {
  bookmarkLabel: string;
  regenerateLabel: string;
  reportLabel: string;
  onBookmark: () => void;
  onRegenerate: () => void;
  onReport: () => void;
  regenerateDisabled?: boolean;
};

const ICON = {
  bookmark: '🔖',
  regenerate: '↻',
  report: '⚑',
} as const;

export function CoachMessageActions({
  bookmarkLabel,
  regenerateLabel,
  reportLabel,
  onBookmark,
  onRegenerate,
  onReport,
  regenerateDisabled = false,
}: CoachMessageActionsProps) {
  return (
    <View className="mb-2 flex-row gap-3 px-1" testID="coach-message-actions">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={bookmarkLabel}
        className="h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40"
        testID="coach-action-bookmark"
        onPress={onBookmark}
      >
        <Text accessibilityElementsHidden importantForAccessibility="no" className="text-lg">
          {ICON.bookmark}
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={regenerateLabel}
        className="h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40"
        disabled={regenerateDisabled}
        testID="coach-action-regenerate"
        onPress={onRegenerate}
      >
        <Text accessibilityElementsHidden importantForAccessibility="no" className="text-xl">
          {ICON.regenerate}
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={reportLabel}
        className="h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40"
        testID="coach-action-report"
        onPress={onReport}
      >
        <Text accessibilityElementsHidden importantForAccessibility="no" className="text-lg">
          {ICON.report}
        </Text>
      </Pressable>
    </View>
  );
}
