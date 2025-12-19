import { getItem, deleteItem } from "../api/api.js";
import { navigateTo } from "../router/router.js";

const app = document.getElementById("app");

export async function renderDetailView({ params }) {
    const { id } = params;

    app.innerHTML = `<div class="loading">Загрузка...</div>`;

    let item;
    try {
        item = await getItem(id);
    } catch (err) {
        app.innerHTML = `<div class="error">Ошибка загрузки статьи</div>`;
        return;
    }

    if (!item) {
        app.innerHTML = `<div class="error">Статья не найдена</div>`;
        return;
    }

    app.innerHTML = `
        <div style="padding: 15px; background: #fff; border-radius: 6px;">
            <h2>${item.title}</h2>
            <p style="opacity: 0.6; margin-top: -5px;">
                Автор: ${item.author || "Не указан"}
            </p>

            <div style="margin: 20px 0; white-space: pre-line;">
                ${item.content}
            </div>

            <div style="margin-top: 25px;">
                <button id="backBtn">⬅ Назад</button>
                <button id="editBtn">Редактировать</button>
                <button id="deleteBtn">Удалить</button>
            </div>
        </div>
    `;

    document.getElementById("backBtn").onclick = () => {
        navigateTo("#/items");
    };

    document.getElementById("editBtn").onclick = () => {
        navigateTo(`#/items/${id}/edit`);
    };

    document.getElementById("deleteBtn").onclick = async () => {
        if (!confirm("Удалить статью?")) return;

        try {
            await deleteItem(id);
            navigateTo("#/items");
        } catch (err) {
            alert("Ошибка удаления");
        }
    };
}
