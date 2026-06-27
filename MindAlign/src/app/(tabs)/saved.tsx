import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { GlassCard } from '@/presentation/components/glass-card';
import { useBookmarks } from '@/presentation/hooks/use-bookmarks';

export default function SavedScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { bookmarks, isLoading, removeBookmark } = useBookmarks();

  return (
    <View className="flex-1 bg-ivory dark:bg-charcoal">
      <SafeAreaView className="flex-1 px-4 py-6">
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <Text className="mb-4 text-base text-accent">{t('common.back')}</Text>
        </Pressable>

        <Text className="mb-2 text-3xl font-semibold text-foreground dark:text-foreground-dark">
          {t('saved.title')}
        </Text>
        <Text className="mb-6 text-base text-muted dark:text-muted-dark">
          {t('saved.subtitle')}
        </Text>

        <ScrollView contentContainerClassName="gap-3 pb-8">
          {isLoading ? (
            <Text className="text-muted dark:text-muted-dark">{t('common.loading')}</Text>
          ) : bookmarks.length === 0 ? (
            <Text className="text-muted dark:text-muted-dark">{t('saved.empty')}</Text>
          ) : (
            bookmarks.map((bookmark) => (
              <GlassCard key={bookmark.id} className="p-4">
                {bookmark.habitTitle ? (
                  <Text className="mb-1 text-xs uppercase text-muted dark:text-muted-dark">
                    {bookmark.habitTitle}
                  </Text>
                ) : null}
                <Text className="text-base text-foreground dark:text-foreground-dark">
                  {bookmark.content}
                </Text>
                {bookmark.microTask ? (
                  <Text className="mt-2 text-sm text-muted dark:text-muted-dark">
                    {bookmark.microTask}
                  </Text>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  className="mt-3"
                  onPress={() => void removeBookmark(bookmark.id)}
                >
                  <Text className="text-sm font-semibold text-red-600">{t('saved.remove')}</Text>
                </Pressable>
              </GlassCard>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
