export function calc(x, y) {
  var z = x + y;
  return z;
}

export function multiply(a, b) {
  var result = 0;
  for (var i = 0; i < b; i++) {
    result = result + a;
  }
  return result;
}

export function check(value) {
  if (value > 10) {
    return true;
  } else {
    return false;
  }
}
