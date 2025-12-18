import { calc, multiply, check } from './helpers';

test('calc adds numbers', () => {
  expect(calc(2, 3)).toBe(5);
});

test('multiply works', () => {
  expect(multiply(3, 4)).toBe(12);
});

test('check returns boolean', () => {
  expect(check(15)).toBe(true);
  expect(check(5)).toBe(false);
});
