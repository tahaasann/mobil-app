import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import type { ApproachLens } from '@/application/ports/ai-coach.port';
import { useAppContainer } from '@/infrastructure/di/app-container';
import { useAuth } from '@/infrastructure/firebase/auth-provider';
import { ChoiceChip } from '@/presentation/components/choice-chip';
import { GlassCard } from '@/presentation/components/glass-card';
import { useAppSettings } from '@/presentation/hooks/use-app-settings';
import { i18n as appI18n, type AppLocale } from '@/presentation/i18n';
import { useAppTheme } from '@/presentation/theme/theme-provider';
import type { ThemePreference } from '@/presentation/theme/resolve-theme';

const APPROACHES: ApproachLens[] = ['universal', 'spiritual', 'scientific'];
const THEMES: ThemePreference[] = ['auto', 'light', 'dark'];
const LANGUAGES: AppLocale[] = ['en', 'tr'];

export default function ProfileScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { settings, refresh } = useAppSettings();
  const { setPreference, preference } = useAppTheme();
  const { user, signOut } = useAuth();
  const {
    updateAppSettingsUseCase,
    exportUserDataUseCase,
    resetUserDataUseCase,
    rescheduleAllNotificationsUseCase,
    requestNotificationPermissionUseCase,
  } = useAppContainer();
  const [isBusy, setIsBusy] = useState(false);

  const saveSettings = async (patch: {
    selectedApproach?: ApproachLens;
    language?: AppLocale;
    theme?: ThemePreference;
  }) => {
    if (!settings) return;
    setIsBusy(true);
    try {
      await updateAppSettingsUseCase.execute({
        selectedApproach: patch.selectedApproach ?? settings.selectedApproach,
        language: patch.language ?? settings.language,
        theme: patch.theme ?? settings.theme,
        onboardingCompleted: settings.onboardingCompleted,
      });
      if (patch.language) {
        await appI18n.changeLanguage(patch.language);
      }
      if (patch.theme) {
        setPreference(patch.theme);
      }
      await refresh();
    } finally {
      setIsBusy(false);
    }
  };

  const handleExport = async () => {
    Alert.alert(t('settings.exportTitle'), t('settings.exportWarning'), [
      { text: t('common.back'), style: 'cancel' },
      {
        text: t('settings.export'),
        onPress: () => {
          void (async () => {
            setIsBusy(true);
            try {
              const json = await exportUserDataUseCase.execute();
              await Share.share({ message: json, title: t('settings.exportTitle') });
            } finally {
              setIsBusy(false);
            }
          })();
        },
      },
    ]);
  };

  const handleReset = () => {
    Alert.alert(t('settings.resetTitle'), t('settings.resetConfirm'), [
      { text: t('common.back'), style: 'cancel' },
      {
        text: t('settings.resetAction'),
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setIsBusy(true);
            try {
              await resetUserDataUseCase.execute();
              router.replace('/onboarding' as Href);
            } finally {
              setIsBusy(false);
            }
          })();
        },
      },
    ]);
  };

  const handleNotifications = async () => {
    await requestNotificationPermissionUseCase.execute();
    await rescheduleAllNotificationsUseCase.execute({
      content: ({ kind, habitTitle }) => ({
        title: t(`notifications.${kind === 'checkin' ? 'checkin' : 'streakRisk'}.title`),
        body: t(`notifications.${kind === 'checkin' ? 'checkin' : 'streakRisk'}.body`, {
          habit: habitTitle,
        }),
      }),
    });
  };

  return (
    <View className="flex-1 bg-ivory dark:bg-charcoal">
      <SafeAreaView className="flex-1 px-4 py-6">
        <Text
          accessibilityRole="header"
          className="mb-2 text-3xl font-semibold text-foreground dark:text-foreground-dark"
        >
          {t('profile.title')}
        </Text>
        <Text className="mb-6 text-base text-muted dark:text-muted-dark">
          {t('profile.subtitle')}
        </Text>

        <ScrollView contentContainerClassName="gap-4 pb-10">
          <GlassCard className="p-4 gap-3">
            <Text className="text-sm text-muted dark:text-muted-dark">
              {user?.email ?? t('settings.guestAccount')}
            </Text>
            <Pressable
              accessibilityRole="button"
              className="py-2"
              onPress={() => router.push('/paywall?source=settings' as Href)}
            >
              <Text className="text-base font-semibold text-accent">
                {t('settings.subscription')}
              </Text>
            </Pressable>
            <Pressable accessibilityRole="button" className="py-2" onPress={() => void signOut()}>
              <Text className="text-base text-accent">{t('settings.signOut')}</Text>
            </Pressable>
          </GlassCard>

          <GlassCard className="p-4">
            <Text className="mb-3 text-base font-semibold text-foreground dark:text-foreground-dark">
              {t('settings.approach')}
            </Text>
            {APPROACHES.map((approach) => (
              <ChoiceChip
                key={approach}
                label={t(
                  `onboarding.approach.${approach === 'spiritual' ? 'spiritual' : approach === 'scientific' ? 'scientific' : 'universal'}`,
                )}
                selected={settings?.selectedApproach === approach}
                onPress={() => void saveSettings({ selectedApproach: approach })}
              />
            ))}
          </GlassCard>

          <GlassCard className="p-4">
            <Text className="mb-3 text-base font-semibold text-foreground dark:text-foreground-dark">
              {t('settings.language')}
            </Text>
            {LANGUAGES.map((language) => (
              <ChoiceChip
                key={language}
                label={language.toUpperCase()}
                selected={(settings?.language ?? i18n.language) === language}
                onPress={() => void saveSettings({ language })}
              />
            ))}
          </GlassCard>

          <GlassCard className="p-4">
            <Text className="mb-3 text-base font-semibold text-foreground dark:text-foreground-dark">
              {t('settings.themeTitle')}
            </Text>
            {THEMES.map((theme) => (
              <ChoiceChip
                key={theme}
                label={t(`settings.theme.${theme}`)}
                selected={(settings?.theme ?? preference) === theme}
                onPress={() => void saveSettings({ theme })}
              />
            ))}
          </GlassCard>

          <GlassCard className="p-4 gap-3">
            <Pressable
              accessibilityRole="button"
              className="py-2"
              disabled={isBusy}
              onPress={() => void handleNotifications()}
            >
              <Text className="text-base text-accent">{t('settings.notifications')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="py-2"
              onPress={() => router.push('/breathing' as Href)}
            >
              <Text className="text-base text-accent">{t('settings.breathing')}</Text>
            </Pressable>
          </GlassCard>

          <GlassCard className="p-4 gap-3">
            <Pressable
              accessibilityRole="button"
              className="py-2"
              disabled={isBusy}
              onPress={() => void handleExport()}
            >
              <Text className="text-base text-accent">{t('settings.export')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="py-2"
              disabled={isBusy}
              onPress={handleReset}
            >
              <Text className="text-base text-red-600">{t('settings.reset')}</Text>
            </Pressable>
            <Text className="text-xs text-muted dark:text-muted-dark">
              {t('settings.privacyNote')}
            </Text>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
