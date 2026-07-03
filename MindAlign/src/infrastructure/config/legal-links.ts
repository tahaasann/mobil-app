export const LEGAL_LINKS = {
  privacyPolicy:
    process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL?.trim() || 'https://mindalign.app/privacy',
  termsOfService: process.env.EXPO_PUBLIC_TERMS_URL?.trim() || 'https://mindalign.app/terms',
} as const;
