import { getItem, deleteItem } from "../api.js";
import { escapeHtml, renderState, setToast } from "../utils.js";

export async function renderDetail(app, { id }) {
  app.innerHTML = renderState({ title: "Загрузка…", text: "Получаем детальную информацию." });

  try {
    const item = await getItem(id);

    const stars = "★".repeat(Number(item.rating || 0)) + "☆".repeat(5 - Number(item.rating || 0));

    app.innerHTML = `
      <section class="card">
        <div class="toolbar">
          <div>
            <h1 style="margin:0 0 .25rem">${escapeHtml(item.place)}</h1>
            <p class="muted" style="margin:0">${escapeHtml(item.city || "—")} • <span class="badge">${escapeHtml(stars)}</span></p>
          </div>

          <div class="actions">
            <a class="btn btn-secondary" href="#/items" style="text-decoration:none;display:inline-block">← Назад</a>
            <a class="btn btn-secondary" href="#/items/${item.id}/edit" style="text-decoration:none;display:inline-block">Редактировать</a>
            <button class="btn btn-danger" id="delBtn" type="button">Удалить</button>
          </div>
        </div>

        <hr style="border:0;border-top:1px solid rgba(255,255,255,.12); margin:1rem 0" />

        <h2 style="margin:0 0 .35rem">Текст отзыва</h2>
        <p style="margin:0">${escapeHtml(item.text || "")}</p>

        <p class="muted" style="margin:1rem 0 0">
          Создано: ${escapeHtml(new Date(item.createdAt || Date.now()).toLocaleString())}
        </p>
      </section>
    `;

    const delBtn = app.querySelector("#delBtn");
    delBtn?.addEventListener("click", async () => {
      const ok = confirm("Удалить отзыв? Это действие нельзя отменить.");
      if (!ok) return;

      delBtn.disabled = true;
      delBtn.textContent = "Удаление…";

      try {
        await deleteItem(item.id);
        setToast("Отзыв удалён ✅");
        location.hash = "#/items";
      } catch {
        delBtn.disabled = false;
        delBtn.textContent = "Удалить";
        setToast("Ошибка удаления ❌");
      }
    });
  } catch {
    app.innerHTML = renderState({
      title: "Не найдено",
      text: "Не удалось загрузить отзыв. Возможно, он был удалён.",
      actionHtml: `<a class="btn" href="#/items" style="text-decoration:none;display:inline-block">Вернуться к списку</a>`
    });
  }
}
