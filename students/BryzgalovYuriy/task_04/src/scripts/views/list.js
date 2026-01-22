import { getItems, deleteItem } from "../api.js";
import { escapeHtml, qs, renderState, setToast } from "../utils.js";

export async function renderList(app) {
  const params = qs();
  const q = (params.get("q") || "").trim();

  app.innerHTML = renderState({
    title: "Загрузка…",
    text: "Получаем список отзывов."
  });

  try {
    const items = await getItems({ q });

    const searchValue = escapeHtml(q);

    if (!items.length) {
      app.innerHTML = renderState({
        title: "Пусто",
        text: q ? "По вашему запросу ничего не найдено." : "Пока нет отзывов. Создайте первый!",
        actionHtml: `<a class="btn" href="#/new" style="display:inline-block;text-decoration:none">Создать отзыв</a>`
      });
      app.prepend(renderSearchBlock(searchValue));
      bindSearch(app);
      return;
    }

    app.innerHTML = `
      ${renderSearchBlock(searchValue)}
      <div class="toolbar" style="margin-top:.75rem">
        <p class="muted" style="margin:0">Найдено: <strong>${items.length}</strong></p>
        <a class="btn" href="#/new" style="text-decoration:none; display:inline-block;">+ Новый отзыв</a>
      </div>

      <ul class="list" id="itemsList" style="margin-top:1rem">
        ${items.map(renderCard).join("")}
      </ul>
    `;

    bindSearch(app);
    bindDelegation(app);
  } catch (e) {
    app.innerHTML = renderState({
      title: "Ошибка",
      text: "Не удалось загрузить список. Проверьте, запущен ли API (json-server).",
      actionHtml: `<button class="btn" id="retryBtn" type="button">Повторить</button>`
    });
    const btn = app.querySelector("#retryBtn");
    btn?.addEventListener("click", () => location.reload());
  }
}

function renderSearchBlock(value) {
  return `
    <section class="card">
      <h2 style="margin:0 0 .35rem">Список отзывов</h2>
      <p class="muted" style="margin:0 0 .75rem">Поиск сохраняется в hash (пример: <code>#/items?q=брест</code>).</p>

      <form class="search" id="searchForm" novalidate>
        <label for="q" class="muted">Поиск (место/город/текст)</label>
        <input id="q" name="q" type="search" placeholder="Например: Брест, парк, кофе…" value="${value}" />
        <div class="actions">
          <button class="btn" type="submit">Искать</button>
          <button class="btn btn-secondary" id="resetBtn" type="button">Сброс</button>
        </div>
      </form>
    </section>
  `;
}

function bindSearch(root) {
  const form = root.querySelector("#searchForm");
  const input = root.querySelector("#q");
  const resetBtn = root.querySelector("#resetBtn");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = (input?.value || "").trim();
    const base = "#/items";
    location.hash = q ? `${base}?q=${encodeURIComponent(q)}` : base;
  });

  resetBtn?.addEventListener("click", () => {
    location.hash = "#/items";
  });
}

function renderCard(item) {
  const stars = "★".repeat(Number(item.rating || 0)) + "☆".repeat(5 - Number(item.rating || 0));

  return `
    <li class="card item" data-id="${item.id}">
      <div class="item-top">
        <div>
          <p class="item-title">${escapeHtml(item.place)}</p>
          <p class="muted" style="margin:.1rem 0 0">${escapeHtml(item.city || "—")}</p>
        </div>
        <span class="badge" title="Рейтинг">${escapeHtml(stars)}</span>
      </div>

      <p class="muted" style="margin:.35rem 0 0">${escapeHtml(shortText(item.text || ""))}</p>

      <div class="actions">
        <a class="btn btn-secondary" href="#/items/${item.id}" style="text-decoration:none;display:inline-block">Открыть</a>
        <a class="btn btn-secondary" href="#/items/${item.id}/edit" style="text-decoration:none;display:inline-block">Редактировать</a>
        <button class="btn btn-danger" type="button" data-action="delete">Удалить</button>
      </div>
    </li>
  `;
}

function shortText(t) {
  const s = String(t).trim();
  return s.length > 120 ? s.slice(0, 120) + "…" : s;
}

function bindDelegation(root) {
  const list = root.querySelector("#itemsList");
  if (!list) return;

  list.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const card = e.target.closest("[data-id]");
    if (!card) return;

    const id = card.dataset.id;

    if (btn.dataset.action === "delete") {
      const ok = confirm("Удалить отзыв? Это действие нельзя отменить.");
      if (!ok) return;

      btn.disabled = true;
      btn.textContent = "Удаление…";

      try {
        await deleteItem(id);
        card.remove();
        setToast("Отзыв удалён ✅");
      } catch {
        btn.disabled = false;
        btn.textContent = "Удалить";
        setToast("Ошибка удаления ❌");
      }
    }
  });
}
