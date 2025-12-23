import { api } from "../api.js";
import { qs, escapeHtml } from "../utils/dom.js";
import { setHash } from "../utils/hash.js";
import { toast } from "../ui/toast.js";

function loadingBlock() {
  return `
    <div class="card">
      <div class="row row--between">
        <div style="flex:1">
          <div class="skeleton" style="width: 240px;"></div>
          <div class="skeleton" style="width: 320px; margin-top: 10px;"></div>
        </div>
        <div class="skeleton" style="width: 110px; height: 36px;"></div>
      </div>
      <div style="margin-top: 14px" class="grid">
        ${Array.from({ length: 6 })
          .map(
            () => `
          <div class="card">
            <div class="skeleton" style="width: 70%;"></div>
            <div class="skeleton" style="width: 45%; margin-top: 10px;"></div>
            <div class="skeleton" style="width: 92%; margin-top: 10px;"></div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}

export async function listView({ mount, query }) {
  const controller = new AbortController();

  const q = query.get("q") || "";
  const category = query.get("category") || "";

  mount.innerHTML = `
    <section class="card" aria-label="Список кружков">
      <div class="row row--between">
        <div>
          <h2 style="margin:0 0 6px">Кружки</h2>
          <div class="help">Маршрут: <b>#/items</b> • поиск/фильтр сохраняются в hash</div>
        </div>
        <a class="btn btn--primary" href="#/new">+ Добавить</a>
      </div>

      <form id="searchForm" class="form" style="margin-top: 12px">
        <div class="row" style="align-items:flex-end">
          <div class="field" style="flex: 1; min-width: 220px">
            <label for="q">Поиск</label>
            <input id="q" name="q" placeholder="Например: GIS, английский..." value="${escapeHtml(q)}" />
          </div>

          <div class="field" style="min-width: 220px">
            <label for="category">Категория</label>
            <select id="category" name="category">
              <option value="">Все</option>
              ${["Наука","Языки","Спорт","Творчество","Волонтёрство","IT"]
                .map(
                  (c) => `<option value="${c}" ${c === category ? "selected" : ""}>${c}</option>`
                )
                .join("")}
            </select>
          </div>

          <button class="btn" type="button" id="resetBtn">Сбросить</button>
        </div>
      </form>

      <div id="content" style="margin-top: 12px">
        ${loadingBlock()}
      </div>
    </section>
  `;

  const content = qs(mount, "#content");
  const form = qs(mount, "#searchForm");
  const resetBtn = qs(mount, "#resetBtn");

  let debounceT = null;

  function syncHashFromForm() {
    const fd = new FormData(form);
    const next = new URLSearchParams();

    const nq = (fd.get("q") || "").toString().trim();
    const nc = (fd.get("category") || "").toString().trim();

    if (nq) next.set("q", nq);
    if (nc) next.set("category", nc);

    setHash("/items", next);
  }

  form.addEventListener("input", () => {
    window.clearTimeout(debounceT);
    debounceT = window.setTimeout(syncHashFromForm, 250);
  });

  resetBtn.addEventListener("click", () => {
    setHash("/items", new URLSearchParams());
  });

  async function load() {
    content.innerHTML = loadingBlock();

    try {
      const clubs = await api.getClubs({ q, category }, controller.signal);

      if (!clubs.length) {
        content.innerHTML = `
          <div class="state">
            <div><b>Пусто</b>: кружков по текущим фильтрам не найдено.</div>
            <div style="margin-top:10px" class="row">
              <a class="btn btn--primary" href="#/new">Создать кружок</a>
              <button class="btn" type="button" id="clearFilters">Сбросить фильтры</button>
            </div>
          </div>
        `;
        qs(content, "#clearFilters").addEventListener("click", () => {
          setHash("/items", new URLSearchParams());
        });
        return;
      }

      content.innerHTML = `
        <div class="grid" id="grid">
          ${clubs
            .map(
              (c) => `
            <article class="card" data-id="${c.id}">
              <div class="row row--between">
                <div style="min-width:0">
                  <div style="font-weight:800; font-size: 18px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    ${escapeHtml(c.name)}
                  </div>
                  <div style="margin-top:6px" class="row">
                    <span class="badge">${escapeHtml(c.category || "Без категории")}</span>
                    <span class="badge">Встречи: ${escapeHtml(c.meeting || "—")}</span>
                  </div>
                </div>
              </div>

              <p class="help" style="margin:10px 0 0">
                ${escapeHtml(c.description || "").slice(0, 140)}${(c.description || "").length > 140 ? "…" : ""}
              </p>

              <div class="row" style="margin-top: 12px">
                <a class="btn btn--primary" href="#/items/${c.id}">Подробнее</a>
                <a class="btn" href="#/items/${c.id}/edit">Редактировать</a>
                <button class="btn btn--danger" type="button" data-action="delete">Удалить</button>
              </div>
            </article>
          `
            )
            .join("")}
        </div>
      `;

      const grid = qs(content, "#grid");

      grid.addEventListener("click", async (e) => {
        const del = e.target.closest("button[data-action='delete']");
        if (!del) return;

        const card = e.target.closest("article[data-id]");
        if (!card) return;

        const id = card.dataset.id;
        const name =
          card.querySelector("div[style*='font-weight:800']")?.textContent?.trim() || `ID ${id}`;

        if (!window.confirm(`Удалить кружок "${name}"?`)) return;

        del.disabled = true;
        try {
          await api.deleteClub(id, controller.signal);
          toast("ok", "Удалено", `Кружок "${name}" удалён.`);
          setHash("/items", query); // reload
        } catch (err) {
          del.disabled = false;
          toast("err", "Ошибка", err.message);
        }
      });
    } catch (err) {
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

  return () => {
    window.clearTimeout(debounceT);
    controller.abort();
  };
}
