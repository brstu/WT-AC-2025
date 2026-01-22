import { API_URL, COLORS, MAX_EXERCISES } from './config';

test('config has API_URL', () => {
  expect(API_URL).toBeDefined();
});

test('config has colors', () => {
  expect(COLORS.primary).toBe('#4a90e2');
});

test('max exercises is defined', () => {
  expect(MAX_EXERCISES).toBe(100);
});
