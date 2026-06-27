import { render, screen } from '@testing-library/react-native';

import HomeScreen from '@/app/index';

jest.mock('@/components/animated-icon', () => ({
  AnimatedIcon: () => null,
}));

jest.mock('@/presentation/hooks/use-health-check', () => ({
  useHealthCheck: () => ({ status: 'ok', message: 'DB OK' }),
}));

describe('HomeScreen health status', () => {
  it('shows DB OK when health check succeeds', async () => {
    await render(<HomeScreen />);
    expect(screen.getByText('DB OK')).toBeOnTheScreen();
  });
});
