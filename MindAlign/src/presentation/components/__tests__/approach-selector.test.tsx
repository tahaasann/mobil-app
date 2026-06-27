import { render, screen, userEvent } from '@testing-library/react-native';

import { ApproachSelector } from '@/presentation/components/approach-selector';
import { I18nProvider } from '@/presentation/i18n/i18n-provider';
import { AppThemeProvider } from '@/presentation/theme/theme-provider';

jest.mock('nativewind', () => ({
  useColorScheme: () => ({
    setColorScheme: jest.fn(),
    toggleColorScheme: jest.fn(),
    colorScheme: 'light',
  }),
}));

jest.mock('expo-blur', () => {
  const { View } = require('react-native');
  return { BlurView: View };
});

jest.mock('expo-glass-effect', () => {
  const { View } = require('react-native');
  return {
    GlassView: View,
    isLiquidGlassAvailable: () => false,
  };
});

describe('ApproachSelector', () => {
  it('renders preview cards and reports selection changes', async () => {
    const onChange = jest.fn();

    await render(
      <I18nProvider locale="en">
        <AppThemeProvider>
          <ApproachSelector value="universal" onChange={onChange} />
        </AppThemeProvider>
      </I18nProvider>,
    );

    expect(screen.getByText('Spiritual / Islamic')).toBeOnTheScreen();
    expect(screen.getByText('Universal calm')).toBeOnTheScreen();

    const user = userEvent.setup();
    await user.press(screen.getByText('Scientific / CBT'));
    expect(onChange).toHaveBeenCalledWith('scientific');
  });
});
