import type { AuthPort } from '@/application/ports/auth.port';

export type SignInWithEmailInput = {
  email: string;
  password: string;
};

export class SignInWithEmailUseCase {
  constructor(private readonly auth: AuthPort) {}

  execute(input: SignInWithEmailInput) {
    return this.auth.signInWithEmail(input.email.trim(), input.password);
  }
}
