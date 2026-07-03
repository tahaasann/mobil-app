import type { AuthPort, AuthUser } from '@/application/ports/auth.port';
import { SignInAsGuestUseCase } from '@/application/use-cases/sign-in-as-guest.use-case';
import { SignInWithEmailUseCase } from '@/application/use-cases/sign-in-with-email.use-case';

const guestUser: AuthUser = {
  id: 'guest-1',
  email: null,
  isAnonymous: true,
  displayName: null,
};

const emailUser: AuthUser = {
  id: 'user-1',
  email: 'coach@example.com',
  isAnonymous: false,
  displayName: 'Coach',
};

function createAuthPort(overrides: Partial<AuthPort> = {}): AuthPort {
  return {
    getCurrentUser: jest.fn().mockResolvedValue(null),
    signInAnonymously: jest.fn().mockResolvedValue(guestUser),
    signInWithEmail: jest.fn().mockResolvedValue(emailUser),
    signOut: jest.fn().mockResolvedValue(undefined),
    deleteAccount: jest.fn().mockResolvedValue(undefined),
    onAuthStateChanged: jest.fn(() => () => undefined),
    ...overrides,
  };
}

describe('auth use cases', () => {
  it('signs in as guest via anonymous auth', async () => {
    const auth = createAuthPort();
    const useCase = new SignInAsGuestUseCase(auth);

    const user = await useCase.execute();

    expect(auth.signInAnonymously).toHaveBeenCalled();
    expect(user.isAnonymous).toBe(true);
  });

  it('signs in with email credentials', async () => {
    const auth = createAuthPort();
    const useCase = new SignInWithEmailUseCase(auth);

    const user = await useCase.execute({ email: 'coach@example.com', password: 'secret' });

    expect(auth.signInWithEmail).toHaveBeenCalledWith('coach@example.com', 'secret');
    expect(user.email).toBe('coach@example.com');
  });
});
