import type { UserProfileRepository } from '@/application/ports/user-profile-repository.port';

export class GetUserProfileUseCase {
  constructor(private readonly userProfileRepository: UserProfileRepository) {}

  execute() {
    return this.userProfileRepository.get();
  }
}
