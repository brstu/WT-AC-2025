import React from 'react';
import { render } from '@testing-library/react';
import App from '../App';

// Минимальный тест без проверок
test('renders', () => {
  render(<App />);
});

test('check title', () => {
  const { getByText } = render(<App />);
  const element = getByText(/Портал стажировок/i);
  expect(element).toBeInTheDocument();
});
