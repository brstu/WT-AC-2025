export function initForm() {
  const form = document.querySelector('.form');
  const submitBtn = form.querySelector('button[type="submit"]');

  const fields = {
    name: { min: 2, msg: 'Минимум 2 символа' },
    email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, msg: 'Некорректный e-mail' },
    message: { min: 20, msg: 'Минимум 20 символов' }
  };

  function validateField(field) {
    const value = field.value.trim();
    const errorEl = field.parentElement.querySelector('.error');
    const rule = fields[field.id];

    let valid = true;
    let msg = '';

    if (field.hasAttribute('required') && !value) {
      msg = 'Обязательное поле';
      valid = false;
    } else if (rule.min && value.length < rule.min) {
      msg = rule.msg;
      valid = false;
    } else if (rule.pattern && !rule.pattern.test(value)) {
      msg = rule.msg;
      valid = false;
    }

    errorEl.textContent = msg;
    field.setAttribute('aria-invalid', !valid);
    return valid;
  }

  form.addEventListener('input', (e) => {
    if (e.target.matches('input, textarea')) {
      validateField(e.target);
      submitBtn.disabled = !form.checkValidity() || ![...form.elements].every(el => validateField(el));
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const allValid = [...form.elements].every(el => el.checkValidity() && validateField(el));
    if (allValid) {
      form.querySelector('.form__result').textContent = 'Спасибо! Сообщение отправлено.';
      form.reset();
      submitBtn.disabled = true;
    }
  });
}