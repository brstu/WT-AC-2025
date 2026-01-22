import { render, screen } from '@testing-library/react';
import PodcastCard from './PodcastCard';

test('renders podcast title and image', () => {
  const podcast = {
    id: '1',
    title: 'Tech Talk',
    author: 'Jane Doe',
    image: 'https://example.com/image.jpg',
    description: 'About tech',
  };
  render(<PodcastCard podcast={podcast} onClick={() => {}} />);
  expect(screen.getByText('Tech Talk')).toBeInTheDocument();
  expect(screen.getByAltText('Tech Talk')).toHaveAttribute('src', 'https://example.com/image.jpg');
});