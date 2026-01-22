import { createItem, getItem, updateItem } from "../api.js";
import { escapeHtml, renderState, setToast } from "../utils.js";

export async function renderNew(app) {
  renderForm(app, {
    title: "Новый отзыв",
    submitText: "Создать",
    initial: { place: "", city: "", rating: "5", text: "" },
    onSubmit: async (data) => {
      const created = await createItem({ ...data, createdAt: new Date().toISOString() });
      setToast("Отзыв создан ✅");
      location.hash = `#/items/${created.id}`;
    }
  });
}

export async function renderEdit(app, { id }) {
  app.innerHTML = renderState({ title: "Загрузка…", text: "Подготавливаем форму редактирования." });

  try {
    const item = await getItem(id);

    renderForm(app, {
      title: `Редактирование: ${item.place}`,
      submitText: "Сохранить",
      initial: {
        place: item.place || "",
        city: item.city || "",
        rating: String(item.rating ?? "5"),
        text: item.text || ""
      },
      onSubmit: async (data) => {
        await updateItem(id, data);
        setToast("Изменения сохранены ✅");
        location.hash = `#/items/${id}`;
      }
    });
  } catch {
    app.innerHTML = renderState({
      title: "Ошибка",
      text: "Не удалось загрузить данные для редактирования.",
      actionHtml: `<a class="btn" href="#/items" style="text-decoration:none;display:inline-block">К списку</a>`
    });
  }
}

function renderForm(app, { title, submitText, initial, onSubmit }) {
  app.innerHTML = `
    <section class="card">
      <div class="toolbar">
        <h1 style="margin:0">${escapeHtml(title)}</h1>
        <a class="btn btn-secondary" href="#/items" style="text-decoration:none;display:inline-block">← Назад</a>
      </div>

      <p class="muted" style="margin:.5rem 0 1rem">
        Валидация: место — обязательно, рейтинг 1–5, текст отзыва минимум 20 символов.
      </p>

      <form id="form" class="row" novalidate>
        <div class="row-2">
          <div class="field">
            <label for="place">Место <span aria-hidden="true">*</span></label>
            <input id="place" name="place" type="text" required value="${escapeHtml(initial.place)}" aria-describedby="placeErr" />
            <p class="error" id="placeErr" aria-live="polite"></p>
          </div>

          <div class="field">
            <label for="city">Город</label>
            <input id="city" name="city" type="text" value="${escapeHtml(initial.city)}" />
            <p class="help">Необязательное поле</p>
          </div>
        </div>

        <div class="row-2">
          <div class="field">
            <label for="rating">Рейтинг (1–5)</label>
            <select id="rating" name="rating" aria-describedby="ratingErr">
              ${[1,2,3,4,5].map(v => `<option value="${v}" ${String(v)===String(initial.rating)?"selected":""}>${v}</option>`).join("")}
            </select>
            <p class="error" id="ratingErr" aria-live="polite"></p>
          </div>

          <div class="field">
            <label for="text">Текст отзыва (мин. 20)</label>
            <textarea id="text" name="text" rows="6" required minlength="20" aria-describedby="textErr">${escapeHtml(initial.text)}</textarea>
            <p class="error" id="textErr" aria-live="polite"></p>
          </div>
        </div>

        <div class="actions">
          <button class="btn" id="submitBtn" type="submit">${escapeHtml(submitText)}</button>
          <button class="btn btn-secondary" type="button" id="cancelBtn">Отмена</button>
        </div>

        <div id="formMsg" class="muted" aria-live="polite"></div>
      </form>
    </section>
  `;

  const form = app.querySelector("#form");
  const submitBtn = app.querySelector("#submitBtn");
  const cancelBtn = app.querySelector("#cancelBtn");
  const formMsg = app.querySelector("#formMsg");

  const place = app.querySelector("#place");
  const rating = app.querySelector("#rating");
  const text = app.querySelector("#text");

  const placeErr = app.querySelector("#placeErr");
  const ratingErr = app.querySelector("#ratingErr");
  const textErr = app.querySelector("#textErr");

  cancelBtn.addEventListener("click", () => history.back());

  const validators = [
    {
      el: place,
      err: placeErr,
      check: () => (place.value.trim() ? "" : "Введите название места.")
    },
    {
      el: rating,
      err: ratingErr,
      check: () => {
        const n = Number(rating.value);
        if (!Number.isFinite(n) || n < 1 || n > 5) return "Рейтинг должен быть от 1 до 5.";
        return "";
      }
    },
    {
      el: text,
      err: textErr,
      check: () => {
        const v = text.value.trim();
        if (!v) return "Введите текст отзыва.";
        if (v.length < 20) return "Минимум 20 символов.";
        return "";
      }
    }
  ];

  function validateOne(v) {
    const msg = v.check();
    v.err.textContent = msg;
    v.el.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }

  function validateAll() {
    const ok = validators.every(validateOne);
    return ok;
  }

  validators.forEach(v => {
    v.el.addEventListener("input", () => validateOne(v));
    v.el.addEventListener("blur", () => validateOne(v));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    formMsg.textContent = "";
    const ok = validateAll();
    if (!ok) {
      const firstBad = validators.find(v => v.el.getAttribute("aria-invalid") === "true");
      firstBad?.el?.focus();
      formMsg.textContent = "Исправьте ошибки и попробуйте снова.";
      return;
    }

    // блокировка submit во время отправки
    submitBtn.disabled = true;
    submitBtn.textContent = "Отправка…";

    try {
      const payload = {
        place: place.value.trim(),
        city: (app.querySelector("#city").value || "").trim(),
        rating: Number(rating.value),
        text: text.value.trim()
      };

      await onSubmit(payload);
    } catch {
      setToast("Ошибка отправки ❌");
      formMsg.textContent = "Не удалось выполнить операцию. Проверьте API.";
      submitBtn.disabled = false;
      submitBtn.textContent = submitText;
    }
  });
}
