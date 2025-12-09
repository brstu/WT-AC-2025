import { api } from "../api.js";
import { Router } from "../router.js";

export async function renderAlbumForm({ params }) {
    const app = document.getElementById("app");
    const isEdit = !!params.id;
    app.innerHTML = `<div class="card loading">Loading....</div>`;

    let album = { title: "", artist: "", year: "", genre: "", description: "" };

    if (isEdit) {
        try {
            album = await api.getAlbum(params.id);
        } catch (err) {
            app.innerHTML = `<div class="card error">Ошибка: ${err.message}</div>`;
            return;
        }
    }

    app.innerHTML = `
        <div class="card">
            <h2>${isEdit ? "Редактировать альбом" : "Добавить альбом"}</h2>
            <form id="albumForm">
                <div class="form-row">
                    <label>Название</label>
                    <input name="title" value="${album.title}" required />
                </div>
                <div class="form-row">
                    <label>Артист</label>
                    <input name="artist" value="${album.artist}" required />
                </div>
                <div class="form-row">
                    <label>Год</label>
                    <input name="year" type="number" value="${album.year}" required />
                </div>
                <div class="form-row">
                    <label>Жанр</label>
                    <input name="genre" value="${album.genre}" required />
                </div>
                <div class="form-row">
                    <label>Описание</label>
                    <textarea name="description" required>${album.description}</textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn">${isEdit ? "Сохранить" : "Добавить"}</button>
                    <button type="button" class="btn" id="cancelBtn">Отмена</button>
                </div>
            </form>
        </div>
    `;

    const form = document.getElementById("albumForm");
    const submitBtn = form.querySelector("button[type=submit]");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;

        const data = Object.fromEntries(new FormData(form).entries());
        data.year = Number(data.year);

        try {
            if (isEdit) {
                await api.updateAlbum(params.id, data);
                alert("✅ Изменения сохранены");
                Router.go(`/albums/${params.id}`);
            } else {
                await api.createAlbum(data);
                alert("✅ Альбом добавлен");
                Router.go("/albums");
            }
        } catch (err) {
            alert("Ошибка: " + err.message);
        } finally {
            submitBtn.disabled = false;
        }
    });

    document.getElementById("cancelBtn").addEventListener("click", () => {
        Router.go(isEdit ? `/albums/${params.id}` : "/albums");
    });
}
