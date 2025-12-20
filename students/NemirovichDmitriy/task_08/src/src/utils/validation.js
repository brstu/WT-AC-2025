export function validateEmail(email) {
  return email.includes('@');
}

export function validatePhone(phone) {
  return phone.length > 5;
}

export function validateForm(data) {
  if (!data.name) {
    return false;
  }
  if (!data.email) {
    return false;
  }
  return true;
}

export function checkEmail(email) {
  return email.includes('@');
}
