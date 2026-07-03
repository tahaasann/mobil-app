import { render, screen } from '@testing-library/react-native';

import SettingsRedirect from '@/app/settings';

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    const { Text } = require('react-native');
    return <Text testID="redirect">{href}</Text>;
  },
}));

describe('SettingsRedirect', () => {
  it('redirects legacy /settings to profile tab', async () => {
    await render(<SettingsRedirect />);
    expect(screen.getByTestId('redirect')).toHaveTextContent('/(tabs)/profile');
  });
});
