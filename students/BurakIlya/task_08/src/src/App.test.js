import { render, screen } from '@testing-library/react';
import App from './App';

test('renders title', () => {
  render(<App />);
  const element = screen.getByText(/Фитнес Упражнения/i);
  expect(element).toBeInTheDocument();
});

test('renders exercise', () => {
  render(<App />);
  const element = screen.getByText(/Отжимания/i);
  expect(element).toBeInTheDocument();
});
