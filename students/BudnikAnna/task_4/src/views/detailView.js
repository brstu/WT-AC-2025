import { api } from "../api.js";
import { qs, escapeHtml, formatDate } from "../utils/dom.js";
import { toast } from "../ui/toast.js";

export async function detailView({ mount, params }) {
  const controller = new AbortController();
  const id = params.id;

  mount.innerHTML = `
    <section class="card">
      <div class="row row--between">
        <div>
          <h2 style="margin:0 0 6px">Деталь кружка</h2>
          <div class="help">Маршрут: <b>#/items/${escapeHtml(id)}</b></div>
        </div>
        <div class="row">
          <a class="btn" href="#/items">← К списку</a>
          <a class="btn" href="#/items/${escapeHtml(id)}/edit">Редактировать</a>
          <button class="btn btn--danger" type="button" id="deleteBtn">Удалить</button>
        </div>
      </div>

      <div id="content" style="margin-top:12px">
        <div class="state">Загрузка…</div>
      </div>
    </section>
  `;

  const content = qs(mount, "#content");
  const deleteBtn = qs(mount, "#deleteBtn");

  function setErr(form, name, msg) {
    const box = form.querySelector(`[data-err="${name}"]`);
    if (box) box.textContent = msg || "";
  }

  function validateApply(fd, form) {
    const studentName = (fd.get("studentName") || "").toString().trim();
    const email = (fd.get("email") || "").toString().trim();
    const course = (fd.get("course") || "").toString().trim();
    const message = (fd.get("message") || "").toString().trim();

    ["studentName", "email", "course", "message"].forEach((k) => setErr(form, k, ""));

    let ok = true;
    if (studentName.length < 3) { setErr(form, "studentName", "Минимум 3 символа."); ok = false; }
    if (!email || !email.includes("@")) { setErr(form, "email", "Введите корректный email."); ok = false; }
    if (!course) { setErr(form, "course", "Выберите курс."); ok = false; }
    if (message.length < 10) { setErr(form, "message", "Минимум 10 символов."); ok = false; }

    return { ok, data: { studentName, email, course, message } };
  }

  async function load() {
    content.innerHTML = `<div class="state">Загрузка…</div>`;

    try {
      const club = await api.getClub(id, controller.signal);
      const apps = await api.getApplicationsByClub(id, controller.signal);

      content.innerHTML = `
        <div class="card">
          <div class="row row--between">
            <div style="min-width:0">
              <div style="font-weight:900; font-size: 22px; line-height:1.2">
                ${escapeHtml(club.name)}
              </div>
              <div class="row" style="margin-top:8px">
                <span class="badge">${escapeHtml(club.category || "Без категории")}</span>
                <span class="badge">Встречи: ${escapeHtml(club.meeting || "—")}</span>
                <span class="badge">Создано: ${escapeHtml(formatDate(club.createdAt || ""))}</span>
              </div>
            </div>
          </div>

          <p style="margin:12px 0 0">${escapeHtml(club.description || "")}</p>
          <p class="help" style="margin:10px 0 0">
            Контакт: <b>${escapeHtml(club.contactEmail || "—")}</b>
          </p>
        </div>

        <div class="grid" style="margin-top:14px">
          <div class="card">
            <h3 style="margin:0 0 10px">Подать заявку</h3>

            <form id="applyForm" class="form" novalidate>
              <div class="field">
                <label for="studentName">Имя и фамилия</label>
                <input id="studentName" name="studentName" required minlength="3" placeholder="Иван Иванов" />
                <div class="error" data-err="studentName"></div>
              </div>

              <div class="field">
                <label for="email">Email</label>
                <input id="email" name="email" type="email" required placeholder="name@example.com" />
                <div class="error" data-err="email"></div>
              </div>

              <div class="field">
                <label for="course">Курс</label>
                <select id="course" name="course" required>
                  <option value="">Выберите</option>
                  ${["1","2","3","4","5","6"].map((x) => `<option value="${x}">${x}</option>`).join("")}
                </select>
                <div class="error" data-err="course"></div>
              </div>

              <div class="field">
                <label for="message">Сообщение</label>
                <textarea id="message" name="message" required minlength="10" placeholder="Почему хотите вступить?"></textarea>
                <div class="error" data-err="message"></div>
              </div>

              <button class="btn btn--primary" type="submit" id="submitBtn">Отправить заявку</button>
              <div class="help">Заявка сохраняется в mock API: <code>/applications</code></div>
            </form>
          </div>

          <div class="card">
            <h3 style="margin:0 0 10px">Последние заявки (до 5)</h3>
            ${
              apps.length
                ? `
              <div style="display:grid; gap:10px">
                ${apps
                  .map(
                    (a) => `
                  <div class="card">
                    <div style="font-weight:800">${escapeHtml(a.studentName)}</div>
                    <div class="help">${escapeHtml(a.email)} • курс ${escapeHtml(a.course)} • ${escapeHtml(
                      formatDate(a.createdAt || "")
                    )}</div>
                    <div class="help" style="margin-top:6px">${escapeHtml(a.message || "")}</div>
                  </div>
                `
                  )
                  .join("")}
              </div>
            `
                : `<div class="state">Пока нет заявок.</div>`
            }
          </div>
        </div>
      `;

      deleteBtn.onclick = async () => {
        if (!window.confirm(`Удалить кружок "${club.name}"?`)) return;

        deleteBtn.disabled = true;
        try {
          await api.deleteClub(id, controller.signal);
          toast("ok", "Удалено", `Кружок "${club.name}" удалён.`);
          location.hash = "#/items";
        } catch (err) {
          deleteBtn.disabled = false;
          toast("err", "Ошибка", err.message);
        }
      };

      const form = qs(content, "#applyForm");
      const submitBtn = qs(content, "#submitBtn");

      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const fd = new FormData(form);
        const { ok, data } = validateApply(fd, form);
        if (!ok) return;

        submitBtn.disabled = true;
        try {
          await api.createApplication(
            {
              clubId: Number(id),
              studentName: data.studentName,
              email: data.email,
              course: data.course,
              message: data.message,
            },
            controller.signal
          );
          toast("ok", "Успех", "Заявка отправлена!");
          form.reset();
          await load(); 
        } catch (err) {
          toast("err", "Ошибка", err.message);
        } finally {
          submitBtn.disabled = false;
        }
      });
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
        return;
      }

      content.innerHTML = `
        <div class="state">
          <div><b>Ошибка загрузки</b></div>
          <div class="help" style="margin-top:6px">${escapeHtml(err.message)}</div>
          <div style="margin-top:10px">
            <button class="btn" type="button" id="retry">Повторить</button>
          </div>
        </div>
      `;
      qs(content, "#retry").addEventListener("click", load);
    }
  }

  load();

  return () => controller.abort();
}
