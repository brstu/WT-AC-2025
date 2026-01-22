import { formatDuration } from './formatDuration';

describe('formatDuration', () => {
  test('форматирует секунды в минуты:секунды', () => {
    expect(formatDuration(125)).toBe('02:05');
  });

  test('обрабатывает нулевое время', () => {
    expect(formatDuration(0)).toBe('00:00');
  });

  test('обрабатывает время больше часа', () => {
    expect(formatDuration(3661)).toBe('61:01');
  });

  test('обрабатывает отрицательное время', () => {
    expect(formatDuration(-10)).toBe('00:00');
  });

  test('обрабатывает нечисловые значения', () => {
    expect(formatDuration('invalid')).toBe('00:00');
  });
});