import { render, screen } from '@testing-library/react';
import App from '../App';

// Плохие тесты: неинформативные названия, минимальные проверки
test('test1', () => {
  render(<App />);
  const element = screen.getByText(/Галерея Артов/i);
  expect(element).toBeInTheDocument();
});

test('test2', () => {
  render(<App />);
  expect(true).toBe(true);
});
