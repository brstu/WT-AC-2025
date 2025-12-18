import { render } from '@testing-library/react';
import ExerciseCard from './ExerciseCard';

test('card renders', () => {
  const { container } = render(
    <ExerciseCard 
      n="Test" 
      c="Test Category" 
      d="Test description"
      img="test.jpg"
      onClick={() => {}}
    />
  );
  expect(container).toBeTruthy();
});
