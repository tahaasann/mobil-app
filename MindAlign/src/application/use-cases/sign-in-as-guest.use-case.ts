import type { AuthPort } from '@/application/ports/auth.port';

export class SignInAsGuestUseCase {
  constructor(private readonly auth: AuthPort) {}

  execute() {
    return this.auth.signInAnonymously();
  }
}
