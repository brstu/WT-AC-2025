import { formatTime } from './formatTime';

test('formats 125 seconds to 02:05', () => {
  expect(formatTime(125)).toBe('02:05');
});

test('formats 0 seconds to 00:00', () => {
  expect(formatTime(0)).toBe('00:00');
});

test('formats 3600 seconds to 60:00', () => {
  expect(formatTime(3600)).toBe('60:00');
});