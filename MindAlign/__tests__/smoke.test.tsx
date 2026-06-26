import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

describe('Jest + RNTL smoke', () => {
  it('renders a React Native Text node', async () => {
    await render(<Text>MindAlign</Text>);
    expect(screen.getByText('MindAlign')).toBeOnTheScreen();
  });
});
