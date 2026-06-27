import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { AppThemeProvider, useAppTheme } from '@/presentation/theme/theme-provider';

jest.mock('nativewind', () => ({
  useColorScheme: () => ({
    setColorScheme: jest.fn(),
    toggleColorScheme: jest.fn(),
    colorScheme: 'light',
  }),
}));

function ThemeProbe() {
  const { resolved } = useAppTheme();
  return <Text>{resolved}</Text>;
}

describe('AppThemeProvider', () => {
  it('resolves dark theme when preference is dark', async () => {
    await render(
      <AppThemeProvider initialPreference="dark">
        <ThemeProbe />
      </AppThemeProvider>,
    );

    expect(screen.getByText('dark')).toBeOnTheScreen();
  });
});
