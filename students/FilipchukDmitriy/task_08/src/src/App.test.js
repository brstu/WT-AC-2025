import { render, screen } from '@testing-library/react';
import App from './App';

test('renders without crashing', () => {
  render(<App />);
  expect(true).toBe(true);
});

test('has title', () => {
  render(<App />);
  const title = screen.getByText(/Каталог/i);
  expect(title).toBeInTheDocument();
});

test('app exists', () => {
  const { container } = render(<App />);
  expect(container).toBeTruthy();
});
