import { render, screen, userEvent } from '@testing-library/react-native';

import { CoachMessageActions } from '@/presentation/components/coach-message-actions';

describe('CoachMessageActions', () => {
  it('renders icon-only actions with accessibility labels', async () => {
    const onBookmark = jest.fn();
    const onRegenerate = jest.fn();
    const onReport = jest.fn();

    await render(
      <CoachMessageActions
        bookmarkLabel="Save coach reply"
        regenerateLabel="Regenerate coach reply"
        reportLabel="Report coach reply"
        onBookmark={onBookmark}
        onRegenerate={onRegenerate}
        onReport={onReport}
      />,
    );

    expect(screen.getByTestId('coach-message-actions')).toBeOnTheScreen();
    expect(screen.getByLabelText('Save coach reply')).toBeOnTheScreen();
    expect(screen.getByLabelText('Regenerate coach reply')).toBeOnTheScreen();
    expect(screen.getByLabelText('Report coach reply')).toBeOnTheScreen();
    expect(screen.queryByText('Save')).toBeNull();
    expect(screen.queryByText('Regenerate')).toBeNull();
    expect(screen.queryByText('Report')).toBeNull();

    const user = userEvent.setup();
    await user.press(screen.getByTestId('coach-action-bookmark'));
    await user.press(screen.getByTestId('coach-action-regenerate'));
    await user.press(screen.getByTestId('coach-action-report'));

    expect(onBookmark).toHaveBeenCalled();
    expect(onRegenerate).toHaveBeenCalled();
    expect(onReport).toHaveBeenCalled();
  });
});
