import { useCallback, useEffect, useState } from 'react';

import type { UserProfile } from '@/domain/entities/user-profile';
import { useAppContainer } from '@/infrastructure/di/app-container';
import { buildProfileSummary, type ProfileSummary } from '@/presentation/profile/profile-summary';

type ProfileSummaryState = {
  profile: UserProfile | null;
  summary: ProfileSummary;
  isLoading: boolean;
};

const EMPTY_SUMMARY = buildProfileSummary({ habits: [] });

export function useProfileSummary() {
  const { getDashboardUseCase, getUserProfileUseCase } = useAppContainer();
  const [state, setState] = useState<ProfileSummaryState>({
    profile: null,
    summary: EMPTY_SUMMARY,
    isLoading: true,
  });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, isLoading: true }));
    try {
      const referenceDate = new Date().toISOString().slice(0, 10);
      const [dashboard, profile] = await Promise.all([
        getDashboardUseCase.execute({ referenceDate }),
        getUserProfileUseCase.execute(),
      ]);

      setState({
        profile,
        summary: buildProfileSummary({ habits: dashboard.habits }),
        isLoading: false,
      });
    } catch {
      setState({
        profile: null,
        summary: EMPTY_SUMMARY,
        isLoading: false,
      });
    }
  }, [getDashboardUseCase, getUserProfileUseCase]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...state, refresh };
}
