import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

import { Colors } from '@/constants/theme';
import {
  resolveTheme,
  toNativeWindColorScheme,
  type ResolvedTheme,
  type ThemePreference,
} from '@/presentation/theme/resolve-theme';

export type AppThemeContextValue = {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'];
  setPreference: (preference: ThemePreference) => void;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

type AppThemeProviderProps = {
  children: ReactNode;
  initialPreference?: ThemePreference;
};

export function AppThemeProvider({ children, initialPreference = 'auto' }: AppThemeProviderProps) {
  const systemScheme = useSystemColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();
  const [preference, setPreference] = useState<ThemePreference>(initialPreference);

  const normalizedSystemScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const resolved = resolveTheme(preference, normalizedSystemScheme);

  useEffect(() => {
    setColorScheme(toNativeWindColorScheme(preference));
  }, [preference, setColorScheme]);

  const value = useMemo<AppThemeContextValue>(
    () => ({
      preference,
      resolved,
      colors: Colors[resolved],
      setPreference,
    }),
    [preference, resolved],
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme(): AppThemeContextValue {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }
  return context;
}
