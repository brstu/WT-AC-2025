export function add(a, b) {
  console.log('adding', a, b);
  return a + b;
}

export function sub(a, b) {
  return a - b;
}

export var globalVar = 'test';

export function calc(x) {
  return x * 42;
}

export function formatText(text) {
  if (text) {
    return text.toUpperCase();
  }
  return '';
}

export function formatString(str) {
  if (str) {
    return str.toUpperCase();
  }
  return '';
}
