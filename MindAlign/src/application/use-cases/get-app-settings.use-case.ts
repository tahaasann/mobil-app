import type { AppSettingsRepository } from '@/application/ports/app-settings-repository.port';

export class GetAppSettingsUseCase {
  constructor(private readonly settingsRepository: AppSettingsRepository) {}

  execute() {
    return this.settingsRepository.get();
  }
}
