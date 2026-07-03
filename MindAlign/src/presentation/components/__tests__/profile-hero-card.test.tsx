import { screen } from '@testing-library/react-native';

import { ProfileHeroCard } from '@/presentation/components/profile-hero-card';
import { AppThemeProvider } from '@/presentation/theme/theme-provider';
import { I18nProvider } from '@/presentation/i18n/i18n-provider';
import { render } from '@testing-library/react-native';

describe('ProfileHeroCard', () => {
  it('shows guest badge and empty identity fallback', async () => {
    await render(
      <AppThemeProvider>
        <I18nProvider locale="en">
          <ProfileHeroCard
            email={null}
            isGuest
            identityGoal={null}
            approach="universal"
          />
        </I18nProvider>
      </AppThemeProvider>,
    );

    expect(screen.getByTestId('profile-avatar')).toHaveTextContent('G');
    expect(screen.getByText('Guest')).toBeOnTheScreen();
    expect(
      screen.getByText('Set your identity goal in onboarding to personalize your coach.'),
    ).toBeOnTheScreen();
  });
});
