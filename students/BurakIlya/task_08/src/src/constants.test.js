import { APP_NAME, VERSION } from './constants';

test('app name is defined', () => {
  expect(APP_NAME).toBe('Фитнес Упражнения');
});

test('version is correct', () => {
  expect(VERSION).toBe('1.0.0');
});
