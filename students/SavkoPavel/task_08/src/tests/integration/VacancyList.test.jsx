import { render, screen } from '@testing-library/react';
import VacancyList from '../../components/VacancyList';

test('renders vacancy title', () => {
  render(<VacancyList />);
  expect(screen.getByText(/Frontend Developer/i)).toBeInTheDocument();
});