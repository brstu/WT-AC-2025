import { helper1, helper2 } from './utils';

test('unit test 1', () => {
  expect(helper1(5)).toBe(6);
});

test('unit test 2', () => {
  expect(helper2(2, 3)).toBe(5);
});

test('unit test 3', () => {
  expect(helper1(0)).toBe(1);
});
