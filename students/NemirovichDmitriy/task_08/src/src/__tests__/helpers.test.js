import { calculate, formatSalary } from '../utils/helpers';

// Плохие практики: тесты без describe, неинформативные названия
test('test1', () => {
  const result = calculate(2, 3);
  expect(result).toBe(5);
});

test('test2', () => {
  const result = formatSalary(50000);
  expect(result).toBe('50000 руб');
});

// Тест с магическим числом
test('calc', () => {
  expect(calculate(10, 20)).toBe(30);
  expect(calculate(5, 7)).toBe(12);
  expect(calculate(100, 200)).toBe(300);
});
