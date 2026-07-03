import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import type { ApproachLens } from '@/application/ports/ai-coach.port';
import { useAppContainer } from '@/infrastructure/di/app-container';
import { useAuth } from '@/infrastructure/firebase/auth-provider';
import { AnimatedEnter } from '@/presentation/components/animated-enter';
import { ChoiceChip } from '@/presentation/components/choice-chip';
import { GlassScreenHeader } from '@/presentation/components/glass-screen-header';
import { ProfileActionRow } from '@/presentation/components/profile-action-row';
import { ProfileHeroCard } from '@/presentation/components/profile-hero-card';
import { ProfileSectionCard } from '@/presentation/components/profile-section-card';
import { ProfileStatGrid } from '@/presentation/components/profile-stat-grid';
import { useAppSettings } from '@/presentation/hooks/use-app-settings';
import { useProfileSummary } from '@/presentation/hooks/use-profile-summary';
import { i18n as appI18n, type AppLocale } from '@/presentation/i18n';
import { useAppTheme } from '@/presentation/theme/theme-provider';
import type { ThemePreference } from '@/presentation/theme/resolve-theme';

const APPROACHES: ApproachLens[] = ['universal', 'spiritual', 'scientific'];
const THEMES: ThemePreference[] = ['auto', 'light', 'dark'];
const LANGUAGES: AppLocale[] = ['en', 'tr'];

export default function ProfileScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { settings, refresh: refreshSettings } = useAppSettings();
  const { setPreference, preference } = useAppTheme();
  const { user, signOut } = useAuth();
  const { profile, summary, isLoading, refresh: refreshSummary } = useProfileSummary();
  const {
    updateAppSettingsUseCase,
    exportUserDataUseCase,
    resetUserDataUseCase,
    replayOnboardingUseCase,
    rescheduleAllNotificationsUseCase,
    requestNotificationPermissionUseCase,
  } = useAppContainer();
  const [isBusy, setIsBusy] = useState(false);

  const isGuest = !user?.email;
  const selectedApproach = settings?.selectedApproach ?? 'universal';

  const refreshAll = async () => {
    await Promise.all([refreshSettings(), refreshSummary()]);
  };

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
      await refreshAll();
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
              await resetUserDataUseCase.execute(user);
              router.replace('/onboarding' as Href);
            } finally {
              setIsBusy(false);
            }
          })();
        },
      },
    ]);
  };

  const handleReplayOnboarding = () => {
    Alert.alert(t('settings.replayOnboardingTitle'), t('settings.replayOnboardingConfirm'), [
      { text: t('common.back'), style: 'cancel' },
      {
        text: t('settings.replayOnboardingAction'),
        onPress: () => {
          void (async () => {
            setIsBusy(true);
            try {
              await replayOnboardingUseCase.execute();
              await refreshAll();
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
      <View className="pointer-events-none absolute -right-16 top-20 h-52 w-52 rounded-full bg-accent/10" />
      <View className="pointer-events-none absolute -left-20 bottom-40 h-48 w-48 rounded-full bg-emerald-400/10" />

      <SafeAreaView className="flex-1 px-4 py-6">
        <GlassScreenHeader title={t('profile.title')} subtitle={t('profile.subtitle')} />

        <ScrollView contentContainerClassName="gap-4 pb-28">
          <AnimatedEnter index={0}>
            <ProfileHeroCard
              email={user?.email ?? null}
              isGuest={isGuest}
              identityGoal={profile?.identityGoal ?? null}
              approach={selectedApproach}
            />
          </AnimatedEnter>

          <AnimatedEnter index={1}>
            <ProfileStatGrid summary={summary} isLoading={isLoading} />
          </AnimatedEnter>

          <AnimatedEnter index={2}>
            <ProfileSectionCard testID="profile-section-account" title={t('profile.sectionAccount')}>
              <ProfileActionRow
                label={t('settings.subscription')}
                onPress={() => router.push('/paywall?source=settings' as Href)}
              />
              <ProfileActionRow
                label={t('settings.signOut')}
                onPress={() => {
                  void (async () => {
                    await signOut();
                    router.replace('/auth' as Href);
                  })();
                }}
              />
            </ProfileSectionCard>
          </AnimatedEnter>

          <AnimatedEnter index={3}>
            <ProfileSectionCard
              testID="profile-section-preferences"
              title={t('profile.sectionPreferences')}
            >
              <Text className="mb-2 text-sm font-medium text-foreground dark:text-foreground-dark">
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

              <Text className="mb-2 mt-3 text-sm font-medium text-foreground dark:text-foreground-dark">
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

              <Text className="mb-2 mt-3 text-sm font-medium text-foreground dark:text-foreground-dark">
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
            </ProfileSectionCard>
          </AnimatedEnter>

          <AnimatedEnter index={4}>
            <ProfileSectionCard testID="profile-section-tools" title={t('profile.sectionTools')}>
              <ProfileActionRow
                disabled={isBusy}
                label={t('settings.notifications')}
                onPress={() => void handleNotifications()}
              />
              <ProfileActionRow
                label={t('settings.breathing')}
                onPress={() => router.push('/breathing' as Href)}
              />
            </ProfileSectionCard>
          </AnimatedEnter>

          <AnimatedEnter index={5}>
            <ProfileSectionCard testID="profile-section-data" title={t('profile.sectionData')}>
              <ProfileActionRow
                disabled={isBusy}
                label={t('settings.export')}
                onPress={() => void handleExport()}
              />
              <ProfileActionRow
                disabled={isBusy}
                label={t('settings.replayOnboarding')}
                onPress={handleReplayOnboarding}
              />
              <ProfileActionRow
                disabled={isBusy}
                label={t('settings.reset')}
                tone="danger"
                onPress={handleReset}
              />
              <Text className="mt-2 text-xs leading-5 text-muted dark:text-muted-dark">
                {t('settings.privacyNote')}
              </Text>
            </ProfileSectionCard>
          </AnimatedEnter>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
