import { render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import { FirebaseProvider, useFirebaseStatus } from '@/infrastructure/firebase/firebase-provider';

const mockBootstrapFirebase = jest.fn();
const mockIsProductionEnv = jest.fn(() => false);

jest.mock('@/infrastructure/firebase/firebase-bootstrap', () => ({
  bootstrapFirebase: () => mockBootstrapFirebase(),
}));

jest.mock('@/infrastructure/config/production-guard', () => ({
  isProductionEnv: () => mockIsProductionEnv(),
}));

function StatusProbe() {
  const { status, message } = useFirebaseStatus();
  return (
    <Text testID="firebase-status">
      {status}:{message ?? ''}
    </Text>
  );
}

describe('FirebaseProvider', () => {
  beforeEach(() => {
    mockBootstrapFirebase.mockReset();
    mockIsProductionEnv.mockReturnValue(false);
  });

  it('shows loading indicator while bootstrap is idle', async () => {
    mockBootstrapFirebase.mockReturnValue(new Promise(() => undefined));

    await render(
      <FirebaseProvider>
        <Text testID="child">child</Text>
      </FirebaseProvider>,
    );

    expect(screen.queryByTestId('child')).toBeNull();
  });

  it('renders children after bootstrap succeeds', async () => {
    mockBootstrapFirebase.mockResolvedValue({ status: 'ready', message: 'ok' });

    await render(
      <FirebaseProvider>
        <StatusProbe />
      </FirebaseProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('firebase-status')).toHaveTextContent('ready:ok');
    });
  });

  it('still renders children when bootstrap fails in development', async () => {
    mockBootstrapFirebase.mockResolvedValue({ status: 'error', message: 'App Check failed' });

    await render(
      <FirebaseProvider>
        <StatusProbe />
      </FirebaseProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('firebase-status')).toHaveTextContent('error:App Check failed');
    });
  });

  it('blocks the app when bootstrap fails in production', async () => {
    mockIsProductionEnv.mockReturnValue(true);
    mockBootstrapFirebase.mockResolvedValue({ status: 'error', message: 'App Check failed' });

    await render(
      <FirebaseProvider>
        <StatusProbe />
      </FirebaseProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Firebase App Check could not start/i)).toBeOnTheScreen();
    });
    expect(screen.queryByTestId('firebase-status')).toBeNull();
  });
});
