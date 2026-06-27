import type { AuthPort } from '@/application/ports/auth.port';

export class SignOutUseCase {
  constructor(private readonly auth: AuthPort) {}

  execute() {
    return this.auth.signOut();
  }
}
