import { render, screen } from '@testing-library/react';
import Modal from './Modal';

test('modal does not render without item', () => {
  const { container } = render(<Modal item={null} onClose={() => {}} />);
  expect(container.firstChild).toBeNull();
});

test('modal renders with item', () => {
  const item = {
    n: 'Test Exercise',
    c: 'Test',
    d: 'Description',
    img: 'test.jpg',
    r: 10
  };
  render(<Modal item={item} onClose={() => {}} />);
  expect(screen.getByText('Test Exercise')).toBeInTheDocument();
});
