const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export function initForm() {
  const form = document.getElementById("feedback-form");
  if (!form) return;

  const name = form.querySelector("#name");
  const email = form.querySelector("#email");
  const message = form.querySelector("#message");
  const submitBtn = document.getElementById("submit-btn");
  const result = document.getElementById("form-result");

  const fields = [name, email, message].filter(Boolean);

  fields.forEach((field) => {
    field.addEventListener("input", () => {
      validateForm();
    });
    field.addEventListener("blur", () => {
      validateField(field);
      updateSubmitState();
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const ok = validateForm(true);
    updateSubmitState();

    if (!ok) {
      result.textContent = "Форма содержит ошибки. Исправь поля, отмеченные красным.";
      result.style.borderColor = "rgba(255,107,107,.55)";
      return;
    }

    const payload = {
      name: name.value.trim(),
      email: email.value.trim() || "—",
      message: message.value.trim(),
      createdAt: new Date().toLocaleString(),
    };

    result.style.borderColor = "rgba(46,229,157,.45)";
    result.innerHTML = `
      <p><strong>Готово!</strong> Сообщение принято (симуляция отправки).</p>
      <ul>
        <li><strong>Имя:</strong> ${escapeHtml(payload.name)}</li>
        <li><strong>E-mail:</strong> ${escapeHtml(payload.email)}</li>
        <li><strong>Дата:</strong> ${escapeHtml(payload.createdAt)}</li>
      </ul>
      <p class="muted small">Текст: ${escapeHtml(payload.message)}</p>
    `;

    form.reset();
    fields.forEach((f) => clearError(f));
    validateForm();
  });

  validateForm();
  updateSubmitState();

  function validateForm(showAll = false) {
    let ok = true;
    fields.forEach((f) => {
      const fieldOk = validateField(f, showAll);
      if (!fieldOk) ok = false;
    });
    updateSubmitState();
    return ok;
  }

  function updateSubmitState() {
    const allOk = fields.every((f) => isFieldValid(f));
    submitBtn.disabled = !allOk;
  }
}

function validateField(field, forceShow = false) {
  const id = field.id;

  const shouldShow = forceShow || field.value.length > 0 || field === document.activeElement;

  if (id === "name") {
    const value = field.value.trim();
    if (!value) return setError(field, "Укажи имя (обязательное поле).", shouldShow);
    if (value.length < 2) return setError(field, "Имя должно быть минимум 2 символа.", shouldShow);
    return clearError(field, shouldShow);
  }

  if (id === "email") {
    const value = field.value.trim();
    if (!value) return clearError(field, shouldShow); 
    if (!emailRe.test(value)) return setError(field, "Введи корректный e-mail (пример: name@mail.com).", shouldShow);
    return clearError(field, shouldShow);
  }

  if (id === "message") {
    const value = field.value.trim();
    if (!value) return setError(field, "Напиши сообщение (минимум 20 символов).", shouldShow);
    if (value.length < 20) return setError(field, `Сейчас ${value.length} символов. Нужно минимум 20.`, shouldShow);
    return clearError(field, shouldShow);
  }

  return true;
}

function isFieldValid(field) {
  const id = field.id;
  const value = field.value.trim();

  if (id === "name") return value.length >= 2;
  if (id === "email") return value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
  if (id === "message") return value.length >= 20;

  return true;
}

function setError(field, message, show = true) {
  field.setAttribute("aria-invalid", "true");
  const el = document.getElementById(`error-${field.id}`);
  if (el) el.textContent = show ? message : "";
  return false;
}

function clearError(field) {
  field.setAttribute("aria-invalid", "false");
  const el = document.getElementById(`error-${field.id}`);
  if (el) el.textContent = "";
  return true;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
