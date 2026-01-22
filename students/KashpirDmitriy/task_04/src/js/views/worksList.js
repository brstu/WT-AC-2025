import { api } from "../api.js";
import { Router } from "../router.js";

function renderWorkCard(work) {
    const el = document.createElement("div");
    el.className = "work-item";
    el.innerHTML = `
        <h3 class="work-title">${work.title}</h3>
        <div class="work-meta">${work.designer} • ${work.year} • ${work.category}</div>
        <div class="note">${work.description.substring(0, 100)}...</div>
    `;

    el.addEventListener("click", () => {
        Router.go(`/works/${work.id}`);
    });

    return el;
}

export async function renderWorksList({ query }) {
    const app = document.getElementById("app");
    app.innerHTML = `<div class="card loading">Loading...</div>`;

    try {
        const search = query.q || query.search || "";
        let works = await api.listWorks({ q: search });

        if (search && works.length > 0) {
            const q = search.toLowerCase();
            works = works.filter(w =>
                (w.title || "").toLowerCase().includes(q) ||
                (w.designer || "").toLowerCase().includes(q) ||
                (w.category || "").toLowerCase().includes(q) ||
                (w.description || "").toLowerCase().includes(q)
            );
        }

        renderList(app, works, search);
    } catch (err) {
        app.innerHTML = `<div class="card error">Ошибка: ${err.message}</div>`;
    }
}

function renderList(app, works, search) {
    app.innerHTML = `
        <div class="header-row">
            <div class="search-inline">
                <input id="searchInput" type="text" placeholder="Поиск работ..." value="${search || ""}" />
                <button id="searchBtn" class="btn">Поиск</button>
            </div>
        </div>
        <div class="list-grid" id="workList"></div>
        <div id="listMsg" class="note"></div>
    `;

    const list = app.querySelector("#workList");
    const listMsg = app.querySelector("#listMsg");
    const searchInput = document.getElementById("searchInput");

    if (!works.length) {
        list.innerHTML = `<div class="empty">Нет работ.</div>`;

        searchInput.addEventListener("input", () => {
            if (searchInput.value.trim() === "") {
                Router.go("/works");
            }
        });

        return;
    }

    works.forEach(w => list.appendChild(renderWorkCard(w)));

    document.getElementById("searchBtn").addEventListener("click", () => {
        const q = searchInput.value.trim();
        if (q) {
            Router.go("/works", { q });
        } else {
            Router.go("/works");
        }
    });

    searchInput.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            const q = e.target.value.trim();
            if (q) {
                Router.go("/works", { q });
            } else {
                Router.go("/works");
            }
        }
    });
}
