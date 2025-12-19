import { api } from "../api.js";
import { Router } from "../router.js";

// Универсальная функция создания карточки альбома
function renderAlbumCard(a) {
    const el = document.createElement("div");
    el.className = "album-item";
    el.innerHTML = `
        <h3 class="album-title">${a.title}</h3>
        <div class="album-meta">${a.artist} — ${a.year} • ${a.genre}</div>
        <div class="note">${a.description}</div>
    `;

    // переход на маршрут с id
    el.addEventListener("click", () => {
        Router.go(`/albums/${a.id}`);
    });

    return el;
}

export async function renderAlbumList({ query }) {
    const app = document.getElementById("app");
    app.innerHTML = `<div class="card loading">Loading...</div>`;

    try {
        const search = query.q || query.search || "";
        let albums = await api.listAlbums({ q: search });

        // клиентская фильтрация
        if (search && albums.length > 0) {
            const q = search.toLowerCase();
            albums = albums.filter(a =>
                (a.title || "").toLowerCase().includes(q) ||
                (a.artist || "").toLowerCase().includes(q) ||
                (a.genre || "").toLowerCase().includes(q) ||
                (a.description || "").toLowerCase().includes(q)
            );
        }

        renderList(app, albums, search);
    } catch (err) {
        app.innerHTML = `<div class="card error">Ошибка: ${err.message}</div>`;
    }
}

function renderList(app, albums, search) {
    app.innerHTML = `
        <div class="header-row">
            <div class="search-inline">
                <input id="searchInput" type="text" placeholder="Поиск..." value="${search || ""}" />
                <button id="searchBtn" class="btn">Поиск</button>
            </div>
        </div>
        <div class="list-grid" id="albumList"></div>
        <div id="listMsg" class="note"></div>
    `;

    const list = app.querySelector("#albumList");
    const listMsg = app.querySelector("#listMsg");
    const searchInput = document.getElementById("searchInput");

    if (!albums.length) {
        list.innerHTML = `<div class="empty">Empty.</div>`;

        // если результат пустой, при очистке поля поиска возвращаем на главную
        searchInput.addEventListener("input", () => {
            if (searchInput.value.trim() === "") {
                Router.go("/albums");
            }
        });

        return;
    }

    albums.forEach(a => list.appendChild(renderAlbumCard(a)));

    // поиск по кнопке
    document.getElementById("searchBtn").addEventListener("click", () => {
        const q = searchInput.value.trim();
        if (q) {
            Router.go("/albums", { q });
        } else {
            Router.go("/albums"); // очистка фильтра → возвращаем на главную
        }
    });

    // поиск по Enter
    searchInput.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            const q = e.target.value.trim();
            if (q) {
                Router.go("/albums", { q });
            } else {
                Router.go("/albums"); // очистка фильтра → возвращаем на главную
            }
        }
    });
}
