import type { UserProfile } from '@/domain/entities/user-profile';

export type UserProfileRepository = {
  get(): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<void>;
};
