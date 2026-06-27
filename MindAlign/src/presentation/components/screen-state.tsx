import { Text, View } from 'react-native';

type ScreenStateProps = {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
};

export function ScreenState({ title, message, actionLabel, onAction, testID }: ScreenStateProps) {
  return (
    <View testID={testID} className="items-center justify-center px-6 py-10">
      <Text className="text-center text-lg font-semibold text-foreground dark:text-foreground-dark">
        {title}
      </Text>
      {message ? (
        <Text className="mt-2 text-center text-sm text-muted dark:text-muted-dark">{message}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Text
          accessibilityRole="button"
          className="mt-4 rounded-xl bg-accent px-4 py-3 text-center text-base font-semibold text-white"
          onPress={onAction}
        >
          {actionLabel}
        </Text>
      ) : null}
    </View>
  );
}

export function LoadingState({ message }: { message: string }) {
  return <ScreenState testID="loading-state" title={message} />;
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <ScreenState
      testID="empty-state"
      title={title}
      message={message}
      actionLabel={actionLabel}
      onAction={onAction}
    />
  );
}

export function ErrorState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <ScreenState
      testID="error-state"
      title={title}
      message={message}
      actionLabel={actionLabel}
      onAction={onAction}
    />
  );
}
