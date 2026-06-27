export type ThemePreference = 'auto' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export function resolveTheme(
  preference: ThemePreference,
  systemScheme: 'light' | 'dark' | null | undefined,
): ResolvedTheme {
  if (preference === 'light') {
    return 'light';
  }
  if (preference === 'dark') {
    return 'dark';
  }
  return systemScheme === 'dark' ? 'dark' : 'light';
}

export function toNativeWindColorScheme(
  preference: ThemePreference,
): 'light' | 'dark' | 'system' {
  if (preference === 'auto') {
    return 'system';
  }
  return preference;
}
