import { getItems, deleteItem } from "../api/api.js";
import { navigateTo } from "../router/router.js";

const app = document.getElementById("app");

/**
 * Рендер списка статей
 */
export async function renderListView({ query }) {
    console.log("renderListView — query:", query);
    app.innerHTML = `<div class="loading">Загрузка...</div>`;

    let items = [];

    try {
        // ✅ Передаём параметры поиска в API
        items = await getItems(query);
    } catch (err) {
        app.innerHTML = `<div class="error">Ошибка загрузки данных</div>`;
        return;
    }

    const searchValue = query?.search || "";

    // Если нет статей — выводим форму + пустой список
    if (!items.length) {
        app.innerHTML = `
            <div class="empty">Нет статей</div>

            <div class="controls" style="margin-top: 20px;">
                <input type="text" id="searchInput" placeholder="Поиск..." value="${searchValue}" />
                <button id="searchBtn">Поиск</button>
                <button id="newBtn">Создать статью</button>
            </div>
        `;

        bindControls();
        return;
    }

    // Рендер списка статей
    app.innerHTML = `
        <div class="controls" style="margin-bottom: 20px;">
            <input type="text" id="searchInput" placeholder="Поиск..." value="${searchValue}" />
            <button id="searchBtn">Поиск</button>
            <button id="newBtn">Создать статью</button>
        </div>

        <div id="list">
            ${items
                .map(
                    (item) => `
                <div class="card" style="padding: 15px; margin-bottom: 12px; background: white; border-radius: 6px;">
                    <h3>${item.title}</h3>
                    <p>${item.content.slice(0, 120)}...</p>

                    <div style="margin-top: 10px;">
                        <a href="#/items/${item.id}">Подробнее</a> |
                        <a href="#/items/${item.id}/edit">Редактировать</a> |
                        <a href="#" data-id="${item.id}" class="deleteLink">Удалить</a>
                    </div>
                </div>
            `
                )
                .join("")}
        </div>
    `;

    bindControls();
    bindDeleteButtons();
}

/**
 * Кнопки: поиск / новая статья
 */
function bindControls() {
    document.getElementById("newBtn").onclick = () => navigateTo("#/new");

    document.getElementById("searchBtn").onclick = () => {
        const value = document.getElementById("searchInput").value.trim();
        navigateTo(`#/items?search=${encodeURIComponent(value)}`);
    };
}

/**
 * Обработчики удаления
 */
function bindDeleteButtons() {
    document.querySelectorAll(".deleteLink").forEach((link) => {
        link.onclick = async (event) => {
            event.preventDefault();
            const id = link.dataset.id;

            if (!confirm("Удалить статью?")) return;

            try {
                await deleteItem(id);

                const search = document.getElementById("searchInput").value.trim();

                navigateTo(
                    search
                        ? `#/items?search=${encodeURIComponent(search)}`
                        : "#/items"
                );
            } catch (err) {
                alert("Ошибка удаления");
            }
        };
    });
}
