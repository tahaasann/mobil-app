import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { GlassCard } from '@/presentation/components/glass-card';
import { useAuth } from '@/infrastructure/firebase/auth-provider';

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
    } catch {
      setError(t('auth.errorGeneric'));
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
    } catch {
      setError(t('auth.errorSignIn'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-ivory dark:bg-charcoal">
      <SafeAreaView className="flex-1 justify-center px-4 py-6">
        <GlassCard className="p-6">
          <Text className="text-2xl font-semibold text-foreground dark:text-foreground-dark">
            {t('auth.title')}
          </Text>
          <Text className="mt-2 text-base text-muted dark:text-muted-dark">
            {t('auth.subtitle')}
          </Text>

          <TextInput
            autoCapitalize="none"
            className="mt-6 rounded-xl border border-gray-300 px-4 py-3 text-base dark:border-gray-600 dark:text-foreground-dark"
            keyboardType="email-address"
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            secureTextEntry
            className="mt-3 rounded-xl border border-gray-300 px-4 py-3 text-base dark:border-gray-600 dark:text-foreground-dark"
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text className="mt-2 text-sm text-red-600">{error}</Text> : null}

          <Pressable
            accessibilityRole="button"
            className={`mt-4 rounded-xl bg-accent px-4 py-3 ${isSubmitting ? 'opacity-50' : ''}`}
            disabled={isSubmitting}
            onPress={() => void handleEmailSignIn()}
          >
            <Text className="text-center text-base font-semibold text-white">
              {t('auth.signIn')}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            className={`mt-3 rounded-xl border border-accent px-4 py-3 ${isSubmitting ? 'opacity-50' : ''}`}
            disabled={isSubmitting}
            onPress={() => void handleGuest()}
          >
            <Text className="text-center text-base font-semibold text-accent">
              {t('auth.continueGuest')}
            </Text>
          </Pressable>
        </GlassCard>
      </SafeAreaView>
    </View>
  );
}
