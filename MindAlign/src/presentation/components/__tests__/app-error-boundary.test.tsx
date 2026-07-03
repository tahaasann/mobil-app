import { render, screen, userEvent } from '@testing-library/react-native';
import { Text } from 'react-native';

import { AppErrorBoundary } from '@/presentation/components/app-error-boundary';

function BrokenChild(): never {
  throw new Error('render boom');
}

function HealthyChild() {
  return <Text>healthy</Text>;
}

describe('AppErrorBoundary (T-234)', () => {
  it('shows error UI when a child throws', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await render(
      <AppErrorBoundary>
        <BrokenChild />
      </AppErrorBoundary>,
    );

    expect(screen.getByTestId('error-state')).toBeOnTheScreen();
    expect(screen.getByText('render boom')).toBeOnTheScreen();

    jest.restoreAllMocks();
  });

  it('recovers after retry', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    let shouldThrow = true;
    const user = userEvent.setup();

    function MaybeBroken() {
      if (shouldThrow) {
        throw new Error('temporary');
      }
      return <Text>recovered</Text>;
    }

    await render(
      <AppErrorBoundary>
        <MaybeBroken />
      </AppErrorBoundary>,
    );

    shouldThrow = false;
    await user.press(screen.getByText('Try again'));
    expect(screen.getByText('recovered')).toBeOnTheScreen();

    jest.restoreAllMocks();
  });

  it('renders children when healthy', async () => {
    await render(
      <AppErrorBoundary>
        <HealthyChild />
      </AppErrorBoundary>,
    );

    expect(screen.getByText('healthy')).toBeOnTheScreen();
  });
});
