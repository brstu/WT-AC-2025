import { createItem, getItem, updateItem } from "../api/api.js";
import { navigateTo } from "../router/router.js";

const app = document.getElementById("app");

export async function renderFormView({ params }) {
    const isEdit = !!params.id;
    const id = params.id;

    let itemData = {
        title: "",
        author: "",
        content: "",
    };

    if (isEdit) {
        app.innerHTML = `<div class="loading">Загрузка...</div>`;
        try {
            itemData = await getItem(id);
        } catch (err) {
            app.innerHTML = `<div class="error">Ошибка загрузки статьи</div>`;
            return;
        }
        if (!itemData) {
            app.innerHTML = `<div class="error">Статья не найдена</div>`;
            return;
        }
    }

    app.innerHTML = `
        <h2>${isEdit ? "Редактировать статью" : "Создать статью"}</h2>

        <form id="articleForm" style="display:flex; flex-direction:column; gap:12px; max-width:600px;">
            
            <label>
                Заголовок *
                <input type="text" id="titleInput" value="${itemData.title || ""}" required />
            </label>

            <label>
                Автор
                <input type="text" id="authorInput" value="${itemData.author || ""}" />
            </label>

            <label>
                Контент *
                <textarea id="contentInput" rows="8" required>${itemData.content || ""}</textarea>
            </label>

            <button type="submit" id="saveBtn">
                ${isEdit ? "Сохранить изменения" : "Создать"}
            </button>

            <button type="button" id="cancelBtn">Отмена</button>
        </form>
    `;

    const form = document.getElementById("articleForm");
    const saveBtn = document.getElementById("saveBtn");
    const cancelBtn = document.getElementById("cancelBtn");

    cancelBtn.onclick = () => {
        navigateTo(isEdit ? `#/items/${id}` : "#/items");
    };

    form.onsubmit = async (event) => {
        event.preventDefault();

        const data = {
            title: document.getElementById("titleInput").value.trim(),
            author: document.getElementById("authorInput").value.trim(),
            content: document.getElementById("contentInput").value.trim(),
        };

        if (!data.title || !data.content) {
            alert("Заполните обязательные поля: Заголовок и Контент");
            return;
        }

        saveBtn.disabled = true;
        saveBtn.textContent = "Сохранение...";

        try {
            if (isEdit) {
                await updateItem(id, data);
                navigateTo(`#/items/${id}`);
            } else {
                await createItem(data);
                navigateTo("#/items");
            }
        } catch (err) {
            alert("Ошибка сохранения");
            saveBtn.disabled = false;
            saveBtn.textContent = isEdit ? "Сохранить изменения" : "Создать";
        }
    };
}
