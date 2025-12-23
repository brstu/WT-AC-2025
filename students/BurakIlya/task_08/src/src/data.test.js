import { data, categories } from './data';

test('data test 1', () => {
  expect(data.length).toBe(6);
});

test('data test 2', () => {
  expect(categories.length).toBeGreaterThan(0);
});
