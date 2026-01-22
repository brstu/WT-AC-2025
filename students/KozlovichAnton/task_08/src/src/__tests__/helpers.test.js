import { add, calc, formatText } from '../utils/helpers';

// Плохие unit тесты: неполное покрытие, отсутствие edge cases
describe('helpers', () => {
  test('add works', () => {
    expect(add(1, 2)).toBe(3);
  });
  
  test('calc test', () => {
    const result = calc(2);
    expect(result).toBe(84);
  });
  
  test('formatText', () => {
    expect(formatText('hello')).toBe('HELLO');
  });
});
