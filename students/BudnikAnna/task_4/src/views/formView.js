import { api } from "../api.js";
import { qs, escapeHtml } from "../utils/dom.js";
import { toast } from "../ui/toast.js";

const categories = ["Наука", "Языки", "Спорт", "Творчество", "Волонтёрство", "IT"];

export async function formView({ mount, params }) {
  const controller = new AbortController();
  const isEdit = Boolean(params?.id);
  const id = params?.id;

  mount.innerHTML = `
    <section class="card">
      <div class="row row--between">
        <div>
          <h2 style="margin:0 0 6px">${isEdit ? "Редактировать кружок" : "Создать кружок"}</h2>
          <div class="help">Маршрут: <b>${isEdit ? `#/items/${escapeHtml(id)}/edit` : "#/new"}</b></div>
        </div>
        <div class="row">
          <a class="btn" href="#/items">← К списку</a>
        </div>
      </div>

      <div id="content" style="margin-top: 12px">
        <div class="state">Загрузка…</div>
      </div>
    </section>
  `;

  const content = qs(mount, "#content");

  function renderForm(values = {}) {
    content.innerHTML = `
      <form class="form" id="clubForm" novalidate>
        <div class="field">
          <label for="name">Название кружка</label>
          <input id="name" name="name" required minlength="3"
                 value="${escapeHtml(values.name || "")}"
                 placeholder="Например: Клуб английского" />
          <div class="error" data-err="name"></div>
        </div>

        <div class="field">
          <label for="category">Категория</label>
          <select id="category" name="category" required>
            <option value="">Выберите</option>
            ${categories
              .map((c) => `<option value="${c}" ${values.category === c ? "selected" : ""}>${c}</option>`)
              .join("")}
          </select>
          <div class="error" data-err="category"></div>
        </div>

        <div class="field">
          <label for="meeting">Время встреч</label>
          <input id="meeting" name="meeting" required
                 value="${escapeHtml(values.meeting || "")}"
                 placeholder="Например: Ср 18:00" />
          <div class="error" data-err="meeting"></div>
        </div>

        <div class="field">
          <label for="contactEmail">Контактный email</label>
          <input id="contactEmail" name="contactEmail" type="email" required
                 value="${escapeHtml(values.contactEmail || "")}"
                 placeholder="club@uni.example" />
          <div class="error" data-err="contactEmail"></div>
        </div>

        <div class="field">
          <label for="description">Описание</label>
          <textarea id="description" name="description" required minlength="20"
            placeholder="Коротко о кружке…">${escapeHtml(values.description || "")}</textarea>
          <div class="error" data-err="description"></div>
        </div>

        <div class="row">
          <button class="btn btn--primary" type="submit" id="submitBtn">
            ${isEdit ? "Сохранить" : "Создать"}
          </button>
          ${isEdit ? `<a class="btn" href="#/items/${escapeHtml(id)}">К детали</a>` : ""}
        </div>

        <div class="help">
          Submit блокируется во время отправки. Валидация: required + минимальная длина.
          Обновление выполняется через <b>PUT</b> (требование PATCH/PUT выполнено).
        </div>
      </form>
    `;
  }

  function setErr(form, name, msg) {
    const box = form.querySelector(`[data-err="${name}"]`);
    if (box) box.textContent = msg || "";
  }

  function validate(form) {
    const fd = new FormData(form);

    const name = (fd.get("name") || "").toString().trim();
    const category = (fd.get("category") || "").toString().trim();
    const meeting = (fd.get("meeting") || "").toString().trim();
    const contactEmail = (fd.get("contactEmail") || "").toString().trim();
    const description = (fd.get("description") || "").toString().trim();

    ["name", "category", "meeting", "contactEmail", "description"].forEach((k) => setErr(form, k, ""));

    let ok = true;
    if (name.length < 3) { setErr(form, "name", "Минимум 3 символа."); ok = false; }
    if (!category) { setErr(form, "category", "Выберите категорию."); ok = false; }
    if (!meeting) { setErr(form, "meeting", "Укажите время встреч."); ok = false; }
    if (!contactEmail || !contactEmail.includes("@")) { setErr(form, "contactEmail", "Введите корректный email."); ok = false; }
    if (description.length < 20) { setErr(form, "description", "Минимум 20 символов."); ok = false; }

    return { ok, data: { name, category, meeting, contactEmail, description } };
  }

  async function init() {
    try {
      if (!isEdit) {
        renderForm();
        return { loadedClub: null };
      }

      const club = await api.getClub(id, controller.signal);
      renderForm(club);
      return { loadedClub: club };
    } catch (err) {
      if (err.status === 404) {
        content.innerHTML = `
          <div class="state">
            <div><b>Пусто</b>: кружок с ID ${escapeHtml(id)} не найден.</div>
            <div style="margin-top:10px">
              <a class="btn btn--primary" href="#/items">Вернуться к списку</a>
            </div>
          </div>
        `;
        return { loadedClub: null, noForm: true };
      }

      content.innerHTML = `
        <div class="state">
          <div><b>Ошибка</b></div>
          <div class="help" style="margin-top:6px">${escapeHtml(err.message)}</div>
          <div style="margin-top:10px">
            <button class="btn" type="button" id="retry">Повторить</button>
          </div>
        </div>
      `;
      qs(content, "#retry").addEventListener("click", init);
      return { loadedClub: null, noForm: true };
    }
  }

  const res = await init();
  if (res?.noForm) return () => controller.abort();

  const form = qs(content, "#clubForm");
  const submitBtn = qs(content, "#submitBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const { ok, data } = validate(form);
    if (!ok) return;

    submitBtn.disabled = true;
    try {
      if (isEdit) {
        await api.updateClub(id, data, controller.signal);
        toast("ok", "Сохранено", "Данные кружка обновлены.");
        location.hash = `#/items/${id}`;
      } else {
        const created = await api.createClub(data, controller.signal);
        toast("ok", "Создано", "Кружок добавлен в каталог.");
        location.hash = `#/items/${created.id}`;
      }
    } catch (err) {
      toast("err", "Ошибка", err.message);
    } finally {
      submitBtn.disabled = false;
    }
  });

  return () => controller.abort();
}
