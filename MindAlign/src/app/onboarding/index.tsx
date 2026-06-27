import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ApproachSelector } from '@/presentation/components/approach-selector';
import { GlassCard } from '@/presentation/components/glass-card';
import { useAppContainer } from '@/infrastructure/di/app-container';
import { createNotificationContentBuilder } from '@/presentation/notifications/notification-content';
import {
  canFinishOnboarding,
  createOnboardingDraft,
  getNextOnboardingStep,
  getPreviousOnboardingStep,
  type OnboardingDraft,
  type OnboardingStep,
} from '@/presentation/hooks/onboarding-flow';

const BARRIER_OPTIONS = ['tired', 'noTime', 'forgot', 'overwhelmed', 'other'] as const;
const NOTIF_WINDOWS = ['morning', 'afternoon', 'evening'] as const;

export default function OnboardingScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { saveOnboardingUseCase, requestNotificationPermissionUseCase, rescheduleAllNotificationsUseCase } =
    useAppContainer();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [draft, setDraft] = useState<OnboardingDraft>(() => ({
    ...createOnboardingDraft(),
    language: (i18n.language as OnboardingDraft['language']) ?? 'en',
  }));
  const [habitInput, setHabitInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const updateDraft = (patch: Partial<OnboardingDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const goNext = () => {
    const next = getNextOnboardingStep(step);
    if (next) {
      setStep(next);
    }
  };

  const goBack = () => {
    const previous = getPreviousOnboardingStep(step);
    if (previous) {
      setStep(previous);
    }
  };

  const addHabit = () => {
    const trimmed = habitInput.trim();
    if (!trimmed || draft.habitTitles.length >= 3) {
      return;
    }
    updateDraft({ habitTitles: [...draft.habitTitles, trimmed] });
    setHabitInput('');
  };

  const finish = async () => {
    if (!canFinishOnboarding(draft)) {
      return;
    }

    setIsSaving(true);
    try {
      await saveOnboardingUseCase.execute({
        approach: draft.approach,
        language: draft.language,
        theme: draft.theme,
        identityGoal: draft.identityGoal,
        defaultTone: draft.defaultTone,
        commonBarrier: draft.commonBarrier,
        notifWindow: draft.notifWindow,
        notifFrequency: draft.notifFrequency,
        habitTitles: draft.habitTitles,
      });

      if (draft.notifWindow) {
        await requestNotificationPermissionUseCase.execute();
      }

      await rescheduleAllNotificationsUseCase.execute({
        content: createNotificationContentBuilder(t),
      });

      router.replace('/paywall?source=onboarding' as Href);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-ivory dark:bg-charcoal">
      <SafeAreaView className="flex-1 px-4 py-6">
        <ScrollView contentContainerClassName="gap-4 pb-10">
          {step === 'welcome' ? (
            <GlassCard className="p-6">
              <Text className="text-3xl font-semibold text-foreground dark:text-foreground-dark">
                {t('onboarding.welcome.title')}
              </Text>
              <Text className="mt-2 text-base text-muted dark:text-muted-dark">
                {t('onboarding.welcome.subtitle')}
              </Text>
              <PrimaryButton label={t('onboarding.welcome.continue')} onPress={goNext} />
            </GlassCard>
          ) : null}

          {step === 'approach' ? (
            <View className="gap-4">
              <StepHeader
                title={t('onboarding.approach.title')}
                subtitle={t('onboarding.approach.subtitle')}
              />
              <ApproachSelector
                value={draft.approach}
                onChange={(approach) => updateDraft({ approach })}
              />
              <NavRow onBack={goBack} onNext={goNext} />
            </View>
          ) : null}

          {step === 'identity' ? (
            <View className="gap-4">
              <StepHeader
                title={t('onboarding.identity.title')}
                subtitle={t('onboarding.identity.subtitle')}
              />
              <TextInput
                className="rounded-xl border border-gray-300 px-4 py-3 text-base text-foreground dark:text-foreground-dark"
                placeholder={t('onboarding.identity.placeholder')}
                value={draft.identityGoal}
                onChangeText={(identityGoal) => updateDraft({ identityGoal })}
              />
              <NavRow onBack={goBack} onNext={goNext} />
            </View>
          ) : null}

          {step === 'habits' ? (
            <View className="gap-4">
              <StepHeader
                title={t('onboarding.habits.title')}
                subtitle={t('onboarding.habits.subtitle')}
              />
              <View className="flex-row gap-2">
                <TextInput
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-base text-foreground dark:text-foreground-dark"
                  placeholder={t('onboarding.habits.placeholder')}
                  value={habitInput}
                  onChangeText={setHabitInput}
                />
                <PrimaryButton label={t('onboarding.habits.add')} onPress={addHabit} />
              </View>
              {draft.habitTitles.map((title) => (
                <Text
                  key={title}
                  className="rounded-lg bg-surface px-3 py-2 text-foreground dark:bg-surface-dark dark:text-foreground-dark"
                >
                  {title}
                </Text>
              ))}
              <NavRow
                onBack={goBack}
                onNext={goNext}
                nextDisabled={!canFinishOnboarding(draft)}
                nextLabel={t('onboarding.habits.continue')}
              />
            </View>
          ) : null}

          {step === 'barrier' ? (
            <View className="gap-3">
              <StepHeader
                title={t('onboarding.barrier.title')}
                subtitle={t('onboarding.barrier.subtitle')}
              />
              {BARRIER_OPTIONS.map((option) => (
                <ChoiceChip
                  key={option}
                  label={t(`onboarding.barrier.${option}`)}
                  selected={draft.commonBarrier === option}
                  onPress={() => updateDraft({ commonBarrier: option })}
                />
              ))}
              <NavRow onBack={goBack} onNext={goNext} />
            </View>
          ) : null}

          {step === 'tone' ? (
            <View className="gap-3">
              <StepHeader title={t('onboarding.tone.title')} subtitle="" />
              <ChoiceChip
                label={t('onboarding.tone.gentle')}
                selected={draft.defaultTone === 'gentle'}
                onPress={() => updateDraft({ defaultTone: 'gentle' })}
              />
              <ChoiceChip
                label={t('onboarding.tone.direct')}
                selected={draft.defaultTone === 'direct'}
                onPress={() => updateDraft({ defaultTone: 'direct' })}
              />
              <NavRow onBack={goBack} onNext={goNext} />
            </View>
          ) : null}

          {step === 'notifications' ? (
            <View className="gap-3">
              <StepHeader
                title={t('onboarding.notifications.title')}
                subtitle={t('onboarding.notifications.subtitle')}
              />
              {NOTIF_WINDOWS.map((windowKey) => (
                <ChoiceChip
                  key={windowKey}
                  label={t(`onboarding.notifications.${windowKey}`)}
                  selected={draft.notifWindow === windowKey}
                  onPress={() => updateDraft({ notifWindow: windowKey, notifFrequency: 1 })}
                />
              ))}
              <ChoiceChip
                label={t('onboarding.notifications.frequencyTwice')}
                selected={draft.notifFrequency === 2}
                onPress={() => updateDraft({ notifFrequency: 2 })}
              />
              <NavRow
                onBack={goBack}
                onNext={() => void finish()}
                nextLabel={
                  isSaving ? t('common.loading') : t('onboarding.notifications.finish')
                }
                nextDisabled={isSaving}
              />
              <Pressable onPress={() => void finish()}>
                <Text className="text-center text-sm text-muted dark:text-muted-dark">
                  {t('onboarding.notifications.skip')}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View>
      <Text className="text-2xl font-semibold text-foreground dark:text-foreground-dark">
        {title}
      </Text>
      {subtitle ? (
        <Text className="mt-1 text-base text-muted dark:text-muted-dark">{subtitle}</Text>
      ) : null}
    </View>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      className="mt-4 rounded-xl bg-accent px-4 py-3"
      onPress={onPress}
    >
      <Text className="text-center text-base font-semibold text-white">{label}</Text>
    </Pressable>
  );
}

function NavRow({
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <View className="mt-2 flex-row justify-between gap-3">
      <Pressable accessibilityRole="button" className="rounded-xl px-4 py-3" onPress={onBack}>
        <Text className="text-base text-muted dark:text-muted-dark">{t('common.back')}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        className={`rounded-xl bg-accent px-4 py-3 ${nextDisabled ? 'opacity-50' : ''}`}
        disabled={nextDisabled}
        onPress={onNext}
      >
        <Text className="text-base font-semibold text-white">{nextLabel ?? t('common.next')}</Text>
      </Pressable>
    </View>
  );
}

function ChoiceChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <GlassCard className={`px-4 py-3 ${selected ? 'border-accent' : ''}`}>
        <Text className="text-base text-foreground dark:text-foreground-dark">{label}</Text>
      </GlassCard>
    </Pressable>
  );
}
