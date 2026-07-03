import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { GlassCard } from '@/presentation/components/glass-card';
import { GlassPressable } from '@/presentation/components/glass-pressable';
import { useAuth } from '@/infrastructure/firebase/auth-provider';
import { resolveAuthErrorTranslationKey } from '@/infrastructure/firebase/parse-firebase-auth-error';

export default function AuthScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { signInAsGuest, signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goToApp = () => {
    router.replace('/(tabs)' as Href);
  };

  const handleGuest = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await signInAsGuest();
      goToApp();
    } catch (caught) {
      if (__DEV__) {
        console.error('[AuthScreen] guest sign-in failed', caught);
      }
      setError(t(resolveAuthErrorTranslationKey(caught)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSignIn = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
      goToApp();
    } catch (caught) {
      if (__DEV__) {
        console.error('[AuthScreen] email sign-in failed', caught);
      }
      setError(t(resolveAuthErrorTranslationKey(caught)));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-ivory dark:bg-charcoal">
      <View className="pointer-events-none absolute -right-12 top-16 h-64 w-64 rounded-full bg-accent/15" />
      <View className="pointer-events-none absolute -left-16 bottom-24 h-52 w-52 rounded-full bg-emerald-300/10" />

      <SafeAreaView className="flex-1 justify-center px-4 py-6">
        <GlassCard variant="elevated" className="p-6">
          <Text className="text-2xl font-semibold text-foreground dark:text-foreground-dark">
            {t('auth.title')}
          </Text>
          <Text className="mt-2 text-base text-muted dark:text-muted-dark">
            {t('auth.subtitle')}
          </Text>

          <TextInput
            autoCapitalize="none"
            className="mt-6 rounded-xl border border-white/25 bg-white/40 px-4 py-3 text-base dark:border-white/10 dark:bg-black/20 dark:text-foreground-dark"
            keyboardType="email-address"
            placeholder={t('auth.emailPlaceholder')}
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            secureTextEntry
            className="mt-3 rounded-xl border border-white/25 bg-white/40 px-4 py-3 text-base dark:border-white/10 dark:bg-black/20 dark:text-foreground-dark"
            placeholder={t('auth.passwordPlaceholder')}
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text className="mt-2 text-sm text-red-600">{error}</Text> : null}

          <GlassPressable
            accessibilityRole="button"
            className={`mt-4 rounded-xl bg-accent px-4 py-3 ${isSubmitting ? 'opacity-50' : ''}`}
            disabled={isSubmitting}
            onPress={() => void handleEmailSignIn()}
          >
            <Text className="text-center text-base font-semibold text-white">
              {t('auth.signIn')}
            </Text>
          </GlassPressable>

          <GlassPressable
            accessibilityRole="button"
            className={`mt-3 rounded-xl border border-accent bg-white/20 px-4 py-3 dark:bg-black/10 ${isSubmitting ? 'opacity-50' : ''}`}
            disabled={isSubmitting}
            onPress={() => void handleGuest()}
          >
            <Text className="text-center text-base font-semibold text-accent">
              {t('auth.continueGuest')}
            </Text>
          </GlassPressable>
        </GlassCard>
      </SafeAreaView>
    </View>
  );
}
