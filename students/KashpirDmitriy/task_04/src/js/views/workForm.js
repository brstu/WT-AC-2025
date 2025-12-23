import { api } from "../api.js";
import { Router } from "../router.js";

export async function renderWorkForm({ params }) {
    const app = document.getElementById("app");
    const isEdit = !!params.id;
    app.innerHTML = `<div class="card loading">Loading...</div>`;

    let work = { title: "", designer: "", year: "", category: "", description: "" };

    if (isEdit) {
        try {
            work = await api.getWork(params.id);
        } catch (err) {
            app.innerHTML = `<div class="card error">Ошибка: ${err.message}</div>`;
            return;
        }
    }

    app.innerHTML = `
        <div class="card">
            <h2>${isEdit ? "Редактировать работу" : "Добавить работу"}</h2>
            <form id="workForm">
                <div class="form-row">
                    <label>Название работы</label>
                    <input name="title" value="${work.title}" required />
                </div>
                <div class="form-row">
                    <label>Имя дизайнера</label>
                    <input name="designer" value="${work.designer}" required />
                </div>
                <div class="form-row">
                    <label>Год</label>
                    <input name="year" type="number" value="${work.year}" required />
                </div>
                <div class="form-row">
                    <label>Категория</label>
                    <input name="category" value="${work.category}" required />
                </div>
                <div class="form-row">
                    <label>Описание</label>
                    <textarea name="description" required>${work.description}</textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn">${isEdit ? "Сохранить" : "Добавить"}</button>
                    <button type="button" class="btn" id="cancelBtn">Отмена</button>
                </div>
            </form>
        </div>
    `;

    const form = document.getElementById("workForm");
    const submitBtn = form.querySelector("button[type=submit]");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;

        const data = Object.fromEntries(new FormData(form).entries());
        data.year = Number(data.year);

        try {
            if (isEdit) {
                await api.updateWork(params.id, data);
                alert("✅ Изменения сохранены");
                Router.go(`/works/${params.id}`);
            } else {
                await api.createWork(data);
                alert("✅ Работа добавлена");
                Router.go("/works");
            }
        } catch (err) {
            alert("Ошибка: " + err.message);
        } finally {
            submitBtn.disabled = false;
        }
    });

    document.getElementById("cancelBtn").addEventListener("click", () => {
        Router.go(isEdit ? `/works/${params.id}` : "/works");
    });
}
